/**
 * Runs once when the Next.js server starts. Loads the embedding model and
 * indexes the corpus in the background so the first question doesn't wait.
 */
export async function register() {
  // The NEXT_RUNTIME check must wrap the import so it's stripped from the edge build.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.HYBRID_RETRIEVAL !== "off") {
    const { warmUpEmbeddings } = await import("./lib/embeddings");
    warmUpEmbeddings();
  }
}
