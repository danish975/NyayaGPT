"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUp,
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
  Copy,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  PanelLeft,
  X,
  Save,
  SquarePen,
  RotateCcw,
  FileText,
  Landmark,
  GraduationCap,
  HeartPulse,
  Home,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnswerMarkdown } from "@/components/chat/AnswerMarkdown";
import { Skeleton, Tooltip } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toaster";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useHydrated, usePrefersReducedMotion } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";
import type { Citation, RetrievalTrace, RetrievalStep } from "@/store/chat-store";

type Turn = {
  role: "user" | "assistant";
  content: string;
  /** Server signature proving this answer came from /api/chat; required by /api/simplify. */
  answerToken?: string;
  simplified?: string;
  showSimplified?: boolean;
  citations?: Citation[];
  confidence?: number;
  trace?: RetrievalTrace;
  feedback?: "up" | "down" | "halluc";
  error?: string;
  simplifying?: boolean;
  /** True while the answer is being progressively revealed. */
  revealing?: boolean;
};

const SUGGESTIONS: { q: string; icon: React.ReactNode; tag: string }[] = [
  { q: "What is the RTI filing process under Section 6?", icon: <FileText className="h-4 w-4" />, tag: "RTI Act" },
  { q: "Explain Article 21 in simple language.", icon: <Landmark className="h-4 w-4" />, tag: "Constitution" },
  { q: "Am I eligible for PMAY if my income is ₹5 lakh?", icon: <Home className="h-4 w-4" />, tag: "Housing" },
  { q: "How many days of work does MGNREGA guarantee?", icon: <HeartPulse className="h-4 w-4" />, tag: "Employment" },
  { q: "What does the DPDP Act say about consent?", icon: <ShieldCheck className="h-4 w-4" />, tag: "Data privacy" },
  { q: "मुझे NEP 2020 के बारे में बताइए।", icon: <GraduationCap className="h-4 w-4" />, tag: "हिन्दी" },
];

const MAX_QUESTION_CHARS = 1000;

