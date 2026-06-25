/**
 * Pure, AI-free burn-rate math for the meal-plan optimizer. Projects how many
 * swipes / dining dollars a student will forfeit at their current pace and what
 * that's worth.
 */
import type { MealPlan, MealPlanRules, SwipeResetPeriod } from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days from now until an ISO deadline (floored at 0). */
export function daysUntil(deadline: string, now: Date = new Date()): number {
  const end = new Date(deadline).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - now.getTime()) / MS_PER_DAY));
}

/** Suggest default deadlines for a fresh plan based on its reset cadence. */
export function suggestDeadlines(
  rules: MealPlanRules,
  now: Date = new Date()
): { swipe_deadline: string; dining_dollars_deadline: string } {
  const swipeDeadline = nextResetDate(rules.swipe_reset, now);
  // Dining dollars usually live until the end of the term regardless of swipe reset.
  const diningDeadline =
    rules.dining_dollars_rolls === "none" ? swipeDeadline : endOfTerm(now);
  return {
    swipe_deadline: swipeDeadline,
    dining_dollars_deadline: diningDeadline,
  };
}

function nextResetDate(reset: SwipeResetPeriod, now: Date): string {
  if (reset === "weekly") {
    // App State resets Saturday. Find the upcoming Saturday (day 6).
    const d = new Date(now);
    const daysToSat = (6 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysToSat);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  return endOfTerm(now);
}

/** Rough end-of-term date: mid-December for a fall term, mid-May for spring. */
function endOfTerm(now: Date): string {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // Jul–Dec → fall term ends ~Dec 18; Jan–Jun → spring term ends ~May 15.
  const end = month >= 6 ? new Date(year, 11, 18) : new Date(year, 4, 15);
  end.setHours(0, 0, 0, 0);
  return end.toISOString();
}

export interface ForfeitureProjection {
  daysLeft: number;
  weeksLeft: number;
  /** Swipes/week needed to zero out the balance by the deadline. */
  requiredWeeklyPace: number;
  projectedUnusedSwipes: number;
  projectedUnusedDollars: number;
  forfeitedValue: number;
  /** True when we used the user's pace; false when we assumed a "use-it-all" pace. */
  pacedFromUser: boolean;
}

/**
 * Project forfeiture. If the user gave a typical weekly pace we project from it;
 * otherwise we report the required pace and assume nothing is forfeited yet
 * (so the UI nudges them to set a realistic pace).
 */
export function projectForfeiture(
  plan: MealPlan,
  now: Date = new Date()
): ForfeitureProjection {
  const daysLeft = daysUntil(plan.swipe_deadline, now);
  const weeksLeft = daysLeft / 7;

  const requiredWeeklyPace =
    weeksLeft > 0 ? plan.swipes_remaining / weeksLeft : plan.swipes_remaining;

  const pacedFromUser =
    typeof plan.typical_swipes_per_week === "number" &&
    plan.typical_swipes_per_week >= 0;

  const expectedUse = pacedFromUser
    ? (plan.typical_swipes_per_week as number) * weeksLeft
    : plan.swipes_remaining; // optimistic default: assume they use it all

  const projectedUnusedSwipes = Math.max(
    0,
    Math.round(plan.swipes_remaining - expectedUse)
  );

  // Dining dollars are forfeited only when they don't roll past this deadline.
  const dollarsExpire = plan.rules.dining_dollars_rolls !== "fall_to_spring";
  const diningDaysLeft = daysUntil(plan.dining_dollars_deadline, now);
  const projectedUnusedDollars =
    dollarsExpire && diningDaysLeft <= daysLeft + 1
      ? Math.max(0, Math.round(plan.dining_dollars_remaining))
      : 0;

  const forfeitedValue = Math.round(
    projectedUnusedSwipes * plan.rules.swipe_value_estimate +
      projectedUnusedDollars
  );

  return {
    daysLeft,
    weeksLeft,
    requiredWeeklyPace: Math.max(0, Math.round(requiredWeeklyPace * 10) / 10),
    projectedUnusedSwipes,
    projectedUnusedDollars,
    forfeitedValue,
    pacedFromUser,
  };
}
