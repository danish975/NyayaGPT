"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Library,
  X,
  Landmark,
  ScrollText,
  FileText,
  HandHeart,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge, EmptyState, PageHeader, Tooltip, inputStyles } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toaster";
import { CORPUS, type Chunk } from "@/data/corpus";
import { CATEGORIES, categoryOf, groupByDocument, matchesCategory, type Category } from "@/lib/corpus-meta";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const DOCS_PER_PAGE = 4;

const CATEGORY_ICON: Record<Category, React.ReactNode> = {
  Constitution: <Landmark className="h-3 w-3" />,
  Act: <ScrollText className="h-3 w-3" />,
  Policy: <FileText className="h-3 w-3" />,
  Scheme: <HandHeart className="h-3 w-3" />,
};

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [page, setPage] = useState(1);

  const groups = useMemo(() => {
    let filtered = CORPUS;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.doc.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q) ||
          c.text.toLowerCase().includes(q) ||
          (c.act && c.act.toLowerCase().includes(q))
      );
    }

    if (category !== "All") {
      filtered = filtered.filter((c) => matchesCategory(c, category));
    }

    return groupByDocument(filtered);
  }, [search, category]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((cat) => [cat, groupByDocument(CORPUS.filter((c) => matchesCategory(c, cat))).length])
      ) as Record<string, number>,
    []
  );

  const totalDocs = groups.length;
  const totalSections = groups.reduce((acc, g) => acc + g.chunks.length, 0);
  const pageCount = Math.max(1, Math.ceil(totalDocs / DOCS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const visible = groups.slice((currentPage - 1) * DOCS_PER_PAGE, currentPage * DOCS_PER_PAGE);

  function updateSearch(v: string) {
    setSearch(v);
    setPage(1);
  }
  function updateCategory(c: "All" | Category) {
    setCategory(c);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Indexed corpus"
          eyebrowIcon={<Library className="h-3.5 w-3.5" />}
          title="Document"
          highlight="Library"
          description="NyayaGPT answers are grounded in these indexed sources. Every chat citation links back to one of these passages."
        />

        {/* Search & Filter */}
        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b bg-background/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="library-search" className="sr-only">
                Search documents
              </label>
              <input
                id="library-search"
                type="search"
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search documents, sections, or text…"
                className={cn(inputStyles, "pl-10 pr-9")}
              />
              {search && (
                <button
                  onClick={() => updateSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div
              role="tablist"
              aria-label="Filter by category"
              className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={category === cat}
                  onClick={() => updateCategory(cat)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                    category === cat
                      ? "border-gold bg-gold-soft text-gold-ink"
                      : "bg-card text-muted-foreground hover:border-gold/60 hover:text-foreground"
                  )}
                >
                  {cat}
                  <span className="rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
                    {counts[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            Showing {totalDocs} document{totalDocs !== 1 ? "s" : ""} · {totalSections} section
            {totalSections !== 1 ? "s" : ""}
            {search && (
              <>
                {" "}
                for <span className="font-medium text-foreground">&ldquo;{search}&rdquo;</span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          {visible.map((g) => (
            <section
              key={g.doc}
              className="animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-card transition hover:shadow-lift"
            >
              <div className="flex flex-col gap-4 border-b bg-parchment/60 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emblem text-accent shadow-card sm:inline-flex">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gold">
                        {CATEGORY_ICON[g.category]} {g.category}
                      </Badge>
                      {g.year && <Badge>{g.year}</Badge>}
                      <Badge>
                        {g.chunks.length} section{g.chunks.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <h2 className="mt-2 font-display text-2xl text-foreground">{g.doc}</h2>
                    {g.act && g.act !== g.doc && (
                      <div className="mt-0.5 text-sm text-muted-foreground">{g.act}</div>
                    )}
                  </div>
                </div>
                {g.url && (
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border bg-card px-3 py-2 text-sm text-foreground transition hover:border-gold"
                  >
                    Official source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <ul className="divide-y">
                {g.chunks.map((c) => (
                  <SectionRow key={c.id} chunk={c} highlight={search} />
                ))}
              </ul>
            </section>
          ))}

          {totalDocs === 0 && (
            <EmptyState
              icon={<Search className="h-5 w-5" />}
              title="No documents match"
              description="Try different keywords or clear the category filter."
              action={
                <button
                  onClick={() => {
                    updateSearch("");
                    updateCategory("All");
                  }}
                  className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition hover:border-gold"
                >
                  Reset filters
                </button>
              }
            />
          )}
        </div>

        {pageCount > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground transition hover:border-gold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition",
                  p === currentPage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:border-gold"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground transition hover:border-gold disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-gold-soft px-0.5 text-foreground">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function SectionRow({ chunk, highlight }: { chunk: Chunk; highlight: string }) {
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const bookmarks = useWorkspaceStore((s) => s.bookmarks);
  const addBookmark = useWorkspaceStore((s) => s.addBookmark);
  const removeBookmark = useWorkspaceStore((s) => s.removeBookmark);
  const saved = hydrated && bookmarks.some((b) => b.id === chunk.id);
  const long = chunk.text.length > 220;

  function toggleBookmark() {
    if (saved) {
      removeBookmark(chunk.id);
      toast("Bookmark removed.", "info");
    } else {
      addBookmark({
        id: chunk.id,
        doc: chunk.doc,
        act: chunk.act,
        section: chunk.section,
        excerpt: chunk.text,
        savedAt: new Date().toLocaleDateString(),
      });
      toast("Section bookmarked to your Workspace.");
    }
  }

  return (
    <li className="group p-5 transition hover:bg-muted/30 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-sm font-semibold text-foreground">
          <Highlighted text={chunk.section} query={highlight} />
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip label="Ask NyayaGPT about this">
            <Link
              href={`/chat?q=${encodeURIComponent(`Explain ${chunk.section} of ${chunk.act ?? chunk.doc}`)}`}
              aria-label={`Ask NyayaGPT about ${chunk.section}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <MessageSquareText className="h-4 w-4" />
            </Link>
          </Tooltip>
          <Tooltip label={saved ? "Remove bookmark" : "Bookmark section"}>
            <button
              onClick={toggleBookmark}
              aria-label={saved ? "Remove bookmark" : "Bookmark section"}
              aria-pressed={saved}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
                saved ? "text-gold-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </button>
          </Tooltip>
        </div>
      </div>
      <p
        className={cn(
          "mt-2 border-l-2 border-gold/70 pl-3 text-sm leading-relaxed text-muted-foreground",
          !open && long && "line-clamp-3"
        )}
      >
        <Highlighted text={chunk.text} query={highlight} />
      </p>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wider">{categoryOf(chunk)}</span>
        {long && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 font-medium text-gold-ink hover:underline"
          >
            {open ? "Show less" : "Read full section"}
            <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
          </button>
        )}
      </div>
    </li>
  );
}