export default function ChatPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTurn, setActiveTurn] = useState<number | null>(null);
  const [focusedCite, setFocusedCite] = useState<{ turn: number; n: number } | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatId = useRef<string | null>(null);
  const autoAsked = useRef(false);

  const addHistory = useWorkspaceStore((s) => s.addHistory);
  const addChat = useWorkspaceStore((s) => s.addChat);

  const lastAssistantIdx = (() => {
    for (let i = turns.length - 1; i >= 0; i--) if (turns[i].role === "assistant") return i;
    return null;
  })();
  const sourcesTurnIdx = activeTurn ?? lastAssistantIdx;
  const sourcesTurn = sourcesTurnIdx !== null ? turns[sourcesTurnIdx] : undefined;

  // Keep the newest content in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns.length, loading]);

  // Auto-grow the composer.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 180)}px`;
  }, [input]);

  // Close the mobile sources drawer with Escape.
  useEffect(() => {
    if (!sourcesOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSourcesOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sourcesOpen]);

  const ask = useCallback(
    async (question: string) => {
      setLoading(true);
      addHistory(question);
      try {
        // The server retrieves the sources, calls the LLM, and returns citations + trace.
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        const data: {
          answer?: string;
          answerToken?: string;
          citations?: Citation[];
          confidence?: number;
          trace?: RetrievalTrace;
          error?: string;
        } = await res.json();

        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: data.answer || data.error || "No answer.",
            answerToken: data.answerToken,
            citations: data.citations ?? [],
            confidence: data.confidence,
            trace: data.trace,
            error: data.error,
            revealing: !data.error,
          },
        ]);
      } catch (err) {
        setTurns((t) => [
          ...t,
          {
            role: "assistant",
            content: "Something went wrong. Please check your connection and try again.",
            error: String(err),
          },
        ]);
      } finally {
        setActiveTurn(null);
        setLoading(false);
      }
    },
    [addHistory]
  );

  const submit = useCallback(
    (q: string) => {
      const question = q.trim();
      if (!question || loading || question.length > MAX_QUESTION_CHARS) return;
      setInput("");
      setTurns((t) => [...t, { role: "user", content: question }]);
      void ask(question);
    },
    [ask, loading]
  );

  // Support /chat?q=... (used by "Ask about this" links in the Library).
  useEffect(() => {
    if (autoAsked.current) return;
    autoAsked.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      window.history.replaceState(null, "", "/chat");
      submit(q);
    }
  }, [submit]);

  function retry(idx: number) {
    const question = turns[idx - 1]?.content;
    if (!question || loading) return;
    setTurns((t) => t.slice(0, idx));
    void ask(question);
  }

  async function runSimplify(idx: number) {
    setTurns((t) => t.map((x, i) => (i === idx ? { ...x, simplifying: true } : x)));
    try {
      const turn = turns[idx];
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: turn.content, answerToken: turn.answerToken }),
      });
      const data = await res.json();
      const simplified: string | undefined = data.simplified || turn.simplified;
      if (!simplified) toast(data.error || "Could not simplify this answer.", "error");
      setTurns((t) =>
        t.map((x, i) =>
          i === idx
            ? { ...x, simplified, showSimplified: Boolean(simplified), simplifying: false }
            : x
        )
      );
    } catch {
      toast("Could not simplify this answer.", "error");
      setTurns((t) => t.map((x, i) => (i === idx ? { ...x, simplifying: false } : x)));
    }
  }

  function setFeedback(idx: number, fb: Turn["feedback"]) {
    setTurns((t) => t.map((x, i) => (i === idx ? { ...x, feedback: fb } : x)));
    if (fb) toast("Thanks — your feedback was recorded.", "info");
  }

  function toggleVariant(idx: number) {
    setTurns((t) =>
      t.map((x, i) => (i === idx ? { ...x, showSimplified: !x.showSimplified } : x))
    );
  }

  function finishReveal(idx: number) {
    setTurns((t) => t.map((x, i) => (i === idx ? { ...x, revealing: false } : x)));
  }

  function openCitation(turnIdx: number, n: number) {
    setActiveTurn(turnIdx);
    setFocusedCite({ turn: turnIdx, n });
    const el = document.getElementById(`cite-${turnIdx}-${n}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function newChat() {
    setTurns([]);
    setActiveTurn(null);
    setFocusedCite(null);
    chatId.current = null;
    textareaRef.current?.focus();
  }

  function saveChat() {
    const firstQ = turns.find((t) => t.role === "user")?.content ?? "Conversation";
    const lastA = [...turns].reverse().find((t) => t.role === "assistant" && !t.error);
    chatId.current ??= `chat-${Date.now()}`;
    addChat({
      id: chatId.current,
      title: firstQ.length > 80 ? `${firstQ.slice(0, 77)}…` : firstQ,
      preview: (lastA?.content ?? "").replace(/[*#`]/g, "").slice(0, 180),
      date: new Date().toLocaleString(),
      messageCount: turns.length,
    });
    toast("Conversation saved to your Workspace.");
  }

  const sourcesPanel = (
    <SourcesPanel
      turn={sourcesTurn}
      turnIdx={sourcesTurnIdx}
      isLatest={sourcesTurnIdx === lastAssistantIdx}
      focusedN={focusedCite && focusedCite.turn === sourcesTurnIdx ? focusedCite.n : null}
      loading={loading}
      onSelect={(n) => sourcesTurnIdx !== null && openCitation(sourcesTurnIdx, n)}
      onShowLatest={() => setActiveTurn(null)}
    />
  );

  const sourceCount = sourcesTurn?.citations?.length ?? 0;
  const overLimit = input.length > MAX_QUESTION_CHARS;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header
        wide
        hideChatCta
        actions={
          <>
            <button
              onClick={() => setSourcesOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm text-foreground transition hover:border-gold lg:hidden"
              aria-label="Show sources"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sources</span>
              {sourceCount > 0 && (
                <span className="rounded-full bg-gold-soft px-1.5 text-[11px] font-semibold text-gold-ink">
                  {sourceCount}
                </span>
              )}
            </button>
            {turns.length > 0 && (
              <>
                <Tooltip label="Save to Workspace" side="bottom">
                  <button
                    onClick={saveChat}
                    aria-label="Save conversation to Workspace"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition hover:border-gold hover:text-foreground"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </Tooltip>
                <Tooltip label="New chat" side="bottom">
                  <button
                    onClick={newChat}
                    aria-label="Start a new chat"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition hover:border-gold hover:text-foreground"
                  >
                    <SquarePen className="h-4 w-4" />
                  </button>
                </Tooltip>
              </>
            )}
          </>
        }
      />

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1">
        {/* Sources sidebar (desktop) */}
        <aside
          aria-label="Sources"
          className="hidden w-[340px] shrink-0 flex-col border-r bg-card/40 lg:flex"
        >
          {sourcesPanel}
        </aside>

        {/* Sources drawer (mobile / tablet) */}
        {sourcesOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Sources">
            <button
              aria-label="Close sources"
              onClick={() => setSourcesOpen(false)}
              className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]"
            />
            <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-fade-up flex-col border-r bg-background shadow-elegant">
              <button
                onClick={() => setSourcesOpen(false)}
                aria-label="Close sources"
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              {sourcesPanel}
            </div>
          </div>
        )}

        {/* Conversation */}
        <main id="main" className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
              {turns.length === 0 ? (
                <EmptyChat onPick={submit} />
              ) : (
                <div className="space-y-8">
                  {turns.map((t, i) => (
                    <TurnView
                      key={i}
                      turn={t}
                      index={i}
                      focusedN={focusedCite?.turn === i ? focusedCite.n : null}
                      onCite={(n) => openCitation(i, n)}
                      onSimplify={() => runSimplify(i)}
                      onToggleVariant={() => toggleVariant(i)}
                      onFeedback={(fb) => setFeedback(i, fb)}
                      onRetry={() => retry(i)}
                      onRevealDone={() => finishReveal(i)}
                    />
                  ))}
                  {loading && <ThinkingBubble />}
                </div>
              )}
            </div>
          </div>

          {/* Composer (stays pinned to the bottom of the column) */}
          <div className="border-t bg-background/85 px-4 pb-4 pt-3 backdrop-blur sm:px-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className={cn(
                "mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-card p-2 shadow-card transition focus-within:border-gold focus-within:shadow-lift",
                overLimit && "border-destructive focus-within:border-destructive"
              )}
            >
              <label htmlFor="chat-input" className="sr-only">
                Ask a legal question
              </label>
              <textarea
                id="chat-input"
                ref={textareaRef}
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
                className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={loading || !input.trim() || overLimit}
                aria-label="Send question"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card transition hover:opacity-90 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </form>
            <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between gap-3 px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-gold-ink" />
                Answers cite their sources. Informational only — not legal advice.
              </span>
              <span className={cn("hidden shrink-0 sm:inline", overLimit && "text-destructive")}>
                {input.length > 800
                  ? `${input.length}/${MAX_QUESTION_CHARS}`
                  : "Enter to send · Shift+Enter for a new line"}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────────── */

