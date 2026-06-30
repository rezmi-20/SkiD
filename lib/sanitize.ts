import DOMPurify from 'isomorphic-dompurify';

export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim(); // No HTML tags allowed
}

export function sanitizeHTML(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  }).trim();
}
