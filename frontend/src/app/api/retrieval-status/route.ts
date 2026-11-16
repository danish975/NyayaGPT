import { NextResponse } from "next/server";
import { embeddingStatus } from "@/lib/embeddings";
import { MIN_SIMILARITY } from "@/lib/hybrid";
import { CORPUS } from "@/data/corpus";

export const dynamic = "force-dynamic";

/** Non-sensitive retrieval health info, shown on the admin dashboard. */
export async function GET() {
  const { status, model } = embeddingStatus();
  const disabled = process.env.HYBRID_RETRIEVAL === "off";
  return NextResponse.json({
    mode: disabled ? "bm25" : status === "ready" ? "hybrid" : status === "failed" ? "bm25" : "warming",
    embeddings: disabled ? "disabled" : status,
    model,
    minSimilarity: MIN_SIMILARITY,
    sections: CORPUS.length,
  });
}
