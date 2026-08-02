import { Link, createFileRoute } from "@tanstack/react-router";
import { PackChrome } from "@/components/skill-packs/PackChrome";
import { SKILL_PACKS } from "@/lib/skill-packs/registry";

export const Route = createFileRoute("/skills/")({
  component: SkillsHub,
});

function SkillsHub() {
  return (
    <PackChrome>
      <div className="space-y-6">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Skill Pack Studio
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            12 LVL skills → full working products
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
            Each pack is a usable tool — not a brochure. Audit evidence, marketplace ops, red-team
            certs, goal graphs, A2A cards, memory budgets, no-code workflows, and more — grounded in
            the ideas and catalog of{" "}
            <a href="https://lvlltd.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              lvlltd.com
            </a>
            .
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_PACKS.map((p) => (
            <Link
              key={p.id}
              to="/skills/$packId"
              params={{ packId: p.id }}
              className="group rounded-[var(--radius-xl)] border border-border bg-surface p-4 transition hover:border-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
                  {p.category}
                </p>
                <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
                  {p.shortName}
                </span>
              </div>
              <h2 className="mt-2 text-sm font-semibold group-hover:text-accent">{p.productName}</h2>
              <p className="mt-1 text-xs text-muted leading-relaxed">{p.productSummary}</p>
              <ul className="mt-3 flex flex-wrap gap-1">
                {p.tools.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-full border border-border bg-elevated px-2 py-0.5 text-[10px] text-subtle"
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </PackChrome>
  );
}
