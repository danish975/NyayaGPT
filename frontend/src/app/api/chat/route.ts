import { NextRequest, NextResponse } from "next/server";
import { buildContext, NO_MATCH_ANSWER } from "@/lib/rag";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSecret, hmacSign } from "@/lib/crypto";
import { groqChat, GroqError } from "@/lib/groq";

const SYSTEM_PROMPT = `You are NyayaGPT, a careful assistant for Indian law, public policy, welfare schemes, and constitutional provisions.

Rules:
- Answer ONLY using the SOURCES provided. If the sources do not contain the answer, say so plainly.
- Be concise, neutral and structured. Use short paragraphs or bullets.
- Cite inline using [1], [2] markers that map to the SOURCES list, in order.
- Detect the user's language (English, Hindi, Punjabi, etc.) and reply in the SAME language.
- Never invent section numbers, dates, or quotes.`;

const MAX_QUESTION_CHARS = 1000;

/** Signs an answer so /api/simplify only accepts text this server produced. */
async function signAnswer(answer: string): Promise<string | undefined> {
  const secret = getSecret();
  return secret ? hmacSign(`answer:${answer}`, secret) : undefined;
}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    name: "chat",
    perIp: 20,
    global: 300,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    const question = typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_CHARS) {
      return NextResponse.json(
        { error: `Question is too long (max ${MAX_QUESTION_CHARS} characters).` },
        { status: 400 }
      );
    }

    // Retrieval happens here on the server: the client cannot choose the sources.
    const { chunks, trace, citations, sources, confidence } = await buildContext(question);

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: NO_MATCH_ANSWER,
        answerToken: await signAnswer(NO_MATCH_ANSWER),
        citations: [],
        confidence: 0,
        trace,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback: generate a mock answer using the sources
      const answer = generateMockAnswer(question, sources);
      return NextResponse.json({
        answer,
        answerToken: await signAnswer(answer),
        citations,
        confidence,
        trace,
        mock: true,
      });
    }

    const userPrompt = `QUESTION:\n${question}\n\nSOURCES:\n${sources}\n\nAnswer the question using only the sources above. Use [n] citations inline.`;

    let answer: string;
    try {
      answer = await groqChat({ apiKey, system: SYSTEM_PROMPT, user: userPrompt, temperature: 0.3 });
    } catch (err) {
      if (err instanceof GroqError) {
        if (err.status === 429) {
          return NextResponse.json(
            { error: "Rate limit reached. Please try again in a moment." },
            { status: 429 }
          );
        }
        console.error("Groq API error:", err.status, err.body);
        return NextResponse.json(
          { error: "The AI service returned an error. Please try again." },
          { status: 502 }
        );
      }
      throw err;
    }

    return NextResponse.json({
      answer,
      answerToken: await signAnswer(answer),
      citations,
      confidence,
      trace,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

function generateMockAnswer(question: string, sources: string): string {
  // Extract source labels for citation
  const sourceLabels = sources.match(/\[\d+\][^\n]*/g) || [];
  const q = question.toLowerCase();

  if (q.includes("article 21") || q.includes("life") || q.includes("liberty")) {
    return `Article 21 of the Constitution of India provides that "No person shall be deprived of his life or personal liberty except according to procedure established by law" [1]. The Supreme Court has significantly expanded the scope of Article 21 over the years to include the right to live with dignity, right to livelihood, right to health, right to pollution-free environment, right to shelter, right to privacy, and right to education [1].\n\nThis article is considered one of the most important fundamental rights and has been the basis for numerous landmark judgments.`;
  }

  if (q.includes("rti") || q.includes("right to information")) {
    return `Under the Right to Information Act, 2005, any citizen can request information from a public authority [1]. The process is straightforward:\n\n1. **Submit a written request** in English, Hindi, or the official language of the area to the Central/State Public Information Officer [1]\n2. **Pay the application fee** of ₹10 (BPL applicants are exempt) [1]\n3. **Receive response within 30 days** of receipt of request [2]\n4. **Urgent cases**: If the information concerns life or liberty, it must be provided within 48 hours [2]\n\nYou are not required to give any reason for requesting information [1].`;
  }

  if (q.includes("pmay") || q.includes("housing") || q.includes("awas")) {
    return `Under PMAY-U 2.0 (approved in 2024), eligibility is based on annual household income [1]:\n\n• **EWS**: up to ₹3 lakh\n• **LIG**: ₹3–6 lakh\n• **MIG**: ₹6–9 lakh [1]\n\nThe family must not own a pucca house anywhere in India [1]. Under the Interest Subsidy Scheme, eligible EWS/LIG/MIG families get a 4% interest subsidy on the first ₹8 lakh of a home loan up to ₹25 lakh (house value up to ₹35 lakh), up to ₹1.8 lakh in total [1].\n\nThe earlier Credit Linked Subsidy Scheme (CLSS) under PMAY-U (2015) is closed to new applicants [2].`;
  }

  if (q.includes("mgnrega") || q.includes("nrega") || q.includes("100 days")) {
    return `MGNREGA guarantees **at least 100 days of unskilled manual work** per financial year to every rural household whose adult members volunteer [1].\n\nKey provisions:\n• If employment is not provided within **15 days** of the application, the applicant is entitled to a daily unemployment allowance [1]\n• Wages must be paid weekly, and **in any case within 15 days** of the date work was done [1]\n• Permissible works include water conservation, drought proofing, irrigation, rural connectivity, and land development [2]`;
  }

  if (q.includes("dpdp") || q.includes("data protection") || q.includes("consent")) {
    return `The Digital Personal Data Protection Act, 2023 establishes that consent must be **free, specific, informed, unconditional and unambiguous** with a clear affirmative action [1]. Key provisions:\n\n• Consent can be **withdrawn at any time** [1]\n• Data Fiduciaries must give a **notice before or when asking for consent**, describing the personal data and the purpose of processing [1]\n• Data Principals have the right to obtain a **summary of their personal data** being processed [2]\n• Special protections exist for **children's data** — verifiable parental consent is required [3]`;
  }

  if (q.includes("nep") || q.includes("education policy") || q.includes("शिक्षा")) {
    return `NEP 2020 introduces a new **5+3+3+4 curricular structure** [1]:\n\n• **Foundational Stage** (age 3–8): 3 years pre-primary + Grades 1–2\n• **Preparatory Stage** (age 8–11): Grades 3–5\n• **Middle Stage** (age 11–14): Grades 6–8\n• **Secondary Stage** (age 14–18): Grades 9–12\n\nWherever possible, the mother tongue or local language should be the medium of instruction until at least Grade 5 [1]. Higher education will feature **multiple exit points**: Certificate (1 yr), Diploma (2 yrs), Bachelor's (3 yrs), Bachelor's with Research (4 yrs) [2].`;
  }

  // Generic fallback
  const numSources = sourceLabels.length;
  return `Based on the retrieved sources, here is what I found regarding your question:\n\n${
    numSources > 0
      ? `The indexed documents contain relevant information across ${numSources} source(s) [1]. Please review the cited sections below for the specific legal text and provisions that apply to your query.`
      : `I found limited information in the current corpus for this specific query. Try asking about RTI, the Constitution (Articles 14/19/21), PMAY, NEP 2020, MGNREGA, or the DPDP Act.`
  }\n\n_Note: This is a demo response. Connect your Groq API key in \`.env.local\` for AI-generated answers._`;
}
