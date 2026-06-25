import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import {
  matchRefundTemplate,
  DEFAULT_TEMPLATE,
  type RefundLadderTemplate,
} from "@/lib/refund-ladders";
import { buildRefundRadarPrompt, REFUND_RADAR_SYSTEM } from "@/lib/prompts/refund-radar";

interface AiLadder {
  relative_tiers?: { pct: number; week: number }[];
  add_drop_week?: number;
  source_note?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { school } = await req.json();

    const curated = matchRefundTemplate(school);
    if (curated) return NextResponse.json({ template: curated });

    try {
      const ai = await claudeJSON<AiLadder>(
        buildRefundRadarPrompt(school || ""),
        REFUND_RADAR_SYSTEM
      );
      const tiers =
        Array.isArray(ai.relative_tiers) && ai.relative_tiers.length > 0
          ? ai.relative_tiers
              .filter((t) => typeof t.pct === "number" && typeof t.week === "number")
              .sort((a, b) => a.week - b.week)
          : DEFAULT_TEMPLATE.relative_tiers;

      const template: RefundLadderTemplate = {
        relative_tiers: tiers,
        add_drop_week: ai.add_drop_week ?? DEFAULT_TEMPLATE.add_drop_week,
        curated: false,
      };
      return NextResponse.json({ template });
    } catch (aiErr) {
      console.error("Refund ladder AI fallback failed:", aiErr);
      return NextResponse.json({ template: DEFAULT_TEMPLATE });
    }
  } catch (err) {
    console.error("Refund ladder error:", err);
    return NextResponse.json({ template: DEFAULT_TEMPLATE }, { status: 200 });
  }
}
