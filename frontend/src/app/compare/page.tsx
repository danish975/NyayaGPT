"use client";

import { useState, useMemo } from "react";
import { GitCompare, Download, ArrowLeftRight, ExternalLink, AlertCircle, Copy } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader, buttonStyles, inputStyles } from "@/components/ui/primitives";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

type PolicyData = {
  id: string;
  name: string;
  objective: string;
  benefits: string;
  eligibility: string;
  duration: string;
  ministry: string;
  year: number;
};

const POLICIES: PolicyData[] = [
  {
    id: "pmay",
    name: "PMAY-U 2.0",
    objective:
      "Housing for 1 crore urban poor and middle-class families through construction support, rental housing and interest subsidy.",
    benefits:
      "₹2.5 lakh assistance per unit (BLC/AHP); 4% interest subsidy on the first ₹8 lakh of a home loan, up to ₹1.8 lakh (ISS).",
    eligibility:
      "EWS (≤₹3L), LIG (₹3–6L), MIG (₹6–9L annual income); no pucca house anywhere in India.",
    duration: "2024–2029 (succeeds PMAY-U 2015–2024)",
    ministry: "Ministry of Housing & Urban Affairs",
    year: 2024,
  },
  {
    id: "mgnrega",
    name: "MGNREGA",
    objective:
      "100 days of guaranteed wage employment per year to rural households.",
    benefits:
      "Minimum 100 days unskilled work; unemployment allowance if not provided within 15 days.",
    eligibility:
      "Any adult member of a rural household willing to do unskilled manual work.",
    duration: "2005–ongoing",
    ministry: "Ministry of Rural Development",
    year: 2005,
  },
  {
    id: "ayushman",
    name: "Ayushman Bharat PM-JAY",
    objective:
      "₹5 lakh per family per year health cover for secondary/tertiary care hospitalization.",
    benefits:
      "Cashless treatment at empanelled hospitals; covers nearly 2,000 procedures.",
    eligibility:
      "SECC-2011 deprivation/occupation criteria, plus all senior citizens aged 70+ (since 2024); no cap on family size.",
    duration: "2018–ongoing",
    ministry: "National Health Authority",
    year: 2018,
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    objective:
      "₹6,000 per year income support to landholding farmer families.",
    benefits:
      "₹2,000 every 4 months directly to bank account via DBT.",
    eligibility: "All landholding farmer families (with some exclusions).",
    duration: "2019–ongoing",
    ministry: "Ministry of Agriculture",
    year: 2019,
  },
  {
    id: "nep",
    name: "NEP 2020",
    objective:
      "Overhaul India's education system with new 5+3+3+4 structure and multidisciplinary approach.",
    benefits:
      "Multiple exit points, Academic Bank of Credits, mother tongue instruction, NETF.",
    eligibility: "All students and educational institutions in India.",
    duration: "2020–ongoing (target: 2040 for full implementation)",
    ministry: "Ministry of Education",
    year: 2020,
  },
  {
    id: "dpdp",
    name: "DPDP Act 2023",
    objective:
      "Protect digital personal data of individuals while enabling lawful processing.",
    benefits:
      "Right to access, correct, erase personal data; consent-based processing.",
    eligibility: "All data principals (individuals) in India.",
    duration: "2023–ongoing",
    ministry: "Ministry of Electronics & IT",
    year: 2023,
  },
  {
    id: "ujjwala",
    name: "PM Ujjwala Yojana",
    objective: "Free LPG connections to BPL households to reduce indoor pollution.",
    benefits: "Free LPG connection; first refill and stove free; deposit-free.",
    eligibility: "Adult woman from BPL household (SECC-2011 list).",
    duration: "2016–ongoing",
    ministry: "Ministry of Petroleum & Natural Gas",
    year: 2016,
  },
  {
    id: "rti",
    name: "RTI Act 2005",
    objective: "Enable citizens to access information from public authorities.",
    benefits: "Any citizen can request information; response within 30 days; life/liberty within 48 hours.",
    eligibility: "Any Indian citizen.",
    duration: "2005–ongoing",
    ministry: "Department of Personnel & Training",
    year: 2005,
  },
];

const COMPARE_FIELDS: { key: keyof PolicyData; label: string }[] = [
  { key: "objective", label: "Objective" },
  { key: "benefits", label: "Benefits" },
  { key: "eligibility", label: "Eligibility" },
  { key: "duration", label: "Duration" },
  { key: "ministry", label: "Ministry" },
  { key: "year", label: "Year" },
];

/** Official portals for each policy, shown as source references. */
const SOURCES: Record<string, { label: string; url: string }> = {
  pmay: { label: "pmay-urban.gov.in", url: "https://pmay-urban.gov.in/" },
  mgnrega: { label: "nrega.nic.in", url: "https://nrega.nic.in/" },
  ayushman: { label: "pmjay.gov.in", url: "https://pmjay.gov.in/" },
  "pm-kisan": { label: "pmkisan.gov.in", url: "https://pmkisan.gov.in/" },
  nep: { label: "education.gov.in", url: "https://www.education.gov.in/nep/about-nep" },
  dpdp: { label: "meity.gov.in", url: "https://www.meity.gov.in/data-protection-framework" },
  ujjwala: { label: "pmuy.gov.in", url: "https://www.pmuy.gov.in/" },
  rti: { label: "rti.gov.in", url: "https://rti.gov.in/" },
};

