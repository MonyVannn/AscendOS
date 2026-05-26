/**
 * Normalizes a phone number to only contain digits.
 * This is used to ensure consistent lookup keys for enrollments.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}
