import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import {
  buildMealPlanAdvicePrompt,
  MEAL_PLAN_ADVISOR_SYSTEM,
} from "@/lib/prompts/meal-plan-advisor";

interface AdviceResult {
  strategies: Array<{ title: string; detail: string; estimated_value?: number }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await claudeJSON<AdviceResult>(
      buildMealPlanAdvicePrompt({
        school: body.school || "",
        swipes_remaining: Number(body.swipes_remaining) || 0,
        dining_dollars_remaining: Number(body.dining_dollars_remaining) || 0,
        days_left: Number(body.days_left) || 0,
        forfeited_value: Number(body.forfeited_value) || 0,
        required_weekly_pace: Number(body.required_weekly_pace) || 0,
        forfeiture_summary: body.forfeiture_summary || "",
      }),
      MEAL_PLAN_ADVISOR_SYSTEM
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error("Meal plan advice error:", err);
    return NextResponse.json({ error: "Failed to build advice" }, { status: 500 });
  }
}
