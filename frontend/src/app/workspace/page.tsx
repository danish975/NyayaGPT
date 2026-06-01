"use client";

import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  MessageSquare,
  Bookmark,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useWorkspaceStore } from "@/store/workspace-store";

export default function WorkspacePage() {
  const { savedChats, bookmarks, removeChat, removeBookmark } =
    useWorkspaceStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emblem text-accent">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-foreground">
              Nyaya<span className="text-gradient-gold">GPT</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              New Chat
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-4xl text-foreground">
          Your <span className="text-gradient-gold">Workspace</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Saved chats, bookmarked laws, and research — stored locally in your
          browser.
        </p>

        {/* Saved Chats */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl text-foreground">
              Saved Chats
            </h2>
          </div>
          {savedChats.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No saved chats yet. Chat with NyayaGPT and your conversations
                will appear here.
              </p>
              <Link
                href="/chat"
                className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Start a chat
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {chat.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {chat.preview}
                    </p>
                    <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                      <span>{chat.messageCount} messages</span>
                      <span>{chat.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeChat(chat.id)}
                    className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookmarked Laws */}
        <section className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl text-foreground">
              Bookmarked Laws
            </h2>
          </div>
          {bookmarks.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No bookmarks yet. Browse the library and bookmark sections for
                quick reference.
              </p>
              <Link
                href="/library"
                className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Browse Library
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase tracking-wider text-accent">
                      {bm.doc}
                      {bm.act && ` · ${bm.act}`}
                    </div>
                    <h3 className="mt-1 font-semibold text-foreground">
                      {bm.section}
                    </h3>
                    <p className="mt-1 border-l-2 border-gold pl-2 text-xs text-muted-foreground line-clamp-2">
                      {bm.excerpt}
                    </p>
                    <span className="mt-2 block text-[10px] text-muted-foreground">
                      Saved {bm.savedAt}
                    </span>
                  </div>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
