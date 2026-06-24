"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SavingsTicker } from "@/components/deals/SavingsTicker";
import { formatCurrency } from "@/lib/utils";
import { IconSearch, IconCheckCircle } from "@/components/ui/icons";
import type { SavingsOpportunity } from "@/lib/types";

const CATEGORIES = ["All", "Campus", "Developer Tools", "Productivity", "Entertainment", "Transportation", "Design Tools"];

export default function DealsPage() {
  const router = useRouter();
  const { snapshot, updateSavingsStatus, mergeSavingsOpportunities } = useStore();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [aiLoaded, setAiLoaded] = React.useState(false);

  const opportunities = snapshot.savings_opportunities;

  const filtered = activeCategory === "All"
    ? opportunities
    : activeCategory === "Campus"
      ? opportunities.filter((o) => o.scope === "campus" || o.category === "Campus")
      : opportunities.filter((o) => o.category === activeCategory);

  const campusDeals = filtered.filter((o) => o.scope === "campus" || o.category === "Campus");
  const generalDeals = filtered.filter((o) => o.scope !== "campus" && o.category !== "Campus");
  const showGrouped = activeCategory === "All" && campusDeals.length > 0 && generalDeals.length > 0;

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
          subscriptions: ["Spotify", "Notion"],
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

        {/* AI research button */}
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
            filtered.map((opp) => (
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

  if (isIgnored) return null;

  return (
    <div
      className={`rounded-2xl bg-white border shadow-card overflow-hidden transition-all ${
        isClaimed ? "border-success/30" : "border-gray-100"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{opportunity.name}</h3>
              {isClaimed && (
                <Badge variant="success">✓ Claimed</Badge>
              )}
              {(opportunity.scope === "campus" || opportunity.category === "Campus") && !isClaimed && (
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
              {loading ? "..." : "Claim →"}
            </a>
          ) : (
            <button
              onClick={onClaim}
              disabled={loading}
              className="flex-1 py-3 text-xs text-primary-600 font-semibold hover:bg-primary-50 transition-colors"
            >
              {loading ? "..." : "Mark claimed"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
