"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Bookmark,
  Trash2,
  FolderOpen,
  History,
  Download,
  FileJson,
  ArrowUpRight,
  Search,
  Briefcase,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EmptyState, PageHeader, Skeleton, Tooltip, buttonStyles } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toaster";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

type Tab = "chats" | "bookmarks" | "history";

function download(name: string, body: string, type: string) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WorkspacePage() {
  const hydrated = useHydrated();
  const { savedChats, bookmarks, history, removeChat, removeBookmark, clearHistory, clearAll } =
    useWorkspaceStore();
  const [tab, setTab] = useState<Tab>("chats");
  const [confirmClear, setConfirmClear] = useState(false);

  const isEmpty = savedChats.length + bookmarks.length + history.length === 0;

  function exportMarkdown() {
    let md = `# NyayaGPT Workspace\n\n_Exported ${new Date().toLocaleString()}_\n\n`;
    md += `## Saved conversations (${savedChats.length})\n\n`;
    for (const c of savedChats) md += `### ${c.title}\n${c.date} · ${c.messageCount} messages\n\n> ${c.preview}\n\n`;
    md += `## Bookmarked sections (${bookmarks.length})\n\n`;
    for (const b of bookmarks)
      md += `### ${b.act ?? b.doc} — ${b.section}\n_Saved ${b.savedAt}_\n\n> ${b.excerpt}\n\n`;
    md += `## Research history (${history.length})\n\n`;
    for (const h of history) md += `- ${h.query} _(${new Date(h.at).toLocaleString()})_\n`;
    download(`nyayagpt-workspace-${Date.now()}.md`, md, "text/markdown");
    toast("Workspace exported as Markdown.");
  }

  function exportJson() {
    download(
      `nyayagpt-workspace-${Date.now()}.json`,
      JSON.stringify({ savedChats, bookmarks, history }, null, 2),
      "application/json"
    );
    toast("Workspace exported as JSON.");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "chats", label: "Conversations", icon: <MessageSquare className="h-4 w-4" />, count: savedChats.length },
    { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="h-4 w-4" />, count: bookmarks.length },
    { id: "history", label: "History", icon: <History className="h-4 w-4" />, count: history.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Stored only in this browser"
          eyebrowIcon={<Briefcase className="h-3.5 w-3.5" />}
          title="Your"
          highlight="Workspace"
          description="Saved conversations, bookmarked legal sections and your research history."
          actions={
            hydrated && !isEmpty ? (
              <>
                <button onClick={exportMarkdown} className={buttonStyles.secondary}>
                  <Download className="h-4 w-4" /> Markdown
                </button>
                <button onClick={exportJson} className={buttonStyles.secondary}>
                  <FileJson className="h-4 w-4" /> JSON
                </button>
              </>
            ) : undefined
          }
        />

        {/* Tabs */}
        <div role="tablist" aria-label="Workspace sections" className="mb-6 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-card sm:inline-flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex shrink-0 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none",
                tab === t.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.icon}
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px]",
                  tab === t.id ? "bg-white/15" : "bg-muted"
                )}
              >
                {hydrated ? t.count : "–"}
              </span>
            </button>
          ))}
        </div>

        {!hydrated ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : tab === "chats" ? (
          savedChats.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-5 w-5" />}
              title="No saved conversations yet"
              description="Use the save button in the chat header to keep a conversation here."
              action={
                <Link href="/chat" className={buttonStyles.primary}>
                  Start a chat
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedChats.map((chat) => (
                <article
                  key={chat.id}
                  className="group flex animate-fade-up flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold-ink">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <DeleteButton label="Delete conversation" onClick={() => { removeChat(chat.id); toast("Conversation deleted.", "info"); }} />
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-sans text-base font-semibold text-foreground">{chat.title}</h3>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-muted-foreground">{chat.preview}</p>
                  <div className="mt-4 flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
                    <span>{chat.messageCount} messages</span>
                    <span aria-hidden>·</span>
                    <span>{chat.date}</span>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : tab === "bookmarks" ? (
          bookmarks.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-5 w-5" />}
              title="No bookmarks yet"
              description="Bookmark sections from the Library or from any cited source in chat."
              action={
                <Link href="/library" className={buttonStyles.primary}>
                  Browse the Library
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {bookmarks.map((bm) => (
                <article
                  key={bm.id}
                  className="flex animate-fade-up flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:border-gold/60 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-gold-ink">
                        {bm.act ?? bm.doc}
                      </div>
                      <h3 className="mt-1 font-sans text-base font-semibold text-foreground">{bm.section}</h3>
                    </div>
                    <DeleteButton label="Remove bookmark" onClick={() => { removeBookmark(bm.id); toast("Bookmark removed.", "info"); }} />
                  </div>
                  <p className="mt-3 line-clamp-4 flex-1 border-l-2 border-gold pl-3 text-sm leading-relaxed text-muted-foreground">
                    {bm.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>Saved {bm.savedAt}</span>
                    <Link
                      href={`/chat?q=${encodeURIComponent(`Explain ${bm.section} of ${bm.act ?? bm.doc}`)}`}
                      className="inline-flex items-center gap-1 font-medium text-gold-ink hover:underline"
                    >
                      Ask about this <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : history.length === 0 ? (
          <EmptyState
            icon={<History className="h-5 w-5" />}
            title="No research history"
            description="Questions you ask in chat are listed here so you can revisit them."
            action={
              <Link href="/chat" className={buttonStyles.primary}>
                Ask a question
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <span className="text-sm font-medium text-foreground">Recent questions</span>
              <button onClick={() => { clearHistory(); toast("History cleared.", "info"); }} className="text-xs font-medium text-muted-foreground transition hover:text-destructive">
                Clear history
              </button>
            </div>
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.at + h.query}>
                  <Link
                    href={`/chat?q=${encodeURIComponent(h.query)}`}
                    className="group flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-muted/40"
                  >
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">{h.query}</span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                      {new Date(h.at).toLocaleString()}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-gold-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hydrated && !isEmpty && (
          <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Clear workspace</div>
              <div className="text-xs text-muted-foreground">
                Permanently removes saved conversations, bookmarks and history from this browser.
              </div>
            </div>
            {confirmClear ? (
              <div className="flex gap-2">
                <button onClick={() => setConfirmClear(false)} className={buttonStyles.secondary}>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearAll();
                    setConfirmClear(false);
                    toast("Workspace cleared.", "info");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition hover:opacity-90"
                >
                  <Trash2 className="h-4 w-4" /> Yes, clear everything
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-card px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        aria-label={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
