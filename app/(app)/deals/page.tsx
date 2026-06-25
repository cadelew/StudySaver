"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SavingsTicker } from "@/components/deals/SavingsTicker";
import { formatCurrency } from "@/lib/utils";
import { IconSearch, IconCheckCircle } from "@/components/ui/icons";
import { matchSchoolPerks } from "@/lib/school-perks";
import type { SavingsOpportunity } from "@/lib/types";

const CATEGORIES = ["All", "Included", "Campus", "Developer Tools", "Productivity", "Entertainment", "Transportation", "Design Tools"];

const COMMON_SUBSCRIPTIONS = [
  "Spotify", "Netflix", "Notion", "Adobe Creative Cloud", "ChatGPT Plus",
  "Amazon Prime", "Hulu", "Disney+", "YouTube Premium", "Apple Music", "Canva", "HBO Max",
];

export default function DealsPage() {
  const router = useRouter();
  const { snapshot, updateSavingsStatus, mergeSavingsOpportunities } = useStore();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [aiLoaded, setAiLoaded] = React.useState(false);
  const [loadingPerks, setLoadingPerks] = React.useState(false);
  const [perksLoaded, setPerksLoaded] = React.useState(false);
  const [subs, setSubs] = React.useState<string[]>([]);
  const [customSub, setCustomSub] = React.useState("");

  const toggleSub = (s: string) =>
    setSubs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const addCustomSub = () => {
    const v = customSub.trim();
    if (v && !subs.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setSubs((prev) => [...prev, v]);
    }
    setCustomSub("");
  };

  const customSubs = subs.filter((s) => !COMMON_SUBSCRIPTIONS.includes(s));

  const opportunities = snapshot.savings_opportunities;
  const school = snapshot.user.school;

  // Auto-surface curated "already paid for" perks for the student's school.
  React.useEffect(() => {
    const curated = matchSchoolPerks(school);
    if (curated.length > 0) mergeSavingsOpportunities(curated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school]);

  const isIncluded = (o: SavingsOpportunity) => o.perk_kind === "included";
  const isCampus = (o: SavingsOpportunity) =>
    !isIncluded(o) && (o.scope === "campus" || o.category === "Campus");

  const filtered = activeCategory === "All"
    ? opportunities
    : activeCategory === "Included"
      ? opportunities.filter(isIncluded)
      : activeCategory === "Campus"
        ? opportunities.filter(isCampus)
        : opportunities.filter((o) => o.category === activeCategory && !isIncluded(o));

  const includedPerks = filtered.filter(isIncluded);
  const campusDeals = filtered.filter(isCampus);
  const generalDeals = filtered.filter((o) => !isIncluded(o) && !isCampus(o));
  const showGrouped = activeCategory === "All" && (campusDeals.length > 0 || includedPerks.length > 0) && generalDeals.length > 0;

  const totalFound = opportunities
    .filter((o) => o.claim_status !== "ignored")
    .reduce((a, b) => a + b.estimated_savings, 0);

  const totalClaimed = opportunities
    .filter((o) => o.claim_status === "claimed")
    .reduce((a, b) => a + b.estimated_savings, 0);

  const handleClaim = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      updateSavingsStatus(id, "claimed");
      setLoadingId(null);
    }, 400);
  };

  const handleIgnore = (id: string) => {
    updateSavingsStatus(id, "ignored");
  };

  const handleLoadAI = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch("/api/find-savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: snapshot.user.school,
          major: snapshot.user.major,
          subscriptions: subs,
        }),
      });
      const data = await res.json();
      if (res.ok && data.opportunities?.length) {
        mergeSavingsOpportunities(
          data.opportunities.map(
            (o: {
              name: string;
              category: string;
              description: string;
              estimated_savings: number;
              source_url?: string;
              relevance_tag?: string;
              scope?: "campus" | "general";
            }, i: number) => ({
              id: `ai-${Date.now()}-${i}`,
              user_id: snapshot.user.id,
              name: o.name,
              category: o.category,
              description: o.description,
              estimated_savings: o.estimated_savings,
              claim_status: "not_claimed" as const,
              source_url: o.source_url,
              relevance_tag: o.relevance_tag,
              scope: o.scope,
            })
          )
        );
      }
      setAiLoaded(true);
    } catch {
      setAiLoaded(true);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleLoadPerks = async () => {
    setLoadingPerks(true);
    try {
      const res = await fetch("/api/find-perks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, major: snapshot.user.major }),
      });
      const data = await res.json();
      if (res.ok && data.perks?.length) {
        mergeSavingsOpportunities(
          data.perks.map(
            (p: {
              name: string;
              category: string;
              description: string;
              estimated_savings: number;
              source_url?: string;
              relevance_tag?: string;
            }, i: number) => ({
              id: `perk-ai-${Date.now()}-${i}`,
              user_id: snapshot.user.id,
              name: p.name,
              category: p.category,
              description: p.description,
              estimated_savings: p.estimated_savings,
              claim_status: "not_claimed" as const,
              source_url: p.source_url,
              relevance_tag: p.relevance_tag,
              scope: "campus" as const,
              perk_kind: "included" as const,
            })
          )
        );
      }
      setPerksLoaded(true);
    } catch {
      setPerksLoaded(true);
    } finally {
      setLoadingPerks(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-base text-foreground">Find Free Money</h1>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {/* Savings summary */}
        <SavingsTicker amount={totalFound} />

        {totalClaimed > 0 && (
          <div className="flex items-center gap-3 bg-success-50 rounded-2xl px-4 py-3">
            <span className="flex-shrink-0 text-success">
              <IconCheckCircle className="w-5 h-5" />
            </span>
            <p className="text-sm font-medium text-success">
              You&apos;ve claimed {formatCurrency(totalClaimed)}/year in savings!
            </p>
          </div>
        )}

        {/* Subscription picker — feeds the deal finder so it hunts discounts on what you actually pay for */}
        <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Subscriptions you pay for</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Check the ones you have and we&apos;ll hunt for student discounts on them.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_SUBSCRIPTIONS.map((s) => {
              const sel = subs.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSub(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    sel
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-gray-200"
                  }`}
                >
                  {sel ? "✓ " : ""}{s}
                </button>
              );
            })}
            {customSubs.map((s) => (
              <button
                key={s}
                onClick={() => toggleSub(s)}
                className="rounded-full px-3 py-1.5 text-xs font-medium border bg-primary-600 text-white border-primary-600"
              >
                {s} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customSub}
              onChange={(e) => setCustomSub(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSub(); } }}
              placeholder="Add another subscription…"
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            <Button onClick={addCustomSub} variant="outline" className="px-4">Add</Button>
          </div>
        </div>

        {/* AI research buttons */}
        {!perksLoaded && (
          <Button
            onClick={handleLoadPerks}
            loading={loadingPerks}
            variant="outline"
            className="w-full border-primary-200 text-primary-700 hover:bg-primary-50"
          >
            Surface perks you already pay for
          </Button>
        )}
        {!aiLoaded && (
          <Button
            onClick={handleLoadAI}
            loading={loadingAI}
            variant="outline"
            className="w-full border-primary-200 text-primary-700 hover:bg-primary-50"
          >
            Find more deals with Browserbase
          </Button>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Deals list */}
        <div className="space-y-3">
          {/* "Already paid for" perks always lead — this is the sharpest, most credible savings */}
          {includedPerks.length > 0 && (activeCategory === "All" || activeCategory === "Included") && (
            <DealSection
              title="Already paid for — just activate"
              subtitle="Your tuition & fees already cover these. Don't buy them again."
              deals={includedPerks}
              loadingId={loadingId}
              onClaim={handleClaim}
              onIgnore={handleIgnore}
            />
          )}

          {showGrouped ? (
            <>
              {campusDeals.length > 0 && (
                <DealSection
                  title={snapshot.user.school ? `${snapshot.user.school} campus` : "Your campus"}
                  subtitle="Discounts and perks from your school"
                  deals={campusDeals}
                  loadingId={loadingId}
                  onClaim={handleClaim}
                  onIgnore={handleIgnore}
                />
              )}
              {generalDeals.length > 0 && (
                <DealSection
                  title="General student deals"
                  subtitle="Available to any student with a .edu email"
                  deals={generalDeals}
                  loadingId={loadingId}
                  onClaim={handleClaim}
                  onIgnore={handleIgnore}
                />
              )}
            </>
          ) : (
            filtered
              .filter((o) => !isIncluded(o))
              .map((opp) => (
                <DealCard
                  key={opp.id}
                  opportunity={opp}
                  loading={loadingId === opp.id}
                  onClaim={() => handleClaim(opp.id)}
                  onIgnore={() => handleIgnore(opp.id)}
                />
              ))
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="inline-flex w-14 h-14 rounded-full bg-muted text-muted-foreground items-center justify-center mx-auto">
                <IconSearch className="w-6 h-6" />
              </span>
              <p className="text-foreground font-semibold mt-3">No deals in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealSection({
  title,
  subtitle,
  deals,
  loadingId,
  onClaim,
  onIgnore,
}: {
  title: string;
  subtitle: string;
  deals: SavingsOpportunity[];
  loadingId: string | null;
  onClaim: (id: string) => void;
  onIgnore: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {deals.map((opp) => (
        <DealCard
          key={opp.id}
          opportunity={opp}
          loading={loadingId === opp.id}
          onClaim={() => onClaim(opp.id)}
          onIgnore={() => onIgnore(opp.id)}
        />
      ))}
    </div>
  );
}

function DealCard({
  opportunity,
  loading,
  onClaim,
  onIgnore,
}: {
  opportunity: SavingsOpportunity;
  loading: boolean;
  onClaim: () => void;
  onIgnore: () => void;
}) {
  const isClaimed = opportunity.claim_status === "claimed";
  const isIgnored = opportunity.claim_status === "ignored";
  const isIncludedPerk = opportunity.perk_kind === "included";

  if (isIgnored) return null;

  return (
    <div
      className={`rounded-2xl bg-white border shadow-card overflow-hidden transition-all ${
        isClaimed ? "border-success/30" : isIncludedPerk ? "border-primary-200" : "border-gray-100"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{opportunity.name}</h3>
              {isClaimed && (
                <Badge variant="success">{isIncludedPerk ? "✓ Activated" : "✓ Claimed"}</Badge>
              )}
              {isIncludedPerk && !isClaimed && (
                <Badge variant="success">Included</Badge>
              )}
              {!isIncludedPerk && (opportunity.scope === "campus" || opportunity.category === "Campus") && !isClaimed && (
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

      {!isClaimed && (
        <div className="flex border-t border-gray-100">
          <button
            onClick={onIgnore}
            className="flex-1 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Ignore
          </button>
          <div className="w-px bg-gray-100" />
          {opportunity.source_url ? (
            <a
              href={opportunity.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClaim}
              className="flex-1 py-3 text-xs text-primary-600 font-semibold hover:bg-primary-50 transition-colors text-center"
            >
              {loading ? "..." : isIncludedPerk ? "Activate →" : "Claim →"}
            </a>
          ) : (
            <button
              onClick={onClaim}
              disabled={loading}
              className="flex-1 py-3 text-xs text-primary-600 font-semibold hover:bg-primary-50 transition-colors"
            >
              {loading ? "..." : isIncludedPerk ? "Mark activated" : "Mark claimed"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
