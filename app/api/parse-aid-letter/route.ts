import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { extractSyllabusTextFromFile } from "@/lib/syllabus-text";
import {
  AID_LETTER_PARSER_SYSTEM,
  buildAidLetterParserPrompt,
} from "@/lib/prompts/aid-letter-parser";

export const runtime = "nodejs";

interface ParsedAidLetter {
  school: string;
  aid_amount: number | null;
  estimated_cost: number | null;
  letter_summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const letterText = await extractSyllabusTextFromFile(file);

    if (letterText.length < 20) {
      return NextResponse.json(
        { error: "Couldn't read enough text from that file. Try a PDF/DOCX export or paste the details manually." },
        { status: 400 }
      );
    }

    const parsed = await claudeJSON<ParsedAidLetter>(
      buildAidLetterParserPrompt(letterText),
      AID_LETTER_PARSER_SYSTEM
    );

    const letter_text = parsed.letter_summary || letterText.slice(0, 2000);

    return NextResponse.json({
      school: parsed.school || "",
      aid_amount: parsed.aid_amount ?? undefined,
      estimated_cost: parsed.estimated_cost ?? undefined,
      letter_text,
    });
  } catch (err) {
    console.error("Aid letter parse error:", err);
    const message = err instanceof Error ? err.message : "Failed to parse aid letter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
