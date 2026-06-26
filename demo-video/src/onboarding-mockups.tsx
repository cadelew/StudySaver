import { Easing, interpolate } from "remotion";
import { Input } from "./components/ui/input";
import { ONBOARDING_ICONS } from "./components/ui/icons";
import { cn } from "./lib/utils";
import { SCREEN_H, SCREEN_W } from "./demo-constants";

const EXPO_OUT = Easing.bezier(0.22, 1, 0.36, 1);

// ─── Copied from app/onboarding/page.tsx ───────────────────────────────────────
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

const YEAR_OPTIONS = [
  { label: "High School Junior or Below", value: "11th or below" },
  { label: "High School Senior", value: "12th" },
  { label: "College freshman", value: "Freshman" },
  { label: "College sophomore", value: "Sophomore" },
  { label: "College junior", value: "Junior" },
  { label: "College senior", value: "Senior" },
  { label: "Graduate student", value: "Grad" },
  { label: "Not started yet", value: "Pre-college" },
];

const ONBOARD_STEPS = [
  "welcome",
  "name",
  "year",
  "school",
  "budget",
  "housing",
  "major",
  "done",
] as const;

type StepId = (typeof ONBOARD_STEPS)[number];

function stepProgress(step: StepId): number {
  const idx = ONBOARD_STEPS.indexOf(step);
  if (idx <= 0) return 0;
  return (idx / (ONBOARD_STEPS.length - 1)) * 100;
}

