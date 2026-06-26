import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { MealPlanCard } from "../../components/meal/MealPlanCard";
import { projectForfeiture } from "../../lib/meal-plan";
import { formatCurrency } from "../../lib/utils";

const DEMO_STRATEGIES = [
  {
    title: "Stock up on grab-and-go",
    detail: "Use 2 swipes/day at Cal Dining markets before finals week.",
    estimated_value: 96,
  },
  {
    title: "Treat friends to guest swipes",
    detail: "Guest passes expire with your plan — use them at Crossroads.",
    estimated_value: 64,
  },
];

function PageHeader() {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-3">
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
      <h1 className="font-semibold text-base text-foreground">Meal Plan</h1>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-semibold ${emphasis ? "text-destructive" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

/** Meal plan burn-down — same content as app/(app)/meal-plan/page.tsx with demo data. */
export const MealPlanRemotion: React.FC = () => {
  const mealPlan = DEMO_SNAPSHOT.meal_plan!;
  const proj = projectForfeiture(mealPlan);

  return (
    <div className="min-h-full bg-background">
      <PageHeader />
      <div className="px-4 pb-8 space-y-4">
        <MealPlanCard plan={mealPlan} />

        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Projection
          </p>
          <Row label="Swipes remaining" value={String(mealPlan.swipes_remaining)} />
          <Row label="Dining dollars" value={formatCurrency(mealPlan.dining_dollars_remaining)} />
          <Row label="Days until deadline" value={`${proj.daysLeft}`} />
          <Row label="Use this many / week" value={`${proj.requiredWeeklyPace} swipes`} />
          <div className="h-px bg-border/60 my-1" />
          <Row
            label="On track to forfeit"
            value={formatCurrency(proj.forfeitedValue)}
            emphasis={proj.forfeitedValue > 0}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Your burn-down plan
          </p>
          {DEMO_STRATEGIES.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl bg-card border border-border/60 shadow-card p-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground leading-snug">{s.title}</p>
                    <span className="text-xs font-bold text-success flex-shrink-0">
                      ${Math.round(s.estimated_value!)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
