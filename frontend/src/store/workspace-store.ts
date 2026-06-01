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

interface WorkspaceState {
  savedChats: SavedChat[];
  bookmarks: BookmarkedLaw[];
  addChat: (chat: SavedChat) => void;
  removeChat: (id: string) => void;
  addBookmark: (bookmark: BookmarkedLaw) => void;
  removeBookmark: (id: string) => void;
  clearAll: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      savedChats: [],
      bookmarks: [],
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
      clearAll: () => set({ savedChats: [], bookmarks: [] }),
    }),
    { name: "nyayagpt-workspace" }
  )
);
