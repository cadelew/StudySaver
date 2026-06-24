"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: string;
  size?: "sm" | "md";
}

export function Progress({ value, color = "#0D9488", size = "md", className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isOverBudget = value > 100;

  return (
    <div
      className={cn(
        "w-full rounded-full bg-gray-100 overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${clamped}%`,
          backgroundColor: isOverBudget ? "#EF4444" : color,
        }}
      />
    </div>
  );
}
