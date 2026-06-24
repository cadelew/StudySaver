"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { CollegeOffer } from "@/lib/types";

type Medium = "email" | "phone";

export default function NegotiatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useStore((s) => s.snapshot.user);
  const setUser = useStore((s) => s.setUser);

  const storedOffers = user.college_offers ?? [];
  const [offers, setOffers] = React.useState<CollegeOffer[]>(storedOffers);
  const [primarySchool, setPrimarySchool] = React.useState(user.school || "");
  const [medium, setMedium] = React.useState<Medium>("email");
  const [loading, setLoading] = React.useState(false);
  const [script, setScript] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Inline add-offer state
  const [newSchool, setNewSchool] = React.useState("");
  const [newAid, setNewAid] = React.useState("");
  const [newCost, setNewCost] = React.useState("");

  const addOffer = () => {
    if (!newSchool.trim()) return;
    const offer: CollegeOffer = {
      school: newSchool.trim(),
      aid_amount: newAid ? Number(newAid) : undefined,
      estimated_cost: newCost ? Number(newCost) : undefined,
    };
    const updated = [...offers.filter((o) => o.school !== offer.school), offer];
    setOffers(updated);
    setUser({ college_offers: updated });
    const stored = JSON.parse(localStorage.getItem("studysaver_user") || "{}");
    localStorage.setItem("studysaver_user", JSON.stringify({ ...stored, college_offers: updated }));
    setNewSchool("");
    setNewAid("");
    setNewCost("");
  };

  const removeOffer = (school: string) => {
    const updated = offers.filter((o) => o.school !== school);
    setOffers(updated);
    setUser({ college_offers: updated });
    const stored = JSON.parse(localStorage.getItem("studysaver_user") || "{}");
    localStorage.setItem("studysaver_user", JSON.stringify({ ...stored, college_offers: updated }));
  };

  const handleGenerate = async () => {
    if (!primarySchool.trim()) {
      toast("Enter your top-choice school first.", "error");
      return;
    }
    if (offers.filter((o) => o.school !== primarySchool).length === 0) {
      toast("Add at least one competing offer to generate a script.", "error");
      return;
    }
    setLoading(true);
    setScript(null);
    try {
      const res = await fetch("/api/aid-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_school: primarySchool, offers, medium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setScript(data.script);
    } catch (err) {
      console.error(err);
      toast("Couldn't generate script. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full">
      <PageHeader title="Aid Negotiation" onBack={() => router.push("/")} />

      <div className="px-4 pb-32 space-y-5">
        {/* Explainer */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4">
          <p className="text-sm text-primary-700 leading-relaxed">
            Got accepted to multiple schools? You can often negotiate a better financial aid package
            from your top choice by showing them competing offers. We&apos;ll write the script for you.
          </p>
        </div>

        {/* Primary school */}
        <section className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your top-choice school</p>
          <Input
            placeholder="e.g. UCLA"
            value={primarySchool}
            onChange={(e) => setPrimarySchool(e.target.value)}
          />
        </section>

        {/* Competing offers */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Competing offers</p>

          {offers.filter((o) => o.school !== primarySchool).length > 0 ? (
            <div className="space-y-2">
              {offers
                .filter((o) => o.school !== primarySchool)
                .map((offer) => (
                  <div
                    key={offer.school}
                    className="flex items-center justify-between bg-card border border-border/60 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{offer.school}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        {offer.estimated_cost !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Est. cost: ${offer.estimated_cost.toLocaleString()}/yr
                          </p>
                        )}
                        {offer.aid_amount !== undefined ? (
                          <p className="text-xs text-primary-700">
                            Aid: ${offer.aid_amount.toLocaleString()}/yr
                          </p>
                        ) : (
                          !offer.estimated_cost && (
                            <p className="text-xs text-muted-foreground italic">Details not entered</p>
                          )
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeOffer(offer.school)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-3 cursor-pointer"
                      aria-label={`Remove ${offer.school}`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No competing offers added yet.</p>
          )}

          {/* Inline add */}
          <div className="bg-muted rounded-2xl p-3 space-y-2">
            <Input
              placeholder="School name"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
            />
            <Input
              label="Estimated annual cost"
              placeholder="e.g. 55000"
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
            />
            <Input
              label="Annual financial aid offer (optional)"
              placeholder="e.g. 15000"
              type="number"
              value={newAid}
              onChange={(e) => setNewAid(e.target.value)}
            />
            <Button onClick={addOffer} disabled={!newSchool.trim()} variant="secondary" className="w-full">
              + Add school
            </Button>
          </div>
        </section>

        {/* Medium toggle */}
        <section className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Script type</p>
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            {(["email", "phone"] as Medium[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMedium(m); setScript(null); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  medium === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "email" ? "Email" : "Phone script"}
              </button>
            ))}
          </div>
        </section>

        {/* Generated script */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-primary-200" />
              <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Writing your script...</p>
          </div>
        )}

        {script && !loading && (
          <section className="space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your script</p>
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-card border border-border/60 rounded-2xl p-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{script}</pre>
            </div>
            <Button onClick={() => { setScript(null); setMedium(medium === "email" ? "phone" : "email"); }} variant="secondary" className="w-full">
              Generate {medium === "email" ? "phone script" : "email"} instead
            </Button>
          </section>
        )}
      </div>

      {/* Sticky CTA */}
      {!script && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
          <Button
            onClick={handleGenerate}
            disabled={loading || !primarySchool.trim()}
            variant="primary"
            loading={loading}
            className="w-full h-14 text-base font-bold shadow-fab"
          >
            Write my {medium === "email" ? "email" : "phone script"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-14 pb-4">
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 className="font-semibold text-base text-foreground line-clamp-1">{title}</h1>
    </div>
  );
}
