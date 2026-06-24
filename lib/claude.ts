import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function claudeJSON<T>(prompt: string, systemPrompt: string): Promise<T> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
    system: systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.",
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return parseJSONFromText<T>(text);
}

function parseJSONFromText<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("Model response did not contain valid JSON");
  }
}

export async function claudeText(prompt: string, systemPrompt: string): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    system: systemPrompt,
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}
