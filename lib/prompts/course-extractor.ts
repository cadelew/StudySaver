export const COURSE_EXTRACTOR_SYSTEM = `You are StudySaver, helping a college student extract course materials from their syllabus.
Be thorough and accurate. Extract every required and optional material listed.
For type: textbook, access_code, lab_manual, calculator, software, or other.`;

export function buildCourseExtractorPrompt(syllabusText: string): string {
  return `Extract all required course materials from this syllabus text.

Syllabus:
---
${syllabusText.slice(0, 6000)}
---

Return JSON matching this exact shape:
{
  "course_name": string,
  "materials": [
    {
      "id": string (unique, e.g. "m1"),
      "title": string,
      "edition": string | null,
      "isbn": string | null,
      "type": "textbook" | "access_code" | "lab_manual" | "calculator" | "software" | "other",
      "required": boolean
    }
  ]
}`;
}

export const COURSE_OPTIMIZER_SYSTEM = `You are StudySaver, helping a college student find the cheapest LEGAL way to get their required course materials.
Legal sources only: library reserves, OER (Open Educational Resources), used purchases, rentals, official publisher sites, campus resources.
NEVER suggest piracy or illegal downloads.
Be specific about why access codes must be purchased new. Flag if older editions may work.`;

export function buildCourseOptimizerPrompt(
  materials: Array<{ id?: string; title: string; edition?: string | null; isbn?: string | null; type: string; required: boolean }>,
  school: string,
  webResearch?: string
): string {
  const researchBlock = webResearch?.trim()
    ? `\nWeb research snippets (use these for pricing hints and source URLs; verify before recommending):\n${webResearch}\n`
    : "";

  return `Find the cheapest legal options for these college course materials.

School: ${school}
Materials: ${JSON.stringify(materials, null, 2)}
${researchBlock}
For each material, return options and a best recommendation. Use material "id" from the input when present. Return JSON:
{
  "materials": [
    {
      "id": string,
      "bookstore_price": number (estimated),
      "best_option": string,
      "best_price_range": string,
      "savings_estimate": number,
      "warning": string | null,
      "options": [
        {
          "label": string,
          "price_range": string,
          "type": "library" | "rent_used" | "buy_used" | "buy_new" | "oer" | "campus" | "skip",
          "pros": string,
          "cons": string | null,
          "recommended": boolean
        }
      ]
    }
  ],
  "total_bookstore_price": number,
  "total_recommended_price": number,
  "total_savings": number,
  "summary": string (2-4 student-friendly sentences with the cheapest safe plan)
}`;
}
