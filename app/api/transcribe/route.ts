import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/deepgram";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const mimeType = (audioFile.type || "audio/webm").split(";")[0];

    const transcript = await transcribeAudio(buffer, mimeType);
    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("Transcription error:", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
