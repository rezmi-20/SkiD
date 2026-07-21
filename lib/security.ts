const DEFAULT_TRUSTED_UPLOAD_HOSTS = ["res.cloudinary.com"];
const DATA_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|webp);base64,/i;
const MAX_DATA_IMAGE_LENGTH = 7 * 1024 * 1024;

function trustedUploadHosts() {
  return (process.env.TRUSTED_UPLOAD_HOSTS || DEFAULT_TRUSTED_UPLOAD_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function isTrustedUploadReference(
  value: unknown,
  options: { allowDataImage?: boolean } = {},
) {
  if (typeof value !== "string") return false;
  const text = value.trim();
  if (!text) return false;

  if (options.allowDataImage && DATA_IMAGE_PREFIX.test(text)) {
    return text.length <= MAX_DATA_IMAGE_LENGTH;
  }

  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return trustedUploadHosts().some((trustedHost) => host === trustedHost || host.endsWith(`.${trustedHost}`));
  } catch {
    return false;
  }
}

export function areTrustedUploadReferences(values: unknown) {
  if (!Array.isArray(values)) return false;
  return values.every((value) => isTrustedUploadReference(value));
}
