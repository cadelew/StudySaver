import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { buildCourseExtractorPrompt, COURSE_EXTRACTOR_SYSTEM } from "@/lib/prompts/course-extractor";
import { extractSyllabusTextFromFile } from "@/lib/syllabus-text";
import type { CourseMaterial } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    let syllabusText = text?.trim() || "";

    if (file && file.size > 0) {
      syllabusText = await extractSyllabusTextFromFile(file);
    }

    if (!syllabusText) {
      return NextResponse.json({ error: "No syllabus text provided" }, { status: 400 });
    }

    if (syllabusText.length < 40) {
      return NextResponse.json(
        { error: "Couldn't read enough text from that file. Try a PDF/DOCX export or paste the syllabus." },
        { status: 400 }
      );
    }

    const result = await claudeJSON<{ course_name: string; materials: CourseMaterial[] }>(
      buildCourseExtractorPrompt(syllabusText),
      COURSE_EXTRACTOR_SYSTEM
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Course extract error:", err);
    const message = err instanceof Error ? err.message : "Failed to extract materials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
