import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedChat = {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
};

export type BookmarkedLaw = {
  id: string;
  doc: string;
  section: string;
  act?: string;
  excerpt: string;
  savedAt: string;
};

export type HistoryEntry = {
  query: string;
  at: string;
};

const MAX_HISTORY = 25;

interface WorkspaceState {
  savedChats: SavedChat[];
  bookmarks: BookmarkedLaw[];
  history: HistoryEntry[];
  addChat: (chat: SavedChat) => void;
  removeChat: (id: string) => void;
  addBookmark: (bookmark: BookmarkedLaw) => void;
  removeBookmark: (id: string) => void;
  addHistory: (query: string) => void;
  clearHistory: () => void;
  clearAll: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      savedChats: [],
      bookmarks: [],
      history: [],
      addChat: (chat) =>
        set((state) => ({
          savedChats: [chat, ...state.savedChats.filter((c) => c.id !== chat.id)],
        })),
      removeChat: (id) =>
        set((state) => ({
          savedChats: state.savedChats.filter((c) => c.id !== id),
        })),
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [bookmark, ...state.bookmarks.filter((b) => b.id !== bookmark.id)],
        })),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),
      addHistory: (query) =>
        set((state) => ({
          history: [
            { query, at: new Date().toISOString() },
            ...state.history.filter((h) => h.query !== query),
          ].slice(0, MAX_HISTORY),
        })),
      clearHistory: () => set({ history: [] }),
      clearAll: () => set({ savedChats: [], bookmarks: [], history: [] }),
    }),
    { name: "nyayagpt-workspace" }
  )
);
