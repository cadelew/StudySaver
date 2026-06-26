import { DEMO_SNAPSHOT } from "../../lib/demo-data";
import { RefundRadarCard } from "../../components/refunds/RefundRadarCard";
import { refundStatus } from "../../lib/refunds";
import { formatCurrency } from "../../lib/utils";

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
      <h1 className="font-semibold text-base text-foreground">Refund Radar</h1>
    </div>
  );
}

/** Drop-deadline tracker — same content as app/(app)/refunds/page.tsx with demo data. */
export const RefundsRemotion: React.FC = () => {
  const ladder = DEMO_SNAPSHOT.refund_ladder!;
  const status = refundStatus(ladder);

  return (
    <div className="min-h-full bg-background">
      <PageHeader />
      <div className="px-4 pb-8 space-y-4">
        <RefundRadarCard ladder={ladder} />

        <div className="rounded-3xl bg-card border border-border/60 shadow-card p-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {ladder.term} refund ladder
          </p>
          {ladder.tiers.map((tier, i) => {
            const isCurrent = !status.expired && tier.deadline === status.nextDeadline;
            return (
              <div key={i} className="flex items-center justify-between">
                <span
                  className={`text-xs ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {tier.pct}% back
                  {isCurrent && " — you are here"}
                </span>
                <span
                  className={`text-xs ${isCurrent ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                >
                  by{" "}
                  {new Date(tier.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
          <div className="h-px bg-border/60 my-1" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Refund if you drop today</span>
            <span className="text-xs font-semibold text-foreground">
              {formatCurrency((ladder.tuition_amount * status.currentPct) / 100)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
