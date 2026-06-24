import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { buildCheckPurchasePrompt, CHECK_PURCHASE_SYSTEM } from "@/lib/prompts/check-purchase";
import type { PurchaseCheck } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { item, amount, remainingBudget, activeGoals, school } = await req.json();

    if (!item || !amount) {
      return NextResponse.json({ error: "Item and amount required" }, { status: 400 });
    }

    const result = await claudeJSON<PurchaseCheck>(
      buildCheckPurchasePrompt(item, amount, remainingBudget || 300, activeGoals || [], school || "UC Berkeley"),
      CHECK_PURCHASE_SYSTEM
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Check purchase error:", err);
    return NextResponse.json({ error: "Failed to check purchase" }, { status: 500 });
  }
}
