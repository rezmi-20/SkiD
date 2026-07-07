export const PLATFORM_CONFIG = {
  COMMISSION_RATE: 0.05,
} as const;

/** The one account that has unrestricted control over all users and admins. */
export const SUPER_ADMIN_EMAIL = "remedanseid00@gmail.com";

/** Returns true only for the super admin account. */
export const isSuperAdmin = (email?: string | null): boolean =>
  typeof email === "string" &&
  email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

/**
 * Returns the Chapa receipt URL for a given reference ID.
 * Uses chapa.co in test mode, and chapa.link in live mode.
 */
export const getChapaReceiptUrl = (referenceId: string | null | undefined): string => {
  if (!referenceId) return "";
  const isTest = process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY?.includes("TEST") || false;
  if (isTest) {
    return `https://checkout.chapa.co/checkout/test-payment-receipt/${referenceId}`;
  }
  return `https://chapa.link/payment-receipt/${referenceId}`;
};


