"use client";

import * as React from "react";
import type { MealPlan, MealPlanRules } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { suggestDeadlines } from "@/lib/meal-plan";

interface MealPlanSetupProps {
  school: string;
  rules: MealPlanRules;
  existing?: MealPlan;
  onSave: (plan: MealPlan) => void;
}

function toDateInput(iso: string): string {
  // <input type="date"> wants YYYY-MM-DD
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function MealPlanSetup({ school, rules, existing, onSave }: MealPlanSetupProps) {
  const defaults = React.useMemo(() => suggestDeadlines(rules), [rules]);

  const [swipes, setSwipes] = React.useState(
    existing ? String(existing.swipes_remaining) : ""
  );
  const [dollars, setDollars] = React.useState(
    existing ? String(existing.dining_dollars_remaining) : ""
  );
  const [pace, setPace] = React.useState(
    existing?.typical_swipes_per_week != null
      ? String(existing.typical_swipes_per_week)
      : ""
  );
  const [swipeDeadline, setSwipeDeadline] = React.useState(
    toDateInput(existing?.swipe_deadline ?? defaults.swipe_deadline)
  );
  const [dollarsDeadline, setDollarsDeadline] = React.useState(
    toDateInput(existing?.dining_dollars_deadline ?? defaults.dining_dollars_deadline)
  );

  const canSave = swipes.trim() !== "" && swipeDeadline !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      school,
      swipes_remaining: Math.max(0, Math.round(Number(swipes) || 0)),
      dining_dollars_remaining: Math.max(0, Math.round(Number(dollars) || 0)),
      typical_swipes_per_week:
        pace.trim() === "" ? undefined : Math.max(0, Number(pace) || 0),
      swipe_deadline: new Date(swipeDeadline).toISOString(),
      dining_dollars_deadline: new Date(
        dollarsDeadline || swipeDeadline
      ).toISOString(),
      rules,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted/60 px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          {rules.curated ? school : "Your school"} — how forfeiture works
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {rules.forfeiture_summary}
        </p>
        {!rules.curated && (
          <p className="text-[11px] text-accent-foreground/80 mt-1.5">
            We don&apos;t have verified rules for your school yet — double-check
            these dates with your dining office.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Swipes left"
          type="number"
          inputMode="numeric"
          placeholder="47"
          value={swipes}
          onChange={(e) => setSwipes(e.target.value)}
        />
        <Input
          label="Dining $ left"
          type="number"
          inputMode="numeric"
          placeholder="120"
          value={dollars}
          onChange={(e) => setDollars(e.target.value)}
        />
      </div>

      <Input
        label="Swipes expire / reset on"
        type="date"
        value={swipeDeadline}
        onChange={(e) => setSwipeDeadline(e.target.value)}
        hint={rules.swipe_reset === "weekly" ? "Resets weekly — defaults to this Saturday" : undefined}
      />

      <Input
        label="Dining dollars expire on"
        type="date"
        value={dollarsDeadline}
        onChange={(e) => setDollarsDeadline(e.target.value)}
      />

      <Input
        label="Swipes you typically use per week (optional)"
        type="number"
        inputMode="numeric"
        placeholder="e.g. 12"
        value={pace}
        onChange={(e) => setPace(e.target.value)}
        hint="Helps us project what you'll forfeit at your current pace."
      />

      <Button onClick={handleSave} disabled={!canSave} className="w-full">
        {existing ? "Update plan" : "See my forfeiture risk"}
      </Button>
    </div>
  );
}
