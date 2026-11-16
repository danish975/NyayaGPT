"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Scale, ArrowRight, Menu, X } from "lucide-react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/eligibility", label: "Eligibility" },
  { href: "/compare", label: "Compare" },
  { href: "/workspace", label: "Workspace" },
  { href: "/login", label: "Admin", match: ["/login", "/admin"] },
];

export function Logo({ badge, compact = false }: { badge?: string; compact?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="NyayaGPT home">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emblem text-accent shadow-card transition group-hover:shadow-gold">
        <Scale className="h-5 w-5" />
      </span>
      <span className={cn("font-display text-xl font-semibold text-foreground", compact && "hidden sm:inline")}>
        Nyaya<span className="text-gradient-gold">GPT</span>
      </span>
      {badge && (
        <span className="rounded-md border border-gold/40 bg-gold-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-ink">
          {badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Site-wide header. `actions` renders extra controls on the right
 * (e.g. Logout on the admin page, the Sources toggle in chat).
 */
export function Header({
  wide = false,
  badge,
  actions,
  hideChatCta = false,
}: {
  wide?: boolean;
  badge?: string;
  actions?: React.ReactNode;
  hideChatCta?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (l: (typeof NAV_LINKS)[number]) =>
    (l.match ?? [l.href]).some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6",
          wide ? "max-w-[1440px]" : "max-w-6xl"
        )}
      >
        {/* With extra actions, drop the wordmark on phones so controls fit. */}
        <Logo badge={badge} compact={Boolean(actions)} />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-sm transition",
                isActive(link)
                  ? "font-medium text-foreground after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {actions}
          {!hideChatCta && (
            <Link
              href="/chat"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card transition hover:-translate-y-px hover:shadow-lift md:inline-flex"
            >
              Open Chat <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <DarkModeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="animate-fade-in border-t bg-card px-4 pb-5 pt-3 shadow-lift md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-3 text-base transition",
                  isActive(link)
                    ? "bg-gold-soft font-medium text-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/chat"
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground"
            >
              Open Chat <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
