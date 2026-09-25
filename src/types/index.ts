export type BoardType = "STATIC" | "DIGITAL";
export type BoardStatus = "AVAILABLE" | "BOOKED";
export type DepositStatus = "PENDING" | "PAID";
export type LeadSource = "QUOTE" | "CONTACT";
export type LeadStatus = "NEW" | "CONTACTED" | "WON" | "LOST";
export type AdminRole = "SUPER_ADMIN" | "SALES_REP";

export type DurationMultipliers = Record<string, number>;
export type TypeMultipliers = Record<string, number>;

export interface QuoteBreakdown {
  boardId: string;
  months: number;
  pricePerMonth: number;
  durationMultiplier: number;
  typeMultiplier: number;
  designFee: number;
  subtotal: number;
  total: number;
  currency: string;
}
