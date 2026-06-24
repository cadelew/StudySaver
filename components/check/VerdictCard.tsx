"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { IconCheckCircle, IconQuestion, IconClock } from "@/components/ui/icons";
import type { PurchaseCheck } from "@/lib/types";

interface VerdictCardProps {
  check: PurchaseCheck;
}

const VERDICT_CONFIG = {
  yes: {
    Icon: IconCheckCircle,
    label: "Yes, go for it",
    bg: "bg-success-50",
    border: "border-success/30",
    text: "text-success",
    iconClass: "text-success",
  },
  yes_but: {
    Icon: IconQuestion,
    label: "Yes, but...",
    bg: "bg-accent-50",
    border: "border-accent/40",
    text: "text-[#9A7B33]",
    iconClass: "text-[#9A7B33]",
  },
  wait: {
    Icon: IconClock,
    label: "Wait on this",
    bg: "bg-[#F4E2DB]",
    border: "border-destructive/30",
    text: "text-destructive",
    iconClass: "text-destructive",
  },
};

export function VerdictCard({ check }: VerdictCardProps) {
  const config = VERDICT_CONFIG[check.verdict];
  const { Icon } = config;

  return (
    <div className={`rounded-3xl border-2 ${config.bg} ${config.border} overflow-hidden`}>
      <div className={`px-4 py-4 ${config.bg}`}>
        <div className="flex items-center gap-3">
          <span className={`flex-shrink-0 ${config.iconClass}`}>
            <Icon className="w-7 h-7" />
          </span>
          <div>
            <p className={`text-lg font-bold ${config.text}`}>{config.label}</p>
            <p className="text-sm text-muted-foreground">
              {check.item} · {formatCurrency(check.estimated_amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card px-4 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Budget impact
          </p>
          <p className="text-sm text-foreground">{check.budget_status}</p>
        </div>

        {check.goal_impact && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Goal impact
            </p>
            <p className="text-sm text-foreground">{check.goal_impact}</p>
            {check.goal_delay_days && check.goal_delay_days > 0 && (
              <p className="text-xs text-[#9A7B33] font-medium mt-0.5">
                Delays goal by {check.goal_delay_days} days
              </p>
            )}
          </div>
        )}

        {check.savings_opportunities && check.savings_opportunities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Before you buy
            </p>
            <div className="space-y-1.5">
              {check.savings_opportunities.map((opp, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-success text-sm flex-shrink-0 mt-0.5">·</span>
                  <p className="text-sm text-foreground">{opp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted rounded-xl px-3 py-3">
          <p className="text-sm text-foreground leading-relaxed">{check.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
