import { Link, createFileRoute } from "@tanstack/react-router";
import { loadCatalogSkills, loadX402Challenge } from "@/lib/marketplace/catalog";
import { X402Panel } from "@/components/marketplace/X402Panel";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";
import { PriceHistoryPanel } from "@/components/agent-economy/PriceHistoryPanel";
import { UpsellRail } from "@/components/agent-economy/UpsellRail";

export const Route = createFileRoute("/marketplace/skill/$skillId")({
  loader: async ({ params }) => {
    const skills = await loadCatalogSkills();
    const skill = skills.find((s) => s.id === params.skillId);
    if (!skill) {
      throw new Error(`Skill not found in live catalog: ${params.skillId}`);
    }
    const challenge = await loadX402Challenge(params.skillId);
    return { skill, challenge };
  },
  pendingComponent: () => <LoaderPending label="Loading skill + x402…" />,
  pendingMs: 80,
  staleTime: 60_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: SkillPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.skill
          ? `${loaderData.skill.name} · LVL Marketplace`
          : "Skill · LVL Marketplace",
      },
    ],
  }),
});

function SkillPage() {
  const { skill, challenge } = Route.useLoaderData();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] text-subtle">{skill.id}</p>
          <h1 className="text-2xl font-semibold">{skill.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">{skill.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border bg-elevated px-2 py-1">
              {skill.category}
            </span>
            <span className="rounded-full border border-border bg-elevated px-2 py-1">
              {skill.tier}
            </span>
            <span className="rounded-full border border-border bg-elevated px-2 py-1 font-mono">
              {skill.price_label}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/marketplace/pay"
            search={{ skill: skill.id }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
          >
            Pay & unlock
          </Link>
          <Link
            to="/marketplace/checkout"
            search={{ skill: skill.id }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm"
          >
            Checkout
          </Link>
          <a
            href={skill.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-4 text-sm"
          >
            lvlltd.com
          </a>
          <Link
            to="/marketplace/catalog"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm"
          >
            ← Catalog
          </Link>
        </div>
      </div>

      {skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.map((t) => (
            <span key={t} className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {skill.outline && (
          <a
            href={skill.outline}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm hover:border-subtle"
          >
            <p className="font-semibold">Free outline</p>
            <p className="mt-1 text-xs text-muted">Evaluate before paying — agent-readable JSON.</p>
          </a>
        )}
        <a
          href={skill.challenge || `https://lvlltd.com/api/pay?skill=${skill.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm hover:border-subtle"
        >
          <p className="font-semibold">Payment challenge URL</p>
          <p className="mt-1 font-mono text-[11px] text-muted break-all">
            /api/pay?skill={skill.id}
          </p>
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PriceHistoryPanel skillId={skill.id} />
        <UpsellRail skillId={skill.id} />
      </div>

      <X402Panel challenge={challenge} />
    </div>
  );
}
