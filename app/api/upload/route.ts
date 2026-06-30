import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

async function uploadSigned(file: File, cloudName: string, apiKey: string, apiSecret: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder: "direskill/uploads",
    timestamp,
  };
  const signature = signCloudinaryParams(params, apiSecret);

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("folder", params.folder);
  uploadData.append("timestamp", String(timestamp));
  uploadData.append("api_key", apiKey);
  uploadData.append("signature", signature);

  return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });
}

async function uploadUnsigned(file: File, cloudName: string) {
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", "direskill_unsigned");
  uploadData.append("folder", "direskill/uploads");

  return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary cloud name is not configured" }, { status: 500 });
    }

    const res = apiKey && apiSecret
      ? await uploadSigned(file, cloudName, apiKey, apiSecret)
      : await uploadUnsigned(file, cloudName);

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("[UPLOAD_ERROR]", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (err) {
    console.error("[UPLOAD_POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
