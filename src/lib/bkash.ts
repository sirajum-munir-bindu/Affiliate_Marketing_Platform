/**
 * bKash Manual Payment Utilities & Validation
 */

export function normalizeTransactionId(trxId: string): string {
  if (!trxId) return "";
  return trxId.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidTransactionId(trxId: string): boolean {
  const normalized = normalizeTransactionId(trxId);
  // bKash transaction IDs are typically 8 to 15 alphanumeric characters
  return /^[A-Z0-9]{8,15}$/.test(normalized);
}

export function normalizeBdPhoneNumber(phone: string): string {
  if (!phone) return "";
  // Strip whitespace, hyphens, and brackets
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
  
  // If starts with +880, replace with 0
  if (cleaned.startsWith("+880")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("880")) {
    cleaned = "0" + cleaned.slice(3);
  }

  return cleaned;
}

export function isValidBdPhoneNumber(phone: string): boolean {
  const normalized = normalizeBdPhoneNumber(phone);
  // Bangladeshi mobile numbers start with 01 and have 11 digits: 013, 014, 015, 016, 017, 018, 019
  return /^01[3-9]\d{8}$/.test(normalized);
}

export function formatCurrencyBDT(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳0.00";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(num)
    .replace("BDT", "৳");
}
