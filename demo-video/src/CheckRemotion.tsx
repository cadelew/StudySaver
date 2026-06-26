import { useCurrentFrame } from "remotion";
import { VerdictCard } from "../../components/check/VerdictCard";
import { Input } from "./components/ui/input";
import { IconQuestion } from "../../components/ui/icons";
import type { PurchaseCheck } from "../../lib/types";

export type CheckFlowState = "form" | "loading" | "result";

export const DEMO_PURCHASE_CHECK: PurchaseCheck = {
  item: "Sony headphones",
  estimated_amount: 120,
  category: "School Supplies",
  verdict: "yes_but",
  budget_status: "You have $66 left in School Supplies this month — this would use most of it.",
  goal_impact: "Pushes your Thanksgiving trip back about 2 weeks.",
  goal_delay_days: 14,
  savings_opportunities: [
    "Check CDW-G student discount — Berkeley students save ~15% on electronics.",
    "Rent from campus library tech desk before buying.",
  ],
  recommendation:
    "If you need them for class, buy through the campus discount. Otherwise wait until next month when your budget resets.",
};

function PageHeader() {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-4">
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
      <h1 className="font-semibold text-base text-foreground">Check Before I Buy</h1>
    </div>
  );
}

const SpinnerRing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent"
      style={{ rotate: `${(frame * 12) % 360}deg` }}
    />
  );
};

export const CheckRemotion: React.FC<{
  flowState: CheckFlowState;
  item?: string;
  amount?: string;
}> = ({ flowState, item = "Sony headphones", amount = "120" }) => {
  if (flowState === "result") {
    return (
      <div className="min-h-full bg-background">
        <PageHeader />
        <div className="px-4 pb-8 space-y-4">
          <VerdictCard check={DEMO_PURCHASE_CHECK} />
        </div>
      </div>
    );
  }

  if (flowState === "loading") {
    return (
      <div className="min-h-full bg-background">
        <PageHeader />
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
            <SpinnerRing />
            <span className="absolute inset-0 flex items-center justify-center text-primary-600">
              <IconQuestion />
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Analyzing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader />
      <div className="px-4 pb-8 space-y-5">
        <p className="text-sm text-muted-foreground">
          Tell StudySaver what you&apos;re about to buy. We&apos;ll check your budget, goals, and savings options.
        </p>

        <Input label="What are you buying?" placeholder='e.g. "Sony headphones"' value={item} readOnly />
        <Input
          label="How much?"
          type="number"
          value={amount}
          readOnly
          leftIcon={<span className="text-sm font-medium">$</span>}
        />
        <div className="w-full h-14 text-base font-bold inline-flex items-center justify-center rounded-full bg-primary-600 text-primary-foreground shadow-card">
          Check this purchase
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium mb-3">Quick checks</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "$120 headphones", active: true },
              { label: "$35 Uber", active: false },
              { label: "$90 textbook", active: false },
              { label: "$80 Nike shoes", active: false },
            ].map((qc) => (
              <div
                key={qc.label}
                className={`text-left p-3 rounded-xl border ${
                  qc.active
                    ? "border-primary-400 bg-primary-50/60"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{qc.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
