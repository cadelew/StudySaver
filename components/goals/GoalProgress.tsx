"use client";

import * as React from "react";
import { formatCurrency, pct } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { GoalInitial } from "@/components/ui/icons";

interface GoalProgressProps {
  goal: Goal;
  weeksEarly?: number;
  priority?: number;
  onClick?: () => void;
}

export function GoalProgress({ goal, weeksEarly, priority, onClick }: GoalProgressProps) {
  const percentage = pct(goal.saved_amount, goal.target_amount);
  const remaining = goal.target_amount - goal.saved_amount;
  const daysUntil = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-3xl bg-gradient-to-br from-primary-50 to-sage border border-primary-100 hover:shadow-card-hover transition-all active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GoalInitial name={goal.name} />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-foreground text-sm">{goal.name}</p>
              {(priority ?? goal.priority) && (
                <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 rounded-full px-1.5 py-0.5">
                  #{priority ?? goal.priority}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {daysUntil > 0 ? `${daysUntil} days away` : "Past due"}
            </p>
          </div>
        </div>
        {weeksEarly && weeksEarly > 0 ? (
          <span className="inline-flex items-center gap-1 bg-success text-white text-xs font-semibold rounded-full px-2.5 py-1 animate-fade-in">
            {weeksEarly}w early
          </span>
        ) : null}
      </div>

      <div className="relative h-3 rounded-full bg-white/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 to-success transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-primary-700">
          {formatCurrency(goal.saved_amount)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(remaining)} to go · {formatCurrency(goal.target_amount)} total
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-1.5">
        {goal.allocated_monthly && goal.allocated_monthly > 0 ? (
          <>
            {formatCurrency(goal.allocated_monthly)}/mo allocated
            {goal.weekly_savings_required > 0 && (
              <span> · need {formatCurrency(goal.weekly_savings_required)}/wk</span>
            )}
          </>
        ) : (
          <>Save {formatCurrency(goal.weekly_savings_required)}/week to reach your goal</>
        )}
      </p>
    </button>
  );
}
