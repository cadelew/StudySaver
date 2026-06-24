"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CategoryBreakdownCard } from "@/components/budget/CategoryBreakdownCard";
import { CategoryAllocationPanel } from "@/components/budget/CategoryAllocationPanel";
import { formatCurrency } from "@/lib/utils";
import { staggerContainer, staggerItem, spring, haptic } from "@/lib/motion";

// Deterministic pseudo daily-impact series per category (demo)
function dailyImpactFor(spent: number, seed: number): number[] {
  const out: number[] = [];
  let s = seed * 9301 + 49297;
  for (let i = 0; i < 7; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    out.push(Math.round(r * (spent / 3)));
  }
  return out;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { snapshot, setCategoryLimit, autoAllocateCategories } = useStore();
  const [expandedId, setExpandedId] = React.useState<string | null>(snapshot.categories[0]?.id ?? null);

  const totalSpent = snapshot.categories.reduce((a, c) => a + c.spent, 0);

  return (
    <div className="min-h-full px-4 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => { haptic(); router.push("/"); }}
          className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
          aria-label="Back"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-display font-semibold text-xl text-foreground leading-tight">Categories</h1>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalSpent)} spent this month</p>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        <motion.div variants={staggerItem}>
          <CategoryAllocationPanel
            categories={snapshot.categories}
            monthlyBudget={snapshot.monthly_budget}
            onAutoAllocate={autoAllocateCategories}
            onSetLimit={setCategoryLimit}
          />
        </motion.div>

        {snapshot.categories.map((cat, i) => (
          <motion.div key={cat.id} variants={staggerItem} transition={spring}>
            <CategoryBreakdownCard
              category={cat}
              expanded={expandedId === cat.id}
              onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              dailyImpact={dailyImpactFor(cat.spent || cat.monthly_limit / 2, i + 1)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
