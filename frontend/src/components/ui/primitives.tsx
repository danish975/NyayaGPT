import { cn } from "@/lib/utils";

/** CSS-only tooltip; shows on hover and keyboard focus. */
export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground opacity-0 shadow-lift transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "success" | "danger" | "planned";
  className?: string;
}) {
  const tones = {
    neutral: "border-border bg-muted text-muted-foreground",
    gold: "border-gold/40 bg-gold-soft text-gold-ink",
    success: "border-success/30 bg-success/10 text-success",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    planned: "border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  description,
  actions,
}: {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  highlight?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl animate-fade-up">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/60 px-3 py-1 text-xs font-medium text-foreground">
            <span className="text-gold-ink">{eyebrowIcon}</span>
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
          {title} {highlight && <span className="text-gradient-gold">{highlight}</span>}
        </h1>
        {description && (
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold-ink">
        {icon}
      </div>
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shared button styles so every page uses the same controls. */
export const buttonStyles = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition hover:-translate-y-px hover:opacity-95 hover:shadow-lift active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card transition hover:-translate-y-px hover:border-gold hover:shadow-lift active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
  icon:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-card text-muted-foreground transition hover:border-gold hover:text-foreground disabled:opacity-50",
};

export const inputStyles =
  "w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground shadow-card outline-none transition placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/25";
