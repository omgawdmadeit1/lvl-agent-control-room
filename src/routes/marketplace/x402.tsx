import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loadX402Challenge } from "@/lib/marketplace/catalog";
import { X402Panel } from "@/components/marketplace/X402Panel";
import { LoaderPending, LoaderError } from "@/components/router/LoaderStates";

export type X402Search = { skill?: string };

function parseSearch(raw: Record<string, unknown>): X402Search {
  const skill =
    typeof raw.skill === "string" && raw.skill.trim()
      ? raw.skill.trim().slice(0, 80)
      : "agent-orchestration";
  return { skill };
}

export const Route = createFileRoute("/marketplace/x402")({
  validateSearch: (raw: Record<string, unknown>) => parseSearch(raw),
  loaderDeps: ({ search }: { search: X402Search }) => ({ skill: search.skill || "agent-orchestration" }),
  loader: async ({ deps }) => loadX402Challenge(deps.skill),
  pendingComponent: () => <LoaderPending label="Fetching x402 challenge…" />,
  pendingMs: 50,
  staleTime: 30_000,
  errorComponent: ({ error, reset }) => (
    <LoaderError error={error instanceof Error ? error : new Error(String(error))} reset={reset} />
  ),
  component: X402Page,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.skillId
          ? `x402 · ${loaderData.skillId}`
          : "x402 · LVL Marketplace",
      },
    ],
  }),
});

const PRESETS = [
  "agent-orchestration",
  "deep-research-synthesizer",
  "agent-marketplace-infrastructure",
  "agent-economy-marketplace-operator",
];

function X402Page() {
  const challenge = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/marketplace/x402" });
  const [skill, setSkill] = useState(search.skill || "agent-orchestration");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">x402 live challenge</h1>
        <p className="mt-1 text-sm text-muted">
          Pull a real payment-required response from production. This is the economic core of LVL.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <label className="text-xs">
          <span className="text-muted">Skill id</span>
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="mt-1 block h-11 w-64 max-w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm font-mono"
          />
        </label>
        <button
          type="button"
          onClick={() => void navigate({ search: { skill }, replace: true })}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
        >
          Load challenge
        </button>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setSkill(p);
                void navigate({ search: { skill: p }, replace: true });
              }}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-2 font-mono text-[10px]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <X402Panel challenge={challenge} />
    </div>
  );
}
