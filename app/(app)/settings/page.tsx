"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { HousingType } from "@/lib/types";

const MAJOR_CHIPS = ["Computer Science", "Biology", "Business", "Psychology", "Engineering", "Nursing", "Education", "Undeclared"];

const HOUSING_OPTIONS: { label: string; value: HousingType }[] = [
  { label: "Living at home / commuting", value: "home" },
  { label: "Campus dorm or residence hall", value: "dorm" },
  { label: "Off-campus apartment", value: "off_campus" },
];

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full rounded-2xl bg-muted px-4 py-3.5 text-sm font-medium text-foreground cursor-pointer hover:bg-primary-50 transition-colors"
    >
      {label}
      <span
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary-600" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { snapshot, setUser, isDemo, hasCustomProfile, exitDemoMode } = useStore();
  const user = snapshot.user;

  const [name, setName] = React.useState(user.name);
  const [school, setSchool] = React.useState(user.school);
  const [location, setLocation] = React.useState(user.location);
  const [major, setMajor] = React.useState(user.major);
  const [budgetUnknown, setBudgetUnknown] = React.useState(user.budget_unknown ?? false);
  const [monthlyBudget, setMonthlyBudget] = React.useState(String(user.monthly_budget || 500));
  const [housing, setHousing] = React.useState<HousingType | "">(user.housing ?? "");
  const [hasMealPlan, setHasMealPlan] = React.useState(user.has_meal_plan ?? false);
  const [hasCar, setHasCar] = React.useState(user.has_car ?? false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      toast("Please enter your name.", "error");
      return;
    }

    setSaving(true);
    const budget = budgetUnknown ? 500 : Number(monthlyBudget) || 500;
    const updates = {
      name: name.trim(),
      school: school.trim(),
      location: location.trim(),
      major: major.trim(),
      budget_unknown: budgetUnknown,
      monthly_budget: budget,
      housing: housing || undefined,
      has_meal_plan: hasMealPlan,
      has_car: hasCar,
    };

    setUser(updates);

    if (!isDemo) {
      const stored = JSON.parse(localStorage.getItem("studysaver_user") || "{}");
      localStorage.setItem(
        "studysaver_user",
        JSON.stringify({
          ...stored,
          ...updates,
          year_in_school: user.year_in_school,
          student_status: user.student_status,
          college_offers: user.college_offers,
        })
      );
    }

    setSaving(false);
    toast("Profile updated");
  };

  const handleRestartOnboarding = () => {
    router.push("/onboarding");
  };

  return (
    <div className="min-h-full pb-8">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          aria-label="Back to dashboard"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-base text-foreground">Settings</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-3xl bg-card border border-border/60 p-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-success flex items-center justify-center text-background font-display font-semibold text-xl shrink-0">
            {name.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-lg text-foreground truncate">{name || "Your profile"}</p>
            {user.year_in_school && (
              <p className="text-sm text-muted-foreground truncate">{user.year_in_school}</p>
            )}
            {isDemo && (
              <p className="text-xs text-accent font-medium mt-0.5">Demo account</p>
            )}
          </div>
        </div>

        {isDemo && (
          <div className="bg-accent/15 border border-accent/30 rounded-2xl px-4 py-3 space-y-3 text-sm text-foreground">
            <p>
              {hasCustomProfile
                ? "You're previewing sample data. Your profile and budget are saved — switch back anytime."
                : "You're exploring with sample data. Run setup below to create your own profile."}
            </p>
            {hasCustomProfile && (
              <Button onClick={() => { exitDemoMode(); router.push("/"); }} variant="secondary" className="w-full">
                Back to my profile
              </Button>
            )}
          </div>
        )}

        <Section title="Profile">
          <Input
            label="Name"
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="School"
            placeholder="UC Berkeley, Stanford..."
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="Berkeley, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Section>

        <Section title="Major">
          <div className="flex flex-wrap gap-2">
            {MAJOR_CHIPS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMajor(major === m ? "" : m)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  major === m ? "bg-primary-600 text-white" : "bg-muted text-foreground hover:bg-primary-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {!MAJOR_CHIPS.includes(major) && (
            <Input
              placeholder="Type your major..."
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          )}
        </Section>

        <Section title="Monthly budget">
          {!budgetUnknown ? (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">$</span>
                <input
                  type="number"
                  className="w-full h-12 rounded-2xl border border-border bg-white pl-9 pr-4 text-lg font-semibold text-foreground focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-inset focus:ring-primary-600/30"
                  placeholder="500"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["300", "500", "750", "1000"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMonthlyBudget(v)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                      monthlyBudget === v ? "bg-primary-600 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-sm text-primary-700">
              Using a default budget of $500. Turn this off to set your own amount.
            </div>
          )}
          <button
            type="button"
            onClick={() => setBudgetUnknown(!budgetUnknown)}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
          >
            {budgetUnknown ? "I know my budget, enter it" : "Not sure yet — use default"}
          </button>
        </Section>

        <Section title="Living situation">
          <div className="grid grid-cols-1 gap-2">
            {HOUSING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHousing(opt.value)}
                className={`rounded-2xl px-4 py-3.5 text-sm font-medium text-left transition-all cursor-pointer ${
                  housing === opt.value ? "bg-primary-600 text-white" : "bg-muted text-foreground hover:bg-primary-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <ToggleRow label="I have a meal plan" checked={hasMealPlan} onChange={setHasMealPlan} />
          <ToggleRow label="I have a car" checked={hasCar} onChange={setHasCar} />
        </Section>

        <Button onClick={handleSave} loading={saving} variant="primary" className="w-full h-14 font-bold">
          Save changes
        </Button>

        <Section title="Setup">
          <button
            type="button"
            onClick={handleRestartOnboarding}
            className="w-full flex items-center justify-between rounded-2xl bg-muted border border-border/60 px-4 py-4 cursor-pointer hover:bg-primary-50 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Run setup again</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Go back to the welcome screen and walk through onboarding from the start
              </p>
            </div>
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </Section>
      </div>
    </div>
  );
}
