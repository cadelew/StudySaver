"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types";

interface GoalAllocationPanelProps {
  goals: Goal[];
  availablePool: number;
  onAutoAllocate: () => void;
  onSetAllocation: (id: string, amount: number) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}

export function GoalAllocationPanel({
  goals,
  availablePool,
  onAutoAllocate,
  onSetAllocation,
  onReorder,
}: GoalAllocationPanelProps) {
  const active = [...goals]
    .filter((g) => g.status === "active")
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  const totalAllocated = active.reduce((sum, g) => sum + (g.allocated_monthly ?? 0), 0);
  const overBudget = totalAllocated > availablePool;

  if (active.length === 0) return null;

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Monthly savings plan
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatCurrency(availablePool)} available this month
          </p>
        </div>
        <Button onClick={onAutoAllocate} variant="secondary" size="sm" className="flex-shrink-0">
          Auto-allocate
        </Button>
      </div>

      <div className="space-y-3">
        {active.map((goal, idx) => (
          <div key={goal.id} className="rounded-2xl bg-muted/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {goal.priority ?? idx + 1}
                </span>
                <p className="text-sm font-semibold text-foreground truncate">{goal.name}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onReorder(goal.id, "up")}
                  disabled={idx === 0}
                  className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onReorder(goal.id, "down")}
                  disabled={idx === active.length - 1}
                  className="w-7 h-7 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={availablePool}
                step={5}
                value={goal.allocated_monthly ?? 0}
                onChange={(e) => onSetAllocation(goal.id, Number(e.target.value))}
                className="flex-1 accent-primary-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-foreground w-16 text-right">
                {formatCurrency(goal.allocated_monthly ?? 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-1 border-t border-border/40">
        <span className="text-muted-foreground">Total allocated</span>
        <span className={`font-semibold ${overBudget ? "text-destructive" : "text-foreground"}`}>
          {formatCurrency(totalAllocated)}
          {overBudget && " (over budget)"}
        </span>
      </div>
    </div>
  );
}
