"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function QuantityStepper({ value, max, onChange, disabled, size = "md", className }: QuantityStepperProps) {
  const buttonSize = size === "sm" ? "icon-sm" : "icon-lg";

  return (
    <div className={cn("inline-flex items-center rounded-full border", size === "sm" ? "h-8" : "h-12", className)}>
      <Button
        variant="ghost"
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className={cn("text-center tabular-nums", size === "sm" ? "w-6 text-sm" : "w-8")} aria-live="polite">
        <span className="sr-only">Quantity </span>
        {value}
      </span>
      <Button
        variant="ghost"
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  );
}
