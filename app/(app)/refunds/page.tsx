"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { RefundRadarCard } from "@/components/refunds/RefundRadarCard";
import { RefundSetup } from "@/components/refunds/RefundSetup";
import { Button } from "@/components/ui/button";
import {
  matchRefundTemplate,
  DEFAULT_TEMPLATE,
  type RefundLadderTemplate,
} from "@/lib/refund-ladders";
import { refundStatus } from "@/lib/refunds";
import { formatCurrency } from "@/lib/utils";
import type { RefundLadder } from "@/lib/types";

export default function RefundsPage() {
  const router = useRouter();
  const { snapshot, setRefundLadder } = useStore();
  const { user, refund_ladder } = snapshot;
  const school = user.school;

  const [editing, setEditing] = React.useState(false);
  const [template, setTemplate] = React.useState<RefundLadderTemplate | null>(null);

  const showSetup = !refund_ladder || editing;

  React.useEffect(() => {
    if (!showSetup) return;
    const curated = matchRefundTemplate(school);
    if (curated) {
      setTemplate(curated);
      return;
    }
    let cancelled = false;
    setTemplate(null);
    fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ school }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setTemplate(data?.template ?? DEFAULT_TEMPLATE);
      })
      .catch(() => {
        if (!cancelled) setTemplate(DEFAULT_TEMPLATE);
      });
    return () => {
      cancelled = true;
    };
  }, [showSetup, school]);

  const handleSave = (ladder: RefundLadder) => {
    setRefundLadder(ladder);
    setEditing(false);
  };

  const status = refund_ladder ? refundStatus(refund_ladder) : null;

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
        <h1 className="font-semibold text-base text-foreground">Refund Radar</h1>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {showSetup ? (
          <>
            <div className="px-1">
              <h2 className="font-display text-xl font-bold text-foreground">
                Dropping a class? Don&apos;t miss the refund window
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;ll count down to each refund deadline so you know exactly
                how much you get back — and when it drops.
              </p>
            </div>
            {template ? (
              <RefundSetup
                school={school || "Your school"}
                template={template}
                existing={editing ? refund_ladder : undefined}
                onSave={handleSave}
              />
            ) : (
              <p className="text-sm text-muted-foreground px-1">Loading your school&apos;s refund ladder…</p>
            )}
            {editing && (
              <Button variant="ghost" className="w-full" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          refund_ladder && status && (
            <>
              <RefundRadarCard ladder={refund_ladder} />

              {/* Full ladder */}
              <div className="rounded-3xl bg-card border border-border/60 shadow-card p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {refund_ladder.term} refund ladder
                </p>
                {refund_ladder.tiers.map((tier, i) => {
                  const isCurrent =
                    !status.expired && tier.deadline === status.nextDeadline;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-sm ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {tier.pct}% back
                        {isCurrent && " — you are here"}
                      </span>
                      <span className={`text-sm ${isCurrent ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
                        by {new Date(tier.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
                <div className="h-px bg-border/60 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Refund if you drop today</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency((refund_ladder.tuition_amount * status.currentPct) / 100)}
                  </span>
                </div>
              </div>

              {refund_ladder.meal_plan_cancel && (
                <div className="rounded-2xl bg-accent/15 border border-accent/30 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">Meal-plan cancellation</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {refund_ladder.meal_plan_cancel.notes}
                  </p>
                </div>
              )}

              {refund_ladder.source_url && (
                <a
                  href={refund_ladder.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-primary-600 font-medium"
                >
                  View your school&apos;s official policy →
                </a>
              )}

              <Button variant="outline" className="w-full" onClick={() => setEditing(true)}>
                Update tuition or term
              </Button>
            </>
          )
        )}
      </div>
    </div>
  );
}