function EmptyChat({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="animate-fade-up pt-4 text-center sm:pt-10">
      <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emblem text-accent shadow-gold">
        <Scale className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl text-foreground sm:text-4xl">Ask NyayaGPT</h1>
      <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
        Source-grounded answers on Indian laws, schemes, and the Constitution. Every
        answer cites the section it came from.
      </p>
      <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s.q}
            onClick={() => onPick(s.q)}
            style={{ animationDelay: `${80 + i * 50}ms` }}
            className="group flex animate-fade-up items-start gap-3 rounded-xl border bg-card p-4 text-sm text-foreground shadow-card transition hover:-translate-y-0.5 hover:border-gold hover:shadow-lift"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold-ink transition group-hover:bg-accent group-hover:text-accent-foreground">
              {s.icon}
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.tag}
              </span>
              <span className="mt-0.5 block leading-snug">{s.q}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Loading ───────────────────────────────────────────────────────── */

function ThinkingBubble() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setPhase(1), 1200);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="flex animate-fade-in items-start gap-3" aria-live="polite">
      <AssistantAvatar />
      <div className="flex-1 space-y-3">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-gold-ink" />
          {phase === 0 ? "Searching the legal corpus…" : "Drafting a cited answer…"}
        </div>
        <div className="space-y-2.5 rounded-2xl border bg-card p-5 shadow-card">
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-14 flex-1 rounded-xl" />
          <Skeleton className="h-14 flex-1 rounded-xl" />
          <Skeleton className="hidden h-14 flex-1 rounded-xl sm:block" />
        </div>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emblem text-accent shadow-card">
      <Scale className="h-4 w-4" />
    </div>
  );
}

