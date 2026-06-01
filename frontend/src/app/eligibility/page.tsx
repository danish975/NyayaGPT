"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  FileCheck2,
  Scale,
  Sparkles,
} from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { CORPUS } from "@/data/corpus";

type Gender = "female" | "male" | "other";
type Occupation =
  | "farmer"
  | "rural_labour"
  | "salaried"
  | "self_employed"
  | "student"
  | "unemployed"
  | "homemaker"
  | "senior";

type Profile = {
  state: string;
  age: number;
  gender: Gender;
  income: number;
  occupation: Occupation;
};

type Rule = (p: Profile) => {
  eligible: boolean;
  reasons: string[];
  confidence: number;
};

type Scheme = {
  id: string;
  name: string;
  ministry: string;
  documents: string[];
  source: { label: string; url: string };
  corpusId?: string;
  rule: Rule;
};

const SCHEMES: Scheme[] = [
  {
    id: "pmay-u",
    name: "Pradhan Mantri Awas Yojana (Urban)",
    ministry: "Ministry of Housing & Urban Affairs",
    documents: [
      "Aadhaar",
      "Income certificate",
      "Bank account details",
      "Affidavit of no pucca house",
    ],
    source: { label: "pmay-urban.gov.in", url: "https://pmay-urban.gov.in/" },
    corpusId: "pmay-elig",
    rule: (p) => {
      const reasons: string[] = [];
      let conf = 0.4;
      if (p.income <= 1_800_000) {
        if (p.income <= 300_000) {
          reasons.push("Income ≤ ₹3L qualifies you for EWS slab");
          conf += 0.35;
        } else if (p.income <= 600_000) {
          reasons.push("Income in ₹3–6L bracket → LIG slab");
          conf += 0.3;
        } else if (p.income <= 1_200_000) {
          reasons.push("Income in ₹6–12L bracket → MIG-I slab");
          conf += 0.2;
        } else {
          reasons.push("Income in ₹12–18L bracket → MIG-II slab");
          conf += 0.15;
        }
      } else {
        return {
          eligible: false,
          reasons: ["Income above ₹18L exceeds MIG-II ceiling"],
          confidence: 0.9,
        };
      }
      if (p.gender === "female") {
        reasons.push("Female ownership preference under EWS/LIG");
        conf += 0.1;
      }
      if (p.age >= 18) {
        conf += 0.05;
        reasons.push("Adult applicant");
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.95) };
    },
  },
  {
    id: "mgnrega",
    name: "MGNREGA — 100 days guaranteed wage employment",
    ministry: "Ministry of Rural Development",
    documents: [
      "Aadhaar",
      "Job card application",
      "Bank/Post Office account",
      "Residence proof",
    ],
    source: { label: "nrega.nic.in", url: "https://nrega.nic.in/" },
    corpusId: "nrega-100",
    rule: (p) => {
      if (p.age < 18)
        return {
          eligible: false,
          reasons: ["MGNREGA requires adult (18+) household member"],
          confidence: 0.95,
        };
      const reasons = [
        "Adult member of a rural household can demand unskilled manual work",
      ];
      let conf = 0.5;
      if (
        p.occupation === "rural_labour" ||
        p.occupation === "farmer" ||
        p.occupation === "unemployed"
      ) {
        reasons.push(
          `Occupation '${p.occupation.replace("_", " ")}' aligns with MGNREGA's target group`
        );
        conf += 0.3;
      }
      if (p.income <= 300_000) {
        reasons.push("Low household income strengthens need-based eligibility");
        conf += 0.1;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.92) };
    },
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi (₹6,000/yr)",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    documents: [
      "Aadhaar",
      "Land records (Khasra/Khatauni)",
      "Bank account linked to Aadhaar",
    ],
    source: { label: "pmkisan.gov.in", url: "https://pmkisan.gov.in/" },
    rule: (p) => {
      if (p.occupation !== "farmer")
        return {
          eligible: false,
          reasons: ["Scheme limited to landholding farmer families"],
          confidence: 0.9,
        };
      if (p.age < 18)
        return {
          eligible: false,
          reasons: ["Applicant must be an adult land-owner"],
          confidence: 0.9,
        };
      const reasons = [
        "Landholding farmer family — eligible for ₹6,000 annual income support",
      ];
      let conf = 0.75;
      if (p.income <= 600_000) {
        reasons.push("Below typical exclusion thresholds");
        conf += 0.1;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.9) };
    },
  },
  {
    id: "ayushman",
    name: "Ayushman Bharat PM-JAY (₹5L health cover)",
    ministry: "National Health Authority",
    documents: [
      "Aadhaar",
      "Ration card",
      "SECC-2011 verification",
      "Mobile number",
    ],
    source: { label: "pmjay.gov.in", url: "https://pmjay.gov.in/" },
    rule: (p) => {
      const reasons: string[] = [];
      let conf = 0.3;
      if (p.income <= 250_000) {
        reasons.push(
          "Household income suggests SECC deprivation criteria likely met"
        );
        conf += 0.45;
      } else if (p.income <= 500_000) {
        reasons.push("Income near threshold — verify SECC-2011 listing");
        conf += 0.2;
      } else
        return {
          eligible: false,
          reasons: ["Household income above typical PM-JAY threshold"],
          confidence: 0.85,
        };
      if (
        p.occupation === "rural_labour" ||
        p.occupation === "unemployed" ||
        p.occupation === "homemaker"
      ) {
        reasons.push(
          "Occupation profile commonly covered under SECC deprivation categories"
        );
        conf += 0.15;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.9) };
    },
  },
  {
    id: "ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana (LPG connection)",
    ministry: "Ministry of Petroleum & Natural Gas",
    documents: [
      "Aadhaar",
      "Ration card",
      "Bank account",
      "BPL declaration / SECC inclusion",
    ],
    source: { label: "pmuy.gov.in", url: "https://www.pmuy.gov.in/" },
    rule: (p) => {
      if (p.gender !== "female")
        return {
          eligible: false,
          reasons: [
            "Connection is issued in the name of an adult woman of the household",
          ],
          confidence: 0.95,
        };
      if (p.age < 18)
        return {
          eligible: false,
          reasons: ["Applicant woman must be 18+"],
          confidence: 0.95,
        };
      const reasons = ["Adult woman applicant — primary criterion met"];
      let conf = 0.6;
      if (p.income <= 300_000) {
        reasons.push(
          "Low-income household — typically included in SECC list"
        );
        conf += 0.25;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.9) };
    },
  },
  {
    id: "nsap-old-age",
    name: "Indira Gandhi National Old Age Pension (IGNOAPS)",
    ministry: "Ministry of Rural Development",
    documents: [
      "Aadhaar",
      "Age proof",
      "BPL certificate",
      "Bank/Post Office account",
    ],
    source: { label: "nsap.nic.in", url: "https://nsap.nic.in/" },
    rule: (p) => {
      if (p.age < 60)
        return {
          eligible: false,
          reasons: ["IGNOAPS requires age 60 or above"],
          confidence: 0.98,
        };
      const reasons = ["Age 60+ qualifies for old-age pension"];
      let conf = 0.7;
      if (p.income <= 300_000) {
        reasons.push(
          "Below-poverty-line income strengthens eligibility"
        );
        conf += 0.2;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.95) };
    },
  },
  {
    id: "sukanya",
    name: "Sukanya Samriddhi Yojana (girl child savings)",
    ministry: "Ministry of Finance · India Post",
    documents: [
      "Birth certificate of girl",
      "Aadhaar of guardian",
      "Address proof",
    ],
    source: {
      label: "nsiindia.gov.in",
      url: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
    },
    rule: (p) => {
      if (p.gender === "female" && p.age <= 10) {
        return {
          eligible: true,
          reasons: ["Girl child under 10 years can open SSY account"],
          confidence: 0.95,
        };
      }
      return {
        eligible: false,
        reasons: ["Account is opened for a girl child below 10 years"],
        confidence: 0.95,
      };
    },
  },
  {
    id: "skill-india",
    name: "PMKVY — Skill India training & certification",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    documents: ["Aadhaar", "Educational certificates", "Bank account"],
    source: {
      label: "pmkvyofficial.org",
      url: "https://www.pmkvyofficial.org/",
    },
    rule: (p) => {
      if (p.age < 15 || p.age > 45)
        return {
          eligible: false,
          reasons: ["Targets youth aged 15–45"],
          confidence: 0.9,
        };
      const reasons = [
        `Age ${p.age} falls in PMKVY target window (15–45)`,
      ];
      let conf = 0.6;
      if (p.occupation === "unemployed" || p.occupation === "student") {
        reasons.push(
          "Unemployed/student profile fits short-term training cohort"
        );
        conf += 0.2;
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.9) };
    },
  },
];

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function EligibilityPage() {
  const [profile, setProfile] = useState<Profile>({
    state: "Maharashtra",
    age: 30,
    gender: "female",
    income: 250_000,
    occupation: "self_employed",
  });
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    return SCHEMES.map((s) => {
      const r = s.rule(profile);
      const chunk = s.corpusId
        ? CORPUS.find((c) => c.id === s.corpusId)
        : undefined;
      return { scheme: s, ...r, chunk };
    }).sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.confidence - a.confidence
    );
  }, [profile]);

  const eligibleCount = results.filter((r) => r.eligible).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emblem text-accent">
              <Scale className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold text-foreground">
              Nyaya<span className="text-gradient-gold">GPT</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/40 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Rules + retrieval · Citation-aware
          </div>
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">
            Scheme Eligibility{" "}
            <span className="text-gradient-gold">Checker</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Answer five quick questions. We combine a deterministic rules engine
            with retrieval over official scheme guidelines to surface programmes
            you likely qualify for — with reasons, documents, and the source you
            can verify.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <form
            className="h-fit rounded-xl border bg-card p-5 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <h2 className="font-display text-lg text-foreground">
              Your profile
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Information stays in your browser.
            </p>

            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                State
              </span>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={profile.state}
                onChange={(e) =>
                  setProfile({ ...profile, state: e.target.value })
                }
              >
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Age
                </span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({ ...profile, age: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Gender
                </span>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={profile.gender}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      gender: e.target.value as Gender,
                    })
                  }
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Annual household income</span>
                <span className="font-mono text-foreground">
                  {formatINR(profile.income)}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={2_000_000}
                step={10_000}
                className="w-full accent-accent"
                value={profile.income}
                onChange={(e) =>
                  setProfile({ ...profile, income: Number(e.target.value) })
                }
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Occupation
              </span>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={profile.occupation}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    occupation: e.target.value as Occupation,
                  })
                }
              >
                <option value="farmer">Farmer (landholding)</option>
                <option value="rural_labour">Rural labour</option>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self-employed</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
                <option value="homemaker">Homemaker</option>
                <option value="senior">Senior citizen</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <BadgeCheck className="h-4 w-4" /> Check eligibility
            </button>
            {submitted && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {eligibleCount} of {results.length} schemes match your profile.
              </p>
            )}
          </form>

          {/* Results */}
          <section className="space-y-4">
            {results.map(({ scheme, eligible, reasons, confidence, chunk }) => (
              <article
                key={scheme.id}
                className={`rounded-xl border bg-card p-5 shadow-sm transition ${
                  eligible ? "" : "opacity-60"
                }`}
              >
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          eligible
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {eligible ? "Eligible" : "Not eligible"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {scheme.ministry}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-lg text-foreground">
                      {scheme.name}
                    </h3>
                  </div>
                  <ConfidenceMeter value={confidence} />
                </header>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Why
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground">
                      {reasons.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Required documents
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground">
                      {scheme.documents.map((d) => (
                        <li key={d} className="flex gap-2">
                          <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
                  <a
                    href={scheme.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    Official source · {scheme.source.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {chunk && (
                    <span className="text-muted-foreground">
                      Retrieved:{" "}
                      <span className="text-foreground">{chunk.doc}</span> ·{" "}
                      {chunk.section}
                    </span>
                  )}
                </footer>
              </article>
            ))}
          </section>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Disclaimer: This tool gives an indicative match using public scheme
          guidelines. Final eligibility is determined by the issuing authority.
          Always verify on the official portal.
        </p>
      </main>
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="w-32 shrink-0">
      <div className="mb-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <span>Confidence</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
