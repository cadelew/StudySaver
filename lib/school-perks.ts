/**
 * Curated "you already pay for this" perks per school — site-licensed software
 * and fee-bundled services students routinely re-buy out of ignorance. Distinct
 * from generic .edu discounts: these cost the student $0 extra because tuition
 * or campus fees already cover them. Tagged perk_kind: "included".
 *
 * Keyed by the canonical slugs in lib/school-match.ts. Uncurated schools fall
 * back to /api/find-perks (AI).
 */
import type { SavingsOpportunity } from "./types";
import { type SchoolKey, matchSchoolKey } from "./school-match";

type PerkSeed = Omit<SavingsOpportunity, "id" | "user_id" | "claim_status">;

// Perks common to most large US universities (only surfaced for curated schools
// so we never over-promise to a school we haven't checked).
const COMMON: PerkSeed[] = [
  {
    name: "Microsoft 365 (free for students)",
    category: "Software",
    description: "Word, Excel, PowerPoint and 1TB OneDrive are free with your .edu — don't pay for a personal subscription.",
    estimated_savings: 100,
    scope: "campus",
    perk_kind: "included",
  },
  {
    name: "Recreation / gym membership",
    category: "Campus Life",
    description: "Your campus rec center is already bundled into your student fees. Skip the off-campus gym membership.",
    estimated_savings: 360,
    scope: "campus",
    perk_kind: "included",
  },
];

const PERKS: Partial<Record<SchoolKey, PerkSeed[]>> = {
  purdue: [
    {
      name: "Adobe Creative Cloud (Purdue license)",
      category: "Software",
      description: "Purdue site-licenses Adobe CC for enrolled students. Activate with your career account instead of paying $20/mo.",
      estimated_savings: 240,
      source_url: "https://www.itap.purdue.edu/shopping/software/",
      relevance_tag: "Purdue",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "MATLAB (Total Academic Headcount)",
      category: "Software",
      description: "Full MATLAB + Simulink + all toolboxes free through Purdue's TAH license.",
      estimated_savings: 250,
      source_url: "https://www.itap.purdue.edu/shopping/software/",
      relevance_tag: "Purdue",
      scope: "campus",
      perk_kind: "included",
    },
  ],
  rutgers: [
    {
      name: "Adobe Creative Cloud (Rutgers)",
      category: "Software",
      description: "Rutgers provides Adobe CC to students. Activate with your NetID before buying it.",
      estimated_savings: 240,
      source_url: "https://software.rutgers.edu/",
      relevance_tag: "Rutgers",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "Free campus printing quota",
      category: "Campus Life",
      description: "Your term fees include a printing allowance at campus labs. Use it before paying per-page elsewhere.",
      estimated_savings: 60,
      relevance_tag: "Rutgers",
      scope: "campus",
      perk_kind: "included",
    },
  ],
  asu: [
    {
      name: "Adobe Creative Cloud (ASU)",
      category: "Software",
      description: "ASU offers Adobe CC to students. Check MyApps before paying for a subscription.",
      estimated_savings: 240,
      source_url: "https://uto.asu.edu/services/software",
      relevance_tag: "ASU",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "Valley Metro U-Pass transit",
      category: "Transportation",
      description: "Discounted/bundled light rail & bus pass for ASU students — far cheaper than full fare.",
      estimated_savings: 300,
      relevance_tag: "ASU",
      scope: "campus",
      perk_kind: "included",
    },
  ],
  appstate: [
    {
      name: "Microsoft 365 + OneDrive (App State)",
      category: "Software",
      description: "Free Office suite and cloud storage with your appstate.edu account.",
      estimated_savings: 100,
      source_url: "https://tech.appstate.edu/",
      relevance_tag: "App State",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "AppalCart free transit",
      category: "Transportation",
      description: "AppalCart buses are fare-free for the Boone community — no student transit cost at all.",
      estimated_savings: 240,
      relevance_tag: "App State",
      scope: "campus",
      perk_kind: "included",
    },
  ],
  berkeley: [
    {
      name: "Adobe Creative Cloud (bSecure)",
      category: "Software",
      description: "UC Berkeley provides Adobe CC to students. Activate via Software Central instead of paying monthly.",
      estimated_savings: 240,
      source_url: "https://software.berkeley.edu/adobe",
      relevance_tag: "UC Berkeley",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "AC Transit Class Pass",
      category: "Transportation",
      description: "Your registration fees already cover unlimited AC Transit rides via the Class Pass.",
      estimated_savings: 300,
      source_url: "https://pt.berkeley.edu/around/transit/passes",
      relevance_tag: "UC Berkeley",
      scope: "campus",
      perk_kind: "included",
    },
    {
      name: "New York Times Academic Pass",
      category: "Reading",
      description: "Free full NYT access through the UC Berkeley Library — don't pay for a personal subscription.",
      estimated_savings: 100,
      source_url: "https://www.lib.berkeley.edu/",
      relevance_tag: "UC Berkeley",
      scope: "campus",
      perk_kind: "included",
    },
  ],
};

/** Curated included-perks for a school, as full SavingsOpportunity records. */
export function matchSchoolPerks(school: string | undefined | null): SavingsOpportunity[] {
  const key = matchSchoolKey(school);
  if (!key) return [];
  const seeds = [...(PERKS[key] ?? []), ...COMMON];
  return seeds.map((seed, i) => ({
    ...seed,
    id: `perk-${key}-${i}`,
    user_id: "user-local",
    claim_status: "not_claimed" as const,
    relevance_tag: seed.relevance_tag ?? (school ?? undefined),
  }));
}
