import { CORPUS, type Chunk } from "@/data/corpus";
import { retrieve } from "./retrieval";
import { embeddingsAvailable, similarities } from "./embeddings";

/**
 * Hybrid retrieval: BM25 keyword search + dense vector search, merged with
 * Reciprocal Rank Fusion (RRF). Falls back to BM25 alone if the embedding
 * model is unavailable or slow.
 */

/**
 * Minimum cosine similarity for a vector hit to count. Calibrated on this
 * corpus with multilingual-e5-small: relevant questions (English paraphrases,
 * Hindi, Punjabi) scored a best match of 0.779–0.876, off-topic questions
 * 0.734–0.769. e5 scores cluster high, so re-calibrate if the model changes.
 */
export const MIN_SIMILARITY = Number(process.env.HYBRID_MIN_SIMILARITY ?? 0.775);
/**
 * Fuse only the top hits from each retriever. Including the long tail of weak
 * BM25 matches lets sections that appear faintly in both lists outrank the
 * best semantic match.
 */
const MAX_VECTOR_HITS = 5;
const MAX_BM25_HITS = 5;
/** Standard RRF constant. */
const RRF_K = 60;
/** How long a request waits for vector search before using BM25 only. */
const VECTOR_TIMEOUT_MS = Number(process.env.HYBRID_VECTOR_TIMEOUT_MS ?? 4000);

export type HybridChunk = Chunk & {
  /** Fused RRF score (or BM25 score in BM25-only mode). */
  score: number;
  bm25?: number;
  vector?: number;
};

export type HybridResult = {
  mode: "hybrid" | "bm25";
  /** Fused ranking, best first. */
  chunks: HybridChunk[];
  bm25: { chunk: Chunk; score: number }[];
  vector: { chunk: Chunk; score: number }[];
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("vector search timed out")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function vectorSearch(query: string): Promise<{ chunk: Chunk; score: number }[] | null> {
  if (!embeddingsAvailable()) return null;
  try {
    const sims = await withTimeout(similarities(query), VECTOR_TIMEOUT_MS);
    return CORPUS.map((chunk, i) => ({ chunk, score: sims[i] }))
      .filter((h) => h.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_VECTOR_HITS);
  } catch (err) {
    console.warn("[hybrid] vector search unavailable for this request:", (err as Error).message);
    return null;
  }
}

export async function hybridRetrieve(query: string, k = 12): Promise<HybridResult> {
  const bm25Hits = retrieve(query, CORPUS.length).map((c) => ({ chunk: c as Chunk, score: c.score }));
  const vectorHits = await vectorSearch(query);

  if (!vectorHits) {
    return {
      mode: "bm25",
      chunks: bm25Hits.slice(0, k).map(({ chunk, score }) => ({ ...chunk, score, bm25: score })),
      bm25: bm25Hits,
      vector: [],
    };
  }

  const bm25Top = bm25Hits.slice(0, MAX_BM25_HITS);
  const fused = new Map<string, HybridChunk>();
  const add = (list: { chunk: Chunk; score: number }[], key: "bm25" | "vector") => {
    list.forEach(({ chunk, score }, rank) => {
      const entry = fused.get(chunk.id) ?? { ...chunk, score: 0 };
      entry.score += 1 / (RRF_K + rank + 1);
      entry[key] = score;
      fused.set(chunk.id, entry);
    });
  };
  add(bm25Top, "bm25");
  add(vectorHits, "vector");

  // Equal RRF scores are common (e.g. keyword rank 1 vs semantic rank 1).
  // Break ties toward semantic support: vector hits passed a calibrated
  // threshold, whereas any single shared word produces a BM25 match.
  const chunks = [...fused.values()]
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.vector ?? 0) - (a.vector ?? 0) ||
        (b.bm25 ?? 0) - (a.bm25 ?? 0)
    )
    .slice(0, k);

  return { mode: "hybrid", chunks, bm25: bm25Hits, vector: vectorHits };
}
