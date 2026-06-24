"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, pct } from "@/lib/utils";
import { IconLightbulb } from "@/components/ui/icons";
import { CategoryIcon } from "@/components/budget/CategoryIcon";
import type { ParsedExpense } from "@/lib/types";

type FlowState = "voice" | "confirm" | "done";

export default function LogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { snapshot, addTransaction } = useStore();
  const [flowState, setFlowState] = React.useState<FlowState>("voice");
  const [parsed, setParsed] = React.useState<ParsedExpense | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [insight, setInsight] = React.useState("");

  const handleTranscript = async (transcript: string) => {
    setLoading(true);
    try {
      const categories = snapshot.categories.map((c) => c.name);
      const res = await fetch("/api/parse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, categories }),
      });
      const data: ParsedExpense = await res.json();
      setParsed(data);
      setFlowState("confirm");
    } catch {
      toast("Couldn't parse that. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsed) return;
    addTransaction({
      amount: parsed.amount,
      merchant: parsed.merchant,
      category: parsed.category,
      source: "voice",
      confidence: parsed.confidence,
    });

    const cat = useStore
      .getState()
      .snapshot.categories.find(
        (c) => c.name.toLowerCase() === parsed.category.toLowerCase()
      );
    const remaining = cat ? cat.monthly_limit - cat.spent : 0;

    setInsight(
      remaining > 0
        ? `${formatCurrency(remaining)} left in ${parsed.category} this month.`
        : `You've hit your ${parsed.category} limit for this month.`
    );
    setFlowState("done");
  };

  const handleReset = () => {
    setParsed(null);
    setInsight("");
    setFlowState("voice");
  };

  if (flowState === "done" && parsed) {
    const cat = snapshot.categories.find(
      (c) => c.name.toLowerCase() === parsed.category.toLowerCase()
    );
    const spent = cat?.spent ?? 0;
    const newPct = cat ? pct(spent, cat.monthly_limit) : 0;

    return (
      <div className="flex flex-col">
        <PageHeader title="Expense Logged" onBack={() => router.push("/")} />
        <div className="flex flex-col items-center px-5 py-6 gap-6">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <Card className="w-full text-center">
            <p className="text-3xl font-display font-bold text-foreground">
              -{formatCurrency(parsed.amount)}
            </p>
            <p className="text-lg font-semibold text-foreground mt-1">{parsed.merchant}</p>
            <Badge variant="default" className="mt-2">{parsed.category}</Badge>

            {cat && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{cat.name}</span>
                  <span>{formatCurrency(spent)} / {formatCurrency(cat.monthly_limit)}</span>
                </div>
                <Progress value={newPct} color={cat.color} />
              </div>
            )}
          </Card>

          <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3 w-full">
            <div className="flex gap-2">
              <span className="flex-shrink-0 text-primary-600">
                <IconLightbulb />
              </span>
              <p className="text-sm text-foreground">{insight}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button onClick={handleReset} variant="primary" className="w-full">
              Log another
            </Button>
            <Button onClick={() => router.push("/")} variant="secondary" className="w-full">
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (flowState === "confirm" && parsed) {
    const cat = snapshot.categories.find((c) => c.name === parsed.category);

    return (
      <div className="flex flex-col">
        <PageHeader title="Confirm Expense" onBack={() => setFlowState("voice")} />
        <div className="flex flex-col px-5 pt-6 pb-6 gap-4">
          <p className="text-sm text-muted-foreground text-center">Does this look right?</p>

          <Card className="text-center">
            <p className="text-4xl font-display font-bold text-foreground">
              {formatCurrency(parsed.amount)}
            </p>
            <p className="text-lg font-semibold mt-1">{parsed.merchant}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="default">{parsed.category}</Badge>
              {cat && <CategoryIcon category={cat.name} size={28} />}
            </div>
            <div className="mt-1">
              <Badge variant={parsed.confidence > 0.8 ? "success" : "warning"}>
                {Math.round(parsed.confidence * 100)}% confident
              </Badge>
            </div>
          </Card>

          {loading && (
            <div className="text-center text-sm text-muted-foreground animate-pulse">
              Parsing...
            </div>
          )}

          <div className="flex flex-col gap-3 mt-2">
            <Button onClick={handleConfirm} variant="primary" className="w-full">
              Confirm and log {formatCurrency(parsed.amount)}
            </Button>
            <Button onClick={handleReset} variant="secondary" className="w-full">
              Record again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Log Expense" onBack={() => router.push("/")} />

      <div className="flex flex-col items-center px-5 py-8 gap-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            What did you spend?
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hold the mic and say it naturally.
          </p>
        </div>

        <VoiceRecorder
          onTranscript={handleTranscript}
          onError={(msg) => toast(msg, "error")}
        />

        {/* Example prompts */}
        <div className="w-full">
          <p className="text-xs text-muted-foreground text-center mb-3">Try saying...</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              '"$14 at Chipotle"',
              '"$6.75 coffee"',
              '"$32 groceries"',
              '"$20 Uber"',
            ].map((ex) => (
              <span key={ex} className="text-xs bg-muted rounded-full px-3 py-1.5 text-foreground">
                {ex}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-4">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="font-semibold text-base text-foreground">{title}</h1>
    </div>
  );
}
