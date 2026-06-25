"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { RefundLadder } from "@/lib/types";
import { refundStatus } from "@/lib/refunds";
import { formatCurrency } from "@/lib/utils";
import { MoneyDisplay } from "@/components/ui/money-display";
import { spring } from "@/lib/motion";

interface RefundRadarCardProps {
  ladder: RefundLadder;
  onClick?: () => void;
}

export function RefundRadarCard({ ladder, onClick }: RefundRadarCardProps) {
  const status = React.useMemo(() => refundStatus(ladder), [ladder]);
  const urgent = !status.expired && status.daysLeft <= 7;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={spring}
      onClick={onClick}
      className={`w-full text-left rounded-3xl border shadow-card p-5 cursor-pointer transition-shadow hover:shadow-card-hover ${
        urgent ? "bg-destructive/5 border-destructive/30" : "bg-card border-border/60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Refund Deadline
        </p>
        {!status.expired && (
          <span
            className={`text-xs font-medium rounded-full px-3 py-1.5 ${
              urgent ? "bg-destructive/15 text-destructive" : "bg-muted text-foreground"
            }`}
          >
            {status.daysLeft} {status.daysLeft === 1 ? "day" : "days"} left
          </span>
        )}
      </div>

      {status.expired ? (
        <div>
          <p className="font-display text-xl font-bold text-foreground">Refund window closed</p>
          <p className="text-xs text-muted-foreground mt-1">
            {ladder.term} • dropping now returns $0
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground leading-snug">
            <span className="font-semibold">{status.daysLeft} days left</span> to get{" "}
            <span className="font-semibold">{status.currentPct}%</span> of your tuition back
          </p>
          <p className="font-display text-3xl font-bold text-destructive leading-tight mt-1">
            <MoneyDisplay amount={status.amountAtStake} prefix="$" duration={800} />
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            at stake — drops to {status.nextPct}% after this deadline
            {" • "}
            {formatCurrency(ladder.tuition_amount)} {ladder.term}
          </p>
        </>
      )}
    </motion.button>
  );
}
