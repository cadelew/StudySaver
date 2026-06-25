"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { MealPlanCard } from "@/components/meal/MealPlanCard";
import { MealPlanSetup } from "@/components/meal/MealPlanSetup";
import { BurnStrategyList, type BurnStrategy } from "@/components/meal/BurnStrategyList";
import { Button } from "@/components/ui/button";
import { matchMealPlanRules, DEFAULT_RULES } from "@/lib/meal-plan-rules";
import { projectForfeiture } from "@/lib/meal-plan";
import { formatCurrency } from "@/lib/utils";
import type { MealPlan, MealPlanRules } from "@/lib/types";

export default function MealPlanPage() {
  const router = useRouter();
  const { snapshot, setMealPlan } = useStore();
  const { user, meal_plan } = snapshot;
  const school = user.school;

  const [editing, setEditing] = React.useState(false);
  const [rules, setRules] = React.useState<MealPlanRules | null>(null);
  const [strategies, setStrategies] = React.useState<BurnStrategy[]>([]);
  const [loadingAdvice, setLoadingAdvice] = React.useState(false);
  const [adviceLoaded, setAdviceLoaded] = React.useState(false);

  const showSetup = !meal_plan || editing;

  // Resolve forfeiture rules for setup: curated first, then AI fallback, then default.
  React.useEffect(() => {
    if (!showSetup) return;
    if (meal_plan && editing) {
      setRules(meal_plan.rules);
      return;
    }
    const curated = matchMealPlanRules(school);
    if (curated) {
      setRules(curated);
      return;
    }
    let cancelled = false;
    setRules(null);
    fetch("/api/meal-plan/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ school }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setRules(data?.rules ?? DEFAULT_RULES);
      })
      .catch(() => {
        if (!cancelled) setRules(DEFAULT_RULES);
      });
    return () => {
      cancelled = true;
    };
  }, [showSetup, school, meal_plan, editing]);

  const handleSave = (plan: MealPlan) => {
    setMealPlan(plan);
    setEditing(false);
    setStrategies([]);
    setAdviceLoaded(false);
  };

  const handleGetStrategy = async () => {
    if (!meal_plan) return;
    setLoadingAdvice(true);
    const proj = projectForfeiture(meal_plan);
    try {
      const res = await fetch("/api/meal-plan/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school,
          swipes_remaining: meal_plan.swipes_remaining,
          dining_dollars_remaining: meal_plan.dining_dollars_remaining,
          days_left: proj.daysLeft,
          forfeited_value: proj.forfeitedValue,
          required_weekly_pace: proj.requiredWeeklyPace,
          forfeiture_summary: meal_plan.rules.forfeiture_summary,
        }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.strategies)) {
        setStrategies(data.strategies);
      }
    } catch {
      // leave strategies empty
    } finally {
      setLoadingAdvice(false);
      setAdviceLoaded(true);
    }
  };

  const proj = meal_plan ? projectForfeiture(meal_plan) : null;

  return (
    <div className="min-h-full">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Back"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-base text-foreground">Meal Plan</h1>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {showSetup ? (
          <>
            <div className="px-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                Don&apos;t forfeit what you already paid for
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tell us your balance and we&apos;ll project what you&apos;re on
                track to lose — and how to spend it down in time.
              </p>
            </div>
            {rules ? (
              <MealPlanSetup
                school={school || "Your school"}
                rules={rules}
                existing={editing ? meal_plan : undefined}
                onSave={handleSave}
              />
            ) : (
              <p className="text-sm text-muted-foreground px-1">Loading your school&apos;s rules…</p>
            )}
            {editing && (
              <Button variant="ghost" className="w-full" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          meal_plan && proj && (
            <>
              <MealPlanCard plan={meal_plan} />

              {/* Projection breakdown */}
              <div className="rounded-3xl bg-card border border-border/60 shadow-card p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Projection
                </p>
                <Row label="Swipes remaining" value={String(meal_plan.swipes_remaining)} />
                <Row label="Dining dollars" value={formatCurrency(meal_plan.dining_dollars_remaining)} />
                <Row label="Days until deadline" value={`${proj.daysLeft}`} />
                <Row
                  label="Use this many / week"
                  value={`${proj.requiredWeeklyPace} swipes`}
                />
                <div className="h-px bg-border/60 my-1" />
                <Row
                  label="On track to forfeit"
                  value={formatCurrency(proj.forfeitedValue)}
                  emphasis={proj.forfeitedValue > 0}
                />
                {!proj.pacedFromUser && (
                  <p className="text-xs text-muted-foreground">
                    Add your typical weekly usage for a sharper projection.
                  </p>
                )}
              </div>

              {/* Strategy */}
              {!adviceLoaded ? (
                <Button onClick={handleGetStrategy} loading={loadingAdvice} className="w-full">
                  How do I use them? Get my burn-down plan
                </Button>
              ) : strategies.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    Your burn-down plan
                  </h3>
                  <BurnStrategyList strategies={strategies} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground px-1">
                  Couldn&apos;t load suggestions right now. Try again later.
                </p>
              )}

              <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
                Update my balance
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${emphasis ? "text-destructive" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
