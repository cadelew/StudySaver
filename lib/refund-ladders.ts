/**
 * Curated tuition / add-drop refund ladders per school. Exact calendar dates
 * shift every term, so we store the ladder *schedule* relative to the term start
 * (in weeks) and resolve it to absolute dates once the student enters their term
 * start + tuition amount. Uncurated schools fall back to /api/refunds (AI) or
 * the generic template, always editable.
 *
 * Keyed by the canonical slugs in lib/school-match.ts.
 */
import type { RefundLadder } from "./types";
import { type SchoolKey, matchSchoolRecord } from "./school-match";

export interface RefundLadderTemplate {
  /** Drop before (term start + week*7 days) to keep `pct`. Sorted asc by week. */
  relative_tiers: { pct: number; week: number }[];
  add_drop_week?: number;
  meal_plan_cancel?: { fee: number; week: number; notes: string };
  source_url?: string;
  curated: boolean;
}

const TEMPLATES: Partial<Record<SchoolKey, RefundLadderTemplate>> = {
  rutgers: {
    relative_tiers: [
      { pct: 100, week: 2 },
      { pct: 50, week: 6 },
      { pct: 25, week: 9 },
      { pct: 0, week: 12 },
    ],
    add_drop_week: 2,
    meal_plan_cancel: {
      fee: 50,
      week: 2,
      notes: "Meal-plan cancellation carries a $50 fee after week 2; no refund beyond week 12.",
    },
    source_url: "https://studentabc.rutgers.edu/tuition-refund-policy",
    curated: true,
  },
  purdue: {
    relative_tiers: [
      { pct: 100, week: 1 },
      { pct: 60, week: 3 },
      { pct: 40, week: 5 },
      { pct: 0, week: 9 },
    ],
    add_drop_week: 1,
    source_url: "https://www.purdue.edu/bursar/refunds/",
    curated: true,
  },
  asu: {
    relative_tiers: [
      { pct: 100, week: 3 },
      { pct: 50, week: 4 },
      { pct: 0, week: 5 },
    ],
    add_drop_week: 1,
    source_url: "https://students.asu.edu/refundpolicy",
    curated: true,
  },
  appstate: {
    relative_tiers: [
      { pct: 100, week: 1 },
      { pct: 90, week: 2 },
      { pct: 50, week: 4 },
      { pct: 25, week: 6 },
      { pct: 0, week: 8 },
    ],
    add_drop_week: 1,
    source_url: "https://studentaccounts.appstate.edu/refunds",
    curated: true,
  },
  berkeley: {
    relative_tiers: [
      { pct: 100, week: 2 },
      { pct: 50, week: 4 },
      { pct: 25, week: 6 },
      { pct: 0, week: 8 },
    ],
    add_drop_week: 2,
    source_url: "https://registrar.berkeley.edu/tuition-fees-residency/tuition-fees/cancellation-withdrawal/",
    curated: true,
  },
};

/** Generic fallback ladder used for manual entry / uncurated schools. */
export const DEFAULT_TEMPLATE: RefundLadderTemplate = {
  relative_tiers: [
    { pct: 100, week: 1 },
    { pct: 50, week: 3 },
    { pct: 25, week: 5 },
    { pct: 0, week: 8 },
  ],
  add_drop_week: 1,
  curated: false,
};

export function matchRefundTemplate(school: string | undefined | null): RefundLadderTemplate | null {
  return matchSchoolRecord(school, TEMPLATES);
}

/** Resolve a relative template + student inputs into an absolute RefundLadder. */
export function resolveLadder(
  template: RefundLadderTemplate,
  input: { school: string; term: string; tuition_amount: number; term_start: string }
): RefundLadder {
  const start = new Date(input.term_start);
  const addDays = (weeks: number) => {
    const d = new Date(start);
    d.setDate(d.getDate() + weeks * 7);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  return {
    school: input.school,
    term: input.term,
    tuition_amount: input.tuition_amount,
    add_drop_deadline:
      template.add_drop_week != null ? addDays(template.add_drop_week) : undefined,
    tiers: [...template.relative_tiers]
      .sort((a, b) => b.pct - a.pct)
      .map((t) => ({ pct: t.pct, deadline: addDays(t.week) })),
    meal_plan_cancel: template.meal_plan_cancel
      ? {
          fee: template.meal_plan_cancel.fee,
          deadline: addDays(template.meal_plan_cancel.week),
          notes: template.meal_plan_cancel.notes,
        }
      : undefined,
    curated: template.curated,
    source_url: template.source_url,
    updated_at: new Date().toISOString(),
  };
}
