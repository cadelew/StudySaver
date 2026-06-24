"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIcon, categoryBg } from "./CategoryIcon";
import { formatCurrency, pct } from "@/lib/utils";
import { spring, haptic } from "@/lib/motion";
import type { BudgetCategory } from "@/lib/types";

interface CategoryBreakdownCardProps {
  category: BudgetCategory;
  expanded: boolean;
  onToggle: () => void;
  dailyImpact: number[];
}

export function CategoryBreakdownCard({ category, expanded, onToggle, dailyImpact }: CategoryBreakdownCardProps) {
  const percentage = pct(category.spent, category.monthly_limit);
  const remaining = category.monthly_limit - category.spent;
  const maxBar = Math.max(...dailyImpact, 1);
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <motion.div
      layout
      transition={spring}
      style={{ background: categoryBg(category.name) }}
      className="rounded-3xl overflow-hidden"
    >
      <button
        onClick={() => { haptic(); onToggle(); }}
        className="w-full flex items-center gap-4 p-4 cursor-pointer text-left"
      >
        <CategoryIcon category={category.name} size={48} className="bg-card/50" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-base text-primary-700">{category.name}</p>
          <p className="text-sm text-primary-700/70">
            {formatCurrency(category.spent)} of {formatCurrency(category.monthly_limit)}
          </p>
        </div>
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={spring}
          className="w-5 h-5 text-primary-700/60 flex-shrink-0"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="rounded-2xl bg-card/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700/70">
                    Daily impact
                  </p>
                  <p className="text-xs font-medium text-primary-700">
                    {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(-remaining)} over`}
                  </p>
                </div>

                {/* Micro bar chart */}
                <div className="flex items-end justify-between gap-2 h-20">
                  {dailyImpact.map((val, i) => {
                    const heightPct = (val / maxBar) * 100;
                    const isOver = percentage > 100 && i === dailyImpact.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full flex items-end h-16">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPct, 4)}%` }}
                            transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 26 }}
                            className="w-full rounded-full"
                            style={{ background: isOver ? "#C0573B" : val > 0 ? "#1A4331" : "#B6C5B8" }}
                          />
                        </div>
                        <span className="text-[10px] text-primary-700/50 font-medium">{days[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
