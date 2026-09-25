import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-50",
        variant === "primary" &&
          "bg-amber-500 text-stone-950 hover:bg-amber-400",
        variant === "secondary" &&
          "border border-stone-600 bg-stone-900 text-stone-100 hover:border-amber-500/60",
        variant === "ghost" && "text-stone-200 hover:bg-stone-800",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      {...props}
    />
  );
}
