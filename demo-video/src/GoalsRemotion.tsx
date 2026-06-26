import { useCurrentFrame } from "remotion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { GoalInitial } from "../../components/ui/icons";
import { formatCurrency } from "../../lib/utils";
import type { Goal } from "../../lib/types";

export type GoalsFlowState =
  | "empty"
  | "sheet"
  | "typing"
  | "loading"
  | "plan"
  | "list";

export const DEMO_GOAL_TEXT = "Trip home for Thanksgiving";

export const DEMO_GOAL_PLAN = {
  goal_name: "Trip home for Thanksgiving",
  estimated_total: 380,
  cost_breakdown: { flights: 220, food: 80, misc: 80 },
  weekly_savings_required: 48,
  recommendation:
    "Save $48/week — skip two eating-out trips and you’ll have this covered before Thanksgiving.",
  tradeoffs: ["Cut one coffee run per week", "Use campus dining instead of DoorDash twice"],
};

export const DEMO_NEW_GOAL: Goal = {
  id: "goal-thanksgiving",
  user_id: "maya-demo",
  name: DEMO_GOAL_PLAN.goal_name,
  target_amount: DEMO_GOAL_PLAN.estimated_total,
  saved_amount: 0,
  deadline: "2026-11-20",
  weekly_savings_required: DEMO_GOAL_PLAN.weekly_savings_required,
  status: "active",
  priority: 1,
  cost_breakdown: DEMO_GOAL_PLAN.cost_breakdown,
};

const Spinner: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      className="w-5 h-5 rounded-full border-2 border-primary-600 border-t-transparent"
      style={{ rotate: `${(frame * 12) % 360}deg` }}
    />
  );
};

function PageHeader({ showNew = true }: { showNew?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 pt-14 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <h1 className="font-semibold text-base text-foreground">Goals</h1>
      </div>
      {showNew && (
        <div className="rounded-full bg-primary-600 text-primary-foreground text-sm font-medium px-4 py-2">
          + New goal
        </div>
      )}
    </div>
  );
}

export const GoalsRemotion: React.FC<{
  flowState: GoalsFlowState;
  typedText?: string;
}> = ({ flowState, typedText = "" }) => {
  const showSheet =
    flowState === "sheet" ||
    flowState === "typing" ||
    flowState === "loading" ||
    flowState === "plan";
  const showPlan = flowState === "plan";
  const loading = flowState === "loading";

  return (
    <div className="relative min-h-full bg-background">
      <PageHeader showNew={!showSheet} />

      <div className="px-4 pb-8 space-y-4">
        {flowState === "list" ? (
          <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-sage border border-primary-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <GoalInitial name={DEMO_NEW_GOAL.name} />
              <div>
                <p className="font-semibold text-foreground text-sm">{DEMO_NEW_GOAL.name}</p>
                <p className="text-xs text-muted-foreground">Save {formatCurrency(DEMO_NEW_GOAL.weekly_savings_required)}/week</p>
              </div>
            </div>
            <div className="relative h-3 rounded-full bg-white/60 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-success w-[8%]" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-primary-700">{formatCurrency(0)}</span>
              <span className="text-sm text-muted-foreground">of {formatCurrency(DEMO_NEW_GOAL.target_amount)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="inline-flex w-16 h-16 rounded-full bg-muted text-muted-foreground items-center justify-center mx-auto">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <p className="text-foreground font-semibold mt-4">No goals yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first goal to start saving with purpose.
            </p>
            <div className="mt-6 inline-flex rounded-full bg-primary-600 text-primary-foreground px-6 py-3 text-sm font-medium">
              Plan a goal
            </div>
          </div>
        )}
      </div>

      {showSheet && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-3xl max-h-[88%] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="w-12 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
              <h2 className="font-semibold text-base mt-2">
                {showPlan ? "Your Goal Plan" : "Plan a Goal"}
              </h2>
            </div>

            <div className="p-4 pb-8 space-y-4">
              {!showPlan ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Describe your goal in plain language. We&apos;ll estimate costs and build a savings plan.
                  </p>
                  <div className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-foreground min-h-[100px] bg-white">
                    {typedText || (
                      <span className="text-muted-foreground">
                        &quot;I want to go to a concert in Oakland next month&quot;
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-card ${
                      typedText ? "" : "opacity-45"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> Building plan...
                      </span>
                    ) : (
                      "Build savings plan"
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <GoalInitial name={DEMO_GOAL_PLAN.goal_name} className="w-14 h-14 text-lg mx-auto" />
                    <h3 className="font-display text-xl font-bold text-foreground mt-2">
                      {DEMO_GOAL_PLAN.goal_name}
                    </h3>
                    <p className="text-3xl font-bold text-primary-600 mt-1">
                      {formatCurrency(DEMO_GOAL_PLAN.estimated_total)}
                    </p>
                    <p className="text-xs text-muted-foreground">estimated total</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(DEMO_GOAL_PLAN.cost_breakdown).map(([key, val]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <span className="font-medium">{formatCurrency(val)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
                    <p className="text-xs text-muted-foreground">Save this much per week</p>
                    <p className="text-3xl font-bold text-primary-700 mt-1">
                      {formatCurrency(DEMO_GOAL_PLAN.weekly_savings_required)}
                    </p>
                  </div>

                  <div className="w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-fab">
                    Add this goal
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
