import Link from "next/link";
import { Scale } from "lucide-react";

const LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/library", label: "Library" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/compare", label: "Compare" },
  { href: "/workspace", label: "Workspace" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emblem text-accent">
            <Scale className="h-4 w-4" />
          </span>
          <div>
            <div className="font-display text-base text-foreground">NyayaGPT</div>
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} · Informational use only, not legal advice
            </div>
          </div>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
