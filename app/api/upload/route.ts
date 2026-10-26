import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { detectFileType } from "@/lib/file-signatures";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_REQUEST_SIZE = MAX_IMAGE_SIZE + 256 * 1024; // multipart framing and fields

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return { cloudName, apiKey, apiSecret };
}

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

async function uploadToCloudinaryWithTimeout(
  file: File,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  timeoutMs: number = 3500
): Promise<string | null> {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    folder: "direskill/uploads",
    timestamp,
  };
  const signature = signCloudinaryParams(params, apiSecret);

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("folder", String(params.folder));
  uploadData.append("timestamp", String(timestamp));
  uploadData.append("api_key", apiKey);
  uploadData.append("signature", signature);

  let endpoint = "auto/upload";
  if (file.type.startsWith("image/")) {
    endpoint = "image/upload";
  } else if (file.type.startsWith("video/")) {
    endpoint = "video/upload";
  }

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, {
      method: "POST",
      body: uploadData,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
    }
  } catch (err) {
    // Cloudinary unreachable or timed out
    console.warn("[UPLOAD] Cloudinary timeout/error, falling back to local storage:", (err as any)?.message);
  }
  return null;
}

async function saveToLocalStorage(file: File): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = EXTENSION_BY_MIME_TYPE[file.type];
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const safeBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  const fileName = `${Date.now()}_${safeBaseName}_${randomSuffix}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // This endpoint is for public profile/community images only. Private case
    // materials must use /api/private-upload, which stores authenticated assets.
    if (session.user.role !== "client" && session.user.role !== "worker") {
      return NextResponse.json({ error: "This account cannot upload public images." }, { status: 403 });
    }

    const declaredLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Photos must be under 10 MB." }, { status: 413 });
    }

    const accounts = await sql`
      SELECT is_suspended FROM users WHERE id = ${session.user.id} LIMIT 1
    `;
    if (!accounts[0] || accounts[0].is_suspended) {
      return NextResponse.json({ error: "This account cannot upload images." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a PNG, JPG, WebP, or GIF image." },
        { status: 400 }
      );
    }

    const fileBytes = Buffer.from(await file.arrayBuffer());
    if (detectFileType(fileBytes) !== mime) {
      return NextResponse.json({ error: "The file content does not match its declared format." }, { status: 400 });
    }

    if (fileBytes.length === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }
    if (fileBytes.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Photos must be under 10 MB." }, { status: 413 });
    }

    let secureUrl: string | null = null;
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (cloudName && apiKey && apiSecret) {
      // Attempt fast Cloudinary upload with 3.5s timeout
      secureUrl = await uploadToCloudinaryWithTimeout(file, cloudName, apiKey, apiSecret, 3500);
    }

    // Vercel's filesystem is ephemeral and not served as persistent user uploads.
    // Never save an attachment URL that will disappear after this function exits.
    if (!secureUrl) {
      if (process.env.VERCEL) {
        return NextResponse.json(
          {
            error: cloudName && apiKey && apiSecret
              ? "Photo storage is temporarily unavailable. Please try again."
              : "Photo storage is not configured. Please contact support.",
          },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
      secureUrl = await saveToLocalStorage(file);
    }

    return NextResponse.json({
      url: secureUrl,
      fileName: file.name,
      mimeType: mime,
      fileSize: fileBytes.length,
    });
  } catch (err: any) {
    console.error("[UPLOAD_POST_FATAL]", err instanceof Error ? err.name : "UnknownError");
    return NextResponse.json({ error: "Upload could not be completed." }, { status: 500 });
  }
}
