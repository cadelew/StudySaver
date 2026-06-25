"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { MealPlan } from "@/lib/types";
import { projectForfeiture } from "@/lib/meal-plan";
import { MoneyDisplay } from "@/components/ui/money-display";
import { formatCurrency } from "@/lib/utils";
import { spring } from "@/lib/motion";

interface MealPlanCardProps {
  plan: MealPlan;
  onClick?: () => void;
}

/**
 * Dashboard centerpiece: a countdown clock against the dollars you're on track
 * to forfeit. The number nobody else shows you.
 */
export function MealPlanCard({ plan, onClick }: MealPlanCardProps) {
  const proj = React.useMemo(() => projectForfeiture(plan), [plan]);
  const atRisk = proj.forfeitedValue > 0;

  // Ring: how much of the balance the user is on track to actually use.
  const usePct =
    plan.swipes_remaining > 0
      ? Math.min(
          100,
          Math.round(
            ((plan.swipes_remaining - proj.projectedUnusedSwipes) /
              plan.swipes_remaining) *
              100
          )
        )
      : 100;

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (usePct / 100) * circumference;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={spring}
      onClick={onClick}
      className={`w-full text-left rounded-3xl border shadow-card p-5 cursor-pointer transition-shadow hover:shadow-card-hover ${
        atRisk
          ? "bg-destructive/5 border-destructive/30"
          : "bg-card border-border/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Meal Plan
        </p>
        <span
          className={`text-xs font-medium rounded-full px-3 py-1.5 ${
            proj.daysLeft <= 7
              ? "bg-destructive/15 text-destructive"
              : "bg-muted text-foreground"
          }`}
        >
          {proj.daysLeft} {proj.daysLeft === 1 ? "day" : "days"} left
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-[72px] h-[72px] flex-shrink-0">
          <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="none"
              stroke={atRisk ? "#EF4444" : "#4F8A6B"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground leading-none">
              {plan.swipes_remaining}
            </span>
            <span className="text-[9px] text-muted-foreground mt-0.5">swipes</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {atRisk ? (
            <>
              <p className="text-xs text-muted-foreground">On track to forfeit</p>
              <p className="font-display text-3xl font-bold text-destructive leading-tight">
                <MoneyDisplay amount={proj.forfeitedValue} prefix="$" duration={800} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use ~{proj.requiredWeeklyPace}/week to spend it all
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">You&apos;re on track</p>
              <p className="font-display text-2xl font-bold text-success leading-tight">
                $0 wasted
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(plan.dining_dollars_remaining)} dining dollars left
              </p>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}
