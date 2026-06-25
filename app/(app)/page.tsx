"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatCurrency, formatCurrencyDecimal } from "@/lib/utils";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { MealPlanCard } from "@/components/meal/MealPlanCard";
import { RefundRadarCard } from "@/components/refunds/RefundRadarCard";
import { SavingsTicker } from "@/components/deals/SavingsTicker";
import { SpendChart } from "@/components/budget/SpendChart";
import { FinancialHealthCard } from "@/components/budget/FinancialHealthCard";
import { CategoryIcon } from "@/components/budget/CategoryIcon";
import { MoneyDisplay } from "@/components/ui/money-display";
import { TOTAL_YEARLY_SAVINGS, FINANCIAL_HEALTH } from "@/lib/demo-data";
import { getWeeklySpendTrend, getWeeklySpendTotal, getWeeklyBudgetAllowance, getBudgetHealthScore } from "@/lib/spending";
import { refundStatus } from "@/lib/refunds";
import { staggerContainer, staggerItem, spring, haptic } from "@/lib/motion";

export default function Dashboard() {
  const router = useRouter();
  const { snapshot, savingsApplied, isDemo } = useStore();
  const { user, categories, goals, savings_opportunities, recent_transactions } = snapshot;

  const weeklyTrend = React.useMemo(
    () => getWeeklySpendTrend(recent_transactions),
    [recent_transactions]
  );
  const weeklyTotal = React.useMemo(
    () => getWeeklySpendTotal(recent_transactions),
    [recent_transactions]
  );
  const weeklyBudget = getWeeklyBudgetAllowance(snapshot.monthly_budget);
  const weeklyPct = weeklyBudget > 0 ? Math.min(100, (weeklyTotal / weeklyBudget) * 100) : 0;
  const healthScore = getBudgetHealthScore(snapshot.total_spent, snapshot.monthly_budget);

  const totalYearlySavings = savings_opportunities
    .filter((s) => s.claim_status !== "ignored")
    .reduce((acc, s) => acc + s.estimated_savings, 0);

  const activeGoal = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0];
  const weeksEarly = savingsApplied > 0
    ? Math.round((savingsApplied / (activeGoal?.weekly_savings_required || 39)) * 10) / 10
    : undefined;

  const topCategories = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const allTopCats = [...categories].sort((a, b) => b.spent - a.spent).map((c) => c.name);

  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Surface the refund radar on the dashboard while a deadline is approaching.
  const showRefundRadar = React.useMemo(() => {
    if (!snapshot.refund_ladder) return false;
    const s = refundStatus(snapshot.refund_ladder);
    return !s.expired && s.daysLeft <= 21;
  }, [snapshot.refund_ladder]);

  return (
    <div className="px-4 pt-14 pb-6">
      {/* Header: avatar + greeting + settings */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-success flex items-center justify-center text-background font-display font-semibold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="font-display font-semibold text-lg text-foreground leading-tight">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <button
              onClick={() => { haptic(); router.push("/onboarding"); }}
              className="flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Demo · Start fresh
            </button>
          )}
          <button
            onClick={() => { haptic(); router.push("/settings"); }}
            className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground cursor-pointer hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10M4 12h16M10 18h10" />
              <circle cx="17" cy="6" r="2" fill="currentColor" stroke="none" />
              <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
              <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      </motion.header>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
        {/* Hero card: weekly spend + chart */}
        <motion.div variants={staggerItem} className="rounded-3xl bg-card border border-border/60 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Weekly Spend
            </p>
            <span className="text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1.5" suppressHydrationWarning>
              {today}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-foreground">
              <MoneyDisplay amount={weeklyTotal} prefix="$" duration={700} />
            </span>
            <span className="font-display text-2xl font-semibold text-muted-foreground">
              / {formatCurrency(weeklyBudget)}
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                weeklyPct >= 100 ? "bg-destructive" : weeklyPct >= 80 ? "bg-accent" : "bg-success"
              }`}
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {weeklyBudget - weeklyTotal > 0
              ? `${formatCurrency(weeklyBudget - weeklyTotal)} left this week`
              : "Weekly budget reached"}
          </p>

          {/* Secondary metrics with vertical dividers */}
          <div className="flex items-stretch mt-4 mb-1 divide-x divide-border">
            {topCategories.map((cat) => (
              <div key={cat.id} className="flex-1 px-3 first:pl-0">
                <p className="text-base font-semibold text-foreground">{formatCurrency(cat.spent)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.name}</p>
              </div>
            ))}
          </div>

          {/* Sage line chart — non-interactive so it never blocks page scroll */}
          <div className="mt-3">
            <SpendChart data={weeklyTrend} />
          </div>
        </motion.div>

        {/* Financial health card */}
        <motion.div variants={staggerItem}>
          <FinancialHealthCard
            score={healthScore}
            label={healthScore >= 7 ? FINANCIAL_HEALTH.label : "Watch spending"}
            insight={
              recent_transactions.length === 0
                ? "Log some spending to analyze your financial health."
                : snapshot.ai_nudge || FINANCIAL_HEALTH.insight
            }
            topCategories={allTopCats}
            empty={recent_transactions.length === 0}
          />
        </motion.div>

        {/* Meal plan forfeiture watch (only for students with a meal plan) */}
        {user.has_meal_plan && (
          <motion.div variants={staggerItem}>
            {snapshot.meal_plan ? (
              <MealPlanCard plan={snapshot.meal_plan} onClick={() => router.push("/meal-plan")} />
            ) : (
              <button
                onClick={() => { haptic(); router.push("/meal-plan"); }}
                className="w-full flex items-center justify-between bg-accent/20 border border-accent/40 rounded-2xl px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Track your meal swipes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">See what you&apos;re on track to forfeit</p>
                </div>
                <svg className="w-4 h-4 text-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </motion.div>
        )}

        {/* Refund deadline radar (only while a deadline is near) */}
        {showRefundRadar && snapshot.refund_ladder && (
          <motion.div variants={staggerItem}>
            <RefundRadarCard ladder={snapshot.refund_ladder} onClick={() => router.push("/refunds")} />
          </motion.div>
        )}

        {/* Active goal */}
        {activeGoal && (
          <motion.div variants={staggerItem}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Active Goal
            </h3>
            <GoalProgress goal={activeGoal} weeksEarly={weeksEarly} onClick={() => router.push("/goals")} />
          </motion.div>
        )}

        {/* Savings ticker */}
        <motion.div variants={staggerItem}>
          <SavingsTicker amount={totalYearlySavings || TOTAL_YEARLY_SAVINGS} highlight={savingsApplied > 0} />
        </motion.div>

        {/* Quick actions adapt based on student lifecycle */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
          {user.student_status === "deciding" ? (
            <>
              <QuickAction label="Negotiate Aid" description="Write your negotiation script" cat="School Supplies" onClick={() => router.push("/negotiate")} highlight />
              <QuickAction label="Scan Syllabus" description="Estimate course & textbook costs" cat="School Supplies" onClick={() => router.push("/course-cost")} />
              <QuickAction label="Plan a Goal" description="Concert, trip, move-in costs" cat="Groceries" onClick={() => router.push("/goals")} />
              <QuickAction label="Find Free Money" description="Student deals & perks" cat="Eating Out" onClick={() => router.push("/deals")} />
            </>
          ) : user.student_status === "high_school" || user.student_status === "applying" ? (
            <>
              <QuickAction label="Plan a Goal" description="Concert, trip, savings goal" cat="Entertainment" onClick={() => router.push("/goals")} />
              <QuickAction label="Find Free Money" description="Student deals & perks" cat="Groceries" onClick={() => router.push("/deals")} />
              <QuickAction label="Check Before I Buy" description="Is this purchase smart?" cat="Eating Out" onClick={() => router.push("/check")} />
              <QuickAction label="Negotiate Aid" description="Financial aid scripts" cat="School Supplies" onClick={() => router.push("/negotiate")} />
            </>
          ) : (
            <>
              <QuickAction label="Meal Plan" description="Don't forfeit your swipes" cat="Groceries" onClick={() => router.push("/meal-plan")} highlight />
              <QuickAction label="Refund Radar" description="Drop-class refund deadlines" cat="School Supplies" onClick={() => router.push("/refunds")} />
              <QuickAction label="Scan Syllabus" description="Find cheapest textbooks" cat="School Supplies" onClick={() => router.push("/course-cost")} />
              <QuickAction label="Check Before I Buy" description="Is this purchase smart?" cat="Eating Out" onClick={() => router.push("/check")} />
              <QuickAction label="Plan a Goal" description="Concert, trip, textbooks" cat="Entertainment" onClick={() => router.push("/goals")} />
              <QuickAction label="Find Free Money" description="Student deals & perks" cat="Groceries" onClick={() => router.push("/deals")} />
            </>
          )}
        </motion.div>

        {/* Budget setup prompt if budget is unknown */}
        {user.budget_unknown && (
          <motion.div variants={staggerItem}>
            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center justify-between bg-accent/20 border border-accent/40 rounded-2xl px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Set your monthly budget</p>
                <p className="text-xs text-muted-foreground mt-0.5">Unlock spending insights and smart alerts</p>
              </div>
              <svg className="w-4 h-4 text-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Recent transactions */}
        <motion.div variants={staggerItem} className="rounded-3xl bg-card border border-border/60 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent</p>
            <button onClick={() => router.push("/deals")} className="text-xs text-primary-600 font-medium cursor-pointer">View all</button>
          </div>
          <div className="space-y-1">
            {recent_transactions.slice(0, 5).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={txn.category} size={38} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{txn.merchant}</p>
                    <p className="text-xs text-muted-foreground">{txn.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">-{formatCurrencyDecimal(txn.amount)}</p>
                  {txn.source === "voice" && (
                    <span className="text-[10px] text-primary-600 font-medium">voice</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Primary action: Log Expense */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          onClick={() => { haptic(12); router.push("/log"); }}
          className="w-full rounded-3xl bg-primary-600 text-primary-foreground shadow-card p-5 flex items-center justify-between cursor-pointer hover:bg-primary-700 transition-colors"
        >
          <div className="text-left">
            <p className="font-display font-semibold text-base">Log Expense</p>
            <p className="text-xs text-primary-200 mt-0.5">Tap the mic and just say it</p>
          </div>
          <span className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

function QuickAction({
  label,
  description,
  cat,
  onClick,
  highlight,
}: {
  label: string;
  description: string;
  cat: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={spring}
      onClick={() => { haptic(); onClick(); }}
      className={`flex flex-col gap-3 p-4 rounded-3xl border shadow-card text-left cursor-pointer hover:shadow-card-hover transition-shadow ${
        highlight ? "bg-primary-600 border-primary-700" : "bg-card border-border/60"
      }`}
    >
      <CategoryIcon category={cat} size={40} />
      <div>
        <p className={`text-sm font-semibold leading-tight ${highlight ? "text-primary-foreground" : "text-foreground"}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${highlight ? "text-primary-200" : "text-muted-foreground"}`}>{description}</p>
      </div>
    </motion.button>
  );
}
