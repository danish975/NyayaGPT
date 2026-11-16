import type { Chunk } from "@/data/corpus";
import { hybridRetrieve, type HybridChunk } from "./hybrid";
import type { Citation, RetrievalStep, RetrievalTrace } from "@/store/chat-store";

export const NO_MATCH_ANSWER =
  "I couldn't find anything in the indexed corpus that matches your question. Try rephrasing, or ask about RTI, the Constitution (Articles 14/15/19/21), PMAY, NEP 2020, MGNREGA, or the DPDP Act.";

/**
 * Heuristic confidence from the strength of the best match.
 * BM25 ~6+ or cosine ~0.875+ counts as a strong match (cosine is scaled
 * from the 0.775 vector threshold); agreement between both retrievers on the
 * top section adds a little.
 */
function computeConfidence(chunks: HybridChunk[]): number {
  if (chunks.length === 0) return 0;
  const top = chunks[0];
  const kw = Math.min(1, (top.bm25 ?? 0) / 6);
  const sem = top.vector !== undefined ? Math.min(1, Math.max(0, (top.vector - 0.775) / 0.1)) : 0;
  const agree = top.bm25 !== undefined && top.vector !== undefined ? 0.05 : 0;
  const breadth = Math.min(1, chunks.length / 3) * 0.15;
  return Math.round(Math.min(0.99, 0.5 + Math.max(kw, sem) * 0.35 + agree + breadth) * 100) / 100;
}

const round = (n: number, d = 3) => +n.toFixed(d);
const label = (c: Chunk) => `${c.doc} · ${c.section}`;

/**
 * Retrieves context for a question on the server. The resulting `sources`
 * block is the only material sent to the LLM; clients cannot supply it.
 */
export async function buildContext(question: string) {
  const result = await hybridRetrieve(question, 12);
  const retrieved = result.chunks;
  const topRanked = retrieved.slice(0, 5);
  const chunks = topRanked.slice(0, 3);

  const step = (c: HybridChunk): RetrievalStep => ({
    id: c.id,
    label: label(c),
    score: round(c.score, result.mode === "hybrid" ? 4 : 3),
  });

  const trace: RetrievalTrace = {
    query: question,
    mode: result.mode,
    bm25: result.bm25.slice(0, 8).map(({ chunk, score }) => ({ id: chunk.id, label: label(chunk), score: round(score) })),
    vector: result.vector.slice(0, 8).map(({ chunk, score }) => ({ id: chunk.id, label: label(chunk), score: round(score) })),
    retrieved: retrieved.map(step),
    topRanked: topRanked.map(step),
    contextUsed: chunks.map((c) => c.id),
  };

  const citations: Citation[] = chunks.map((c) => ({
    id: c.id,
    doc: c.doc,
    act: c.act,
    section: c.section,
    year: c.year,
    excerpt: c.text,
    url: c.url,
    score: round(c.score, 4),
    bm25: c.bm25 !== undefined ? round(c.bm25) : undefined,
    vector: c.vector !== undefined ? round(c.vector) : undefined,
  }));

  const sources = chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.doc} — ${c.section}${c.year ? ` (${c.year})` : ""}\n"""${c.text}"""`
    )
    .join("\n\n");

  return { chunks, trace, citations, sources, confidence: computeConfidence(chunks) };
}
