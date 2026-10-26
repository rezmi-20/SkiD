import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { detectFileType } from "@/lib/file-signatures";
import { isAuthenticatedCloudinaryUrl } from "@/lib/cloudinary-private";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_BY_MIME: Record<string, number> = {
  "image/png": 10 * 1024 * 1024,
  "image/jpeg": 10 * 1024 * 1024,
  "image/webp": 10 * 1024 * 1024,
  "image/gif": 10 * 1024 * 1024,
  "application/pdf": 20 * 1024 * 1024,
  "video/mp4": 35 * 1024 * 1024,
  "video/webm": 35 * 1024 * 1024,
  "video/quicktime": 35 * 1024 * 1024,
  "video/ogg": 35 * 1024 * 1024,
};

const RAW_EXTENSION: Record<string, string> = { "application/pdf": ".pdf" };

function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function uploadError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return uploadError("Unauthorized", 401);
    if (!session.user.emailVerified) return uploadError("Verify your email before uploading attachments.", 403);
    if (session.user.role !== "client" && session.user.role !== "worker") return uploadError("This account cannot upload private attachments.", 403);
    const account = await sql`SELECT is_suspended FROM users WHERE id = ${session.user.id} LIMIT 1`;
    if (!account[0] || account[0].is_suspended) return uploadError("This account cannot upload attachments.", 403);

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return uploadError("No file provided", 400);

    const maxSize = MAX_SIZE_BY_MIME[file.type];
    if (!maxSize) return uploadError("Unsupported file format.", 400);
    if (file.size <= 0 || file.size > maxSize) return uploadError("File exceeds the allowed size.", 400);

    const bytes = Buffer.from(await file.arrayBuffer());
    if (detectFileType(bytes) !== file.type) return uploadError("The file content does not match its declared format.", 400);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return uploadError("Private file storage is not configured.", 503);

    const timestamp = Math.floor(Date.now() / 1000);
    const resourceType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "raw";
    const extension = RAW_EXTENSION[file.type] || "";
    const params: Record<string, string | number> = {
      folder: "direskill/private",
      public_id: `${crypto.randomUUID()}${extension}`,
      timestamp,
      type: "authenticated",
    };
    const signature = signUploadParams(params, apiSecret);
    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([bytes], { type: file.type }), file.name);
    for (const [key, value] of Object.entries(params)) uploadForm.append(key, String(value));
    uploadForm.append("api_key", apiKey);
    uploadForm.append("signature", signature);

    const upstream = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`, {
      method: "POST",
      body: uploadForm,
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return uploadError("Private file storage is temporarily unavailable.", 503);

    const uploaded = await upstream.json();
    if (typeof uploaded.secure_url !== "string" || !isAuthenticatedCloudinaryUrl(uploaded.secure_url)) {
      console.error("[PRIVATE_UPLOAD_INVALID_CLOUDINARY_RESPONSE]");
      return uploadError("Private file storage could not confirm restricted access.", 502);
    }

    return NextResponse.json({
      url: uploaded.secure_url,
      fileName: file.name.replace(/[\r\n\0]/g, "").slice(0, 255),
      mimeType: file.type,
      fileSize: bytes.length,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[PRIVATE_UPLOAD_ERROR]", error instanceof Error ? error.name : "UnknownError");
    return uploadError("Private upload could not be completed.", 500);
  }
}
