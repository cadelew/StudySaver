"use client";

import * as React from "react";
import { formatCurrency, pct } from "@/lib/utils";
import type { BudgetCategory } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

interface BudgetRingProps {
  category: BudgetCategory;
  onClick?: () => void;
}

export function BudgetRing({ category, onClick }: BudgetRingProps) {
  const percentage = pct(category.spent, category.monthly_limit);
  const remaining = category.monthly_limit - category.spent;
  const isOver = category.spent > category.monthly_limit;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl hover:bg-muted active:scale-95 transition-all"
    >
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="5"
          />
          <circle
            cx="32" cy="32" r={radius}
            fill="none"
            stroke={isOver ? "#EF4444" : category.color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon category={category.name} size={32} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground leading-none">
          {formatCurrency(remaining < 0 ? 0 : remaining)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
          {isOver ? "over" : "left"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium line-clamp-1 max-w-[72px]">
          {category.name}
        </p>
      </div>
    </button>
  );
}
