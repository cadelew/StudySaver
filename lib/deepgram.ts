import { createClient } from "@deepgram/sdk";

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("Deepgram API key is not configured");

  const deepgram = createClient(apiKey);
  const normalizedMime = mimeType.split(";")[0] || "audio/webm";

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
    mimetype: normalizedMime,
    model: "nova-2",
    smart_format: true,
    punctuate: true,
    utterances: false,
  });

  if (error) throw new Error(`Deepgram error: ${error.message}`);

  const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim();
  if (!transcript) throw new Error("No speech detected. Try speaking a little longer.");

  return transcript;
}
