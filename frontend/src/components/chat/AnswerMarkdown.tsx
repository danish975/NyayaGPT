"use client";

import type { Citation } from "@/store/chat-store";

/**
 * Minimal, safe markdown renderer for LLM answers (no HTML injection).
 * Supports headings, bullet/numbered lists, simple tables, **bold**,
 * *italic*, `code`, and [n] / [1, 2] citation markers.
 */

type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul" | "ol"; items: { text: string; depth: number }[] }
  | { kind: "table"; rows: string[][] };

/** Matches a markdown table separator row such as `|---|:---:|`. */
const TABLE_SEPARATOR = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];

  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join("\n") });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      flush();
      continue;
    }

    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ kind: "h", text: heading[1] });
      continue;
    }

    if (line.trim().startsWith("|")) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim();
        if (!TABLE_SEPARATOR.test(row)) {
          rows.push(
            row
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((c) => c.trim())
          );
        }
        i++;
      }
      i--;
      if (rows.length) blocks.push({ kind: "table", rows });
      continue;
    }

    const bullet = raw.match(/^(\s*)[-*•]\s+(.*)$/);
    const numbered = raw.match(/^(\s*)\d+[.)]\s+(.*)$/);
    const item = bullet ?? numbered;
    if (item) {
      flush();
      const kind = bullet ? "ul" : "ol";
      const depth = Math.min(2, Math.floor(item[1].replace(/\t/g, "  ").length / 2));
      const last = blocks[blocks.length - 1];
      if (last && last.kind === kind) last.items.push({ text: item[2], depth });
      else blocks.push({ kind, items: [{ text: item[2], depth }] });
      continue;
    }

    para.push(line.trim());
  }
  flush();
  return blocks;
}

// Citations may come as [1], [1, 2] or full-width 【1】 (some models use the latter).
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|[[【]\d+(?:\s*,\s*\d+)*[\]】]|\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)/g;

function Inline({
  text,
  citations,
  onCite,
}: {
  text: string;
  citations: Citation[];
  onCite: (n: number) => void;
}) {
  const parts = text.split(INLINE);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
              {p.slice(1, -1)}
            </code>
          );
        const cite = p.match(/^[[【](\d+(?:\s*,\s*\d+)*)[\]】]$/);
        if (cite) {
          return (
            <span key={i} className="whitespace-nowrap">
              {cite[1].split(",").map((s) => {
                const n = parseInt(s.trim(), 10);
                const c = citations[n - 1];
                return (
                  <CiteBadge key={`${i}-${n}`} n={n} citation={c} onClick={() => onCite(n)} />
                );
              })}
            </span>
          );
        }
        if ((p.startsWith("*") && p.endsWith("*")) || (p.startsWith("_") && p.endsWith("_")))
          return (
            <em key={i} className="text-muted-foreground">
              {p.slice(1, -1)}
            </em>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function CiteBadge({
  n,
  citation,
  onClick,
}: {
  n: number;
  citation?: Citation;
  onClick: () => void;
}) {
  const label = citation ? `${citation.act ?? citation.doc} — ${citation.section}` : `Source ${n}`;
  return (
    <span className="group/cite relative inline-flex align-baseline">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Open source ${n}: ${label}`}
        className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-px items-center justify-center rounded-md border border-gold/50 bg-gold-soft px-1 text-[10px] font-bold text-gold-ink transition hover:border-gold hover:bg-accent hover:text-accent-foreground"
      >
        {n}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-1.5 w-max max-w-[260px] -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-[11px] font-medium leading-snug text-primary-foreground opacity-0 shadow-lift transition-opacity group-hover/cite:opacity-100 group-focus-within/cite:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

export function AnswerMarkdown({
  text,
  citations,
  onCite,
  caret,
}: {
  text: string;
  citations: Citation[];
  onCite: (n: number) => void;
  caret?: boolean;
}) {
  const blocks = parseBlocks(text);
  const inline = (t: string) => <Inline text={t} citations={citations} onCite={onCite} />;

  return (
    <div className="space-y-3 text-[15px] leading-7 text-foreground/90">
      {blocks.map((b, i) => {
        const isLast = i === blocks.length - 1;
        const tail = caret && isLast ? <Caret /> : null;
        switch (b.kind) {
          case "h":
            return (
              <h4 key={i} className="pt-1 font-sans text-base font-semibold text-foreground">
                {inline(b.text)}
                {tail}
              </h4>
            );
          case "ul":
          case "ol": {
            const List = b.kind === "ul" ? "ul" : "ol";
            return (
              <List
                key={i}
                className={
                  b.kind === "ul"
                    ? "space-y-1.5 pl-1"
                    : "list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-gold-ink"
                }
              >
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className={b.kind === "ul" ? "flex gap-2.5" : "pl-1"}
                    style={it.depth ? { marginLeft: it.depth * 18 } : undefined}
                  >
                    {b.kind === "ul" && (
                      <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    )}
                    <span>
                      {inline(it.text)}
                      {isLast && j === b.items.length - 1 ? tail : null}
                    </span>
                  </li>
                ))}
              </List>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      {b.rows[0].map((c, j) => (
                        <th key={j} className="px-3 py-2 text-left font-semibold text-foreground">
                          {inline(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.slice(1).map((r, j) => (
                      <tr key={j} className="border-t">
                        {r.map((c, k) => (
                          <td key={k} className="px-3 py-2 align-top">
                            {inline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <p key={i} className="whitespace-pre-line">
                {inline(b.text)}
                {tail}
              </p>
            );
        }
      })}
      {blocks.length === 0 && caret && <Caret />}
    </div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-4 w-[7px] translate-y-0.5 animate-pulse rounded-sm bg-gold"
    />
  );
}
