import { Link } from "@tanstack/react-router";
import type { CatalogSkill } from "@/lib/marketplace/types";
import { cn } from "@/components/ui/cn";

export function SkillCard({
  skill,
  compact,
}: {
  skill: CatalogSkill;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-4 transition hover:border-subtle",
        compact && "p-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-subtle truncate">{skill.id}</p>
          <h3 className="mt-0.5 text-sm font-semibold leading-snug">{skill.name}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-elevated px-2 py-0.5 font-mono text-[11px]">
          {skill.price_label}
        </span>
      </div>
      <p className="mt-2 line-clamp-3 text-xs text-muted leading-relaxed">{skill.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
          {skill.category}
        </span>
        <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
          {skill.tier}
        </span>
        {skill.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-subtle">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/marketplace/skill/$skillId"
          params={{ skillId: skill.id }}
          className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
        >
          Open skill
        </Link>
        <a
          href={skill.listing_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
        >
          Live listing
        </a>
      </div>
    </article>
  );
}
