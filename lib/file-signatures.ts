export function detectFileType(bytes: Uint8Array): string | null {
  const data = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (/^GIF8[79]a$/.test(data.subarray(0, 6).toString("ascii"))) return "image/gif";
  if (data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (data.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (data.subarray(0, 4).toString("hex") === "1a45dfa3") return "video/webm";
  if (data.subarray(0, 4).toString("ascii") === "OggS") return "video/ogg";
  if (data.subarray(4, 8).toString("ascii") === "ftyp") {
    return data.subarray(8, 12).toString("ascii") === "qt  " ? "video/quicktime" : "video/mp4";
  }
  return null;
}
