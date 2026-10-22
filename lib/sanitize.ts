export function sanitizeText(input: string): string {
  if (!input) return "";

  // Plain text is rendered by React, which escapes markup. Keep this helper
  // free of isomorphic-dompurify: importing it on a serverless route eagerly
  // loads jsdom and can fail during Vercel's CommonJS/ESM module loading.
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function sanitizeHTML(input: string): Promise<string> {
  if (!input) return "";

  // Load the DOM based sanitizer only for the few places that sanitize HTML.
  // This prevents routes that only need plain text sanitization from loading
  // jsdom during serverless function initialization.
  const { default: DOMPurify } = await import('isomorphic-dompurify');
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  }).trim();
}
