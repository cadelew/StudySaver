"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "@/lib/utils";
import type { BudgetCategory } from "@/lib/types";

interface CategoryAllocationPanelProps {
  categories: BudgetCategory[];
  monthlyBudget: number;
  onAutoAllocate: () => void;
  onSetLimit: (id: string, amount: number) => void;
}

export function CategoryAllocationPanel({
  categories,
  monthlyBudget,
  onAutoAllocate,
  onSetLimit,
}: CategoryAllocationPanelProps) {
  const totalAllocated = categories.reduce((sum, c) => sum + c.monthly_limit, 0);
  const overBudget = totalAllocated > monthlyBudget;
  const unallocated = monthlyBudget - totalAllocated;

  if (categories.length === 0) return null;

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category limits
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(monthlyBudget)} monthly budget
          </p>
        </div>
        <Button onClick={onAutoAllocate} variant="secondary" size="sm" className="flex-shrink-0">
          Rebalance
        </Button>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-2xl bg-muted/60 p-3 space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon category={cat.name} size={32} className="bg-card/80 flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Math.max(monthlyBudget, cat.monthly_limit)}
                step={5}
                value={cat.monthly_limit}
                onChange={(e) => onSetLimit(cat.id, Number(e.target.value))}
                className="flex-1 accent-primary-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-foreground w-16 text-right">
                {formatCurrency(cat.monthly_limit)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-1 border-t border-border/40">
        <span className="text-muted-foreground">Total allocated</span>
        <span className={`font-semibold ${overBudget ? "text-destructive" : unallocated > 0 ? "text-muted-foreground" : "text-foreground"}`}>
          {formatCurrency(totalAllocated)}
          {overBudget && " (over budget)"}
          {!overBudget && unallocated > 0 && ` (${formatCurrency(unallocated)} unallocated)`}
        </span>
      </div>
    </div>
  );
}
