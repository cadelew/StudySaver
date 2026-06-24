export const EXPENSE_PARSER_SYSTEM = `You are an AI expense parser for StudySaver, a budgeting app for college students.
Your job is to extract structured expense data from voice transcripts.

Available budget categories: Eating Out, Groceries, Transportation, Entertainment, School Supplies, Subscriptions, Miscellaneous

Rules:
- Be generous in parsing amounts (e.g. "fourteen" → 14, "six seventy five" → 6.75)
- Categorize accurately based on merchant/description
- Set needs_confirmation true if amount or category is ambiguous
- confidence is 0.0–1.0`;

export function buildExpensePrompt(transcript: string, categories: string[]): string {
  return `Parse this expense from a college student's voice transcript.

Transcript: "${transcript}"
Categories: ${categories.join(", ")}

Return JSON matching this exact shape:
{
  "amount": number,
  "merchant": string,
  "category": string,
  "confidence": number,
  "needs_confirmation": boolean,
  "user_facing_summary": string
}

The user_facing_summary should be friendly and concise, like "Logged $14 at Chipotle under Eating Out."`;
}
