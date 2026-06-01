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
  Globe,
  Sparkles,
  Layers,
  GitCompare,
  CheckCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-emblem opacity-[0.04]" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/40 px-3 py-1 text-xs font-medium text-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Source-grounded · Citation-aware · For Indian citizens
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="font-display text-5xl leading-tight text-foreground sm:text-6xl"
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
              className="mt-6 text-lg text-muted-foreground"
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
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-elegant transition hover:opacity-90"
              >
                Start asking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition hover:border-gold"
              >
                Browse the library
              </Link>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="font-semibold text-foreground">10,000+</span>{" "}
                Legal Documents
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Search className="h-4 w-4 text-accent" />
                <span className="font-semibold text-foreground">50,000+</span>{" "}
                Indexed Sections
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-accent" />
                Hybrid Retrieval
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Source Grounded
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-accent" />
                Multilingual
              </span>
            </motion.div>
          </div>

          {/* Example card */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
            className="mx-auto mt-16 max-w-3xl rounded-2xl border bg-card p-6 shadow-elegant"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Example
            </div>
            <p className="mt-2 font-display text-lg text-foreground">
              &ldquo;Am I eligible for PMAY if my annual income is ₹5 lakh?&rdquo;
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-foreground">
              Yes. Households with annual income between ₹3–6 lakh fall under the
              Low Income Group (LIG) category and are eligible for an interest
              subsidy of 6.5% under the Credit Linked Subsidy Scheme
              <sup className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                1
              </sup>
              .
            </div>
            <div className="mt-3 rounded-md border-l-2 border-gold bg-parchment/50 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                [1] PMAY-U Guidelines · Eligibility Criteria (2015)
              </span>
              <br />
              &ldquo;LIG with annual income from Rs. 3 lakh to Rs. 6 lakh… interest
              subsidy of 6.5%…&rdquo;
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp}>
                <Feature icon={f.icon} title={f.title} body={f.body} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Resume-Worthy Section */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">
              Production-grade <span className="text-gradient-gold">architecture</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built with enterprise patterns you&apos;d find in Harvey AI, Perplexity,
              and Notion.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESUME_FEATURES.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm text-foreground"
              >
                <CheckCircle className="h-5 w-5 shrink-0 text-accent" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const FEATURES = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Hybrid retrieval",
    body: "BM25 keyword + dense vector search surface the most relevant sections before generating an answer.",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Every answer cites its source",
    body: "Inline [1][2] citations link back to the exact document, section, and passage.",
  },
  {
    icon: <Languages className="h-5 w-5" />,
    title: "Multilingual",
    body: "Ask in English, हिन्दी, or ਪੰਜਾਬੀ. NyayaGPT detects your language and replies in it.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "No hallucinated sections",
    body: "Answers are generated only from the indexed corpus. If it doesn't know, it says so.",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: "Seeded with key acts",
    body: "RTI 2005, Constitution, PMAY-U, NEP 2020, MGNREGA, and the DPDP Act 2023.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Explain Simply",
    body: "Translate dense legal language into plain English or Hindi anyone can understand.",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Scheme Eligibility",
    body: "Check your eligibility for PMAY, Ayushman Bharat, MGNREGA and more with our rules engine.",
  },
  {
    icon: <GitCompare className="h-5 w-5" />,
    title: "Policy Comparison",
    body: "Compare two schemes, acts or policies side-by-side across eligibility, benefits & more.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Cross-encoder reranking",
    body: "Multi-stage retrieval with reranking ensures the most precise context reaches the LLM.",
  },
];

const RESUME_FEATURES = [
  "Retrieval-Augmented Generation (RAG)",
  "Hybrid Search (BM25 + Vector)",
  "Cross-Encoder Reranking",
  "Citation Grounding",
  "Multilingual Query Processing",
  "Scheme Eligibility Engine",
  "Policy Comparison Engine",
  "Admin Analytics Dashboard",
  "Legal Document Intelligence",
  "Source Traceability",
  "Groq LLM Integration",
  "FastAPI + Next.js Stack",
];

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 transition hover:border-gold hover:shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
