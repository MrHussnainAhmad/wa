import type { BoardType, QuoteBreakdown } from "@/types";

export function nearestDurationKey(
  months: number,
  multipliers: Record<string, number>
): string {
  const keys = Object.keys(multipliers)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);

  if (keys.length === 0) return String(months);

  let best = keys[0];
  for (const key of keys) {
    if (months >= key) best = key;
  }
  return String(best);
}

export function calculateQuote(input: {
  boardId: string;
  months: number;
  pricePerMonth: number;
  boardType: BoardType;
  designFee: number;
  currency: string;
  durationMultipliers: Record<string, number>;
  typeMultipliers: Record<string, number>;
}): QuoteBreakdown {
  const { months, pricePerMonth, boardType, designFee, currency } = input;

  if (months < 1 || !Number.isFinite(months)) {
    throw new Error("Duration must be at least 1 month");
  }

  const durationKey = nearestDurationKey(months, input.durationMultipliers);
  const durationMultiplier = input.durationMultipliers[durationKey] ?? 1;
  const typeKey = boardType.toLowerCase();
  const typeMultiplier = input.typeMultipliers[typeKey] ?? 1;

  const subtotal = pricePerMonth * months * durationMultiplier * typeMultiplier;
  const total = subtotal + designFee;

  return {
    boardId: input.boardId,
    months,
    pricePerMonth,
    durationMultiplier,
    typeMultiplier,
    designFee,
    subtotal: Math.round(subtotal),
    total: Math.round(total),
    currency,
  };
}
