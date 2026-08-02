import type { MarketplaceRail } from "@/lib/marketplace/types";
import { cn } from "@/components/ui/cn";

const STATUS: Record<string, string> = {
  live: "bg-ok/15 text-ok border-ok/30",
  partial: "bg-warn/15 text-warn border-warn/30",
  planned: "bg-muted/20 text-muted border-border",
};

export function RailsDiagram({ rails }: { rails: MarketplaceRail[] }) {
  return (
    <section
      aria-labelledby="rails-heading"
      className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="rails-heading" className="text-sm font-semibold">
            Agent commerce rails
          </h2>
          <p className="mt-1 text-xs text-muted">
            LVL LTD is not a human app store — it is a six-rail stack for machine-to-machine skill
            commerce on Base USDC.
          </p>
        </div>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rails.map((r, i) => (
          <li
            key={r.id}
            className="relative rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-[10px] text-subtle">
                {String(i + 1).padStart(2, "0")} · {r.id}
              </p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                  STATUS[r.status] || STATUS.planned,
                )}
              >
                {r.status}
              </span>
            </div>
            <h3 className="mt-2 text-sm font-semibold">{r.name}</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">{r.idea}</p>
            <p className="mt-2 font-mono text-[10px] text-subtle">{r.productSurface}</p>
            {r.metric && (
              <p className="mt-2 text-xs font-medium text-accent">{r.metric}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
