import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are NyayaGPT, a careful assistant for Indian law, public policy, welfare schemes, and constitutional provisions.

Rules:
- Answer ONLY using the SOURCES provided. If the sources do not contain the answer, say so plainly.
- Be concise, neutral and structured. Use short paragraphs or bullets.
- Cite inline using [1], [2] markers that map to the SOURCES list, in order.
- Detect the user's language (English, Hindi, Punjabi, etc.) and reply in the SAME language.
- Never invent section numbers, dates, or quotes.`;

export async function POST(request: NextRequest) {
  try {
    const { question, sources } = await request.json();

    if (!question || !sources) {
      return NextResponse.json(
        { error: "Question and sources are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback: generate a mock answer using the sources
      return NextResponse.json({
        answer: generateMockAnswer(question, sources),
        mock: true,
      });
    }

    const userPrompt = `QUESTION:\n${question}\n\nSOURCES:\n${sources}\n\nAnswer the question using only the sources above. Use [n] citations inline.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please try again in a moment." },
          { status: 429 }
        );
      }
      const text = await res.text();
      console.error("Groq API error:", res.status, text);
      return NextResponse.json(
        { error: "The AI service returned an error. Please try again." },
        { status: 500 }
      );
    }

    const json = await res.json();
    const answer = json?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ answer });
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
    return `Under PMAY-U (Pradhan Mantri Awas Yojana - Urban), eligibility is based on household income [1]:\n\n• **EWS**: Annual income up to ₹3 lakh — 6.5% interest subsidy on loan up to ₹6 lakh [1]\n• **LIG**: Annual income ₹3–6 lakh — 6.5% interest subsidy on loan up to ₹6 lakh [1]\n• **MIG-I**: Annual income ₹6–12 lakh — 4% interest subsidy on loan up to ₹9 lakh [1]\n• **MIG-II**: Annual income ₹12–18 lakh — 3% interest subsidy on loan up to ₹12 lakh [1]\n\nPreference is given to women ownership especially under EWS and LIG categories [1].`;
  }

  if (q.includes("mgnrega") || q.includes("nrega") || q.includes("100 days")) {
    return `MGNREGA guarantees **100 days of unskilled manual work** per financial year to every rural household whose adult members volunteer [1].\n\nKey provisions:\n• If employment is not provided within **15 days**, the applicant is entitled to an unemployment allowance [1]\n• **Wages must be paid within 15 days** of the date work was done [1]\n• Permissible works include water conservation, drought proofing, irrigation, rural connectivity, and land development [2]`;
  }

  if (q.includes("dpdp") || q.includes("data protection") || q.includes("consent")) {
    return `The Digital Personal Data Protection Act, 2023 establishes that consent must be **free, specific, informed, unconditional and unambiguous** with a clear affirmative action [1]. Key provisions:\n\n• Consent can be **withdrawn at any point** [1]\n• Data Fiduciaries must provide a **notice before obtaining consent** describing the personal data to be collected and purpose of processing [1]\n• Data Principals have the right to obtain a **summary of their personal data** being processed [2]\n• Special protections exist for **children's data** — verifiable parental consent is required [3]`;
  }

  if (q.includes("nep") || q.includes("education policy") || q.includes("शिक्षा")) {
    return `NEP 2020 introduces a new **5+3+3+4 curricular structure** [1]:\n\n• **Foundational Stage** (age 3–8): 3 years pre-primary + Grades 1–2\n• **Preparatory Stage** (age 8–11): Grades 3–5\n• **Middle Stage** (age 11–14): Grades 6–8\n• **Secondary Stage** (age 14–18): Grades 9–12\n\nMother tongue or local language shall be the medium of instruction until at least Grade 5 [1]. Higher education will feature **multiple exit points**: Certificate (1 yr), Diploma (2 yrs), Bachelor's (3 yrs), Bachelor's with Research (4 yrs) [2].`;
  }

  // Generic fallback
  const numSources = sourceLabels.length;
  return `Based on the retrieved sources, here is what I found regarding your question:\n\n${
    numSources > 0
      ? `The indexed documents contain relevant information across ${numSources} source(s) [1]. Please review the cited sections below for the specific legal text and provisions that apply to your query.`
      : `I found limited information in the current corpus for this specific query. Try asking about RTI, the Constitution (Articles 14/19/21), PMAY, NEP 2020, MGNREGA, or the DPDP Act.`
  }\n\n_Note: This is a demo response. Connect your Groq API key in \`.env.local\` for AI-generated answers._`;
}
