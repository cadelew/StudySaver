import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { researchStudentDeals, isBrowserbaseConfigured } from "@/lib/browserbase";
import { buildSavingsFinderPrompt, SAVINGS_FINDER_SYSTEM } from "@/lib/prompts/savings-finder";

interface SavingsFinderResult {
  opportunities: Array<{
    name: string;
    category: string;
    description: string;
    estimated_savings: number;
    source_url: string;
    relevance_tag: string;
    scope?: "campus" | "general";
    action: string;
  }>;
  total_estimated_savings: number;
}

export async function POST(req: NextRequest) {
  try {
    const { school, major, subscriptions } = await req.json();
    const schoolName = school || "UC Berkeley";
    const majorName = major || "undeclared";
    const subs: string[] = subscriptions || [];

    let webResearch = "";
    if (isBrowserbaseConfigured()) {
      try {
        webResearch = await researchStudentDeals(schoolName, majorName, subs);
      } catch (err) {
        console.error("Browserbase savings research failed:", err);
      }
    }

    const result = await claudeJSON<SavingsFinderResult>(
      buildSavingsFinderPrompt(schoolName, majorName, subs, webResearch),
      SAVINGS_FINDER_SYSTEM
    );

    return NextResponse.json({
      ...result,
      research_used: Boolean(webResearch),
    });
  } catch (err) {
    console.error("Find savings error:", err);
    return NextResponse.json({ error: "Failed to find savings" }, { status: 500 });
  }
}
