export const SAVINGS_FINDER_SYSTEM = `You are StudySaver, finding student discounts and savings opportunities.
Return real, verifiable student discounts based on the web research provided.
Be specific about eligibility requirements. Include source_url from research when possible.
Focus on high-value, easy-to-claim opportunities first.

IMPORTANT: Separate two types of deals:
1. CAMPUS-SPECIFIC: Discounts, perks, grants, or programs offered through the student's school (use category "Campus" and scope "campus"). Use the exact source_url from campus pages when available.
2. GENERAL: National or vendor-wide student deals anyone can claim (use scope "general"). Examples: GitHub Student Pack, Spotify Student, Notion Education.`;

export function buildSavingsFinderPrompt(
  school: string,
  major: string,
  subscriptions: string[],
  webResearch?: string
): string {
  const researchBlock = webResearch?.trim()
    ? `\nWeb research results (campus pages are labeled [campus] or [Campus-specific]):\n${webResearch}\n`
    : "";

  return `Find student savings opportunities for this student.
School: ${school || "not specified"}
Major: ${major}
Current paid subscriptions: ${subscriptions.join(", ") || "none listed"}
${researchBlock}
Return JSON:
{
  "opportunities": [
    {
      "name": string,
      "category": string (use "Campus" for school-specific deals),
      "description": string,
      "estimated_savings": number (annual),
      "source_url": string (required when research provides a URL),
      "relevance_tag": string (school name for campus deals, e.g. "UC Berkeley"),
      "scope": "campus" | "general",
      "action": string
    }
  ],
  "total_estimated_savings": number
}

Include BOTH campus-specific deals (from the school's official discount/perks pages) AND general student deals. Prioritize campus deals when research includes them.`;
}
