/**
 * Pure, AI-free refund-deadline math. Given a refund ladder, tells the student
 * how much money is on the table right now and when it drops.
 */
import type { RefundLadder } from "./types";
import { daysUntil } from "./meal-plan";

export interface RefundStatus {
  /** Refund % you'd get if you dropped right now. */
  currentPct: number;
  /** The next, lower refund % once the upcoming deadline passes. */
  nextPct: number;
  /** ISO date when currentPct drops to nextPct. */
  nextDeadline: string | null;
  daysLeft: number;
  /** Dollars you lose by waiting past nextDeadline. */
  amountAtStake: number;
  /** True once all refund windows have closed. */
  expired: boolean;
}

export { daysUntil };

export function refundStatus(ladder: RefundLadder, now: Date = new Date()): RefundStatus {
  // Tiers sorted ascending by deadline (earliest first).
  const tiers = [...ladder.tiers].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  // The current tier is the earliest one whose deadline hasn't passed — that's
  // the % you still qualify for if you act before its deadline.
  const idx = tiers.findIndex((t) => new Date(t.deadline).getTime() >= now.getTime());

  if (idx === -1) {
    return {
      currentPct: 0,
      nextPct: 0,
      nextDeadline: null,
      daysLeft: 0,
      amountAtStake: 0,
      expired: true,
    };
  }

  const current = tiers[idx];
  const next = tiers[idx + 1];
  const nextPct = next ? next.pct : 0;
  const amountAtStake = Math.round(
    (ladder.tuition_amount * (current.pct - nextPct)) / 100
  );

  return {
    currentPct: current.pct,
    nextPct,
    nextDeadline: current.deadline,
    daysLeft: daysUntil(current.deadline, now),
    amountAtStake,
    expired: false,
  };
}
