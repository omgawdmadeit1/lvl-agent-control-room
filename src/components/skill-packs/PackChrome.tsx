import { Link } from "@tanstack/react-router";
import { SKILL_PACKS, type SkillPackId } from "@/lib/skill-packs/registry";
import { cn } from "@/components/ui/cn";

export function PackChrome({
  active,
  children,
}: {
  active?: SkillPackId;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="font-semibold hover:text-accent">
              Control Room
            </Link>
            <span className="text-subtle">/</span>
            <Link to="/skills" className="font-medium">
              Skill Pack Studio
            </Link>
            {active && (
              <>
                <span className="text-subtle">/</span>
                <span className="text-muted">{SKILL_PACKS.find((p) => p.id === active)?.shortName}</span>
              </>
            )}
          </div>
          <nav aria-label="Skill packs" className="flex max-w-full flex-wrap gap-1">
            {SKILL_PACKS.map((p) => (
              <Link
                key={p.id}
                to="/skills/$packId"
                params={{ packId: p.id }}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-2.5 text-[10px] font-medium",
                  active === p.id
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-elevated text-muted hover:text-fg",
                )}
                title={p.name}
              >
                {p.shortName}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-4">{children}</main>
    </div>
  );
}
