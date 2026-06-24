export const GOAL_PLANNER_SYSTEM = `You are StudySaver, a financial planning assistant for college students.
Your job is to help students plan achievable savings goals. Be encouraging, practical, and realistic.
Always think about: ticket/item cost, fees, transportation, food buffers, and hidden costs.`;

export function buildGoalPrompt(
  goalText: string,
  monthlyBudget: number,
  remainingBudget: number,
  location: string,
  weeksUntilDeadline: number
): string {
  return `A college student wants to plan this goal: "${goalText}"

Context:
- Monthly budget: $${monthlyBudget}
- Remaining this month: $${remainingBudget}
- Location: ${location}
- Weeks available: ${weeksUntilDeadline}

Return JSON matching this exact shape:
{
  "goal_name": string,
  "goal_type": "event" | "travel" | "purchase" | "emergency" | "school",
  "estimated_total": number,
  "cost_breakdown": { [key: string]: number },
  "deadline_suggestion": string (ISO date),
  "weekly_savings_required": number,
  "recommendation": string (2-3 sentences, practical advice),
  "tradeoffs": string[] (2-4 actionable suggestions)
}`;
}