// ─── Static button — same classes as components/ui/button.tsx (no framer-motion) ─
function StaticButton({
  variant = "primary",
  className,
  children,
  pressed = false,
}: {
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  children: React.ReactNode;
  pressed?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors duration-200 select-none";
  const variants = {
    primary: "bg-primary-600 text-primary-foreground shadow-card",
    secondary: "bg-muted text-foreground",
    outline: "border border-border text-foreground",
  };
  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ scale: pressed ? 0.96 : 1 }}
    >
      {children}
    </div>
  );
}

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
        <h2 className="font-display text-xl font-bold text-foreground mt-2.5">{title}</h2>
        <p className="text-muted-foreground text-xs mt-1 leading-snug">{subtitle}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OnboardShell({
  step,
  showBack = true,
  pressed = false,
  children,
}: {
  step: StepId;
  showBack?: boolean;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  const progress = stepProgress(step);
  return (
    <div className="h-full flex flex-col bg-background px-5 pt-9 pb-6 overflow-hidden">
      <div className="h-1 bg-gray-100 rounded-full mb-5 overflow-hidden shrink-0">
        <div
          className="h-full bg-primary-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden px-0.5">
        <div className="flex flex-col gap-4">{children}</div>
      </div>
      <div className="flex gap-2.5 mt-4 shrink-0">
        {showBack && (
          <StaticButton variant="secondary" className="flex-1 h-11 px-4 text-sm">
            Back
          </StaticButton>
        )}
        <StaticButton
          variant="primary"
          className="flex-1 h-12 font-bold text-sm whitespace-nowrap"
          pressed={pressed}
        >
          Continue →
        </StaticButton>
      </div>
    </div>
  );
}

// ─── Welcome splash layout — fixed px for the 296×612 phone screen ──────────────
// (The real app sizes with vh/clamp, which resolve against the video viewport in
//  Remotion, so we pin equivalent pixel values that fit the phone.)
const WORD_FONT = 26;
const WORD_STRIDE = 33; // line-height + gap
const WALL_TOP = 22; // pt-5 (20) + small pt
const FIRST_WORD_CENTER = WALL_TOP + WORD_FONT * 0.55;
const LOGO_FONT = 38;
const LOGO_TOP =
  WALL_TOP + WELCOME_KEYWORDS.length * WORD_STRIDE + 10;
const LOGO_CENTER = LOGO_TOP + LOGO_FONT * 0.5;
const STAR_S = Math.max(SCREEN_W * 1.05, SCREEN_H * 0.3);
const STAR_L = -STAR_S * 0.3;
const STAR_Y_START = -STAR_S * 0.55;
const STAR_Y_END = LOGO_CENTER - STAR_S / 2;

function useWelcomeStar(stepLocal: number) {
  const starY = interpolate(stepLocal, [4, 44], [STAR_Y_START, STAR_Y_END], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const starRot = interpolate(stepLocal, [4, 44], [-360, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  const starCenter = starY + STAR_S / 2;
  const wordCenters = WELCOME_KEYWORDS.map(
    (_, i) => FIRST_WORD_CENTER + i * WORD_STRIDE,
  );
  let activeIndex = -1;
  let best = WORD_STRIDE / 2 + 2;
  wordCenters.forEach((c, i) => {
    const d = Math.abs(starCenter - c);
    if (d < best) {
      best = d;
      activeIndex = i;
    }
  });
  const logoLit = starCenter >= LOGO_TOP - 6;

  return { starY, starRot, activeIndex, logoLit };
}

function WelcomeSplashScreen({
  stepLocal,
  pressed,
}: {
  stepLocal: number;
  pressed: boolean;
}) {
  const { starY, starRot, activeIndex, logoLit } = useWelcomeStar(stepLocal);

  return (
    <div className="relative h-full flex flex-col bg-primary-600 text-primary-foreground px-7 pt-5 pb-7 overflow-hidden">
      <div className="relative shrink-0 flex flex-col">
        <div
          aria-hidden
          className="absolute z-10 pointer-events-none"
          style={{
            left: STAR_L,
            top: starY,
            rotate: `${starRot}deg`,
            width: STAR_S,
            height: STAR_S,
          }}
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
          >
            <path d={STAR_PATH} fill="#DDBA76" />
          </svg>
        </div>

        <div className="relative flex flex-col">
          {WELCOME_KEYWORDS.map((word, i) => {
            const lit = i === activeIndex;
            return (
              <span
                key={word}
                aria-hidden
                className={cn(
                  "relative font-display font-semibold tracking-tight",
                  lit ? "z-20 text-accent-50" : "z-0 text-primary-200/45",
                )}
                style={{
                  fontSize: WORD_FONT,
                  lineHeight: 1.05,
                  height: WORD_STRIDE,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div className="relative shrink-0" style={{ marginTop: 10 }}>
          <h1
            className={cn(
              "relative font-display font-bold tracking-tight leading-none",
              logoLit ? "z-20 text-accent-50" : "z-0 text-primary-200/45",
            )}
            style={{ fontSize: LOGO_FONT }}
          >
            StudySaver
          </h1>
          <p className="relative z-30 text-white mt-1.5" style={{ fontSize: 13 }}>
            AI savings copilot for students
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0" aria-hidden />

      <div className="relative z-30 shrink-0 flex flex-col gap-3">
        <StaticButton
          variant="outline"
          pressed={pressed}
          className="w-full h-14 text-base font-semibold bg-transparent border-white text-white"
        >
          Get Started
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </StaticButton>
        <div className="text-white/90 text-sm py-1 text-center">
          Explore with demo data · no setup
        </div>
      </div>
    </div>
  );
}

function NameScreen({ name, pressed }: { name: string; pressed: boolean }) {
  return (
    <OnboardShell step="name" pressed={pressed}>
      <OnboardStep iconKey="name" title="What should we call you?" subtitle="First name is fine.">
        <Input placeholder="First name" value={name} readOnly />
      </OnboardStep>
    </OnboardShell>
  );
}

function YearScreen({ pressed, selected }: { pressed: boolean; selected: boolean }) {
  return (
    <OnboardShell step="year" pressed={pressed}>
      <OnboardStep iconKey="school" title="What year are you?" subtitle="This helps us tailor your experience.">
        <div className="grid grid-cols-2 gap-1.5">
          {YEAR_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={cn(
                "rounded-xl px-2 py-2 text-[10px] font-medium text-left leading-[1.25]",
                selected && opt.value === "Freshman"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-muted text-foreground",
              )}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </OnboardStep>
    </OnboardShell>
  );
}

function SchoolScreen({
  pressed,
  school,
  location,
}: {
  pressed: boolean;
  school: string;
  location: string;
}) {
  return (
    <OnboardShell step="school" pressed={pressed}>
      <OnboardStep
        iconKey="school"
        title="Where do you go to school?"
        subtitle="This helps us find campus-specific deals."
      >
        <Input placeholder="UC Berkeley, Stanford..." value={school} readOnly />
        <Input label="Your city/location" placeholder="Berkeley, CA" value={location} readOnly />
      </OnboardStep>
    </OnboardShell>
  );
}

function BudgetScreen({ pressed, amount }: { pressed: boolean; amount: string }) {
  return (
    <OnboardShell step="budget" pressed={pressed}>
      <OnboardStep
        iconKey="budget"
        title="What's your monthly flexible budget?"
        subtitle="Money for food, entertainment, and everyday spending outside of tuition and rent."
      >
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-muted-foreground">
            $
          </span>
          <input
            readOnly
            value={amount}
            placeholder="500"
            className="w-full h-14 rounded-2xl border border-border bg-white pl-9 pr-4 text-2xl font-bold text-foreground focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 flex-nowrap">
          {["300", "500", "750", "1000"].map((v) => (
            <div
              key={v}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium shrink-0",
                amount === v ? "bg-primary-600 text-white" : "bg-muted text-foreground",
              )}
            >
              ${v}
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground underline underline-offset-2">
          Not sure yet
        </div>
      </OnboardStep>
    </OnboardShell>
  );
}

export const TapCursor: React.FC<{
  x: number;
  y: number;
  tapProgress: number;
}> = ({ x, y, tapProgress }) => {
  const scale = interpolate(tapProgress, [0, 0.35, 1], [0, 1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const ringScale = interpolate(tapProgress, [0, 1], [0.4, 1.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(tapProgress, [0, 0.2, 1], [0, 0.45, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (tapProgress <= 0) return null;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y, translate: "-50% -50%" }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: 48,
          height: 48,
          border: "2.5px solid rgba(255,255,255,0.95)",
          opacity: ringOpacity,
          scale: ringScale,
          translate: "-50% -50%",
        }}
      />
      <div
        className="rounded-full"
        style={{
          width: 30,
          height: 30,
          background: "rgba(255,255,255,0.45)",
          border: "2.5px solid rgba(255,255,255,0.95)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          scale,
        }}
      />
    </div>
  );
};

export type OnboardStepId = "welcome" | "name" | "year" | "school" | "budget";

export const STEP_CALLOUTS: Record<OnboardStepId, string> = {
  welcome: "Set up in under a minute — no bank login",
  name: "Personalized from your very first answer",
  year: "Tips tailored to your year in school",
  school: "Campus deals and perks, found for you",
  budget: "Every purchase checked against what you can spend",
};

export const OnboardingScreen: React.FC<{
  step: OnboardStepId;
  stepLocal: number;
  tapAt: number;
}> = ({ step, stepLocal, tapAt }) => {
  const pressed = stepLocal >= tapAt && stepLocal <= tapAt + 6;

  const typedName = "Maya".slice(
    0,
    Math.floor(
      interpolate(stepLocal, [8, tapAt - 8], [0, 4], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );

  const yearSelected = stepLocal >= tapAt - 18;
  const schoolTypeStart = 12;
  const schoolTypeEnd = Math.max(schoolTypeStart + 12, tapAt - 22);
  const schoolText = "UC Berkeley".slice(
    0,
    Math.floor(
      interpolate(stepLocal, [schoolTypeStart, schoolTypeEnd], [0, 11], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const locationStart = schoolTypeStart + 8;
  const locationEnd = Math.max(locationStart + 10, tapAt - 14);
  const locationText = "Berkeley, CA".slice(
    0,
    Math.floor(
      interpolate(stepLocal, [locationStart, locationEnd], [0, 12], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const budgetCountStart = 14;
  const budgetCountEnd = Math.max(budgetCountStart + 10, tapAt - 20);
  const budgetAmount =
    stepLocal >= budgetCountEnd
      ? "500"
      : stepLocal >= budgetCountStart
        ? interpolate(stepLocal, [budgetCountStart, budgetCountEnd], [0, 500], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }).toFixed(0)
        : "";

  if (step === "welcome") {
    return <WelcomeSplashScreen stepLocal={stepLocal} pressed={pressed} />;
  }
  if (step === "name") {
    return <NameScreen name={typedName} pressed={pressed} />;
  }
  if (step === "year") {
    return <YearScreen pressed={pressed} selected={yearSelected} />;
  }
  if (step === "school") {
    return (
      <SchoolScreen
        pressed={pressed}
        school={schoolText}
        location={locationText}
      />
    );
  }
  return <BudgetScreen pressed={pressed} amount={budgetAmount} />;
};

export const StepCallout: React.FC<{
  text: string;
  stepLocal: number;
  duration: number;
  opacityOverride?: number;
}> = ({ text, stepLocal, duration, opacityOverride = 1 }) => {
  const fadeIn = interpolate(stepLocal, [6, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });
  const fadeOut = interpolate(
    stepLocal,
    [duration - 10, duration - 2],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const ty = interpolate(stepLocal, [6, 18], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EXPO_OUT,
  });

  return (
    <div
      style={{
        opacity: fadeIn * fadeOut * opacityOverride,
        translate: `0 ${ty * opacityOverride}px`,
        maxWidth: 300,
      }}
    >
      <p
        className="font-display font-bold text-primary-600 leading-snug"
        style={{ fontSize: 26 }}
      >
        {text}
      </p>
    </div>
  );
};

export const PHONE_W = SCREEN_W;
export const PHONE_H = SCREEN_H;

const PANEL_SHADOW = "0 32px 64px rgba(0,0,0,0.35)";

export const PhoneMockup: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
  clipContent?: boolean;
}> = ({ children, width = PHONE_W, height = PHONE_H, clipContent = true }) => (
  <div
    className="relative bg-background"
    style={{
      width,
      height,
      borderRadius: 32,
      boxShadow: PANEL_SHADOW,
      flexShrink: 0,
      overflow: clipContent ? "hidden" : "visible",
    }}
  >
    {children}
  </div>
);

/** Larger scaled panel for the dashboard scene (no device bezel). */
export const DashboardPanel: React.FC<{
  children: React.ReactNode;
  contentWidth: number;
  viewportHeight: number;
  scale: number;
  width: number;
  height: number;
}> = ({ children, contentWidth, viewportHeight, scale, width, height }) => (
  <div
    className="relative overflow-hidden bg-background"
    style={{
      width,
      height,
      borderRadius: Math.round(32 * scale),
      boxShadow: PANEL_SHADOW,
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: contentWidth,
        height: viewportHeight,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  </div>
);
