import crypto from "node:crypto";
import { isTrustedUploadReference } from "@/lib/security";

const ALLOWED_RESOURCE_TYPES = new Set(["image", "video", "raw"]);

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return crypto.createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function isAuthenticatedCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" &&
      /\/(?:image|video|raw)\/authenticated\//.test(url.pathname);
  } catch {
    return false;
  }
}

export function createCloudinaryPrivateDownloadUrl(value: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Private file storage is not configured.");

  const assetUrl = new URL(value);
  if (!isAuthenticatedCloudinaryUrl(value) || assetUrl.pathname.split("/")[1] !== cloudName) {
    throw new Error("Unsupported private Cloudinary asset reference.");
  }

  const parts = assetUrl.pathname.split("/").filter(Boolean);
  const resourceType = parts[1];
  if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) throw new Error("Unsupported Cloudinary resource type.");
  const authenticatedIndex = parts.indexOf("authenticated");
  if (authenticatedIndex < 0) throw new Error("Private Cloudinary asset type is missing.");
  const assetPath = parts.slice(authenticatedIndex + 1);
  if (assetPath[0]?.match(/^v\d+$/)) assetPath.shift();
  if (assetPath.length === 0) throw new Error("Private Cloudinary asset identifier is missing.");

  const encodedPublicId = assetPath.join("/");
  const decodedPublicId = decodeURIComponent(encodedPublicId);
  const lastDot = decodedPublicId.lastIndexOf(".");
  const format = lastDot > decodedPublicId.lastIndexOf("/") ? decodedPublicId.slice(lastDot + 1) : "";
  const publicId = resourceType === "raw" || !format ? decodedPublicId : decodedPublicId.slice(0, lastDot);
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + 300;
  const params: Record<string, string | number> = {
    expires_at: expiresAt,
    format: format || "pdf",
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };
  const signature = signParams(params, apiSecret);
  const query = new URLSearchParams({
    timestamp: String(timestamp),
    public_id: publicId,
    format: format || "pdf",
    type: "authenticated",
    expires_at: String(expiresAt),
    api_key: apiKey,
    signature,
  });
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/download?${query}`;
}

export async function fetchStoredUpload(url: string) {
  if (!isTrustedUploadReference(url)) throw new Error("Untrusted upload reference.");
  const source = isAuthenticatedCloudinaryUrl(url) ? createCloudinaryPrivateDownloadUrl(url) : url;
  if (!isAuthenticatedCloudinaryUrl(url)) {
    const parsed = new URL(source);
    if (parsed.protocol !== "https:") throw new Error("Insecure upload reference.");
  }
  return fetch(source, { cache: "no-store", redirect: "error" });
}
