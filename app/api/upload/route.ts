import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

// Uses Cloudinary's unsigned upload — no API secret needed.
// Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local
// Create a free account at cloudinary.com and grab your cloud name.
// The upload preset "direskill_unsigned" must be created in Cloudinary dashboard
// (Settings → Upload → Upload presets → Add unsigned preset).

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", "direskill_unsigned");
    uploadData.append("folder", "direskill/messages");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      const err = await res.json();
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
