import { nanoid } from "nanoid";

export const AFFILIATE_COOKIE_NAME = "affiliate_ref";
export const DEFAULT_ATTRIBUTION_DAYS = 30;

/**
 * Generate a non-enumerable, collision-resistant referral code
 * Format: REF_XXXXXXXX (e.g. REF_9K2PX8M1)
 */
export function generateReferralCode(): string {
  // Use custom alphabet without ambiguous characters (0, O, I, 1, l)
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "REF_";
  for (let i = 0; i < 8; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

/**
 * Calculate commission snapshot
 */
export function calculateCommissionAmount(
  basePrice: number,
  rate: number,
  type: "PERCENTAGE" | "FIXED" = "PERCENTAGE"
): number {
  if (basePrice <= 0 || rate <= 0) return 0;
  
  if (type === "PERCENTAGE") {
    const raw = (basePrice * rate) / 100;
    return Math.round((raw + Number.EPSILON) * 100) / 100;
  }

  // FIXED
  return Math.min(basePrice, Math.round((rate + Number.EPSILON) * 100) / 100);
}

/**
 * Check if attribution is within window (e.g. 30 days)
 */
export function isAttributionValid(
  clickedAt: Date,
  attributionDays: number = DEFAULT_ATTRIBUTION_DAYS
): boolean {
  const maxAgeMs = attributionDays * 24 * 60 * 60 * 1000;
  const elapsed = Date.now() - clickedAt.getTime();
  return elapsed >= 0 && elapsed <= maxAgeMs;
}
