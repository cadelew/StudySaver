import * as React from "react";
import { DEMO_SNAPSHOT, FINANCIAL_HEALTH } from "../../lib/demo-data";
import { formatCurrency, formatCurrencyDecimal } from "../../lib/utils";
import { GoalProgress } from "../../components/goals/GoalProgress";
import { MealPlanCard } from "../../components/meal/MealPlanCard";
import { RefundRadarCard } from "../../components/refunds/RefundRadarCard";
import { SavingsTicker } from "./stubs/savings-ticker";
import { SpendChart } from "../../components/budget/SpendChart";
import { FinancialHealthCard } from "../../components/budget/FinancialHealthCard";
import { CategoryIcon } from "../../components/budget/CategoryIcon";
import {
  getWeeklySpendTrend,
  getWeeklySpendTotal,
  getWeeklyBudgetAllowance,
  getBudgetHealthScore,
} from "../../lib/spending";
import { refundStatus } from "../../lib/refunds";

/** Static dashboard — same markup as app/(app)/page.tsx, fed with DEMO_SNAPSHOT. */
export const DashboardRemotion: React.FC = () => {
  const snapshot = DEMO_SNAPSHOT;
  const { user, categories, goals, savings_opportunities, recent_transactions } =
    snapshot;

  const weeklyTrend = React.useMemo(
    () => getWeeklySpendTrend(recent_transactions),
    [recent_transactions],
  );
  const weeklyTotal = React.useMemo(
    () => getWeeklySpendTotal(recent_transactions),
    [recent_transactions],
  );
  const weeklyBudget = getWeeklyBudgetAllowance(snapshot.monthly_budget);
  const weeklyPct =
    weeklyBudget > 0 ? Math.min(100, (weeklyTotal / weeklyBudget) * 100) : 0;
  const healthScore = getBudgetHealthScore(
    snapshot.total_spent,
    snapshot.monthly_budget,
  );

  const totalYearlySavings = savings_opportunities
    .filter((s) => s.claim_status !== "ignored")
    .reduce((acc, s) => acc + s.estimated_savings, 0);

  const activeGoal = goals
    .filter((g) => g.status === "active")
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))[0];

  const topCategories = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  const allTopCats = [...categories]
    .sort((a, b) => b.spent - a.spent)
    .map((c) => c.name);

  const showRefundRadar = React.useMemo(() => {
    if (!snapshot.refund_ladder) return false;
    const s = refundStatus(snapshot.refund_ladder);
    return !s.expired && s.daysLeft <= 21;
  }, [snapshot.refund_ladder]);

  return (
    <div className="px-4 pt-14 pb-32 bg-background">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-success flex items-center justify-center text-background font-display font-semibold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="font-display font-semibold text-lg text-foreground leading-tight">
              {user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground flex-shrink-0"
            aria-hidden
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h10M4 12h16M10 18h10"
              />
              <circle cx="17" cy="6" r="2" fill="currentColor" stroke="none" />
              <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
              <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Weekly Spend
            </p>
            <span className="text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1.5">
              Thu, Jun 25
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-foreground">
              {formatCurrency(weeklyTotal)}
            </span>
            <span className="font-display text-2xl font-semibold text-muted-foreground">
              / {formatCurrency(weeklyBudget)}
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                weeklyPct >= 100
                  ? "bg-destructive"
                  : weeklyPct >= 80
                    ? "bg-accent"
                    : "bg-success"
              }`}
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {weeklyBudget - weeklyTotal > 0
              ? `${formatCurrency(weeklyBudget - weeklyTotal)} left this week`
              : "Weekly budget reached"}
          </p>

          <div className="flex items-stretch mt-4 mb-1 divide-x divide-border">
            {topCategories.map((cat) => (
              <div key={cat.id} className="flex-1 px-3 first:pl-0">
                <p className="text-base font-semibold text-foreground">
                  {formatCurrency(cat.spent)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat.name}</p>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <SpendChart data={weeklyTrend} height={110} />
          </div>
        </div>

        <FinancialHealthCard
          score={healthScore}
          label={healthScore >= 7 ? FINANCIAL_HEALTH.label : "Watch spending"}
          insight={snapshot.ai_nudge || FINANCIAL_HEALTH.insight}
          topCategories={allTopCats}
        />

        {user.has_meal_plan && snapshot.meal_plan && (
          <MealPlanCard plan={snapshot.meal_plan} />
        )}

        {showRefundRadar && snapshot.refund_ladder && (
          <RefundRadarCard ladder={snapshot.refund_ladder} />
        )}

        {activeGoal && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Active Goal
            </h3>
            <GoalProgress goal={activeGoal} />
          </div>
        )}

        <SavingsTicker amount={totalYearlySavings} />

        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            label="Meal Plan"
            description="Don't forfeit your swipes"
            cat="Groceries"
            highlight
          />
          <QuickAction
            label="Refund Radar"
            description="Drop-class refund deadlines"
            cat="School Supplies"
          />
          <QuickAction
            label="Scan Syllabus"
            description="Find cheapest textbooks"
            cat="School Supplies"
          />
          <QuickAction
            label="Check Before I Buy"
            description="Is this purchase smart?"
            cat="Eating Out"
          />
        </div>

        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recent
            </p>
            <span className="text-xs text-primary-600 font-medium">View all</span>
          </div>
          <div className="space-y-1">
            {recent_transactions.slice(0, 3).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon category={txn.category} size={38} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {txn.merchant}
                    </p>
                    <p className="text-xs text-muted-foreground">{txn.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    -{formatCurrencyDecimal(txn.amount)}
                  </p>
                  {txn.source === "voice" && (
                    <span className="text-[10px] text-primary-600 font-medium">
                      voice
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function QuickAction({
  label,
  description,
  cat,
  highlight,
}: {
  label: string;
  description: string;
  cat: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-3xl border shadow-card text-left ${
        highlight ? "bg-primary-600 border-primary-700" : "bg-card border-border/60"
      }`}
    >
      <CategoryIcon category={cat} size={40} />
      <div>
        <p
          className={`text-sm font-semibold leading-tight ${
            highlight ? "text-primary-foreground" : "text-foreground"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            highlight ? "text-primary-200" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
