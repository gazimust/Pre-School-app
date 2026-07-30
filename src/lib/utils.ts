import { differenceInMonths, differenceInYears, format } from "date-fns";

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

export function formatDate(date: Date | string, pattern = "d MMM yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy 'at' HH:mm");
}

export function ageLabel(dateOfBirth: Date | string): string {
  const dob = new Date(dateOfBirth);
  const months = differenceInMonths(new Date(), dob);
  if (months < 24) {
    return `${months} month${months === 1 ? "" : "s"} old`;
  }
  const years = differenceInYears(new Date(), dob);
  const remMonths = months - years * 12;
  return remMonths > 0 ? `${years}y ${remMonths}m old` : `${years} years old`;
}

/** EYFS age bands: Birth to Three, and Three and Four-Year-Olds. */
export function eyfsAgeBandFor(dateOfBirth: Date | string): "BIRTH_TO_THREE" | "THREE_TO_FOUR" {
  const months = differenceInMonths(new Date(), new Date(dateOfBirth));
  return months < 36 ? "BIRTH_TO_THREE" : "THREE_TO_FOUR";
}

export function ageBandLabel(band: "BIRTH_TO_THREE" | "THREE_TO_FOUR"): string {
  return band === "BIRTH_TO_THREE" ? "Birth to Three" : "Three and Four-Year-Olds";
}

export function invoiceTotal(lineItems: { quantity: unknown; unitPrice: unknown }[]): number {
  return lineItems.reduce((sum, item) => {
    return sum + Number(item.quantity) * Number(item.unitPrice);
  }, 0);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
