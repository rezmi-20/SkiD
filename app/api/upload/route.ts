import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import "@/lib/db";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_VIDEO_SIZE = 35 * 1024 * 1024; // 35 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);

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

  const ext = path.extname(file.name) || (file.type.startsWith("image/") ? ".jpg" : file.type.startsWith("video/") ? ".mp4" : ".pdf");
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload photos (PNG, JPG, WebP), PDFs, or videos (MP4, WebM, MOV)." },
        { status: 400 }
      );
    }

    if (mime.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Photos must be under 10 MB" }, { status: 400 });
    }
    if (mime === "application/pdf" && file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "PDF documents must be under 20 MB" }, { status: 400 });
    }
    if (mime.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Videos must be under 35 MB" }, { status: 400 });
    }

    let secureUrl: string | null = null;
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

    if (cloudName && apiKey && apiSecret) {
      // Attempt fast Cloudinary upload with 3.5s timeout
      secureUrl = await uploadToCloudinaryWithTimeout(file, cloudName, apiKey, apiSecret, 3500);
    }

    // If Cloudinary timed out or not configured, persist to local public/uploads immediately
    if (!secureUrl) {
      secureUrl = await saveToLocalStorage(file);
    }

    return NextResponse.json({
      url: secureUrl,
      fileName: file.name,
      mimeType: mime,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("[UPLOAD_POST_FATAL]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
