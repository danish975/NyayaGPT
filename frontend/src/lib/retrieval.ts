import { CORPUS, type Chunk } from "@/data/corpus";

const STOP = new Set([
  "the","a","an","is","are","was","were","of","in","on","to","for","and","or",
  "what","who","how","why","when","where","i","me","my","you","your","it",
  "be","do","does","this","that","with","by","at","as","from","can","am",
  "explain","tell","under","please","about","compare","vs","versus",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

export type ScoredChunk = Chunk & { score: number };

/**
 * BM25 retrieval over the in-memory corpus.
 * Returns the top-k chunks scored against the query.
 */
export function retrieve(query: string, k = 4): ScoredChunk[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const N = CORPUS.length;
  const df = new Map<string, number>();
  const docTokens = CORPUS.map((c) => {
    const toks = tokenize(`${c.doc} ${c.section} ${c.act ?? ""} ${c.text}`);
    const uniq = new Set(toks);
    uniq.forEach((t) => df.set(t, (df.get(t) ?? 0) + 1));
    return toks;
  });
  const avgLen = docTokens.reduce((a, d) => a + d.length, 0) / N;

  const scored: ScoredChunk[] = CORPUS.map((c, i) => {
    const toks = docTokens[i];
    const tf = new Map<string, number>();
    toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    let score = 0;
    for (const q of qTokens) {
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      const idf = Math.log(1 + (N - (df.get(q) ?? 0) + 0.5) / ((df.get(q) ?? 0) + 0.5));
      const k1 = 1.5, b = 0.75;
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * toks.length) / avgLen)));
    }
    return { ...c, score };
  })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored;
}
