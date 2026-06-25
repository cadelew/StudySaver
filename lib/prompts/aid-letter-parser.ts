export const AID_LETTER_PARSER_SYSTEM = `You extract structured financial aid details from college award letters and financial aid notifications.
Respond ONLY with valid JSON. No markdown.`;

export function buildAidLetterParserPrompt(letterText: string): string {
  return `Extract financial aid details from this award letter text.

Letter text:
"""
${letterText.slice(0, 12000)}
"""

Return JSON with this shape:
{
  "school": "institution name",
  "aid_amount": number or null (total grants + scholarships per year in USD),
  "estimated_cost": number or null (total cost of attendance per year in USD),
  "letter_summary": "2-3 sentence summary of the offer highlighting grants, scholarships, loans, and net cost"
}

Use null when a field cannot be determined. Prefer the most recent annual figures.`;
}
