import type { FeatureExtractionPipeline } from "@huggingface/transformers";
import { CORPUS } from "@/data/corpus";

/**
 * Local sentence embeddings for vector search (server-only).
 *
 * Uses a small multilingual model so Hindi/Punjabi questions can match the
 * English corpus. The model (~120 MB) is downloaded from Hugging Face on first
 * use and cached on disk. If it can't load, callers fall back to BM25.
 */

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "Xenova/multilingual-e5-small";
// Serverless platforms (Vercel, AWS Lambda) only allow writes under /tmp.
const SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const CACHE_DIR =
  process.env.EMBEDDING_CACHE_DIR ||
  (SERVERLESS ? "/tmp/nyayagpt-models" : `${process.cwd()}/.cache/models`);
const RETRY_AFTER_MS = 5 * 60_000;

export type EmbeddingStatus = "idle" | "loading" | "ready" | "failed";

type State = {
  extractor: Promise<FeatureExtractionPipeline> | null;
  corpus: Promise<Float32Array[]> | null;
  status: EmbeddingStatus;
  failedAt: number;
  error: string | null;
};

/**
 * Next.js bundles instrumentation and each route separately, so module-level
 * variables would be duplicated. Keep one shared state on globalThis so the
 * model loads once per process and the warm-up benefits every route.
 */
const g = globalThis as typeof globalThis & { __nyayaEmbeddings?: State };
const state: State = (g.__nyayaEmbeddings ??= {
  extractor: null,
  corpus: null,
  status: "idle",
  failedAt: 0,
  error: null,
});

export function embeddingStatus() {
  return { status: state.status, model: EMBEDDING_MODEL, error: state.error };
}

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!state.extractor) {
    state.status = "loading";
    state.extractor = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.cacheDir = CACHE_DIR;
      return pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" });
    })();
    state.extractor.catch((err) => {
      state.status = "failed";
      state.failedAt = Date.now();
      state.error = err instanceof Error ? err.message : String(err);
      console.error("[embeddings] model failed to load; using BM25 only:", state.error);
      state.extractor = null;
      state.corpus = null;
    });
  }
  return state.extractor;
}

/** e5 models expect "query: " / "passage: " prefixes. */
async function embed(texts: string[], kind: "query" | "passage"): Promise<Float32Array[]> {
  const extractor = await getExtractor();
  const output = await extractor(
    texts.map((t) => `${kind}: ${t}`),
    { pooling: "mean", normalize: true }
  );
  const dim = output.dims[1];
  const data = output.data as Float32Array;
  return texts.map((_, i) => data.slice(i * dim, (i + 1) * dim));
}

/** Embeddings for every corpus section, computed once per server process. */
function corpusVectors(): Promise<Float32Array[]> {
  if (!state.corpus) {
    const t0 = Date.now();
    state.corpus = embed(
      CORPUS.map((c) => `${c.act ?? c.doc} — ${c.section}. ${c.text}`),
      "passage"
    ).then((vecs) => {
      state.status = "ready";
      state.error = null;
      console.log(`[embeddings] ${EMBEDDING_MODEL} ready; indexed ${vecs.length} sections in ${Date.now() - t0} ms`);
      return vecs;
    });
    // Don't cache a failure: allow a later retry.
    state.corpus.catch(() => {
      state.corpus = null;
    });
  }
  return state.corpus;
}

/** Start loading the model and indexing the corpus in the background. */
export function warmUpEmbeddings(): void {
  if (!embeddingsAvailable()) return;
  corpusVectors().catch(() => {});
}

/** True when vector search can be attempted (enabled, and not in a recent failure window). */
export function embeddingsAvailable(): boolean {
  if (process.env.HYBRID_RETRIEVAL === "off") return false;
  return !(state.status === "failed" && Date.now() - state.failedAt < RETRY_AFTER_MS);
}

/**
 * Cosine similarity of the query against every corpus section, aligned with
 * CORPUS order. Vectors are normalised, so the dot product is the cosine.
 */
export async function similarities(query: string): Promise<number[]> {
  const [vectors, [q]] = await Promise.all([corpusVectors(), embed([query], "query")]);
  return vectors.map((v) => {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * q[i];
    return s;
  });
}
