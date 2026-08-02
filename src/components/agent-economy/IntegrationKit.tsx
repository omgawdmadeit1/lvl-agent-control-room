import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { buildIntegrationKit } from "@/lib/agent-economy/live-ops";
import { cn } from "@/components/ui/cn";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none";

export function IntegrationKitPage() {
  const [skill, setSkill] = useState("agent-x402-first-buy");
  const [budget, setBudget] = useState(5);
  const kit = useMemo(
    () => buildIntegrationKit({ defaultSkill: skill, budgetUsd: budget }),
    [skill, budget],
  );
  const json = JSON.stringify(kit, null, 2);

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Ship to other agents
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Agent integration kit</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          One JSON document your purchasing agent (or MCP host) can load: discovery URLs, commerce
          endpoints, network config, and the canonical sequence. Pair with the official SDK.
        </p>
        <div className="mt-4 grid max-w-lg gap-2 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-muted">Default skill</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={skill}
              onChange={(e) => setSkill(e.target.value.trim())}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted">Budget USD</span>
            <input
              type="number"
              className={cn(inputCls, "mt-1")}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
            onClick={() => void navigator.clipboard?.writeText(json)}
          >
            Copy kit JSON
          </button>
          <a
            href={`data:application/json,${encodeURIComponent(json)}`}
            download="lvl-agent-integration-kit.json"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Download
          </a>
          <Link
            to="/marketplace/sdk"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            SDK playground
          </Link>
        </div>
      </section>
      <pre className="max-h-[32rem] overflow-auto rounded-[var(--radius-xl)] border border-border bg-elevated p-4 font-mono text-[11px] text-muted">
        {json}
      </pre>
    </div>
  );
}
