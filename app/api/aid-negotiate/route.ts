import { NextRequest, NextResponse } from "next/server";
import { claudeText } from "@/lib/claude";
import { researchFinancialAid, isBrowserbaseConfigured } from "@/lib/browserbase";
import type { CollegeOffer } from "@/lib/types";

const SYSTEM = `You are a financial aid negotiation coach who helps college students maximize their aid packages.
You write professional, factual, and respectful negotiation scripts that are effective without being aggressive.
Focus on specific, concrete arguments based on competing offers and family circumstances.`;

function formatOfferLine(o: CollegeOffer): string {
  const parts: string[] = [];
  if (o.estimated_cost !== undefined) parts.push(`$${o.estimated_cost.toLocaleString()}/yr total cost`);
  if (o.aid_amount !== undefined) parts.push(`$${o.aid_amount.toLocaleString()}/yr in aid`);
  if (o.letter_text) parts.push(`Award letter notes: ${o.letter_text.slice(0, 600)}`);
  if (parts.length === 0) return " (offer received, details not entered)";
  return `: ${parts.join("; ")}`;
}

function buildPrompt(
  primarySchool: string,
  offers: CollegeOffer[],
  medium: "email" | "phone",
  webResearch?: string
): string {
  const offerSummary = offers
    .filter((o) => o.school !== primarySchool)
    .map((o) => `- ${o.school}${formatOfferLine(o)}`)
    .join("\n");

  const primaryOffer = offers.find((o) => o.school === primarySchool);
  const primaryLine = primaryOffer ? formatOfferLine(primaryOffer).replace(/^: /, "") : null;

  return `A student has been accepted to multiple colleges and wants to negotiate more financial aid from their top choice.

Primary school (the one they want to attend): ${primarySchool}
${primaryLine ? `Current offer from ${primarySchool}: ${primaryLine}` : `Offer details from ${primarySchool} not provided yet.`}

Competing offers:
${offerSummary || "No competing offers entered yet."}
${webResearch ? `\nWeb research (aid policies, appeal tips, contact info):\n${webResearch}\n` : ""}

Write a ${medium === "email" ? "professional email" : "phone call script"} that:
${medium === "email" ? `
- Has a clear subject line
- Opens with genuine interest in attending ${primarySchool}
- References the specific competing offers by name and amount
- Politely asks the financial aid office to review and improve the offer
- Is 3-4 short paragraphs, under 250 words
- Ends with a professional sign-off
` : `
- Starts with an intro for when the financial aid office picks up
- References specific competing offers by name and amount
- Asks a direct but polite question about improving the offer
- Includes suggested responses to common pushback
- Is formatted as a script with [brackets] for student's own details to fill in
`}

Be specific, warm, and factual. Do not use templates that sound generic.`;
}

export async function POST(req: NextRequest) {
  try {
    const { primary_school, offers, medium = "email" } = await req.json() as {
      primary_school: string;
      offers: CollegeOffer[];
      medium?: "email" | "phone";
    };

    if (!primary_school || !offers?.length) {
      return NextResponse.json({ error: "primary_school and offers are required" }, { status: 400 });
    }

    let webResearch = "";
    if (isBrowserbaseConfigured()) {
      try {
        webResearch = await researchFinancialAid(primary_school, "appeal negotiation");
      } catch (err) {
        console.error("Browserbase aid research failed:", err);
      }
    }

    const script = await claudeText(
      buildPrompt(primary_school, offers, medium, webResearch || undefined),
      SYSTEM
    );

    return NextResponse.json({ script, medium, primary_school });
  } catch (err) {
    console.error("Aid negotiation error:", err);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
