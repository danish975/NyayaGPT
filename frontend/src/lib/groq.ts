/**
 * Minimal Groq chat-completions client shared by the API routes.
 * The model can be changed with GROQ_MODEL without touching code.
 */

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export class GroqError extends Error {
  constructor(public status: number, public body: string) {
    super(`Groq API error ${status}`);
  }
}

export async function groqChat(opts: {
  apiKey: string;
  system: string;
  user: string;
  temperature: number;
}): Promise<string> {
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  // gpt-oss models are reasoning models: keep reasoning short and leave
  // enough token budget for the visible answer.
  const isReasoningModel = model.startsWith("openai/gpt-oss");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      temperature: opts.temperature,
      max_tokens: isReasoningModel ? 2048 : 1024,
      ...(isReasoningModel ? { reasoning_effort: "low" } : {}),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new GroqError(res.status, await res.text());

  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}
