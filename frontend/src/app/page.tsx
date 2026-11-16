"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  BookOpen,
  Search,
  Languages,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  GitCompare,
  CheckCircle,
  Quote,
  MessageSquareText,
  Filter,
  Database,
  ListOrdered,
  Boxes,
  Cpu,
  BadgeCheck,
  FileCheck2,
  BadgeIndianRupee,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/primitives";
import { CORPUS } from "@/data/corpus";
import { cn } from "@/lib/utils";

const DOCUMENT_COUNT = new Set(CORPUS.map((c) => c.act ?? c.doc)).size;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
          <div
            aria-hidden
            className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
          />
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-card"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-gold-ink" />
                Source-grounded · Citation-aware · For Indian citizens
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                custom={1}
                variants={fadeUp}
                className="font-display text-[2.6rem] leading-[1.08] text-foreground sm:text-6xl lg:text-7xl"
              >
                India&apos;s laws and schemes,
                <br />
                <span className="text-gradient-gold">explained with citations.</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                custom={2}
                variants={fadeUp}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
              >
                NyayaGPT is a retrieval-augmented assistant that answers questions
                about the Constitution, public policies, and welfare schemes — and
                shows you the exact section it learned from.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                custom={3}
                variants={fadeUp}
                className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Link
                  href="/chat"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground shadow-elegant transition hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
                >
                  Start asking <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/library"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-7 py-3.5 text-base font-medium text-foreground shadow-card transition hover:-translate-y-0.5 hover:border-gold sm:w-auto"
                >
                  Browse the library
                </Link>
              </motion.div>

              {/* Trust metrics (real counts from the indexed corpus) */}
              <motion.dl
                initial="hidden"
                animate="visible"
                custom={4}
                variants={fadeUp}
                className="mx-auto mt-12 grid max-w-3xl grid-cols-2 overflow-hidden rounded-2xl border bg-card/80 shadow-card sm:grid-cols-4"
              >
                <Stat icon={<BookOpen className="h-4 w-4" />} value={String(DOCUMENT_COUNT)} label="Acts & schemes" />
                <Stat icon={<Search className="h-4 w-4" />} value={String(CORPUS.length)} label="Indexed sections" />
                <Stat icon={<Quote className="h-4 w-4" />} value="Top 3" label="Sources per answer" />
                <Stat icon={<Languages className="h-4 w-4" />} value="EN · हि · ਪੰ" label="Reply languages" />
              </motion.dl>
            </div>

            {/* Example card */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={fadeUp}
              className="mx-auto mt-16 max-w-3xl rounded-2xl border bg-card p-6 shadow-elegant transition hover:shadow-lift sm:p-7"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Example
                </div>
                <Badge tone="gold">
                  <Quote className="h-3 w-3" /> 1 source
                </Badge>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <MessageSquareText className="h-4 w-4" />
                </span>
                <p className="font-display text-lg text-foreground">
                  &ldquo;Am I eligible for PMAY if my annual income is ₹5 lakh?&rdquo;
                </p>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emblem text-accent">
                  <Scale className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground">
                  Likely yes. Under PMAY-U 2.0, households with annual income between
                  ₹3–6 lakh fall in the Low Income Group (LIG) category, provided the
                  family does not own a pucca house anywhere in India
                  <sup className="mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-gold/50 bg-gold-soft px-1 text-[10px] font-bold text-gold-ink">
                    1
                  </sup>
                  .
                </div>
              </div>
              <div className="ml-11 mt-3 rounded-lg border-l-2 border-gold bg-parchment p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  [1] PMAY-U 2.0 Guidelines · Eligibility and Interest Subsidy Scheme (2024)
                </span>
                <br />
                &ldquo;…LIG (₹3–6 lakh) and MIG (₹6–9 lakh) households that do not
                own a pucca house anywhere in India…&rdquo;
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <SectionHeading
              eyebrow="Capabilities"
              title="Built for clarity, grounded in law"
              description="Every capability is designed around one principle: an answer is only as good as the source you can check it against."
            />
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} custom={i} variants={fadeUp} className="h-full">
                  <Feature {...f} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Architecture */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <SectionHeading
              eyebrow="Architecture"
              title="How a question becomes a cited answer"
              description="The retrieval-augmented pipeline behind every response. Stages marked “Planned” are on the roadmap and not yet part of the live system."
            />
            <Pipeline />
          </div>
        </section>

        {/* Stack */}
        <section className="border-t bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <SectionHeading
              eyebrow="Engineering"
              title="Production-grade foundations"
              description="Security, transparency and accessibility built in from the start."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RESUME_FEATURES.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm text-foreground shadow-card transition hover:border-gold/60"
                >
                  <CheckCircle className="h-5 w-5 shrink-0 text-gold-ink" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-emblem px-6 py-14 text-center shadow-elegant sm:px-12">
              <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
              <h2 className="relative font-display text-3xl text-white sm:text-4xl">
                Ask your first question in seconds
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-white/70">
                No sign-up required. Answers are cited, and your research stays in your browser.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-gold transition hover:-translate-y-0.5"
                >
                  Open NyayaGPT <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/eligibility"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
                >
                  Check scheme eligibility
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-r px-3 py-4 last:border-r-0 sm:border-b-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r [&:nth-child(n+3)]:border-b-0">
      <dt className="order-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-gold-ink">{icon}</span>
        {label}
      </dt>
      <dd className="order-1 whitespace-nowrap font-display text-2xl text-foreground">{value}</dd>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{description}</p>
    </div>
  );
}

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  body: string;
  planned?: boolean;
  href?: string;
};

