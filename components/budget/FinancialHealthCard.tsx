"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CategoryIcon } from "./CategoryIcon";

interface FinancialHealthCardProps {
  score: number;
  label: string;
  insight: string;
  topCategories: string[];
}

export function FinancialHealthCard({ score, label, insight, topCategories }: FinancialHealthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="rounded-3xl bg-accent-50 border border-accent-100 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9A7B33]">
            Financial Health
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-display text-4xl font-bold text-primary-700">{score}</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l2.6 6.3L21 9l-4.8 4.3L17.5 21 12 17.3 6.5 21l1.3-7.7L3 9l6.4-.7L12 2z" />
              </svg>
              <span className="text-sm font-semibold text-primary-700">{label}</span>
            </div>
          </div>
        </div>

        {/* Top expense category icons */}
        <div className="flex -space-x-2">
          {topCategories.slice(0, 5).map((cat) => (
            <div key={cat} className="ring-2 ring-accent-50 rounded-full">
              <CategoryIcon category={cat} size={34} />
            </div>
          ))}
        </div>
      </div>

      {/* AI insight */}
      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-card/70 px-3.5 py-3">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-sm text-foreground leading-relaxed">{insight}</p>
      </div>
    </motion.div>
  );
}
