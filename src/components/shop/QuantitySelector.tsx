import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  size = "md",
}: QuantitySelectorProps) {
  const btn = size === "sm" ? "size-8" : "size-11";
  return (
    <div className={cn("inline-flex items-center border border-border", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(btn, "grid place-items-center disabled:opacity-30 hover:bg-secondary")}
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(btn, "grid place-items-center disabled:opacity-30 hover:bg-secondary")}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
