export function sanitizeText(input: string): string {
  if (!input) return "";

  // Plain text is rendered by React, which escapes markup. Keep this helper
  // independent of DOM-based sanitizers so serverless route initialization
  // does not load jsdom.
  return input.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeHTML(input: string): string {
  if (!input) return "";

  // Return safe text rather than parsing HTML. There are no internal callers
  // that require formatted HTML, and avoiding a DOM implementation prevents
  // jsdom from being pulled into Vercel serverless bundles.
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
}
