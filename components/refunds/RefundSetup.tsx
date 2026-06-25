"use client";

import * as React from "react";
import type { RefundLadder } from "@/lib/types";
import { type RefundLadderTemplate, resolveLadder } from "@/lib/refund-ladders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RefundSetupProps {
  school: string;
  template: RefundLadderTemplate;
  existing?: RefundLadder;
  onSave: (ladder: RefundLadder) => void;
}

function defaultTerm(now = new Date()): string {
  const y = now.getFullYear();
  return now.getMonth() >= 6 ? `Fall ${y}` : `Spring ${y}`;
}

export function RefundSetup({ school, template, existing, onSave }: RefundSetupProps) {
  const [tuition, setTuition] = React.useState(
    existing ? String(existing.tuition_amount) : ""
  );
  const [term, setTerm] = React.useState(existing?.term ?? defaultTerm());
  // Term start isn't stored on the ladder (only resolved tier dates are), so
  // default to today on re-entry; the user can adjust.
  const [termStart, setTermStart] = React.useState(
    new Date().toISOString().slice(0, 10)
  );

  const canSave = tuition.trim() !== "" && termStart !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave(
      resolveLadder(template, {
        school,
        term: term.trim() || defaultTerm(),
        tuition_amount: Math.max(0, Math.round(Number(tuition) || 0)),
        term_start: new Date(termStart).toISOString(),
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-muted/60 px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          {template.curated ? `${school} refund ladder` : "Refund ladder"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {template.relative_tiers
            .map((t) => `${t.pct}% before week ${t.week}`)
            .join(" → ")}
        </p>
        {!template.curated && (
          <p className="text-[11px] text-accent-foreground/80 mt-1.5">
            We don&apos;t have a verified ladder for your school — confirm exact
            dates with your bursar.
          </p>
        )}
      </div>

      <Input
        label="Tuition for one class"
        type="number"
        inputMode="numeric"
        placeholder="1400"
        value={tuition}
        onChange={(e) => setTuition(e.target.value)}
        hint="What one course costs — used to compute what's at stake."
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Term"
          placeholder="Fall 2026"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <Input
          label="First day of term"
          type="date"
          value={termStart}
          onChange={(e) => setTermStart(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={!canSave} className="w-full">
        {existing ? "Update" : "Track my refund deadline"}
      </Button>
    </div>
  );
}
