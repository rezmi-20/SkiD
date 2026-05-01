/**
 * Filters messages for contact information sharing.
 * Returns { blocked: true, reason } if contact info is detected,
 * or { blocked: false } if the message is clean.
 */
export function filterContactInfo(text: string): { blocked: boolean; reason?: string } {
  const patterns = [
    // Ethiopian phone numbers: 09xx, 07xx, +2519xx, +2517xx
    { regex: /(\+?251)?[\s\-]?0?[79]\d{8}/, label: "phone number" },
    // Generic phone numbers with separators
    { regex: /\b\d[\d\s\-().]{7,}\d\b/, label: "phone number" },
    // Email addresses
    { regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/, label: "email address" },
    // Telegram links / handles
    { regex: /t\.me\/\S+|telegram\.me\/\S+/i, label: "Telegram link" },
    // WhatsApp links
    { regex: /wa\.me\/\S+|whatsapp\.com\/\S+/i, label: "WhatsApp link" },
    // Social @ handles (bare @username)
    { regex: /@[a-zA-Z0-9_]{3,}/, label: "social media handle" },
  ];

  for (const { regex, label } of patterns) {
    if (regex.test(text)) {
      return {
        blocked: true,
        reason: `Sharing contact information (${label}) is not allowed on DireSkill. Please keep all communication inside the app.`,
      };
    }
  }

  return { blocked: false };
}
