"use client";

import * as React from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCheckCircle, ONBOARDING_ICONS } from "@/components/ui/icons";
import { useStore } from "@/lib/store";
import type { StudentStatus, HousingType, CollegeOffer } from "@/lib/types";

type Step =
  | "welcome"
  | "name"
  | "year"
  | "school"
  | "offers"       // only shown when status === "deciding"
  | "budget"
  | "housing"
  | "major"
  | "done";

interface FormState {
  name: string;
  year_in_school: string;
  student_status: StudentStatus | "";
  school: string;
  location: string;
  school_unknown: boolean;
  budget_unknown: boolean;
  monthly_budget: string;
  housing: HousingType | "";
  has_meal_plan: boolean;
  has_car: boolean;
  major: string;
  college_offers: CollegeOffer[];
}

const YEAR_OPTIONS: { label: string; value: string; status: StudentStatus }[] = [
  { label: "High School Junior or Below", value: "11th or below", status: "high_school" },
  { label: "High School Senior", value: "12th", status: "high_school" },
  { label: "College freshman", value: "Freshman", status: "committed" },
  { label: "College sophomore", value: "Sophomore", status: "committed" },
  { label: "College junior", value: "Junior", status: "committed" },
  { label: "College senior", value: "Senior", status: "committed" },
  { label: "Graduate student", value: "Grad", status: "committed" },
  { label: "Not started yet", value: "Pre-college", status: "not_started" },
];

const SENIOR_PROCESS_OPTIONS: { label: string; value: StudentStatus }[] = [
  { label: "I've committed to a school", value: "committed" },
  { label: "Still deciding between offers", value: "deciding" },
  { label: "I'm applying to colleges", value: "applying" },
];

const MAJOR_CHIPS = ["Computer Science", "Biology", "Business", "Psychology", "Engineering", "Nursing", "Education", "Undeclared"];

// ─── Welcome splash (animated star + masking spotlight) ──────────────────────
const STAR_PATH =
  "M100 12 L121 74 L186 74 L133 112 L154 176 L100 142 L46 176 L67 112 L14 74 L79 74 Z";

const WELCOME_KEYWORDS = [
  "Budgeting",
  "Saving",
  "Textbooks",
  "Planning",
  "Discounts",
  "Goals",
  "Spending",
  "Cashback",
  "Freedom",
];

const WALL_TEXT_CLASS =
  "font-display font-semibold text-[3.25rem] sm:text-[4.25rem] leading-[1.05] tracking-tight";

