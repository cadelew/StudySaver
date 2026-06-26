import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { formatCurrency } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { SavingsTicker } from "./stubs/savings-ticker";
import type { SavingsOpportunity } from "../../lib/types";

const CATEGORIES = ["All", "Included", "Campus", "Developer Tools"];

function DealCard({ opportunity }: { opportunity: SavingsOpportunity }) {
  const isIncluded = opportunity.perk_kind === "included";

  return (
    <div
      className={`rounded-2xl bg-white border shadow-card overflow-hidden ${
        isIncluded ? "border-primary-200" : "border-gray-100"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{opportunity.name}</h3>
              {isIncluded && <Badge variant="success">Included</Badge>}
              {!isIncluded &&
                (opportunity.scope === "campus" || opportunity.category === "Campus") && (
                  <Badge variant="info">Campus</Badge>
                )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {opportunity.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline">{opportunity.category}</Badge>
              {opportunity.relevance_tag && (
                <Badge variant="info">{opportunity.relevance_tag}</Badge>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-extrabold text-success">
              {formatCurrency(opportunity.estimated_savings)}
            </p>
            <p className="text-[10px] text-muted-foreground">/year</p>
          </div>
        </div>
      </div>
      <div className="flex border-t border-gray-100">
        <div className="flex-1 py-3 text-xs text-muted-foreground text-center">Ignore</div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 py-3 text-xs text-primary-600 font-semibold text-center">
          {isIncluded ? "Activate →" : "Claim →"}
        </div>
      </div>
    </div>
  );
}

/** Static deals page — same markup as app/(app)/deals/page.tsx, fed with DEMO_SNAPSHOT. */
export const DealsRemotion: React.FC = () => {
  const { savings_opportunities, user } = DEMO_SNAPSHOT;

  const includedPerks = savings_opportunities.filter((o) => o.perk_kind === "included");
  const campusDeals = savings_opportunities.filter(
    (o) => o.perk_kind !== "included" && (o.scope === "campus" || o.category === "Campus"),
  );
  const totalFound = savings_opportunities
    .filter((o) => o.claim_status !== "ignored")
    .reduce((a, b) => a + b.estimated_savings, 0);

  return (
    <div className="min-h-full bg-background">
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
        <h1 className="font-semibold text-base text-foreground">Find Free Money</h1>
      </div>

      <div className="px-4 pb-8 space-y-4">
        <SavingsTicker amount={totalFound} />

        <div className="flex gap-2 overflow-hidden pb-1">
          {CATEGORIES.map((cat, i) => (
            <span
              key={cat}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                i === 0
                  ? "bg-primary-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          <div className="px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Already paid for — just activate
            </p>
            <p className="text-xs text-muted-foreground">
              Your tuition & fees already cover these. Don&apos;t buy them again.
            </p>
          </div>
          {includedPerks.slice(0, 2).map((opp) => (
            <DealCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        <div className="space-y-2">
          <div className="px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {user.school} campus
            </p>
            <p className="text-xs text-muted-foreground">
              Discounts and perks from your school
            </p>
          </div>
          {campusDeals.slice(0, 2).map((opp) => (
            <DealCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </div>
    </div>
  );
};
