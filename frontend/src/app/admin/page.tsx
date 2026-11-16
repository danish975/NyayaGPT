"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  LogOut,
  Search,
  ThumbsDown,
  ThumbsUp,
  Users,
  Server,
  Cpu,
  KeyRound,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge, Skeleton, inputStyles } from "@/components/ui/primitives";
import { useHydrated } from "@/lib/use-hydrated";
import { toast } from "@/components/ui/Toaster";
import { CORPUS } from "@/data/corpus";
import { groupByDocument } from "@/lib/corpus-meta";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type LatencyPoint = { t: string; ms: number };
type Trend = { day: string; helpful: number; not: number; halluc: number };

const SEED_QUERIES = [
  "RTI filing process under Section 6",
  "Article 21 explained simply",
  "PMAY eligibility ₹5 lakh income",
  "MGNREGA guaranteed days of work",
  "DPDP Act consent requirements",
  "NEP 2020 key reforms",
  "Article 19 freedom of speech",
  "RTI 48 hour rule life liberty",
];

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

function nowLabel() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

/* Chart styling read from CSS variables so charts follow light/dark mode. */
const C1 = "var(--chart-1)";
const C2 = "var(--chart-2)";
const C3 = "var(--chart-3)";
const GRID = "var(--chart-grid)";
const AXIS = { fontSize: 11, fill: "var(--chart-axis)" };
const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--popover-foreground)",
  fontSize: 12,
  boxShadow: "var(--shadow-lift)",
};

