import { NextRequest, NextResponse } from "next/server";
import { claudeJSON } from "@/lib/claude";
import { researchCourseMaterials, isBrowserbaseConfigured } from "@/lib/browserbase";
import { buildCourseOptimizerPrompt, COURSE_OPTIMIZER_SYSTEM } from "@/lib/prompts/course-extractor";
import type { CourseMaterial } from "@/lib/types";

interface CourseOptimizerResult {
  materials: CourseMaterial[];
  total_bookstore_price: number;
  total_recommended_price: number;
  total_savings: number;
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const { materials, school } = await req.json();

    if (!materials || !Array.isArray(materials)) {
      return NextResponse.json({ error: "Materials array required" }, { status: 400 });
    }

    const schoolName = school || "UC Berkeley";
    let webResearch = "";

    if (isBrowserbaseConfigured()) {
      try {
        webResearch = await researchCourseMaterials(materials, schoolName);
      } catch (err) {
        console.error("Browserbase course research failed:", err);
      }
    }

    const result = await claudeJSON<CourseOptimizerResult>(
      buildCourseOptimizerPrompt(materials, schoolName, webResearch),
      COURSE_OPTIMIZER_SYSTEM
    );

    return NextResponse.json({
      ...result,
      research_used: Boolean(webResearch),
    });
  } catch (err) {
    console.error("Course research error:", err);
    return NextResponse.json({ error: "Failed to research materials" }, { status: 500 });
  }
}
