export const REFUND_RADAR_SYSTEM = `You encode US university tuition refund / withdrawal schedules.
Return the typical refund ladder for the named school as percentages tied to weeks after the term start.
If unsure of exact specifics, return the most common arrangement for that type of institution and keep it conservative.
This is a fallback for a school we have not hand-verified; the student will be told to confirm with their bursar.`;

export function buildRefundRadarPrompt(school: string): string {
  return `Describe the standard tuition refund schedule for dropping/withdrawing from a course at: ${school || "an unnamed US university"}

Return JSON (weeks are whole numbers counted from the first day of the term):
{
  "relative_tiers": [ { "pct": number, "week": number } ],  // e.g. 100% before week 1, 50% before week 3, 0% after
  "add_drop_week": number,
  "source_note": string
}`;
}
