"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  ExternalLink,
  FileCheck2,
  Info,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader, buttonStyles, inputStyles } from "@/components/ui/primitives";
import { CORPUS } from "@/data/corpus";
import { cn } from "@/lib/utils";

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
    name: "Pradhan Mantri Awas Yojana (Urban) 2.0",
    ministry: "Ministry of Housing & Urban Affairs",
    documents: [
      "Aadhaar",
      "Income certificate",
      "Bank account details",
      "Affidavit of no pucca house",
    ],
    source: { label: "pmay-urban.gov.in", url: "https://pmay-urban.gov.in/" },
    corpusId: "pmay2-elig",
    rule: (p) => {
      if (p.income > 900_000) {
        return {
          eligible: false,
          reasons: ["Income above ₹9L exceeds the PMAY-U 2.0 MIG ceiling"],
          confidence: 0.9,
        };
      }
      const reasons: string[] = [];
      let conf = 0.4;
      if (p.income <= 300_000) {
        reasons.push("Income ≤ ₹3L → EWS category");
        conf += 0.3;
      } else if (p.income <= 600_000) {
        reasons.push("Income in ₹3–6L bracket → LIG category");
        conf += 0.25;
      } else {
        reasons.push("Income in ₹6–9L bracket → MIG category (Interest Subsidy Scheme)");
        conf += 0.2;
      }
      reasons.push("Your family must not own a pucca house anywhere in India");
      if (p.gender === "female") {
        reasons.push("Houses are preferably in the name of the woman head of the family or held jointly");
        conf += 0.05;
      }
      if (p.age >= 18) {
        conf += 0.05;
        reasons.push("Adult applicant");
      }
      return { eligible: true, reasons, confidence: Math.min(conf, 0.9) };
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
      return {
        eligible: true,
        reasons: [
          "Landholding farmer family — eligible for ₹6,000 annual income support",
          "Excluded if any family member paid income tax in the last assessment year, holds or held a constitutional post, is a serving or retired government employee (except Group D / MTS), draws a pension of ₹10,000+/month, or is a practising professional such as a doctor, lawyer or CA",
        ],
        confidence: 0.75,
      };
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
    corpusId: "ayush-eligibility",
    rule: (p) => {
      if (p.age >= 70) {
        return {
          eligible: true,
          reasons: [
            "Since October 2024, every senior citizen aged 70+ is covered irrespective of income (Ayushman Vay Vandana card)",
          ],
          confidence: 0.95,
        };
      }
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
      if (p.gender === "female" && p.age < 10) {
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
      if (p.age < 15 || p.age > 59)
        return {
          eligible: false,
          reasons: ["PMKVY 4.0 is open to candidates aged 15–59"],
          confidence: 0.9,
        };
      const reasons = [
        `Age ${p.age} falls in the PMKVY 4.0 age range (15–59)`,
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


const MAX_INCOME_INPUT = 10_000_000;
type ResultFilter = "all" | "eligible" | "ineligible";

export default function EligibilityPage() {
  const [profile, setProfile] = useState<Profile>({
    state: "Maharashtra",
    age: 30,
    gender: "female",
    income: 250_000,
    occupation: "self_employed",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ageInput, setAgeInput] = useState(String(profile.age));
  const [incomeInput, setIncomeInput] = useState(String(profile.income));
  const [filter, setFilter] = useState<ResultFilter>("all");
  const resultsRef = useRef<HTMLElement>(null);

  const ageError = (() => {
    if (ageInput.trim() === "") return "Enter your age.";
    const n = Number(ageInput);
    if (!Number.isInteger(n)) return "Age must be a whole number.";
    if (n < 0 || n > 120) return "Age must be between 0 and 120.";
    return null;
  })();

  const incomeError = (() => {
    if (incomeInput.trim() === "") return "Enter your annual household income.";
    const n = Number(incomeInput);
    if (!Number.isFinite(n) || n < 0) return "Income must be a positive amount.";
    if (n > MAX_INCOME_INPUT) return "Enter an amount up to ₹1 crore.";
    return null;
  })();

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
  const shown = results.filter((r) =>
    filter === "all" ? true : filter === "eligible" ? r.eligible : !r.eligible
  );
  const hasErrors = Boolean(ageError || incomeError);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Rules + retrieval · Citation-aware"
          eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
          title="Scheme Eligibility"
          highlight="Checker"
          description="Answer five quick questions. A deterministic rules engine and the indexed scheme guidelines surface programmes you likely qualify for — with reasons, documents, and a source you can verify."
        />

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Form */}
          <form
            noValidate
            className="h-fit rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-24"
            onSubmit={(e) => {
              e.preventDefault();
              if (hasErrors) return;
              setSubmitted(true);
              if (window.innerWidth < 1024)
                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <h2 className="font-display text-xl text-foreground">Your profile</h2>
            <p className="mb-5 mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Information stays in your browser.
            </p>

            <Field label="State" htmlFor="state">
              <select
                id="state"
                className={inputStyles}
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              >
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age" htmlFor="age" error={ageError}>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  aria-invalid={Boolean(ageError)}
                  aria-describedby={ageError ? "age-error" : undefined}
                  className={cn(inputStyles, ageError && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                  value={ageInput}
                  onChange={(e) => {
                    setAgeInput(e.target.value);
                    const n = Number(e.target.value);
                    if (e.target.value.trim() !== "" && Number.isInteger(n) && n >= 0 && n <= 120)
                      setProfile({ ...profile, age: n });
                  }}
                />
              </Field>
              <Field label="Gender" htmlFor="gender">
                <select
                  id="gender"
                  className={inputStyles}
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <Field label="Annual household income" htmlFor="income" error={incomeError} hint={formatINR(profile.income)}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                <input
                  id="income"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10_000}
                  aria-invalid={Boolean(incomeError)}
                  aria-describedby={incomeError ? "income-error" : undefined}
                  className={cn(inputStyles, "pl-7", incomeError && "border-destructive focus:border-destructive focus:ring-destructive/20")}
                  value={incomeInput}
                  onChange={(e) => {
                    setIncomeInput(e.target.value);
                    const n = Number(e.target.value);
                    if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= MAX_INCOME_INPUT)
                      setProfile({ ...profile, income: n });
                  }}
                />
              </div>
              <input
                type="range"
                aria-label="Annual household income slider"
                min={0}
                max={2_000_000}
                step={10_000}
                className="mt-3 w-full cursor-pointer accent-[var(--gold)]"
                value={Math.min(profile.income, 2_000_000)}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setProfile({ ...profile, income: n });
                  setIncomeInput(String(n));
                }}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>₹0</span>
                <span>₹10L</span>
                <span>₹20L+</span>
              </div>
            </Field>

            <Field label="Occupation" htmlFor="occupation">
              <select
                id="occupation"
                className={inputStyles}
                value={profile.occupation}
                onChange={(e) => setProfile({ ...profile, occupation: e.target.value as Occupation })}
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
            </Field>

            <button type="submit" disabled={hasErrors} className={cn(buttonStyles.primary, "mt-2 w-full py-3")}>
              <BadgeCheck className="h-4 w-4" /> Check eligibility
            </button>
            {hasErrors && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> Fix the highlighted fields to continue.
              </p>
            )}
          </form>

          {/* Results */}
          <section ref={resultsRef} aria-labelledby="results-heading" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 id="results-heading" className="font-display text-lg text-foreground">
                  {submitted ? "Your results" : "Live preview"}
                </h2>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  <span className="font-semibold text-foreground">{eligibleCount}</span> of {results.length} schemes match your profile.
                </p>
              </div>
              <div role="tablist" aria-label="Filter results" className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
                {(
                  [
                    ["all", `All (${results.length})`],
                    ["eligible", `Eligible (${eligibleCount})`],
                    ["ineligible", `Not eligible (${results.length - eligibleCount})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={filter === id}
                    onClick={() => setFilter(id)}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 font-medium transition",
                      filter === id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {shown.map(({ scheme, eligible, reasons, confidence, chunk }) => (
              <ResultCard
                key={scheme.id}
                scheme={scheme}
                eligible={eligible}
                reasons={reasons}
                confidence={confidence}
                chunk={chunk}
              />
            ))}
          </section>
        </div>

        <p className="mt-10 flex items-start gap-2 rounded-xl border bg-card/60 p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Disclaimer: This tool gives an indicative match using public scheme
          guidelines. Final eligibility is determined by the issuing authority.
          Always verify on the official portal.
        </p>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label}</span>
        {hint && <span className="font-mono text-foreground">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function ResultCard({
  scheme,
  eligible,
  reasons,
  confidence,
  chunk,
}: {
  scheme: Scheme;
  eligible: boolean;
  reasons: string[];
  confidence: number;
  chunk?: (typeof CORPUS)[number];
}) {
  const [showSource, setShowSource] = useState(false);
  return (
    <article
      className={cn(
        "animate-fade-up overflow-hidden rounded-2xl border bg-card shadow-card transition hover:shadow-lift",
        eligible ? "border-l-4 border-l-success" : "border-l-4 border-l-border"
      )}
    >
      <div className="p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  eligible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}
              >
                {eligible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleSlash className="h-3.5 w-3.5" />}
                {eligible ? "Likely eligible" : "Not eligible"}
              </span>
              <span className="text-xs text-muted-foreground">{scheme.ministry}</span>
            </div>
            <h3 className={cn("mt-2 font-display text-xl", eligible ? "text-foreground" : "text-muted-foreground")}>
              {scheme.name}
            </h3>
          </div>
          <ConfidenceMeter value={confidence} />
        </header>

        <div className={cn("mt-5 grid gap-5 sm:grid-cols-2", !eligible && "opacity-80")}>
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Why</h4>
            <ul className="space-y-1.5 text-sm text-foreground">
              {reasons.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Required documents</h4>
            <ul className="space-y-1.5 text-sm text-foreground">
              {scheme.documents.map((d) => (
                <li key={d} className="flex gap-2">
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-ink" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="border-t bg-parchment/50 px-5 py-3 text-xs sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <a
            href={scheme.source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-gold-ink hover:underline"
          >
            Official source · {scheme.source.label}
            <ExternalLink className="h-3 w-3" />
          </a>
          {chunk && (
            <button
              onClick={() => setShowSource((s) => !s)}
              aria-expanded={showSource}
              className="flex max-w-full items-center gap-1 text-left text-muted-foreground transition hover:text-foreground"
            >
              <span className="min-w-0">
                Retrieved: <span className="font-medium text-foreground">{chunk.doc}</span> · {chunk.section}
              </span>
              <ChevronDown className={cn("h-3 w-3 shrink-0 transition", showSource && "rotate-180")} />
            </button>
          )}
        </div>
        {chunk && showSource && (
          <p className="mt-3 animate-fade-in border-l-2 border-gold pl-3 leading-relaxed text-muted-foreground">
            {chunk.text}
          </p>
        )}
      </footer>
    </article>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone = pct >= 75 ? "bg-success" : pct >= 50 ? "bg-gold" : "bg-destructive";
  return (
    <div className="w-36 shrink-0" title="Confidence of the rule-based match">
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Confidence</span>
        <span className="font-mono text-foreground">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Confidence"
      >
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
