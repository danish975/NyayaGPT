"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Scale,
  Sparkles,
  Loader2,
  BookOpen,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { retrieve } from "@/lib/retrieval";
import type { Citation, RetrievalTrace, RetrievalStep } from "@/store/chat-store";

type Turn = {
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

const SUGGESTIONS = [
  "What is the RTI filing process under Section 6?",
  "Explain Article 21 in simple language.",
  "Am I eligible for PMAY if my income is ₹5 lakh?",
  "How many days of work does MGNREGA guarantee?",
  "What does the DPDP Act say about consent?",
  "मुझे NEP 2020 के बारे में बताइए।",
];

function computeConfidence(chunks: { score: number }[]): number {
  if (chunks.length === 0) return 0;
  const top = chunks[0].score;
  const base = Math.min(1, top / 6);
  const breadth = Math.min(1, chunks.length / 3) * 0.2;
  return Math.round(Math.min(0.99, 0.55 + base * 0.4 + breadth) * 100) / 100;
}

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const latestAssistant = [...turns].reverse().find((t) => t.role === "assistant");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  async function submit(q: string) {
    const question = q.trim();
    if (!question || loading) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", content: question }]);
    setLoading(true);

    try {
      // BM25 retrieval
      const wide = retrieve(question, 12);
      const reranked = wide.slice(0, 5);
      const chunks = reranked.slice(0, 3);

      const trace: RetrievalTrace = {
        query: question,
        retrieved: wide.map((c) => ({
          id: c.id,
          label: `${c.doc} · ${c.section}`,
          score: +c.score.toFixed(3),
        })),
        reranked: reranked.map((c) => ({
          id: c.id,
          label: `${c.doc} · ${c.section}`,
          score: +c.score.toFixed(3),
        })),
        contextUsed: chunks.map((c) => c.id),
      };

      if (chunks.length === 0) {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content:
              "I couldn't find anything in the indexed corpus that matches your question. Try rephrasing, or ask about RTI, the Constitution (Articles 14/19/21), PMAY, NEP 2020, MGNREGA, or the DPDP Act.",
            citations: [],
            confidence: 0,
            trace,
          },
        ]);
        setLoading(false);
        return;
      }

      // Call our API route (which calls Groq)
      const sourcesBlock = chunks
        .map(
          (c, i) =>
            `[${i + 1}] ${c.doc} — ${c.section}${c.year ? ` (${c.year})` : ""}\n"""${c.text}"""`
        )
        .join("\n\n");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sources: sourcesBlock }),
      });

      const data = await res.json();

      const citations: Citation[] = chunks.map((c) => ({
        id: c.id,
        doc: c.doc,
        act: c.act,
        section: c.section,
        year: c.year,
        excerpt: c.text,
        url: c.url,
        score: +c.score.toFixed(3),
      }));

      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: data.answer || data.error || "No answer.",
          citations,
          confidence: computeConfidence(chunks),
          trace,
          error: data.error,
        },
      ]);
    } catch (err) {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          error: String(err),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function runSimplify(idx: number) {
    setTurns((t) =>
      t.map((x, i) => (i === idx ? { ...x, simplifying: true } : x))
    );
    try {
      const turn = turns[idx];
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: turn.content }),
      });
      const data = await res.json();
      setTurns((t) =>
        t.map((x, i) =>
          i === idx
            ? {
                ...x,
                simplified: data.simplified || x.simplified,
                showSimplified: true,
                simplifying: false,
              }
            : x
        )
      );
    } catch {
      setTurns((t) =>
        t.map((x, i) => (i === idx ? { ...x, simplifying: false } : x))
      );
    }
  }

  function setFeedback(idx: number, fb: Turn["feedback"]) {
    setTurns((t) =>
      t.map((x, i) => (i === idx ? { ...x, feedback: fb } : x))
    );
  }

  function toggleVariant(idx: number) {
    setTurns((t) =>
      t.map((x, i) =>
        i === idx ? { ...x, showSimplified: !x.showSimplified } : x
      )
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
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
              href="/library"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Library
            </Link>
            <Link
              href="/eligibility"
              className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline"
            >
              Eligibility
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex flex-1 max-w-7xl gap-4 px-4">
        {/* Sources Panel (left) */}
        <aside className="hidden w-80 shrink-0 flex-col border-r pr-4 lg:flex">
          <div className="flex items-center gap-2 py-4">
            <BookOpen className="h-4 w-4 text-accent" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Sources
            </h2>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pb-6">
            {!latestAssistant?.citations?.length ? (
              <p className="text-xs text-muted-foreground">
                Retrieved sections will appear here after you ask a question.
              </p>
            ) : (
              latestAssistant.citations.map((c, i) => (
                <a
                  key={c.id}
                  href={`#cite-${c.id}`}
                  className="block scroll-mt-20 rounded-lg border bg-card p-3 text-xs transition hover:border-gold"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {c.act ?? c.doc}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground">{c.section}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    score {c.score}
                  </div>
                </a>
              ))
            )}
          </div>
        </aside>

        {/* Chat / AI Assistant (right) */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto py-6">
            {turns.length === 0 ? (
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emblem text-accent">
                  <Scale className="h-7 w-7" />
                </div>
                <h2 className="font-display text-3xl text-foreground">
                  Ask NyayaGPT
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Source-grounded answers on Indian laws, schemes, and the
                  Constitution. Every answer cites the section it came from.
                </p>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-lg border bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-gold hover:shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {turns.map((t, i) => (
                  <TurnView
                    key={i}
                    turn={t}
                    onSimplify={() => runSimplify(i)}
                    onToggleVariant={() => toggleVariant(i)}
                    onFeedback={(fb) => setFeedback(i, fb)}
                  />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">
                      Retrieving sources and drafting answer…
                    </span>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t bg-background/80 py-4 backdrop-blur">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:border-gold focus-within:shadow-md"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                rows={1}
                placeholder="Ask about RTI, PMAY, Article 21, DPDP, NEP 2020, MGNREGA…"
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Ask
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3 text-accent" />
              NyayaGPT cites every source. This is informational and not legal
              advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function TurnView({
  turn,
  onSimplify,
  onToggleVariant,
  onFeedback,
}: {
  turn: Turn;
  onSimplify: () => void;
  onToggleVariant: () => void;
  onFeedback: (fb: Turn["feedback"]) => void;
}) {
  if (turn.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
          {turn.content}
        </div>
      </div>
    );
  }

  const displayed =
    turn.showSimplified && turn.simplified ? turn.simplified : turn.content;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emblem text-accent">
          <Scale className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-3">
          {turn.error && !turn.content ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {turn.error}
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
                {turn.showSimplified && turn.simplified && (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    <Wand2 className="h-3 w-3" /> Explained simply
                  </div>
                )}
                <FormattedAnswer text={displayed} />
              </div>

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {typeof turn.confidence === "number" &&
                  turn.confidence > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-1 text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Confidence {Math.round(turn.confidence * 100)}%
                    </span>
                  )}
                <button
                  onClick={
                    turn.simplified ? onToggleVariant : onSimplify
                  }
                  disabled={turn.simplifying}
                  className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-foreground transition hover:border-gold disabled:opacity-50"
                >
                  {turn.simplifying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  {turn.simplified
                    ? turn.showSimplified
                      ? "Show original"
                      : "Show simplified"
                    : "Explain simply"}
                </button>

                <div className="ml-auto flex items-center gap-1">
                  <FeedbackBtn
                    active={turn.feedback === "up"}
                    onClick={() =>
                      onFeedback(turn.feedback === "up" ? undefined : "up")
                    }
                    label="Helpful"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </FeedbackBtn>
                  <FeedbackBtn
                    active={turn.feedback === "down"}
                    onClick={() =>
                      onFeedback(
                        turn.feedback === "down" ? undefined : "down"
                      )
                    }
                    label="Not helpful"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </FeedbackBtn>
                  <FeedbackBtn
                    active={turn.feedback === "halluc"}
                    onClick={() =>
                      onFeedback(
                        turn.feedback === "halluc" ? undefined : "halluc"
                      )
                    }
                    label="Report hallucination"
                  >
                    <AlertTriangle className="h-3 w-3" />
                  </FeedbackBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {turn.citations && turn.citations.length > 0 && (
        <div className="ml-11 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sources used
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {turn.citations.map((c, i) => (
              <div key={c.id} id={`cite-${c.id}`} className="scroll-mt-20">
                <CitationCard index={i + 1} citation={c} />
              </div>
            ))}
          </div>
        </div>
      )}

      {turn.trace && (
        <TracePanel
          trace={turn.trace}
          contextIds={turn.citations?.map((c) => c.id) ?? []}
        />
      )}
    </div>
  );
}

function CitationCard({
  index,
  citation,
}: {
  index: number;
  citation: Citation;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-xs transition hover:border-gold">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
          {index}
        </span>
        <span className="font-semibold text-foreground">
          {citation.act ?? citation.doc}
        </span>
      </div>
      <div className="mt-1 font-medium text-foreground">{citation.section}</div>
      <p className="mt-2 border-l-2 border-gold pl-2 text-muted-foreground line-clamp-3">
        {citation.excerpt}
      </p>
      {citation.url && (
        <a
          href={citation.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-accent hover:underline"
        >
          View source →
        </a>
      )}
    </div>
  );
}

function FeedbackBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${
        active
          ? "border-gold bg-accent/15 text-accent"
          : "bg-card text-muted-foreground hover:border-gold hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TracePanel({
  trace,
  contextIds,
}: {
  trace: RetrievalTrace;
  contextIds: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-11">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        How this answer was generated
      </button>
      {open && (
        <div className="mt-2 space-y-3 rounded-lg border bg-card/60 p-3 text-xs">
          <TraceRow
            label={`Retrieved: ${trace.retrieved.length}`}
            items={trace.retrieved}
          />
          <TraceRow
            label={`After reranking: ${trace.reranked.length}`}
            items={trace.reranked}
          />
          <TraceRow
            label={`Generation context: ${contextIds.length}`}
            items={trace.reranked.filter((r) => contextIds.includes(r.id))}
          />
        </div>
      )}
    </div>
  );
}

function TraceRow({
  label,
  items,
}: {
  label: string;
  items: RetrievalStep[];
}) {
  return (
    <div>
      <div className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center justify-between gap-3 rounded border bg-background px-2 py-1"
          >
            <span className="truncate text-foreground">{it.label}</span>
            <span className="shrink-0 text-muted-foreground">{it.score}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-muted-foreground">—</li>
        )}
      </ul>
    </div>
  );
}

function FormattedAnswer({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (m) {
          return (
            <a
              key={i}
              href={`#cite-idx-${m[1]}`}
              onClick={(e) => {
                e.preventDefault();
                const cards = document.querySelectorAll('[id^="cite-"]');
                const target = cards[
                  parseInt(m[1], 10) - 1
                ] as HTMLElement | undefined;
                target?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                target?.classList.add("ring-2", "ring-gold");
                setTimeout(
                  () => target?.classList.remove("ring-2", "ring-gold"),
                  1200
                );
              }}
              className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground transition hover:opacity-80"
            >
              {m[1]}
            </a>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </p>
  );
}
