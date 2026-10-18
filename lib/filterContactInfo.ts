/**
 * Filters chat messages for external links, URLs, and phone numbers.
 * Prohibits sharing external contact info and off-platform links to protect
 * escrow contracts and user safety on DireSkill.
 *
 * Returns { blocked: true, reason } if prohibited content is detected,
 * or { blocked: false } if the message is clean.
 */
export function filterContactInfo(text: string): { blocked: boolean; reason?: string } {
  if (!text || typeof text !== "string") return { blocked: false };

  const trimmed = text.trim();
  if (!trimmed) return { blocked: false };

  // ── 1. WEB LINKS & URLs ──────────────────────────────────────────
  // A. Protocol-based URLs (http://, https://, ftp://, etc.)
  const protocolUrlRegex = /(https?:\/\/|ftp:\/\/|file:\/\/)[^\s/$.?#].[^\s]*/i;
  if (protocolUrlRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing external website links is prohibited. Please keep all communication inside DireSkill.",
    };
  }

  // B. Standard www. prefixes
  const wwwUrlRegex = /\bwww\.[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)+[^\s]*/i;
  if (wwwUrlRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing web links is prohibited. Please keep all communication inside DireSkill.",
    };
  }

  // C. Popular domain names and TLDs (e.g. .com, .et, .org, .net, .io, .co, .app, .xyz, etc.)
  const domainRegex = /\b[a-zA-Z0-9\-]{2,}\.(com|et|org|net|io|co|me|app|dev|xyz|info|biz|online|site|tech|link|tv|cc|to|ai|agency|space|store|top|pro|live|mobi|cloud|click|press)(\/[^\s]*)?\b/i;
  if (domainRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing web domains or website links is prohibited on DireSkill.",
    };
  }

  // D. Messaging, social media & link shortener domains
  const socialLinkRegex = /\b(t\.me|telegram\.me|telegram\.dog|wa\.me|whatsapp\.com|fb\.com|facebook\.com|m\.me|instagram\.com|instagr\.am|tiktok\.com|snapchat\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com|youtu\.be|viber\.com|imo\.im|discord\.gg|discord\.com|bit\.ly|bitly\.com|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly)\/[^\s]*/i;
  if (socialLinkRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing social media and messaging links is prohibited. Please communicate through DireSkill chat.",
    };
  }

  // E. Obfuscated link notations (e.g., "google [dot] com", "site (dot) et", "domain dot com")
  const obfuscatedDotRegex = /\b[a-zA-Z0-9\-]{2,}\s*(\[\s*dot\s*\]|\(\s*dot\s*\)|\s+dot\s+)\s*(com|et|org|net|io|co|me|app|xyz)\b/i;
  if (obfuscatedDotRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing disguised web links is prohibited on DireSkill.",
    };
  }

  // ── 2. PHONE NUMBERS ─────────────────────────────────────────────
  // A. Standard & spaced Ethiopian phone numbers (09..., 07..., +251 9..., 251 9...)
  // Handles 0911223344, 09 11 22 33 44, 09-11-22-33-44, 0 9 1 1 2 2 3 3 4 4, +251 911 223 344
  const ethiopianPhoneRegex = /(?:\+?251[\s\-.]*)?0?[\s\-.]*[79](?:[\s\-.]*\d){8}\b/;
  if (ethiopianPhoneRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing phone numbers is strictly prohibited. Please communicate exclusively through DireSkill chat.",
    };
  }

  // B. Generic phone numbers with standard country codes or formatted digits
  // e.g., +1 (555) 234-5678, +44 20 7946 0958, (011) 123-4567, +251-91-122-3344
  const genericFormattedPhone = /(?:\+\d{1,3}[\s\-.]*)?(?:\(\d{2,4}\)[\s\-.]*|\d{2,4}[\s\-.]+)\d{3,4}[\s\-.]+\d{3,4}/;
  if (genericFormattedPhone.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing phone numbers is prohibited. Keep all communication within the secure DireSkill platform.",
    };
  }

  // C. Sequences of 8+ contiguous digits or spaced digits that represent phone numbers
  // Exclude common single price/year numbers by checking if digits sequence length is 8 to 15
  if (/\b\d{8,15}\b/.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing phone numbers or numeric contact codes is prohibited on DireSkill.",
    };
  }

  // Also catch spaced digit strings like "0 9 1 2 3 4 5 6 7 8" or "+1 (555) 234-5678"
  const spacedDigitsMatch = trimmed.match(/(?:\+?\d[\s\-_./()]{0,3}){7,}\d/);
  if (spacedDigitsMatch) {
    const matchedSegment = spacedDigitsMatch[0];
    const rawDigits = matchedSegment.replace(/[^\d]/g, "");
    // Check if it's just a calendar date like 12/05/2026 or 2026/05/12
    const isPureDate = /^\d{1,4}[/\-.]\d{1,2}[/\-.]\d{2,4}$/.test(matchedSegment.trim());
    if (!isPureDate && rawDigits.length >= 8 && rawDigits.length <= 15) {
      return {
        blocked: true,
        reason: "Sharing phone numbers or contact digits is prohibited on DireSkill.",
      };
    }
  }

  // ── 3. EMAIL ADDRESSES ───────────────────────────────────────────
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i;
  if (emailRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing email addresses is prohibited. Please use in-app messaging.",
    };
  }

  // Obfuscated email notations: e.g. "name [at] domain [dot] com"
  const obfuscatedEmailRegex = /[a-zA-Z0-9._%+\-]+\s*(\[\s*at\s*\]|\(\s*at\s*\)|\s+at\s+)\s*[a-zA-Z0-9.\-]+\s*(\[\s*dot\s*\]|\(\s*dot\s*\)|\s+dot\s+)\s*[a-zA-Z]{2,}/i;
  if (obfuscatedEmailRegex.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing disguised email addresses is prohibited on DireSkill.",
    };
  }

  // ── 4. SOCIAL MEDIA HANDLES ──────────────────────────────────────
  // Bare @username handles
  if (/@\b[a-zA-Z0-9_]{3,}\b/.test(trimmed)) {
    return {
      blocked: true,
      reason: "Sharing social media handles is prohibited. Please communicate through DireSkill.",
    };
  }

  return { blocked: false };
}
