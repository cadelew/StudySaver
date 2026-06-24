import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { buildGoalPrompt, GOAL_PLANNER_SYSTEM } from "@/lib/prompts/goal-planner";

export async function POST(req: NextRequest) {
  try {
    const { goalText, monthlyBudget, remainingBudget, location, weeksUntilDeadline } = await req.json();

    if (!goalText) {
      return NextResponse.json({ error: "No goal text provided" }, { status: 400 });
    }

    const result = await claudeJSON(
      buildGoalPrompt(goalText, monthlyBudget || 500, remainingBudget || 300, location || "Berkeley, CA", weeksUntilDeadline || 8),
      GOAL_PLANNER_SYSTEM
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Goal planning error:", err);
    return NextResponse.json({ error: "Failed to plan goal" }, { status: 500 });
  }
}