function WelcomeSplash({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const splashRef = React.useRef<HTMLDivElement>(null);
  const wallRef = React.useRef<HTMLDivElement>(null);
  const wordsRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<HTMLHeadingElement>(null);
  const [viewport, setViewport] = React.useState({ w: 0, h: 0 });
  const [wordBounds, setWordBounds] = React.useState<{ top: number; bottom: number }[]>([]);
  const [yEnd, setYEnd] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [logoBounds, setLogoBounds] = React.useState<{ top: number; bottom: number } | null>(null);
  const [logoLit, setLogoLit] = React.useState(false);

  const ANIM_DURATION = 2.5;

  // Star size scales with viewport; width-driven so it stays large on phones
  const S =
    viewport.w > 0 && viewport.h > 0
      ? Math.max(viewport.w * 1.15, viewport.h * 0.34)
      : 0;
  const L = -S * 0.38;
  const yStart = -S * 0.55;

  const starY = useMotionValue(0);
  const starRot = useMotionValue(-360);

  const measureLayout = React.useCallback(() => {
    const splash = splashRef.current;
    const wall = wallRef.current;
    const words = wordsRef.current;
    const logo = logoRef.current;
    if (!splash || !wall || !words) return;

    const w = splash.clientWidth;
    const h = splash.clientHeight;
    setViewport({ w, h });

    const starSize = Math.max(w * 1.15, h * 0.34);

    const bounds = Array.from(words.querySelectorAll("[data-word]")).map((el) => {
      const node = el as HTMLElement;
      return { top: node.offsetTop, bottom: node.offsetTop + node.offsetHeight };
    });
    setWordBounds(bounds);

    if (logo && starSize > 0) {
      const wallRect = wall.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const logoTop = logoRect.top - wallRect.top;
      const logoBottom = logoRect.bottom - wallRect.top;
      setLogoBounds({ top: logoTop, bottom: logoBottom });
      setYEnd(logoTop + (logoBottom - logoTop) / 2 - starSize / 2);
    }
  }, []);

  React.useEffect(() => {
    const splash = splashRef.current;
    if (!splash) return;
    measureLayout();
    const ro = new ResizeObserver(measureLayout);
    ro.observe(splash);
    return () => ro.disconnect();
  }, [measureLayout]);

  React.useEffect(() => {
    if (!viewport.h || S <= 0 || !yEnd) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      starY.set(yEnd);
      starRot.set(0);
      setActiveIndex(-1);
      setLogoLit(false);
      return;
    }
    starY.set(yStart);
    starRot.set(-360);
    setActiveIndex(-1);
    setLogoLit(false);
    // Same duration + linear spin keeps rotation speed constant and in sync with the drop
    const timing = { duration: ANIM_DURATION, ease: [0.45, 0.05, 0.55, 0.95] as const, delay: 0.2 };
    const c1 = animate(starY, yEnd, timing);
    const c2 = animate(starRot, 0, timing);
    return () => {
      c1.stop();
      c2.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.w, viewport.h, yEnd, S]);

  React.useEffect(() => {
    if (!wordBounds.length || S <= 0) return;
    const starCenterOffset = S / 2;
    const updateLit = (y: number) => {
      const center = y + starCenterOffset;
      const idx = wordBounds.findIndex((b) => center >= b.top && center <= b.bottom);
      setActiveIndex(idx);
      setLogoLit(
        logoBounds !== null && center >= logoBounds.top && center <= logoBounds.bottom
      );
    };
    updateLit(starY.get());
    return starY.on("change", updateLit);
  }, [starY, wordBounds, logoBounds, S]);

  return (
    <div
      ref={splashRef}
      className="relative min-h-[100dvh] flex flex-col bg-primary-600 text-primary-foreground px-7 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))] overflow-hidden"
    >
      <div ref={wallRef} className="relative shrink-0 -mx-7 flex flex-col">
        {/* Star sits between muted text (z-0) and highlighted text (z-20) */}
        <motion.div
          aria-hidden
          className="absolute top-0 left-0 z-10 pointer-events-none"
          style={{ x: L, y: starY, rotate: starRot, width: S, height: S }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
            <path d={STAR_PATH} fill="#DDBA76" />
          </svg>
        </motion.div>

        {/* Word wall — modest fixed gaps; taller screens get slightly more, not full spread */}
        <div
          ref={wordsRef}
          className="relative px-7 flex flex-col gap-y-1.5 sm:gap-y-2 md:gap-y-2.5 lg:gap-y-3 pt-3 sm:pt-4 pb-1 sm:pb-2"
        >
          {WELCOME_KEYWORDS.map((word, i) => {
            const lit = i === activeIndex;
            return (
              <span
                key={word}
                data-word
                aria-hidden
                className={`relative ${WALL_TEXT_CLASS} transition-colors duration-200 ${
                  lit ? "z-20 text-accent-50" : "z-0 text-primary-200/45"
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Logo in the same stacking context as the star */}
        <div className="relative shrink-0 px-7 mt-1 sm:mt-2 md:mt-3">
          <h1
            ref={logoRef}
            className={`relative font-display text-7xl sm:text-8xl font-bold tracking-tight leading-none transition-colors duration-200 ${
              logoLit ? "z-20 text-accent-50" : "z-0 text-primary-200/45"
            }`}
          >
            StudySaver
          </h1>
          <p className="relative z-30 text-white text-sm sm:text-base mt-1.5 sm:mt-2 md:mt-2.5">
            AI savings copilot for students
          </p>
        </div>
      </div>

      {/* Modest buffer on tall screens — capped so the tagline-to-button gap stays tight */}
      <div className="flex-1 min-h-0 max-h-6 sm:max-h-8" aria-hidden />

      <div className="relative z-30 shrink-0 mt-3 sm:mt-4 flex flex-col gap-3">
        <Button
          variant="outline"
          onClick={onStart}
          className="w-full h-14 text-base font-semibold bg-transparent border-white text-white hover:bg-white/10 hover:text-white"
        >
          Get Started
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
        <button
          onClick={onSkip}
          className="text-white text-sm py-1.5 cursor-pointer hover:text-white/80 transition-colors"
        >
          Skip and explore
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);

  const [step, setStep] = React.useState<Step>("welcome");
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [form, setForm] = React.useState<FormState>({
    name: "",
    year_in_school: "",
    student_status: "",
    school: "",
    location: "",
    school_unknown: false,
    budget_unknown: false,
    monthly_budget: "500",
    housing: "",
    has_meal_plan: false,
    has_car: false,
    major: "",
    college_offers: [],
  });

  const isHS = form.student_status === "high_school";
  const isDeciding = form.student_status === "deciding";
  const isApplying = form.student_status === "applying";
  const isNotStarted = form.student_status === "not_started";
  const isHSSenior = form.year_in_school === "12th";

  // Ordered list of steps (some conditional)
  const getSteps = React.useCallback((): Step[] => {
    const base: Step[] = ["welcome", "name", "year", "school"];
    if (isDeciding) base.push("offers");
    base.push("budget", "housing", "major", "done");
    return base;
  }, [isDeciding]);

  const steps = getSteps();
  const stepIdx = steps.indexOf(step);
  const progress = stepIdx > 0 ? ((stepIdx) / (steps.length - 1)) * 100 : 0;

  const goNext = () => {
    const next = steps[stepIdx + 1];
    if (next) { setDirection(1); setStep(next); }
  };
  const goBack = () => {
    const prev = steps[stepIdx - 1];
    if (prev) { setDirection(-1); setStep(prev); }
  };
  const skip = () => router.push("/");

  const handleDone = () => {
    const payload = {
      name: form.name,
      year_in_school: form.year_in_school,
      student_status: form.student_status as StudentStatus,
      school: form.school_unknown ? "" : form.school,
      location: form.school_unknown ? "" : form.location,
      monthly_budget: form.budget_unknown ? 500 : Number(form.monthly_budget) || 500,
      budget_unknown: form.budget_unknown,
      housing: form.housing as HousingType,
      has_meal_plan: form.has_meal_plan,
      has_car: form.has_car,
      major: form.major,
      college_offers: form.college_offers,
    };
    localStorage.setItem("studysaver_onboarded", "1");
    localStorage.setItem("studysaver_user", JSON.stringify(payload));
    setUser(payload);
    router.push("/");
  };

  // ─── Welcome splash ──────────────────────────────────────────────────────────
  if (step === "welcome") {
    return (
      <WelcomeSplash
        onStart={() => { setDirection(1); setStep("name"); }}
        onSkip={skip}
      />
    );
  }

  // ─── Done screen ─────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background px-6 pt-16 pb-8">
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-success-50 flex items-center justify-center text-success">
            <IconCheckCircle className="w-12 h-12" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">
              You&apos;re all set, {form.name || "there"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {form.student_status === "deciding"
                ? "Your personalized financial aid plan is ready."
                : "Your personalized budget is ready."}
            </p>
          </div>
          <div className="bg-muted rounded-2xl px-5 py-4 w-full text-left space-y-2">
            {form.budget_unknown ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly budget</span>
                <span className="font-semibold text-muted-foreground italic">Set later</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly budget</span>
                <span className="font-semibold">${form.monthly_budget}</span>
              </div>
            )}
            {form.school && !form.school_unknown && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">School</span>
                <span className="font-semibold">{form.school}</span>
              </div>
            )}
            {!form.school && form.school_unknown && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">School</span>
                <span className="font-semibold text-muted-foreground italic">Set later</span>
              </div>
            )}
            {form.student_status === "deciding" && form.college_offers.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Offers added</span>
                <span className="font-semibold">{form.college_offers.length}</span>
              </div>
            )}
            {form.major && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Major</span>
                <span className="font-semibold">{form.major}</span>
              </div>
            )}
          </div>
        </div>
        <Button onClick={handleDone} variant="primary" className="w-full h-14 text-base font-bold">
          Open my dashboard →
        </Button>
      </div>
    );
  }

  // ─── Step machine ─────────────────────────────────────────────────────────────
  const canContinue = (() => {
    if (step === "name") return form.name.trim().length > 0;
    if (step === "year") {
      if (!form.year_in_school) return false;
      if (form.year_in_school === "12th") {
        return (
          form.student_status === "committed" ||
          form.student_status === "deciding" ||
          form.student_status === "applying"
        );
      }
      return true;
    }
    return true;
  })();

  return (
    <div className="h-[100dvh] flex flex-col bg-background px-6 pt-14 pb-8 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden shrink-0">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto app-scroll px-0.5 py-1">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col gap-6"
          >
            {step === "name" && (
              <OnboardStep iconKey="name" title="What should we call you?" subtitle="First name is fine.">
                <Input
                  placeholder="Maya"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && canContinue) goNext(); }}
                />
              </OnboardStep>
            )}

            {step === "year" && (
              <OnboardStep iconKey="school" title="What year are you?" subtitle="This helps us tailor your experience.">
                <div className="grid grid-cols-2 gap-2">
                  {YEAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setForm({
                          ...form,
                          year_in_school: opt.value,
                          student_status: opt.value === "12th" ? "" : opt.status,
                        })
                      }
                      className={`rounded-2xl px-4 py-3 text-sm font-medium text-left transition-all ${
                        form.year_in_school === opt.value
                          ? "bg-primary-600 text-white shadow-sm"
                          : "bg-muted text-foreground hover:bg-primary-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* High school seniors: follow-up on college process */}
                {isHSSenior && (
                  <div className="mt-2 bg-primary-50 rounded-2xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-primary-700">Where are you in the process?</p>
                    {SENIOR_PROCESS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setForm({ ...form, student_status: opt.value })}
                        className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-all ${
                          form.student_status === opt.value
                            ? "bg-primary-600 text-white"
                            : "bg-white text-foreground border border-border"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </OnboardStep>
            )}

            {step === "school" && (
              <OnboardStep
                iconKey="school"
                title={
                  isDeciding
                    ? "What's your top school right now?"
                    : isApplying
                      ? "Which schools are you applying to?"
                      : isNotStarted
                        ? "Which school are you considering?"
                        : isHS && !isDeciding && !isApplying
                          ? "Where do you go to high school?"
                          : "Where do you go to school?"
                }
                subtitle={
                  isDeciding
                    ? "Your first-choice or front-runner. We'll add your other offers next."
                    : isApplying
                      ? "Your top choice or a school you're seriously considering."
                      : "This helps us find campus-specific deals."
                }
              >
                {isHS && !isDeciding && !isApplying && !isHSSenior ? (
                  <>
                    <Input
                      placeholder="Your high school name"
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value, school_unknown: false })}
                      autoFocus
                    />
                    <Input
                      label="Your city/location"
                      placeholder="Oakland, CA"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value, school_unknown: false })}
                    />
                  </>
                ) : (
                  <>
                    {form.school_unknown ? (
                      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-sm text-primary-700">
                        No problem. You can add your school later from the dashboard.
                      </div>
                    ) : (
                      <>
                        <Input
                          placeholder={
                            isApplying
                              ? "e.g. UCLA, Stanford..."
                              : isNotStarted
                                ? "School you're considering"
                                : "UC Berkeley, Stanford..."
                          }
                          value={form.school}
                          onChange={(e) => setForm({ ...form, school: e.target.value, school_unknown: false })}
                          autoFocus
                        />
                        <Input
                          label="Your city/location"
                          placeholder="Berkeley, CA"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value, school_unknown: false })}
                        />
                      </>
                    )}
                    {(isNotStarted || isDeciding || isApplying) && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, school: "", location: "", school_unknown: true });
                          goNext();
                        }}
                        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
                      >
                        Not sure yet, skip this
                      </button>
                    )}
                  </>
                )}
              </OnboardStep>
            )}

            {step === "offers" && isDeciding && (
              <OnboardStep
                iconKey="school"
                title="Add your college offers"
                subtitle="We'll help you compare aid packages and write negotiation scripts."
              >
                <OffersStep form={form} setForm={setForm} />
              </OnboardStep>
            )}

            {step === "budget" && (
              <OnboardStep
                iconKey="budget"
                title="What's your monthly flexible budget?"
                subtitle="Money for food, entertainment, and everyday spending outside of tuition and rent."
              >
                {!form.budget_unknown ? (
                  <>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-muted-foreground">$</span>
                      <input
                        type="number"
                        className="w-full h-16 rounded-2xl border border-border bg-white pl-9 pr-4 text-3xl font-bold text-foreground focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-inset focus:ring-primary-600/30"
                        placeholder="500"
                        value={form.monthly_budget}
                        onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {["300", "500", "750", "1000"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setForm({ ...form, monthly_budget: v })}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                            form.monthly_budget === v ? "bg-primary-600 text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          ${v}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 text-sm text-primary-700">
                    No problem. We&apos;ll use a conservative default of $500 and you can update it anytime from the dashboard.
                  </div>
                )}
                <button
                  onClick={() => setForm({ ...form, budget_unknown: !form.budget_unknown, monthly_budget: "500" })}
                  className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {form.budget_unknown ? "I know my budget, enter it" : "Not sure yet"}
                </button>
              </OnboardStep>
            )}

            {step === "housing" && (
              <OnboardStep
                iconKey="school"
                title="What's your living situation?"
                subtitle="Helps us set smarter defaults for food and transport budgets."
              >
                <div className="grid grid-cols-1 gap-2">
                  {([
                    { label: "Living at home / commuting", value: "home" as HousingType },
                    { label: "Campus dorm or residence hall", value: "dorm" as HousingType },
                    { label: "Off-campus apartment", value: "off_campus" as HousingType },
                  ] as { label: string; value: HousingType }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, housing: opt.value })}
                      className={`rounded-2xl px-4 py-3.5 text-sm font-medium text-left transition-all ${
                        form.housing === opt.value ? "bg-primary-600 text-white" : "bg-muted text-foreground hover:bg-primary-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <ToggleRow
                    label="I have a meal plan"
                    checked={form.has_meal_plan}
                    onChange={(v) => setForm({ ...form, has_meal_plan: v })}
                  />
                  <ToggleRow
                    label="I have a car"
                    checked={form.has_car}
                    onChange={(v) => setForm({ ...form, has_car: v })}
                  />
                </div>

                <button onClick={goNext} className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                  Skip this step
                </button>
              </OnboardStep>
            )}

            {step === "major" && (
              <OnboardStep iconKey="major" title="What's your major?" subtitle="Helps us surface relevant tools and deals.">
                <div className="flex flex-wrap gap-2">
                  {MAJOR_CHIPS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm({ ...form, major: form.major === m ? "" : m })}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        form.major === m ? "bg-primary-600 text-white" : "bg-muted text-foreground hover:bg-primary-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, major: form.major === "__other__" ? "" : "__other__" })}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      form.major === "__other__" || (!MAJOR_CHIPS.includes(form.major) && form.major !== "")
                        ? "bg-primary-600 text-white"
                        : "bg-muted text-foreground hover:bg-primary-50"
                    }`}
                  >
                    Other
                  </button>
                </div>

                {(!MAJOR_CHIPS.includes(form.major) || form.major === "__other__") && (
                  <Input
                    placeholder="Type your major..."
                    value={form.major === "__other__" ? "" : form.major}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    autoFocus
                  />
                )}

                <button onClick={goNext} className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                  Skip this step
                </button>
              </OnboardStep>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-6 shrink-0">
        {stepIdx > 1 && (
          <Button onClick={goBack} variant="secondary" className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={goNext}
          disabled={!canContinue}
          variant="primary"
          className="flex-1 h-14 font-bold"
        >
          {stepIdx === steps.length - 2 ? "Finish →" : "Continue →"}
        </Button>
      </div>
    </div>
  );
}

// ─── Offers step sub-component ────────────────────────────────────────────────

function OffersStep({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const [newSchool, setNewSchool] = React.useState(form.school || "");
  const [newAid, setNewAid] = React.useState("");
  const [newCost, setNewCost] = React.useState("");

  const addOffer = () => {
    if (!newSchool.trim()) return;
    const offer: CollegeOffer = {
      school: newSchool.trim(),
      aid_amount: newAid ? Number(newAid) : undefined,
      estimated_cost: newCost ? Number(newCost) : undefined,
    };
    setForm((f) => ({
      ...f,
      college_offers: [...f.college_offers.filter((o) => o.school !== offer.school), offer],
    }));
    setNewSchool("");
    setNewAid("");
    setNewCost("");
  };

  const removeOffer = (school: string) => {
    setForm((f) => ({ ...f, college_offers: f.college_offers.filter((o) => o.school !== school) }));
  };

  React.useEffect(() => {
    if (form.school && !form.college_offers.find((o) => o.school === form.school)) {
      setNewSchool(form.school);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {form.college_offers.length > 0 && (
        <div className="space-y-2">
          {form.college_offers.map((offer) => (
            <div key={offer.school} className="flex items-center justify-between bg-primary-50 rounded-2xl px-4 py-3 border border-primary-100">
              <div>
                <p className="text-sm font-semibold text-foreground">{offer.school}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {offer.estimated_cost !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Est. cost: ${offer.estimated_cost.toLocaleString()}/yr
                    </p>
                  )}
                  {offer.aid_amount !== undefined && (
                    <p className="text-xs text-primary-700">
                      Aid: ${offer.aid_amount.toLocaleString()}/yr
                    </p>
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
      )}

      <div className="space-y-2">
        <Input
          placeholder="School name (e.g. UCLA)"
          value={newSchool}
          onChange={(e) => setNewSchool(e.target.value)}
        />
        <Input
          label="Estimated annual cost (tuition + room/board)"
          placeholder="55000"
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
        />
        <Input
          label="Annual financial aid offer (optional)"
          placeholder="12000"
          type="number"
          value={newAid}
          onChange={(e) => setNewAid(e.target.value)}
        />
        <Button
          onClick={addOffer}
          disabled={!newSchool.trim()}
          variant="secondary"
          className="w-full"
        >
          + Add school
        </Button>
      </div>

      {form.college_offers.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Add at least 2 schools to unlock negotiation scripts.
        </p>
      )}
    </div>
  );
}

// ─── Reusable helpers ─────────────────────────────────────────────────────────

function OnboardStep({
  iconKey,
  title,
  subtitle,
  children,
}: {
  iconKey: keyof typeof ONBOARDING_ICONS;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const Icon = ONBOARDING_ICONS[iconKey] || ONBOARDING_ICONS.name;
  return (
    <div className="space-y-5">
      <div>
        <span className="inline-flex w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 items-center justify-center">
          <Icon className="w-6 h-6" />
        </span>
        <h2 className="font-display text-2xl font-bold text-foreground mt-3">{title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

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
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full bg-muted rounded-2xl px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors"
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary-600" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
