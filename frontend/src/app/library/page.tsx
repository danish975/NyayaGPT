"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, ExternalLink, Search, Filter } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { CORPUS } from "@/data/corpus";

const CATEGORIES = ["All", "Constitution", "Act", "Policy", "Scheme"];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const grouped = useMemo(() => {
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
      filtered = filtered.filter((c) => {
        const doc = c.doc.toLowerCase();
        switch (category) {
          case "Constitution":
            return doc.includes("constitution");
          case "Act":
            return doc.includes("act") || doc.includes("dpdp");
          case "Policy":
            return doc.includes("nep") || doc.includes("guidelines");
          case "Scheme":
            return (
              doc.includes("pmay") ||
              doc.includes("mgnrega") ||
              doc.includes("ayushman")
            );
          default:
            return true;
        }
      });
    }

    return filtered.reduce<Record<string, typeof CORPUS>>((acc, c) => {
      (acc[c.doc] ||= []).push(c);
      return acc;
    }, {});
  }, [search, category]);

  const totalDocs = Object.keys(grouped).length;
  const totalSections = Object.values(grouped).reduce(
    (acc, chunks) => acc + chunks.length,
    0
  );

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
              Open Chat
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-display text-4xl text-foreground">
          Document Library
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          NyayaGPT answers are grounded in the following indexed sources. Every
          chat citation links back to one of these passages.
        </p>

        {/* Search & Filter */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents, sections, or text…"
              className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-gold"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  category === cat
                    ? "border-gold bg-accent/15 text-accent"
                    : "bg-card text-muted-foreground hover:border-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {totalDocs} document{totalDocs !== 1 ? "s" : ""} ·{" "}
          {totalSections} section{totalSections !== 1 ? "s" : ""}
        </p>

        <div className="mt-6 space-y-8">
          {Object.entries(grouped).map(([doc, chunks]) => (
            <section
              key={doc}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-foreground">
                    {doc}
                  </h2>
                  {chunks[0].act && (
                    <div className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
                      {chunks[0].act}
                      {chunks[0].year ? ` · ${chunks[0].year}` : ""}
                    </div>
                  )}
                </div>
                {chunks[0].url && (
                  <a
                    href={chunks[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    Official source{" "}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <ul className="mt-5 space-y-3">
                {chunks.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border bg-background/60 p-4 text-sm"
                  >
                    <div className="font-semibold text-foreground">
                      {c.section}
                    </div>
                    <p className="mt-2 border-l-2 border-gold pl-3 text-muted-foreground">
                      {c.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {totalDocs === 0 && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                No documents match your search. Try different keywords.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
