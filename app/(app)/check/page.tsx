"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { VerdictCard } from "@/components/check/VerdictCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconQuestion } from "@/components/ui/icons";
import type { PurchaseCheck } from "@/lib/types";

export default function CheckPage() {
  const router = useRouter();
  const { snapshot } = useStore();
  const [item, setItem] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<PurchaseCheck | null>(null);

  const QUICK_CHECKS = [
    { label: "$120 headphones", item: "Sony headphones", amount: 120 },
    { label: "$35 Uber", item: "Uber ride", amount: 35 },
    { label: "$90 textbook", item: "Organic Chemistry textbook", amount: 90 },
    { label: "$80 Nike shoes", item: "Nike Air Max shoes", amount: 80 },
  ];

  const handleCheck = async (checkItem?: string, checkAmount?: number) => {
    const finalItem = checkItem || item;
    const finalAmount = checkAmount || parseFloat(amount);

    if (!finalItem || !finalAmount) return;

    setLoading(true);
    setResult(null);

    try {
      const activeGoals = snapshot.goals
        .filter((g) => g.status === "active")
        .map((g) => ({
          name: g.name,
          target: g.target_amount,
          saved: g.saved_amount,
          weeklySavings: g.weekly_savings_required,
        }));

      const res = await fetch("/api/check-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: finalItem,
          amount: finalAmount,
          remainingBudget: snapshot.remaining,
          activeGoals,
          school: snapshot.user.school,
        }),
      });

      const data: PurchaseCheck = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <h1 className="font-semibold text-base text-foreground">Check Before I Buy</h1>
      </div>

      <div className="px-4 pb-8 space-y-5">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Tell StudySaver what you&apos;re about to buy. We&apos;ll check your budget, goals, and savings options.
          </p>

          <div className="space-y-3">
            <Input
              label="What are you buying?"
              placeholder='e.g. "Sony headphones"'
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
            <Input
              label="How much?"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<span className="text-sm font-medium">$</span>}
            />
            <Button
              onClick={() => handleCheck()}
              disabled={!item || !amount || loading}
              loading={loading}
              variant="primary"
              className="w-full"
            >
              Check this purchase
            </Button>
          </div>
        </div>

        {/* Quick checks */}
        {!result && (
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-3">Quick checks</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_CHECKS.map((qc) => (
                <button
                  key={qc.label}
                  onClick={() => {
                    setItem(qc.item);
                    setAmount(qc.amount.toString());
                    handleCheck(qc.item, qc.amount);
                  }}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary-200 hover:bg-primary-50/50 active:scale-[0.98] transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{qc.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
              <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-primary-600">
                <IconQuestion />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Analyzing your purchase...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            <VerdictCard check={result} />
            <Button
              onClick={() => { setResult(null); setItem(""); setAmount(""); }}
              variant="secondary"
              className="w-full"
            >
              Check something else
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
