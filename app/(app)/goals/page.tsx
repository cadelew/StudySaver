"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { GoalProgress } from "@/components/goals/GoalProgress";
import { GoalAllocationPanel } from "@/components/goals/GoalAllocationPanel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { IconTarget, GoalInitial } from "@/components/ui/icons";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { snapshot, addGoal, reorderGoal, setGoalAllocation, autoAllocateGoals } = useStore();
  const [showCreate, setShowCreate] = React.useState(false);
  const [goalText, setGoalText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [planPreview, setPlanPreview] = React.useState<GoalPlanResult | null>(null);

  interface GoalPlanResult {
    goal_name: string;
    goal_type: string;
    estimated_total: number;
    cost_breakdown: Record<string, number>;
    deadline_suggestion: string;
    weekly_savings_required: number;
    recommendation: string;
    tradeoffs: string[];
  }

  const handlePlanGoal = async () => {
    if (!goalText.trim()) return;
    setLoading(true);
    try {
      const weeksUntilDeadline = 8;
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalText,
          monthlyBudget: snapshot.monthly_budget,
          remainingBudget: snapshot.remaining,
          location: snapshot.user.location,
          weeksUntilDeadline,
        }),
      });
      const data: GoalPlanResult = await res.json();
      setPlanPreview(data);
    } catch (err) {
      toast("Couldn't plan goal. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = () => {
    if (!planPreview) return;
    addGoal({
      name: planPreview.goal_name,
      target_amount: planPreview.estimated_total,
      saved_amount: 0,
      deadline: planPreview.deadline_suggestion,
      weekly_savings_required: planPreview.weekly_savings_required,
      status: "active",
      cost_breakdown: planPreview.cost_breakdown,
    });
    setShowCreate(false);
    setPlanPreview(null);
    setGoalText("");
    toast(`Goal added: ${planPreview.goal_name}!`);
  };

  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between px-4 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-semibold text-base text-foreground">Goals</h1>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          variant="primary"
          size="sm"
          className="rounded-full"
        >
          + New goal
        </Button>
      </div>

      <div className="px-4 pb-8 space-y-4">
        {snapshot.goals.length > 0 && (
          <GoalAllocationPanel
            goals={snapshot.goals}
            availablePool={snapshot.remaining}
            onAutoAllocate={autoAllocateGoals}
            onSetAllocation={setGoalAllocation}
            onReorder={reorderGoal}
          />
        )}

        {/* Active goals */}
        {snapshot.goals.length === 0 ? (
          <div className="text-center py-16">
            <span className="inline-flex w-16 h-16 rounded-full bg-muted text-muted-foreground items-center justify-center mx-auto">
              <IconTarget className="w-8 h-8" />
            </span>
            <p className="text-foreground font-semibold mt-4">No goals yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first goal to start saving with purpose.
            </p>
            <Button onClick={() => setShowCreate(true)} variant="primary" className="mt-6">
              Plan a goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {[...snapshot.goals]
              .filter((g) => g.status === "active")
              .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
              .map((goal) => (
              <div key={goal.id}>
                <GoalProgress goal={goal} priority={goal.priority} />
                <GoalBreakdown goal={goal} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create goal sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreate(false); setPlanPreview(null); }} />
          <div className="relative bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
              <h2 className="font-semibold text-base mt-2">{planPreview ? "Your Goal Plan" : "Plan a Goal"}</h2>
              <button onClick={() => { setShowCreate(false); setPlanPreview(null); setGoalText(""); }} className="ml-auto mt-2 text-muted-foreground">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 pb-8 space-y-4">
              {!planPreview ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Describe your goal in plain language. We&apos;ll estimate costs and build a savings plan.
                  </p>
                  <textarea
                    className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-600 min-h-[100px] resize-none"
                    placeholder='"I want to go to a concert in Oakland next month"'
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                  />

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Concert next month",
                      "Trip home for Thanksgiving",
                      "Emergency fund $300",
                      "New laptop",
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setGoalText(ex)}
                        className="text-xs bg-muted rounded-full px-3 py-1.5 text-foreground hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handlePlanGoal}
                    disabled={!goalText.trim() || loading}
                    loading={loading}
                    variant="primary"
                    className="w-full"
                  >
                    Build savings plan
                  </Button>
                </>
              ) : (
                <>
                  {/* Plan preview */}
                  <div className="text-center">
                    <GoalInitial name={planPreview.goal_name} className="w-14 h-14 text-lg mx-auto" />
                    <h3 className="font-display text-xl font-bold text-foreground mt-2">{planPreview.goal_name}</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-1">{formatCurrency(planPreview.estimated_total)}</p>
                    <p className="text-xs text-muted-foreground">estimated total</p>
                  </div>

                  {/* Cost breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(planPreview.cost_breakdown).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                            <span className="font-medium">{formatCurrency(val)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weekly savings */}
                  <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
                    <p className="text-xs text-muted-foreground">Save this much per week</p>
                    <p className="text-3xl font-bold text-primary-700 mt-1">{formatCurrency(planPreview.weekly_savings_required)}</p>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-muted rounded-2xl p-3">
                    <p className="text-sm text-foreground leading-relaxed">{planPreview.recommendation}</p>
                  </div>

                  {/* Tradeoffs */}
                  {planPreview.tradeoffs && planPreview.tradeoffs.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">To make it happen</p>
                      <div className="space-y-1.5">
                        {planPreview.tradeoffs.map((t, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span className="text-primary-600 text-sm flex-shrink-0">→</span>
                            <p className="text-sm text-foreground">{t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button onClick={handleAddGoal} variant="primary" className="w-full">
                      Add this goal
                    </Button>
                    <Button onClick={() => setPlanPreview(null)} variant="secondary" className="w-full">
                      Edit goal description
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalBreakdown({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!goal.cost_breakdown) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
      >
        {expanded ? "Hide" : "Show"} cost breakdown
      </button>
      {expanded && (
        <div className="mt-2 bg-white rounded-xl border border-gray-100 px-3 py-2 space-y-1.5 animate-fade-in">
          {Object.entries(goal.cost_breakdown).map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
              <span className="font-medium">{formatCurrency(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
