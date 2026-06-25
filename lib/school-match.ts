/**
 * Shared school-name matching. Each curated data file (meal-plan rules, refund
 * ladders, perks) keys its records by a canonical school slug. A user types a
 * school name freely during onboarding, so we resolve that free text to a slug
 * via lowercase-substring aliases.
 *
 * This generalizes the keyword-match approach originally in school-deal-sources.ts.
 */

export type SchoolKey = "purdue" | "rutgers" | "asu" | "appstate" | "berkeley";

// Ordered list of [slug, ...aliases]. First alias hit wins.
const SCHOOL_ALIASES: Array<[SchoolKey, string[]]> = [
  ["purdue", ["purdue"]],
  ["rutgers", ["rutgers"]],
  ["asu", ["arizona state", "asu"]],
  ["appstate", ["appalachian", "app state", "appstate"]],
  ["berkeley", ["berkeley", "ucb", "uc berkeley", "cal "]],
];

/** Resolve free-text school name to a canonical slug, or null if uncurated. */
export function matchSchoolKey(school: string | undefined | null): SchoolKey | null {
  const s = (school ?? "").toLowerCase().trim();
  if (!s) return null;
  for (const [key, aliases] of SCHOOL_ALIASES) {
    if (aliases.some((a) => s.includes(a))) return key;
  }
  return null;
}

/** Look up a record in a slug-keyed map for the given school name. */
export function matchSchoolRecord<T>(
  school: string | undefined | null,
  map: Partial<Record<SchoolKey, T>>
): T | null {
  const key = matchSchoolKey(school);
  if (!key) return null;
  return map[key] ?? null;
}
