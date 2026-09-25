/** Escape user input for safe Mongo regex. */
export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Loose board search: tokens match city, address, size, or type (case-insensitive). */
export function fuzzyBoardFilter(q?: string, city?: string) {
  const clauses: Record<string, unknown>[] = [];

  if (city?.trim()) {
    clauses.push({
      city: { $regex: escapeRegex(city.trim()), $options: "i" },
    });
  }

  if (q?.trim()) {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    for (const token of tokens) {
      const rx = escapeRegex(token);
      clauses.push({
        $or: [
          { city: { $regex: rx, $options: "i" } },
          { address: { $regex: rx, $options: "i" } },
          { size: { $regex: rx, $options: "i" } },
          { type: { $regex: rx, $options: "i" } },
        ],
      });
    }
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}
