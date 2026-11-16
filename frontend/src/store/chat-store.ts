import { create } from "zustand";

export type Citation = {
  id: string;
  doc: string;
  act?: string;
  section: string;
  year?: number;
  excerpt: string;
  url?: string;
  /** Fused hybrid score (Reciprocal Rank Fusion), or the BM25 score in BM25-only mode. */
  score: number;
  /** BM25 keyword score, if the section matched any query terms. */
  bm25?: number;
  /** Cosine similarity from vector search, if it passed the similarity threshold. */
  vector?: number;
};

export type RetrievalStep = {
  id: string;
  label: string;
  score: number;
};

export type RetrievalTrace = {
  query: string;
  /** "hybrid" when vector search ran; "bm25" when it was unavailable. */
  mode: "hybrid" | "bm25";
  /** BM25 keyword matches, best first. */
  bm25: RetrievalStep[];
  /** Vector (semantic) matches above the threshold, best first. */
  vector: RetrievalStep[];
  /** Fused ranking of both lists. */
  retrieved: RetrievalStep[];
  topRanked: RetrievalStep[];
  contextUsed: string[];
};

export type Turn = {
  role: "user" | "assistant";
  content: string;
  simplified?: string;
  showSimplified?: boolean;
  citations?: Citation[];
  confidence?: number;
  trace?: RetrievalTrace;
  feedback?: "up" | "down" | "halluc";
  error?: string;
  simplifying?: boolean;
};

interface ChatState {
  turns: Turn[];
  input: string;
  loading: boolean;
  setInput: (input: string) => void;
  addTurn: (turn: Turn) => void;
  updateTurn: (index: number, update: Partial<Turn>) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  turns: [],
  input: "",
  loading: false,
  setInput: (input) => set({ input }),
  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  updateTurn: (index, update) =>
    set((state) => ({
      turns: state.turns.map((t, i) => (i === index ? { ...t, ...update } : t)),
    })),
  setLoading: (loading) => set({ loading }),
  clearChat: () => set({ turns: [], input: "" }),
}));
