import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { buildExpensePrompt, EXPENSE_PARSER_SYSTEM } from "@/lib/prompts/expense-parser";
import type { ParsedExpense } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { transcript, categories } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    const defaultCategories = [
      "Eating Out", "Groceries", "Transportation", "Entertainment",
      "School Supplies", "Subscriptions", "Miscellaneous",
    ];

    const parsed = await claudeJSON<ParsedExpense>(
      buildExpensePrompt(transcript, categories || defaultCategories),
      EXPENSE_PARSER_SYSTEM
    );

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Parse expense error:", err);
    return NextResponse.json({ error: "Failed to parse expense" }, { status: 500 });
  }
}
