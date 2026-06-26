import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { GoalProgress } from "../../components/goals/GoalProgress";
import { DEMO_NEW_GOAL } from "./GoalsRemotion";

/** Dashboard cropped to highlight the newly added goal. */
export const DashboardGoalRemotion: React.FC = () => {
  const { user } = DEMO_SNAPSHOT;

  return (
    <div className="px-4 pt-14 pb-32 bg-background min-h-full">
      <header className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-600 to-success flex items-center justify-center text-background font-display font-semibold text-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <p className="font-display font-semibold text-lg text-foreground leading-tight">
            {user.name}
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Weekly Spend
            </p>
            <span className="text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1.5">
              Thu, Jun 25
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-foreground">$114</span>
            <span className="font-display text-xl font-semibold text-muted-foreground">/ $125</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Active Goal
          </h3>
          <GoalProgress goal={DEMO_NEW_GOAL} priority={1} />
        </div>

        <div className="rounded-3xl bg-primary-50 border border-primary-100 p-4">
          <p className="text-sm text-primary-800 leading-relaxed">
            Your Thanksgiving trip is on track — save {DEMO_NEW_GOAL.weekly_savings_required}/week to hit your deadline.
          </p>
        </div>
      </div>
    </div>
  );
};
