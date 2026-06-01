import { NextRequest, NextResponse } from "next/server";

const SIMPLIFY_PROMPT = `You are NyayaGPT in "Explain Simply" mode. Rewrite the following legal answer so a 15-year-old can understand it.

Rules:
- Use plain everyday language. Short sentences.
- Keep all [n] citation markers exactly where they appear.
- Do not add new facts that are not in the original answer.
- Reply in the same language as the original answer.`;

export async function POST(request: NextRequest) {
  try {
    const { answer } = await request.json();

    if (!answer) {
      return NextResponse.json(
        { error: "Answer text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback: basic simplification
      const simplified = answer
        .replace(/\b(notwithstanding|aforementioned|hereinafter|thereof|pursuant|inter alia)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      return NextResponse.json({
        simplified: `Here's the simple version:\n\n${simplified}\n\n_Note: Connect Groq API key for AI-powered simplification._`,
      });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SIMPLIFY_PROMPT },
          { role: "user", content: answer },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Groq simplify error:", res.status, text);
      return NextResponse.json(
        { error: "Could not simplify the answer." },
        { status: 500 }
      );
    }

    const json = await res.json();
    const simplified = json?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ simplified });
  } catch (error) {
    console.error("Simplify API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
