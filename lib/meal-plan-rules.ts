/**
 * Curated, verified meal-plan forfeiture rules per school. This per-school
 * encoding is the defensible moat — the official apps (Transact eAccounts, GET)
 * only show balances and never warn about forfeiture. All entries here are
 * curated: true. Uncurated schools fall back to /api/meal-plan/rules (AI) or
 * manual entry with DEFAULT_RULES.
 *
 * Keyed by the canonical slugs in lib/school-match.ts.
 */
import type { MealPlanRules } from "./types";
import { type SchoolKey, matchSchoolRecord } from "./school-match";

const RULES: Partial<Record<SchoolKey, MealPlanRules>> = {
  purdue: {
    swipe_reset: "block",
    swipes_roll_over: false,
    dining_dollars_rolls: "fall_to_spring",
    swipe_value_estimate: 9,
    forfeiture_summary:
      "Block meals are forfeited at the end of each semester — they do not carry over. Dining Dollars roll from fall to spring, but anything left after spring is lost.",
    source_url: "https://dining.purdue.edu/meal-plans/",
    curated: true,
  },
  rutgers: {
    swipe_reset: "semester",
    swipes_roll_over: false,
    dining_dollars_rolls: "semester",
    swipe_value_estimate: 10,
    forfeiture_summary:
      "Unused meal swipes expire every semester with no refund. Meal-plan cancellation after week two carries a $50 fee, and no refunds are given beyond week 12.",
    source_url: "https://food.rutgers.edu/meal-plans/",
    curated: true,
  },
  asu: {
    swipe_reset: "semester",
    swipes_roll_over: false,
    dining_dollars_rolls: "semester",
    swipe_value_estimate: 9,
    forfeiture_summary:
      "Meals reset each semester. Maroon & Gold Dollars sit in separate buckets with different expiration dates — check each bucket so none lapse before the term ends.",
    source_url: "https://sundevildining.asu.edu/meal-plans",
    curated: true,
  },
  appstate: {
    swipe_reset: "weekly",
    swipes_roll_over: false,
    dining_dollars_rolls: "semester",
    swipe_value_estimate: 8,
    forfeiture_summary:
      "Meal swipes reset every Saturday and do NOT roll over — anything unused that week is gone. Use them or lose them weekly.",
    source_url: "https://food.appstate.edu/meal-plans",
    curated: true,
  },
  berkeley: {
    swipe_reset: "semester",
    swipes_roll_over: false,
    dining_dollars_rolls: "semester",
    swipe_value_estimate: 11,
    forfeiture_summary:
      "Meal points / swipes expire at the end of the semester with no refund. Spend them down before move-out.",
    source_url: "https://caldining.berkeley.edu/meal-plans",
    curated: true,
  },
};

/** Sensible fallback for manual entry when a school isn't curated and AI is off. */
export const DEFAULT_RULES: MealPlanRules = {
  swipe_reset: "semester",
  swipes_roll_over: false,
  dining_dollars_rolls: "semester",
  swipe_value_estimate: 9,
  forfeiture_summary:
    "Most plans forfeit unused swipes at the end of the term with no refund. Confirm your exact dates with your dining services office.",
  curated: false,
};

export function matchMealPlanRules(school: string | undefined | null): MealPlanRules | null {
  return matchSchoolRecord(school, RULES);
}
