import { CORPUS, type Chunk } from "@/data/corpus";

export type Category = "Constitution" | "Act" | "Policy" | "Scheme";

export const CATEGORIES: ("All" | Category)[] = ["All", "Constitution", "Act", "Policy", "Scheme"];

/**
 * Library filter rules, unchanged from the original page. A document can
 * match more than one category (e.g. "PMAY-U Guidelines" is Policy and Scheme).
 */
export function matchesCategory(c: Chunk, category: "All" | Category): boolean {
  const doc = c.doc.toLowerCase();
  switch (category) {
    case "Constitution":
      return doc.includes("constitution");
    case "Act":
      return doc.includes("act") || doc.includes("dpdp");
    case "Policy":
      return doc.includes("nep") || doc.includes("guidelines");
    case "Scheme":
      return doc.includes("pmay") || doc.includes("mgnrega") || doc.includes("ayushman");
    default:
      return true;
  }
}

/** Single primary category, used for display labels. */
export function categoryOf(c: Chunk): Category {
  const doc = c.doc.toLowerCase();
  if (doc.includes("constitution")) return "Constitution";
  if (doc.includes("pmay") || doc.includes("mgnrega") || doc.includes("ayushman")) return "Scheme";
  if (doc.includes("nep") || doc.includes("guidelines")) return "Policy";
  return "Act";
}

export type DocumentGroup = {
  doc: string;
  act?: string;
  year?: number;
  url?: string;
  category: Category;
  chunks: Chunk[];
};

export function groupByDocument(chunks: Chunk[] = CORPUS): DocumentGroup[] {
  const map = new Map<string, DocumentGroup>();
  for (const c of chunks) {
    let g = map.get(c.doc);
    if (!g) {
      g = { doc: c.doc, act: c.act, year: c.year, url: c.url, category: categoryOf(c), chunks: [] };
      map.set(c.doc, g);
    }
    g.chunks.push(c);
  }
  return [...map.values()];
}