export default function AdminPage() {
  const router = useRouter();
  const totalChunks = CORPUS.length;
  const documents = useMemo(() => groupByDocument(), []);
  const documentsIndexed = documents.length;
  const totalWords = useMemo(
    () => CORPUS.reduce((a, c) => a + c.text.split(/\s+/).length, 0),
    []
  );

  const [activeUsers, setActiveUsers] = useState(() => rand(40, 90));
  const [latency, setLatency] = useState<LatencyPoint[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: `${i}`,
      ms: rand(380, 720),
    }))
  );
  const [queries, setQueries] = useState(() =>
    SEED_QUERIES.map((q) => ({ q, count: rand(40, 320) })).sort(
      (a, b) => b.count - a.count
    )
  );
  const [trend, setTrend] = useState<Trend[]>(() =>
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      helpful: rand(60, 200),
      not: rand(8, 35),
      halluc: rand(0, 8),
    }))
  );
  const [docQuery, setDocQuery] = useState("");
  // Simulated values are random, so render them only on the client to avoid
  // server/client hydration mismatches.
  const ready = useHydrated();
  const [retrieval, setRetrieval] = useState<{ mode: string; embeddings: string; model: string } | null>(null);

  // Real vector-index status from the server (polls while the model warms up).
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const r = await fetch("/api/retrieval-status", { cache: "no-store" });
        const data = await r.json();
        if (stop) return;
        setRetrieval(data);
        if (data.embeddings === "loading" || data.embeddings === "idle") timer = setTimeout(load, 3000);
      } catch {
        /* leave as unknown */
      }
    };
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, []);

  const vectorLabel = !retrieval
    ? "Checking…"
    : retrieval.embeddings === "ready"
      ? `${retrieval.model.split("/").pop()} · ready`
      : retrieval.embeddings === "loading" || retrieval.embeddings === "idle"
        ? "Loading model…"
        : retrieval.embeddings === "disabled"
          ? "Disabled (HYBRID_RETRIEVAL=off)"
          : "Unavailable · BM25 fallback";

  // Access to this page is enforced server-side by src/middleware.ts.

  // Simulated real-time updates
  useEffect(() => {
    const id = setInterval(() => {
      setActiveUsers((u) => Math.max(20, Math.min(180, u + rand(-6, 8))));
      setLatency((prev) => {
        const next = [...prev.slice(1), { t: nowLabel(), ms: rand(360, 780) }];
        return next;
      });
      setQueries((prev) => {
        const i = rand(0, prev.length);
        return prev
          .map((row, idx) =>
            idx === i ? { ...row, count: row.count + rand(0, 3) } : row
          )
          .sort((a, b) => b.count - a.count);
      });
      setTrend((prev) => {
        const i = prev.length - 1;
        return prev.map((row, idx) =>
          idx === i
            ? {
                ...row,
                helpful: row.helpful + rand(0, 4),
                not: row.not + rand(0, 2),
                halluc: row.halluc + (Math.random() < 0.15 ? 1 : 0),
              }
            : row
        );
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const avgLatency = Math.round(
    latency.reduce((a, b) => a + b.ms, 0) / latency.length
  );
  const totalFeedback = trend.reduce(
    (acc, t) => acc + t.helpful + t.not + t.halluc,
    0
  );
  const hallucinations = trend.reduce((acc, t) => acc + t.halluc, 0);

  const feedbackPie = [
    {
      name: "Helpful",
      value: trend.reduce((a, t) => a + t.helpful, 0),
    },
    { name: "Not helpful", value: trend.reduce((a, t) => a + t.not, 0) },
    { name: "Hallucination", value: hallucinations },
  ];
  const pieColors = [C1, C2, C3];

  const filteredDocs = documents.filter((d) =>
    `${d.doc} ${d.act ?? ""} ${d.category}`.toLowerCase().includes(docQuery.toLowerCase())
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    toast("Signed out.", "info");
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        wide
        badge="Admin"
        hideChatCta
        actions={
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 text-sm text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        }
      />

      <main id="main" className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">Operations dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Corpus, indexing and system status are live. Usage and feedback analytics are simulated until telemetry storage is connected.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Corpus: live
            </Badge>
            <Badge tone="planned">Analytics: simulated</Badge>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={<FileText className="h-4 w-4" />} label="Documents indexed" value={documentsIndexed} hint={`${totalWords.toLocaleString()} words`} />
          <Kpi icon={<Database className="h-4 w-4" />} label="Total chunks" value={totalChunks} hint="BM25, in-memory" />
          <Kpi icon={<Users className="h-4 w-4" />} label="Active users" value={ready ? activeUsers : "—"} simulated />
          <Kpi icon={<Gauge className="h-4 w-4" />} label="Avg retrieval latency" value={ready ? `${avgLatency} ms` : "—"} simulated />
        </div>

        {/* Document management + indexing */}
        <div className="grid gap-6 xl:grid-cols-3">
          <Card
            title="Document management"
            subtitle={`${documentsIndexed} documents · ${totalChunks} sections`}
            className="xl:col-span-2"
            action={
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <label htmlFor="doc-filter" className="sr-only">Filter documents</label>
                <input
                  id="doc-filter"
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  placeholder="Filter documents…"
                  className={cn(inputStyles, "py-1.5 pl-8 text-xs")}
                />
              </div>
            }
          >
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-y bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-5 py-2.5 font-semibold">Document</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Category</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Sections</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Year</th>
                    <th scope="col" className="px-5 py-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((d) => (
                    <tr key={d.doc} className="border-b transition last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground">{d.doc}</div>
                        {d.url && (
                          <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold-ink">
                            {new URL(d.url).hostname} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3"><Badge tone="gold">{d.category}</Badge></td>
                      <td className="px-3 py-3 text-right font-mono text-foreground">{d.chunks.length}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{d.year ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Indexed
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No documents match “{docQuery}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Indexing status" subtitle="Live configuration">
              <ul className="space-y-3 text-sm">
                <StatusRow icon={<Database className="h-4 w-4" />} label="Keyword index" value="BM25 · in-memory" ok />
                <StatusRow icon={<Search className="h-4 w-4" />} label="Vector index" value={vectorLabel} ok={retrieval?.embeddings === "ready"} />
                <StatusRow
                  icon={<Activity className="h-4 w-4" />}
                  label="Retrieval mode"
                  value={retrieval?.mode === "hybrid" ? "Hybrid (RRF)" : retrieval?.mode === "warming" ? "BM25 (warming up)" : "BM25 only"}
                  ok={retrieval?.mode === "hybrid"}
                />
                <StatusRow icon={<Cpu className="h-4 w-4" />} label="LLM" value="Groq (server-side)" ok />
                <StatusRow icon={<KeyRound className="h-4 w-4" />} label="Endpoints" value="Signed · rate-limited" ok />
              </ul>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>Sections indexed</span>
                  <span className="font-mono text-foreground">{totalChunks}/{totalChunks}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full rounded-full bg-success" />
                </div>
              </div>
            </Card>

            <Card title="Upload documents" subtitle="Add PDFs or text to the corpus">
              <div
                aria-disabled="true"
                className="flex flex-col items-center rounded-xl border-2 border-dashed bg-muted/30 px-4 py-6 text-center"
              >
                <CloudUpload className="h-7 w-7 text-muted-foreground" />
                <div className="mt-2 text-sm font-medium text-foreground">Uploads unavailable</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  The corpus is bundled at build time (<code className="font-mono">src/data/corpus.ts</code>).
                  Uploading requires a storage and indexing backend, which this deployment doesn&apos;t have.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {!ready ? (
          <div className="grid gap-6 xl:grid-cols-3">
            <Skeleton className="h-[320px] rounded-2xl xl:col-span-2" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </div>
        ) : (
        <>
        {/* Latency + Feedback split */}
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Retrieval latency" subtitle="Last 20 requests" className="xl:col-span-2" simulated>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={latency} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="lat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C1} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={C1} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="t" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis unit="ms" tick={AXIS} width={60} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: GRID }} />
                <Area type="monotone" dataKey="ms" stroke={C1} fill="url(#lat)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Feedback mix" subtitle={`${totalFeedback} signals this week`} simulated>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={feedbackPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="var(--card)"
                  isAnimationActive={false}
                >
                  {feedbackPie.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Feedback trend + Top queries */}
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Feedback trends" subtitle="Last 7 days" className="xl:col-span-2" simulated>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} width={40} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: GRID }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
                <Line type="monotone" dataKey="helpful" stroke={C1} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="not" stroke={C2} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="halluc" stroke={C3} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top queries" subtitle="Trending in last hour" simulated>
            <ul className="space-y-2">
              {queries.slice(0, 7).map((row, i) => {
                const max = queries[0]?.count || 1;
                return (
                  <li key={row.q} className="relative overflow-hidden rounded-lg border bg-background px-3 py-2 text-sm">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-gold-soft transition-all duration-500"
                      style={{ width: `${(row.count / max) * 100}%` }}
                    />
                    <span className="relative flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-semibold text-primary-foreground">
                          {i + 1}
                        </span>
                        <span className="truncate text-foreground">{row.q}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">{row.count}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Stacked bar + Hallucination */}
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Daily helpful vs flagged" subtitle="Stacked counts" className="xl:col-span-2" simulated>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} width={40} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
                <Bar dataKey="helpful" stackId="a" fill={C1} />
                <Bar dataKey="not" stackId="a" fill={C2} />
                <Bar dataKey="halluc" stackId="a" fill={C3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Hallucination reports" subtitle="Open investigation queue" simulated>
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-display text-2xl text-foreground">{hallucinations}</div>
                <div className="text-xs text-muted-foreground">flagged this week</div>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <ReportRow icon={<ThumbsDown className="h-3 w-3" />} text="Article 21 — citation mismatch" tag="open" />
              <ReportRow icon={<AlertTriangle className="h-3 w-3" />} text="PMAY income limit (Hindi)" tag="review" />
              <ReportRow icon={<ThumbsUp className="h-3 w-3" />} text="RTI §7 timeline" tag="resolved" />
              <ReportRow icon={<Activity className="h-3 w-3" />} text="DPDP consent — vague answer" tag="open" />
            </ul>
          </Card>
        </div>

        </>
        )}

        <p className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <Server className="h-3.5 w-3.5" />
          Cards marked “Simulated” are generated in the browser. Connect a database to persist real telemetry from the chat, feedback buttons, and retrieval pipeline.
        </p>
      </main>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  simulated,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  simulated?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emblem text-accent shadow-card">
          {icon}
        </span>
        {simulated ? (
          <Badge tone="planned">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" /> Simulated
          </Badge>
        ) : (
          <Badge tone="success">Live</Badge>
        )}
      </div>
      <div className="mt-4 font-display text-3xl text-foreground">{value}</div>
      <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = "",
  action,
  simulated,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  simulated?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-sm font-semibold text-foreground">{title}</h2>
            {simulated && <Badge tone="planned">Simulated</Badge>}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusRow({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", ok ? "text-success" : "text-muted-foreground")}>
        <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-success" : "bg-muted-foreground/50")} />
        {value}
      </span>
    </li>
  );
}

function ReportRow({
  icon,
  text,
  tag,
}: {
  icon: React.ReactNode;
  text: string;
  tag: "open" | "review" | "resolved";
}) {
  const tagClass =
    tag === "open"
      ? "border-destructive/40 text-destructive bg-destructive/5"
      : tag === "review"
        ? "border-gold/40 text-gold-ink bg-gold-soft"
        : "border-border text-muted-foreground bg-background";
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-foreground">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <span className="truncate">{text}</span>
      </span>
      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider", tagClass)}>
        {tag}
      </span>
    </li>
  );
}