export default function ComparePage() {
  const [leftId, setLeftId] = useState("pmay");
  const [rightId, setRightId] = useState("mgnrega");

  const leftPolicy = useMemo(
    () => POLICIES.find((p) => p.id === leftId)!,
    [leftId]
  );
  const rightPolicy = useMemo(
    () => POLICIES.find((p) => p.id === rightId)!,
    [rightId]
  );

  function exportMarkdown() {
    let md = `# Policy Comparison: ${leftPolicy.name} vs ${rightPolicy.name}\n\n`;
    md += `| Feature | ${leftPolicy.name} | ${rightPolicy.name} |\n`;
    md += `|---------|${"-".repeat(leftPolicy.name.length + 2)}|${"-".repeat(rightPolicy.name.length + 2)}|\n`;
    for (const field of COMPARE_FIELDS) {
      md += `| ${field.label} | ${leftPolicy[field.key]} | ${rightPolicy[field.key]} |\n`;
    }
    md += `\n_Generated by NyayaGPT · ${new Date().toLocaleDateString()}_\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compare-${leftPolicy.id}-vs-${rightPolicy.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Comparison exported as Markdown.");
  }

  async function copyTable() {
    const rows = COMPARE_FIELDS.map(
      (f) => `${f.label}\t${leftPolicy[f.key]}\t${rightPolicy[f.key]}`
    ).join("\n");
    try {
      await navigator.clipboard.writeText(`Feature\t${leftPolicy.name}\t${rightPolicy.name}\n${rows}`);
      toast("Comparison copied — paste it into a spreadsheet.");
    } catch {
      toast("Couldn't access the clipboard.", "error");
    }
  }

  function swap() {
    setLeftId(rightId);
    setRightId(leftId);
  }

  const same = leftId === rightId;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Side-by-side analysis"
          eyebrowIcon={<GitCompare className="h-3.5 w-3.5" />}
          title="Compare"
          highlight="Policies"
          description="Select two schemes, acts, or policies to compare them across objective, benefits, eligibility, and more."
          actions={
            <>
              <button onClick={copyTable} className={buttonStyles.secondary}>
                <Copy className="h-4 w-4" /> Copy
              </button>
              <button onClick={exportMarkdown} className={buttonStyles.primary}>
                <Download className="h-4 w-4" /> Export Markdown
              </button>
            </>
          }
        />

        {/* Selectors */}
        <div className="mb-6 grid items-end gap-3 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-[1fr_auto_1fr] sm:p-5">
          <PolicySelect id="policy-a" label="Policy A" value={leftId} onChange={setLeftId} />
          <button
            onClick={swap}
            aria-label="Swap policies"
            title="Swap policies"
            className="inline-flex h-11 w-11 items-center justify-center justify-self-center rounded-full border bg-card text-muted-foreground shadow-card transition hover:rotate-180 hover:border-gold hover:text-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <PolicySelect id="policy-b" label="Policy B" value={rightId} onChange={setRightId} />
        </div>

        {same && (
          <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-sm text-foreground">
            <AlertCircle className="h-4 w-4 text-gold-ink" />
            You&apos;re comparing a policy with itself. Choose a different Policy B to see differences.
          </div>
        )}

        {/* Comparison table (tablet & desktop) */}
        <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-card md:block">
          <table className="w-full table-fixed text-sm">
            <caption className="sr-only">
              Comparison of {leftPolicy.name} and {rightPolicy.name}
            </caption>
            <thead>
              <tr className="border-b bg-parchment/70">
                <th scope="col" className="w-40 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                <PolicyHeading policy={leftPolicy} tag="A" />
                <PolicyHeading policy={rightPolicy} tag="B" />
              </tr>
            </thead>
            <tbody>
              {COMPARE_FIELDS.map((field) => (
                <tr key={field.key} className="border-b transition last:border-0 hover:bg-muted/30">
                  <th scope="row" className="px-5 py-4 text-left align-top text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </th>
                  <td className="border-l px-5 py-4 align-top leading-relaxed text-foreground">
                    {String(leftPolicy[field.key])}
                  </td>
                  <td className="border-l px-5 py-4 align-top leading-relaxed text-foreground">
                    {String(rightPolicy[field.key])}
                  </td>
                </tr>
              ))}
              <tr className="bg-parchment/40">
                <th scope="row" className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <td className="border-l px-5 py-4"><SourceLink id={leftPolicy.id} /></td>
                <td className="border-l px-5 py-4"><SourceLink id={rightPolicy.id} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Stacked cards (mobile) */}
        <div className="space-y-4 md:hidden">
          {[leftPolicy, rightPolicy].map((p, i) => (
            <section key={`${p.id}-${i}`} className="overflow-hidden rounded-2xl border bg-card shadow-card">
              <div className="flex items-center gap-2 border-b bg-parchment/70 px-4 py-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
                  {i === 0 ? "A" : "B"}
                </span>
                <h2 className="font-display text-lg text-foreground">{p.name}</h2>
              </div>
              <dl className="divide-y">
                {COMPARE_FIELDS.map((f) => (
                  <div key={f.key} className="px-4 py-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-foreground">{String(p[f.key])}</dd>
                  </div>
                ))}
                <div className="px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source</dt>
                  <dd className="mt-1"><SourceLink id={p.id} /></dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Summaries are for quick comparison only. Check the official portal for current rules before applying.
        </p>
      </main>
      <Footer />
    </div>
  );
}

function PolicySelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputStyles, "cursor-pointer")}>
        {POLICIES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function PolicyHeading({ policy, tag }: { policy: PolicyData; tag: string }) {
  return (
    <th scope="col" className="border-l px-5 py-4 text-left">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
          {tag}
        </span>
        <span className="font-display text-lg font-normal text-foreground">{policy.name}</span>
      </div>
      <div className="mt-1 text-xs font-normal text-muted-foreground">{policy.ministry}</div>
    </th>
  );
}

function SourceLink({ id }: { id: string }) {
  const s = SOURCES[id];
  if (!s) return <span className="text-muted-foreground">—</span>;
  return (
    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-gold-ink hover:underline">
      {s.label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}
