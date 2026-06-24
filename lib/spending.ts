import type { Transaction } from "./types";
import type { SpendPoint } from "@/components/budget/SpendChart";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Start of the current calendar week (Monday 00:00 local). */
function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Sum spending per day for the current Mon–Sun week from logged transactions. */
export function getWeeklySpendTrend(transactions: Transaction[]): SpendPoint[] {
  const weekStart = startOfWeek();

  return WEEK_LABELS.map((label, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);

    const value = transactions
      .filter((txn) => sameDay(new Date(txn.created_at), day))
      .reduce((sum, txn) => sum + txn.amount, 0);

    return { label, value: Math.round(value * 100) / 100 };
  });
}

export function getWeeklySpendTotal(transactions: Transaction[]): number {
  const total = getWeeklySpendTrend(transactions).reduce((sum, p) => sum + p.value, 0);
  return Math.round(total * 100) / 100;
}

/** Weekly spending cap derived from monthly flexible budget (~4 weeks). */
export function getWeeklyBudgetAllowance(monthlyBudget: number): number {
  if (monthlyBudget <= 0) return 0;
  return Math.round((monthlyBudget / 4) * 100) / 100;
}

/** Rough health score from how much of the monthly budget is used so far. */
export function getBudgetHealthScore(totalSpent: number, monthlyBudget: number): number {
  if (monthlyBudget <= 0) return 5;
  const used = totalSpent / monthlyBudget;
  const score = 10 - used * 6;
  return Math.round(Math.max(3, Math.min(10, score)) * 10) / 10;
}
