import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { matchMealPlanRules, DEFAULT_RULES } from "@/lib/meal-plan-rules";
import {
  buildMealPlanRulesPrompt,
  MEAL_PLAN_RULES_SYSTEM,
} from "@/lib/prompts/meal-plan-rules";
import type { MealPlanRules } from "@/lib/types";

type AiRules = Omit<MealPlanRules, "curated" | "source_url">;

export async function POST(req: NextRequest) {
  try {
    const { school } = await req.json();

    // Prefer hand-verified rules when we have them.
    const curated = matchMealPlanRules(school);
    if (curated) return NextResponse.json({ rules: curated });

    try {
      const ai = await claudeJSON<AiRules>(
        buildMealPlanRulesPrompt(school || ""),
        MEAL_PLAN_RULES_SYSTEM
      );
      const rules: MealPlanRules = {
        swipe_reset: ai.swipe_reset ?? DEFAULT_RULES.swipe_reset,
        swipes_roll_over: ai.swipes_roll_over ?? DEFAULT_RULES.swipes_roll_over,
        dining_dollars_rolls:
          ai.dining_dollars_rolls ?? DEFAULT_RULES.dining_dollars_rolls,
        swipe_value_estimate:
          Number(ai.swipe_value_estimate) || DEFAULT_RULES.swipe_value_estimate,
        forfeiture_summary:
          ai.forfeiture_summary || DEFAULT_RULES.forfeiture_summary,
        curated: false,
      };
      return NextResponse.json({ rules });
    } catch (aiErr) {
      console.error("Meal plan rules AI fallback failed:", aiErr);
      return NextResponse.json({ rules: DEFAULT_RULES });
    }
  } catch (err) {
    console.error("Meal plan rules error:", err);
    return NextResponse.json({ rules: DEFAULT_RULES }, { status: 200 });
  }
}
