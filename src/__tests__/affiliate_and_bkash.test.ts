import { describe, it, expect } from "vitest";
import {
  generateReferralCode,
  calculateCommissionAmount,
  isAttributionValid,
} from "@/lib/affiliate";
import {
  normalizeTransactionId,
  isValidTransactionId,
  normalizeBdPhoneNumber,
  isValidBdPhoneNumber,
  formatCurrencyBDT,
} from "@/lib/bkash";

describe("Affiliate System & Attribution Logic", () => {
  it("generates unique, non-enumerable referral codes with REF_ prefix", () => {
    const code1 = generateReferralCode();
    const code2 = generateReferralCode();
    expect(code1).toMatch(/^REF_[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
    expect(code2).toMatch(/^REF_[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
    expect(code1).not.toBe(code2);
  });

  it("calculates percentage commissions accurately to 2 decimal places", () => {
    // 20% on ৳2,000 = ৳400
    expect(calculateCommissionAmount(2000, 20, "PERCENTAGE")).toBe(400);

    // 25% on ৳3,500 = ৳875
    expect(calculateCommissionAmount(3500, 25, "PERCENTAGE")).toBe(875);

    // 33.33% on ৳1,999 = ৳666.27
    expect(calculateCommissionAmount(1999, 33.33, "PERCENTAGE")).toBe(666.27);
  });

  it("handles fixed commissions and caps at base price", () => {
    expect(calculateCommissionAmount(2000, 500, "FIXED")).toBe(500);
    // Should never exceed base price
    expect(calculateCommissionAmount(300, 500, "FIXED")).toBe(300);
  });

  it("returns 0 commission for zero or negative values", () => {
    expect(calculateCommissionAmount(0, 20)).toBe(0);
    expect(calculateCommissionAmount(1000, 0)).toBe(0);
    expect(calculateCommissionAmount(-500, 20)).toBe(0);
  });

  it("validates attribution window (default 30 days)", () => {
    const now = new Date();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);

    expect(isAttributionValid(now, 30)).toBe(true);
    expect(isAttributionValid(tenDaysAgo, 30)).toBe(true);
    expect(isAttributionValid(thirtyOneDaysAgo, 30)).toBe(false);
  });
});

describe("bKash Payment Validation & Formatting", () => {
  it("normalizes bKash transaction IDs properly", () => {
    expect(normalizeTransactionId("  bl12a34b5c  ")).toBe("BL12A34B5C");
    expect(normalizeTransactionId("CI-18-XX-29")).toBe("CI18XX29");
  });

  it("validates transaction ID formats", () => {
    expect(isValidTransactionId("BL12A34B5C")).toBe(true);
    expect(isValidTransactionId("CI18XX29Y1")).toBe(true);
    // Too short (<8 chars)
    expect(isValidTransactionId("ABC1234")).toBe(false);
    // Invalid characters
    expect(isValidTransactionId("!@#$%^&*")).toBe(false);
  });

  it("normalizes and validates Bangladeshi mobile numbers", () => {
    expect(normalizeBdPhoneNumber("+8801712345678")).toBe("01712345678");
    expect(normalizeBdPhoneNumber("8801812345678")).toBe("01812345678");
    expect(normalizeBdPhoneNumber("01912-345678")).toBe("01912345678");

    expect(isValidBdPhoneNumber("01712345678")).toBe(true);
    expect(isValidBdPhoneNumber("01812345678")).toBe(true);
    expect(isValidBdPhoneNumber("01912345678")).toBe(true);
    expect(isValidBdPhoneNumber("01312345678")).toBe(true);

    // Invalid numbers
    expect(isValidBdPhoneNumber("01212345678")).toBe(false); // 012 not valid in BD
    expect(isValidBdPhoneNumber("0171234567")).toBe(false); // only 10 digits
    expect(isValidBdPhoneNumber("12345678901")).toBe(false);
  });

  it("formats BDT currency correctly", () => {
    const formatted = formatCurrencyBDT(2500);
    expect(formatted).toContain("2,500");
    expect(formatted).toContain("৳");
  });
});
