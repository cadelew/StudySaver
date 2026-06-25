"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { CategoryBreakdownCard } from "@/components/budget/CategoryBreakdownCard";
import { CategoryAllocationPanel } from "@/components/budget/CategoryAllocationPanel";
import { formatCurrency } from "@/lib/utils";
import { staggerContainer, staggerItem, spring, haptic } from "@/lib/motion";
import type { Transaction } from "@/lib/types";

function dayKey(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

function buildDailyImpact(transactions: Transaction[], categoryName: string) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);

    return {
      key: dayKey(date),
      label: date.toLocaleDateString("en-US", { weekday: "narrow" }),
      value: 0,
    };
  });

  const indexByKey = new Map(days.map((day, index) => [day.key, index]));
  const normalizedCategory = categoryName.toLowerCase();

  transactions.forEach((txn) => {
    if (txn.category.toLowerCase() !== normalizedCategory) return;

    const createdAt = new Date(txn.created_at);
    if (Number.isNaN(createdAt.getTime())) return;

    const index = indexByKey.get(dayKey(createdAt));
    if (index !== undefined) {
      days[index].value += txn.amount;
    }
  });

  return days;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { snapshot, setCategoryLimit, autoAllocateCategories } = useStore();
  const [expandedId, setExpandedId] = React.useState<string | null>(snapshot.categories[0]?.id ?? null);

  const totalSpent = snapshot.categories.reduce((a, c) => a + c.spent, 0);
  const dailyImpactByCategory = React.useMemo(
    () =>
      new Map(
        snapshot.categories.map((cat) => [
          cat.id,
          buildDailyImpact(snapshot.recent_transactions, cat.name),
        ])
      ),
    [snapshot.categories, snapshot.recent_transactions]
  );

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

        {snapshot.categories.map((cat) => (
          <motion.div key={cat.id} variants={staggerItem} transition={spring}>
            <CategoryBreakdownCard
              category={cat}
              expanded={expandedId === cat.id}
              onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
              dailyImpact={dailyImpactByCategory.get(cat.id) ?? []}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
