import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const tone =
    status === "AVAILABLE" || status === "PAID" || status === "WON"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "BOOKED" || status === "PENDING" || status === "NEW"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : status === "LOST"
          ? "bg-red-500/15 text-red-300 border-red-500/30"
          : "bg-stone-500/15 text-stone-300 border-stone-500/30";

  return (
    <span
      className={cn(
        "inline-flex border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        tone
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
