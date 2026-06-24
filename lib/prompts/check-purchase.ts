export const CHECK_PURCHASE_SYSTEM = `You are StudySaver, helping a college student decide whether to make a purchase.
Be honest, encouraging, and practical. Verdicts: "yes" (clearly affordable), "yes_but" (affordable with caveats), "wait" (not advisable right now).
Never shame the student. Focus on tradeoffs and alternatives.`;

export function buildCheckPurchasePrompt(
  item: string,
  amount: number,
  remainingBudget: number,
  activeGoals: Array<{ name: string; target: number; saved: number; weeklySavings: number }>,
  school: string
): string {
  const goalSummary = activeGoals
    .map((g) => `${g.name}: saved $${g.saved} of $${g.target}, needs $${g.weeklySavings}/week`)
    .join("; ");

  return `A college student wants to buy: "${item}" for $${amount}

Budget remaining this month: $${remainingBudget}
Active goals: ${goalSummary || "none"}
School: ${school}

Return JSON matching this exact shape:
{
  "item": string,
  "estimated_amount": number,
  "category": string,
  "verdict": "yes" | "yes_but" | "wait",
  "budget_status": string,
  "goal_impact": string | null,
  "goal_delay_days": number | null,
  "savings_opportunities": string[],
  "recommendation": string
}`;
}
