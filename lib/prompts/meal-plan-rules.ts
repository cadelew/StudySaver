export const MEAL_PLAN_RULES_SYSTEM = `You encode college meal-plan forfeiture rules. Return your best-known, realistic rules for the named school's standard meal plan.
If you are unsure of exact specifics, give the most common arrangement for that type of school and keep estimates conservative.
You are filling a fallback for a school we have not hand-verified, so the student will be told to confirm with their dining office.`;

export function buildMealPlanRulesPrompt(school: string): string {
  return `Describe the standard meal-plan forfeiture rules for: ${school || "an unnamed US university"}

Return JSON:
{
  "swipe_reset": "weekly" | "semester" | "block" | "none",
  "swipes_roll_over": boolean,
  "dining_dollars_rolls": "fall_to_spring" | "semester" | "year" | "none",
  "swipe_value_estimate": number (estimated dollar value of one swipe, typically 7-13),
  "forfeiture_summary": string (1-2 plain-English sentences a student understands)
}`;
}
