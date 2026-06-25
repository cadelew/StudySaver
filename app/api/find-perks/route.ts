import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { matchSchoolPerks } from "@/lib/school-perks";
import { buildPerksFinderPrompt, PERKS_FINDER_SYSTEM } from "@/lib/prompts/perks-finder";

interface PerksResult {
  perks: Array<{
    name: string;
    category: string;
    description: string;
    estimated_savings: number;
    source_url?: string;
    relevance_tag?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { school, major } = await req.json();

    // Curated, verified perks take priority and are returned as-is.
    const curated = matchSchoolPerks(school);
    if (curated.length > 0) {
      return NextResponse.json({
        perks: curated.map((p) => ({
          name: p.name,
          category: p.category,
          description: p.description,
          estimated_savings: p.estimated_savings,
          source_url: p.source_url,
          relevance_tag: p.relevance_tag,
        })),
        curated: true,
      });
    }

    const result = await claudeJSON<PerksResult>(
      buildPerksFinderPrompt(school || "", major || ""),
      PERKS_FINDER_SYSTEM
    );
    return NextResponse.json({ ...result, curated: false });
  } catch (err) {
    console.error("Find perks error:", err);
    return NextResponse.json({ error: "Failed to find perks", perks: [] }, { status: 500 });
  }
}