/* ─── Progressive reveal ("streaming" presentation of the full answer) ─ */

function useReveal(text: string, active: boolean, onDone: () => void) {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(active ? 0 : text.length);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) {
      setCount(text.length);
      return;
    }
    if (reduced) {
      setCount(text.length);
      doneRef.current();
      return;
    }
    // Finish within ~1.6s regardless of length.
    const step = Math.max(3, Math.ceil(text.length / 95));
    let n = 0;
    let raf = 0;
    const tick = () => {
      n = Math.min(text.length, n + step);
      setCount(n);
      if (n < text.length) raf = requestAnimationFrame(tick);
      else doneRef.current();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, reduced]);

  return text.slice(0, count);
}

/* ─── Turn ──────────────────────────────────────────────────────────── */

function TurnView({
  turn,
  index,
  focusedN,
  onCite,
  onSimplify,
  onToggleVariant,
  onFeedback,
  onRetry,
  onRevealDone,
}: {
  turn: Turn;
  index: number;
  focusedN: number | null;
  onCite: (n: number) => void;
  onSimplify: () => void;
  onToggleVariant: () => void;
  onFeedback: (fb: Turn["feedback"]) => void;
  onRetry: () => void;
  onRevealDone: () => void;
}) {
  const displayed = turn.showSimplified && turn.simplified ? turn.simplified : turn.content;
  const shown = useReveal(displayed, Boolean(turn.revealing), onRevealDone);

  if (turn.role === "user") {
    return (
      <div className="flex animate-fade-up justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground shadow-card">
          {turn.content}
        </div>
      </div>
    );
  }

  const citations = turn.citations ?? [];

  if (turn.error) {
    return (
      <div className="flex animate-fade-up items-start gap-3">
        <AssistantAvatar />
        <div
          role="alert"
          className="flex flex-1 flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{turn.content}</span>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-destructive"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(displayed);
      toast("Answer copied to clipboard.");
    } catch {
      toast("Couldn't access the clipboard.", "error");
    }
  }

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">NyayaGPT</span>
            {citations.length > 0 && <span>· {citations.length} sources</span>}
            {typeof turn.confidence === "number" && turn.confidence > 0 && (
              <Tooltip label="Retrieval confidence (keyword + semantic match strength)">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      turn.confidence >= 0.75 ? "bg-success" : turn.confidence >= 0.5 ? "bg-gold" : "bg-destructive"
                    )}
                  />
                  {Math.round(turn.confidence * 100)}% confidence
                </span>
              </Tooltip>
            )}
            {turn.showSimplified && turn.simplified && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold-soft px-2 py-0.5 font-semibold text-gold-ink">
                <Wand2 className="h-3 w-3" /> Explained simply
              </span>
            )}
          </div>

          <div className="rounded-2xl rounded-tl-md border bg-card px-5 py-4 shadow-card">
            <AnswerMarkdown
              text={shown}
              citations={citations}
              onCite={onCite}
              caret={turn.revealing}
            />
          </div>

          {/* Action row */}
          {!turn.revealing && (
            <div className="flex animate-fade-in flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={turn.simplified ? onToggleVariant : onSimplify}
                disabled={turn.simplifying}
                className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 font-medium text-foreground transition hover:border-gold disabled:opacity-50"
              >
                {turn.simplifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-gold-ink" />}
                {turn.simplifying
                  ? "Simplifying…"
                  : turn.simplified
                    ? turn.showSimplified
                      ? "Show original"
                      : "Show simplified"
                    : "Explain simply"}
              </button>
              <IconAction label="Copy answer" onClick={copy}>
                <Copy className="h-3.5 w-3.5" />
              </IconAction>

              <div className="ml-auto flex items-center gap-1">
                <IconAction
                  label="Helpful"
                  active={turn.feedback === "up"}
                  onClick={() => onFeedback(turn.feedback === "up" ? undefined : "up")}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </IconAction>
                <IconAction
                  label="Not helpful"
                  active={turn.feedback === "down"}
                  onClick={() => onFeedback(turn.feedback === "down" ? undefined : "down")}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </IconAction>
                <IconAction
                  label="Report hallucination"
                  active={turn.feedback === "halluc"}
                  onClick={() => onFeedback(turn.feedback === "halluc" ? undefined : "halluc")}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </IconAction>
              </div>
            </div>
          )}
        </div>
      </div>

      {citations.length > 0 && (
        <div className="ml-11 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sources used
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {citations.map((c, i) => (
              <CitationCard
                key={c.id}
                domId={`cite-${index}-${i + 1}`}
                index={i + 1}
                citation={c}
                highlighted={focusedN === i + 1}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {turn.trace && (
        <TracePanel trace={turn.trace} contextIds={citations.map((c) => c.id)} />
      )}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
          active
            ? "border-gold bg-gold-soft text-gold-ink"
            : "bg-card text-muted-foreground hover:border-gold hover:text-foreground"
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

/* ─── Citations ─────────────────────────────────────────────────────── */

function BookmarkButton({ citation }: { citation: Citation }) {
  const hydrated = useHydrated();
  const bookmarks = useWorkspaceStore((s) => s.bookmarks);
  const addBookmark = useWorkspaceStore((s) => s.addBookmark);
  const removeBookmark = useWorkspaceStore((s) => s.removeBookmark);
  const saved = hydrated && bookmarks.some((b) => b.id === citation.id);

  return (
    <Tooltip label={saved ? "Remove bookmark" : "Bookmark section"}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (saved) {
            removeBookmark(citation.id);
            toast("Bookmark removed.", "info");
          } else {
            addBookmark({
              id: citation.id,
              doc: citation.doc,
              act: citation.act,
              section: citation.section,
              excerpt: citation.excerpt,
              savedAt: new Date().toLocaleDateString(),
            });
            toast("Section bookmarked to your Workspace.");
          }
        }}
        aria-label={saved ? "Remove bookmark" : "Bookmark section"}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md transition",
          saved ? "text-gold-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      </button>
    </Tooltip>
  );
}

function CitationCard({
  domId,
  index,
  citation,
  highlighted,
  compact = false,
  onSelect,
}: {
  domId?: string;
  index: number;
  citation: Citation;
  highlighted?: boolean;
  compact?: boolean;
  onSelect?: () => void;
}) {
  const [open, setOpen] = useState(!compact);

  // Expand when a matching [n] badge is clicked in the answer.
  useEffect(() => {
    if (highlighted) setOpen(true);
  }, [highlighted]);

  return (
    <div
      id={domId}
      className={cn(
        "scroll-mt-24 rounded-xl border bg-card text-xs shadow-card transition",
        highlighted ? "border-gold ring-2 ring-gold/40" : "hover:border-gold/70"
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          onClick={() => {
            setOpen((o) => !o);
            onSelect?.();
          }}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
        >
          <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {index}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-foreground">
              {citation.act ?? citation.doc}
            </span>
            <span className={cn("mt-0.5 block text-muted-foreground", !open && "truncate")}>
              {citation.section}
            </span>
          </span>
          <ChevronDown
            className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition", open && "rotate-180")}
          />
        </button>
        <BookmarkButton citation={citation} />
      </div>

      {open && (
        <div className="animate-fade-in border-t px-3 pb-3 pt-2.5">
          <p className="border-l-2 border-gold pl-2.5 leading-relaxed text-muted-foreground">
            {citation.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {citation.year && <span>{citation.year}</span>}
            <ScoreChip label="Keyword" value={citation.bm25} pct={((citation.bm25 ?? 0) / 8) * 100} title="BM25 keyword score" />
            <ScoreChip
              label="Semantic"
              value={citation.vector}
              pct={((citation.vector ?? 0) - 0.775) / 0.1 * 100}
              title="Vector cosine similarity"
            />
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 font-medium text-gold-ink hover:underline"
              >
                Official source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SourcesPanel({
  turn,
  turnIdx,
  isLatest,
  focusedN,
  loading,
  onSelect,
  onShowLatest,
}: {
  turn?: Turn;
  turnIdx: number | null;
  isLatest: boolean;
  focusedN: number | null;
  loading: boolean;
  onSelect: (n: number) => void;
  onShowLatest: () => void;
}) {
  const citations = turn?.citations ?? [];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gold-ink" />
          <h2 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
            Sources
          </h2>
          {citations.length > 0 && (
            <span className="rounded-full bg-gold-soft px-1.5 text-[11px] font-semibold text-gold-ink">
              {citations.length}
            </span>
          )}
        </div>
        {!isLatest && turnIdx !== null && (
          <button onClick={onShowLatest} className="text-[11px] font-medium text-gold-ink hover:underline">
            Show latest
          </button>
        )}
      </div>

      <div className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-4">
        {loading && isLatest ? (
          <>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        ) : citations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-5 text-center text-xs text-muted-foreground">
            <BookOpen className="mx-auto mb-2 h-5 w-5 text-muted-foreground/60" />
            Retrieved sections will appear here after you ask a question.
            <Link href="/library" className="mt-3 block font-medium text-gold-ink hover:underline">
              Browse the library →
            </Link>
          </div>
        ) : (
          citations.map((c, i) => (
            <CitationCard
              key={`${turnIdx}-${c.id}`}
              index={i + 1}
              citation={c}
              highlighted={focusedN === i + 1}
              compact={focusedN !== i + 1}
              onSelect={() => onSelect(i + 1)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Retrieval trace ───────────────────────────────────────────────── */

function TracePanel({ trace, contextIds }: { trace: RetrievalTrace; contextIds: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-11">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground transition hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        How this answer was generated
      </button>
      {open && (
        <div className="mt-2 animate-fade-in rounded-xl border bg-card/70 p-4 text-xs">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-muted-foreground">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                trace.mode === "hybrid" ? "border-success/30 bg-success/10 text-success" : "border-gold/40 bg-gold-soft text-gold-ink"
              )}
            >
              {trace.mode === "hybrid" ? "Hybrid retrieval" : "BM25 only"}
            </span>
            {trace.mode === "hybrid"
              ? "Keyword and semantic results merged with Reciprocal Rank Fusion."
              : "Semantic search was unavailable for this request, so keyword search was used."}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TraceRow step={1} label={`Keyword · ${trace.bm25.length}`} items={trace.bm25} />
            <TraceRow step={2} label={`Semantic · ${trace.vector.length}`} items={trace.vector} />
            <TraceRow step={3} label={`Fused · ${trace.topRanked.length}`} items={trace.topRanked} />
            <TraceRow
              step={4}
              label={`Sent to LLM · ${contextIds.length}`}
              items={trace.topRanked.filter((r) => contextIds.includes(r.id))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreChip({
  label,
  value,
  pct,
  title,
}: {
  label: string;
  value?: number;
  pct: number;
  title: string;
}) {
  if (value === undefined) return null;
  return (
    <span className="inline-flex items-center gap-1.5" title={title}>
      {label}
      <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-gold"
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </span>
      <span className="font-mono">{value}</span>
    </span>
  );
}

function TraceRow({ step, label, items }: { step: number; label: string; items: RetrievalStep[] }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gold-soft text-[9px] text-gold-ink">
          {step}
        </span>
        {label}
      </div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li
            key={it.id}
            title={it.label}
            className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-1"
          >
            <span className="truncate text-foreground">{it.label}</span>
            <span className="shrink-0 font-mono text-muted-foreground">{it.score}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-muted-foreground">—</li>}
      </ul>
    </div>
  );
}
