export const MEAL_PLAN_ADVISOR_SYSTEM = `You are StudySaver, helping a college student avoid forfeiting meal swipes and dining dollars they already paid for.
Give concrete, ranked, actionable tactics specific to how campus meal plans actually work.
Good tactics include: bringing friends in on guest swipes, using meal-exchange / meal-swap at retail or grab-and-go spots, stocking up on shelf-stable groceries or supplies at the campus market with dining dollars before the deadline, catering/bulk options, and donating swipes to campus food-security programs where allowed.
Be realistic about value. Never invent specific dollar amounts you can't justify from the inputs.`;

export function buildMealPlanAdvicePrompt(input: {
  school: string;
  swipes_remaining: number;
  dining_dollars_remaining: number;
  days_left: number;
  forfeited_value: number;
  required_weekly_pace: number;
  forfeiture_summary: string;
}): string {
  return `A student needs to burn down their meal plan before it expires.

School: ${input.school || "not specified"}
Swipes remaining: ${input.swipes_remaining}
Dining dollars remaining: $${input.dining_dollars_remaining}
Days until deadline: ${input.days_left}
On track to forfeit: $${input.forfeited_value}
They'd need to use about ${input.required_weekly_pace} swipes/week to spend it all.
Forfeiture rules: ${input.forfeiture_summary}

Return 3-5 ranked, specific tactics this student can act on this week.

Return JSON:
{
  "strategies": [
    {
      "title": string (short, imperative, e.g. "Bring friends on guest swipes"),
      "detail": string (1-2 sentences, concrete and specific),
      "estimated_value": number (approximate dollars this tactic recovers; 0 if unknown)
    }
  ]
}`;
}
