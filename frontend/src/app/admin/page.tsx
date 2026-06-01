"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  ArrowLeft,
  BookOpen,
  Database,
  FileText,
  Gauge,
  LogOut,
  Scale,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { CORPUS } from "@/data/corpus";
import { useRouter } from "next/navigation";

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

export default function AdminPage() {
  const router = useRouter();
  const totalChunks = CORPUS.length;
  const documentsIndexed = useMemo(
    () => new Set(CORPUS.map((c) => c.doc)).size,
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

  // Check auth
  useEffect(() => {
    const isAdmin = localStorage.getItem("nyayagpt-admin");
    if (!isAdmin) {
      router.push("/login");
    }
  }, [router]);

  // Real-time updates
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
  const pieColors = ["#c9a84c", "#8898aa", "#e53e3e"];

  function handleLogout() {
    localStorage.removeItem("nyayagpt-admin");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emblem text-accent">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-foreground">
              Nyaya<span className="text-gradient-gold">GPT</span>
              <span className="ml-2 rounded-md border border-gold/40 bg-accent/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-accent">
                Admin
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm text-foreground transition hover:border-gold"
            >
              <BookOpen className="h-4 w-4" /> Library
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Live
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            Operations dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time view of retrieval, generation, and user feedback for the
            NyayaGPT corpus.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={<FileText className="h-4 w-4" />}
            label="Documents indexed"
            value={documentsIndexed}
          />
          <Kpi
            icon={<Database className="h-4 w-4" />}
            label="Total chunks"
            value={totalChunks}
          />
          <Kpi
            icon={<Users className="h-4 w-4" />}
            label="Active users"
            value={activeUsers}
            live
          />
          <Kpi
            icon={<Gauge className="h-4 w-4" />}
            label="Avg retrieval latency"
            value={`${avgLatency} ms`}
            live
          />
        </div>

        {/* Latency + Feedback split */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="Retrieval latency"
            subtitle="Last 20 requests"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={latency}>
                <defs>
                  <linearGradient id="lat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0d8" />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                />
                <YAxis
                  unit="ms"
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ms"
                  stroke="#c9a84c"
                  fill="url(#lat)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Feedback mix"
            subtitle={`${totalFeedback} signals this week`}
          >
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={feedbackPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {feedbackPie.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Feedback trend + Top queries */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="Feedback trends"
            subtitle="Last 7 days"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0d8" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="helpful"
                  stroke="#c9a84c"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="not"
                  stroke="#8898aa"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="halluc"
                  stroke="#e53e3e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top queries" subtitle="Trending in last hour">
            <ul className="space-y-2">
              {queries.slice(0, 7).map((row, i) => (
                <li
                  key={row.q}
                  className="flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emblem text-[10px] font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span className="truncate text-foreground">{row.q}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Stacked bar + Hallucination */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            title="Daily helpful vs flagged"
            subtitle="Stacked counts"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0d8" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8898aa" }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="helpful" stackId="a" fill="#c9a84c" />
                <Bar dataKey="not" stackId="a" fill="#8898aa" />
                <Bar dataKey="halluc" stackId="a" fill="#e53e3e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Hallucination reports"
            subtitle="Open investigation queue"
          >
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {hallucinations}
                </div>
                <div className="text-xs text-muted-foreground">
                  flagged this week
                </div>
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <ReportRow
                icon={<ThumbsDown className="h-3 w-3" />}
                text="Article 21 — citation mismatch"
                tag="open"
              />
              <ReportRow
                icon={<AlertTriangle className="h-3 w-3" />}
                text="PMAY income limit (Hindi)"
                tag="review"
              />
              <ReportRow
                icon={<ThumbsUp className="h-3 w-3" />}
                text="RTI §7 timeline"
                tag="resolved"
              />
              <ReportRow
                icon={<Activity className="h-3 w-3" />}
                text="DPDP consent — vague answer"
                tag="open"
              />
            </ul>
          </Card>
        </div>

        <p className="pt-2 text-xs text-muted-foreground">
          Demo metrics are simulated in-browser. Connect a database to persist
          real telemetry from the chat, feedback buttons, and retrieval pipeline.
        </p>
      </main>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  live,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  live?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emblem text-accent">
          {icon}
        </span>
        {live && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />{" "}
            live
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-2xl text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-base text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
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
        ? "border-gold/40 text-accent bg-accent/10"
        : "border-border text-muted-foreground bg-background";
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2">
      <span className="flex items-center gap-2 text-foreground">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        {text}
      </span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${tagClass}`}
      >
        {tag}
      </span>
    </li>
  );
}