function Feature({ icon, title, body, planned, href }: FeatureItem) {
  const inner = (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-card transition duration-300",
        "hover:-translate-y-1 hover:border-gold/70 hover:shadow-lift"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold-soft text-gold-ink transition group-hover:bg-accent group-hover:text-accent-foreground">
          {icon}
        </div>
        {planned ? <Badge tone="planned">Planned</Badge> : <Badge tone="success">Live</Badge>}
      </div>
      <h3 className="mt-5 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-ink">
          Try it <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full rounded-2xl">
      {inner}
    </Link>
  ) : (
    inner
  );
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Hybrid retrieval",
    body: "BM25 keyword search and multilingual vector search, merged with Reciprocal Rank Fusion — so paraphrases and Hindi or Punjabi questions find the right section.",
    href: "/chat",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Citation grounding",
    body: "Inline [1][2] citations link back to the exact document, section, and passage the answer was built from.",
    href: "/chat",
  },
  {
    icon: <Languages className="h-5 w-5" />,
    title: "Multilingual support",
    body: "Ask in English, हिन्दी, or ਪੰਜਾਬੀ. NyayaGPT detects your language and replies in it.",
    href: "/chat",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Legal simplification",
    body: "“Explain simply” rewrites dense legal language in plain words while keeping every citation in place.",
    href: "/chat",
  },
  {
    icon: <BadgeIndianRupee className="h-5 w-5" />,
    title: "Scheme eligibility",
    body: "Check PMAY, Ayushman Bharat, MGNREGA and more with a transparent rules engine and the documents you’ll need.",
    href: "/eligibility",
  },
  {
    icon: <GitCompare className="h-5 w-5" />,
    title: "Policy comparison",
    body: "Compare two schemes or acts side-by-side across objective, benefits, eligibility and duration — then export.",
    href: "/compare",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Cross-encoder reranking",
    body: "A second-stage reranker will rescore candidate sections so only the most precise context reaches the LLM.",
    planned: true,
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "No hallucinated sections",
    body: "Answers are generated only from retrieved sources. If the corpus doesn’t cover it, NyayaGPT says so.",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: "Seeded with key acts",
    body: "The Constitution, RTI 2005, DPDP 2023, PMAY-U, MGNREGA, NEP 2020 and Ayushman Bharat PM-JAY.",
    href: "/library",
  },
];

type Stage = { icon: React.ReactNode; title: string; detail: string; planned?: boolean };

const PIPELINE: Stage[] = [
  { icon: <MessageSquareText className="h-4 w-4" />, title: "User query", detail: "Question in English, Hindi or Punjabi" },
  { icon: <Filter className="h-4 w-4" />, title: "Query processing", detail: "Tokenise, normalise, drop stop-words" },
  { icon: <Database className="h-4 w-4" />, title: "BM25 + vector search", detail: "Keyword + multilingual semantic search, fused with RRF" },
  { icon: <ListOrdered className="h-4 w-4" />, title: "Cross-encoder reranking", detail: "Rescore top candidates", planned: true },
  { icon: <Boxes className="h-4 w-4" />, title: "Context assembly", detail: "Top 3 sections, numbered [1]–[3]" },
  { icon: <Cpu className="h-4 w-4" />, title: "LLM generation", detail: "Groq-hosted model, sources-only prompt" },
  { icon: <BadgeCheck className="h-4 w-4" />, title: "Citation validation", detail: "Verify every [n] maps to a source", planned: true },
  { icon: <FileCheck2 className="h-4 w-4" />, title: "Final answer", detail: "Cited answer + retrieval trace" },
];

function Pipeline() {
  return (
    <motion.ol
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {PIPELINE.map((s, i) => (
        <motion.li key={s.title} custom={i} variants={fadeUp} className="relative">
          <div
            className={cn(
              "group relative flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
              s.planned ? "border-dashed" : "hover:border-gold/70"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                  s.planned ? "bg-muted text-muted-foreground" : "bg-emblem text-accent shadow-card"
                )}
              >
                {s.icon}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-4 font-sans text-sm font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.detail}</p>
            {s.planned && <Badge tone="planned" className="mt-3 self-start">Planned</Badge>}
          </div>
          {/* Connector to the next node (horizontal on large screens, vertical on mobile) */}
          {i < PIPELINE.length - 1 && (
            <>
              <span
                aria-hidden
                className={cn(
                  "flow-line absolute -right-4 top-1/2 hidden h-0.5 w-4 -translate-y-1/2 lg:block",
                  (i + 1) % 4 === 0 && "lg:hidden"
                )}
              />
              <span
                aria-hidden
                className="absolute -bottom-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-gold/50 sm:hidden"
              />
            </>
          )}
        </motion.li>
      ))}
    </motion.ol>
  );
}

const RESUME_FEATURES = [
  "Retrieval-Augmented Generation (RAG)",
  "Hybrid search (BM25 + vectors, RRF)",
  "Citation grounding & retrieval trace",
  "Multilingual answers",
  "Scheme eligibility rules engine",
  "Policy comparison & Markdown export",
  "HMAC-signed admin sessions",
  "Rate-limited, signed AI endpoints",
  "Groq LLM integration",
  "Next.js App Router full-stack",
  "Dark mode & responsive design",
  "Keyboard-accessible UI",
];
