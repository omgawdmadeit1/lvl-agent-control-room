import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  buildIntegrationKit,
  runBuyerAgentSimulation,
  type BuyerSimResult,
} from "@/lib/agent-economy/live-ops";
import { cn } from "@/components/ui/cn";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none";

export function BuyerSimulator() {
  const [skill, setSkill] = useState("agent-x402-first-buy");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BuyerSimResult | null>(null);

  async function run() {
    setBusy(true);
    try {
      setResult(await runBuyerAgentSimulation(skill));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Integration test
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Buyer agent simulator</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Dry-run the full agent purchase path against live lvlltd.com — discovery, shop, outline,
          cart, 402 challenge, proof, agent card. No USDC spent.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-xs">
            <span className="text-muted">Skill under test</span>
            <input
              className={cn(inputCls, "mt-1 w-64")}
              value={skill}
              onChange={(e) => setSkill(e.target.value.trim())}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Running…" : "Run simulation"}
          </button>
          <Link
            to="/marketplace/checkout"
            search={{ skill }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Open checkout
          </Link>
        </div>
      </section>

      {result && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase text-subtle">Score</p>
              <p className="font-mono text-4xl font-semibold">
                {result.score}
                <span className="ml-2 text-lg text-muted">{result.grade}</span>
              </p>
              <p className="text-xs text-muted">
                {result.durationMs}ms · {result.skillId} ·{" "}
                {result.readyForProduction ? (
                  <span className="text-ok">production-ready path</span>
                ) : (
                  <span className="text-warn">fix failing steps</span>
                )}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
              onClick={() => {
                const kit = buildIntegrationKit({ defaultSkill: skill });
                void navigator.clipboard?.writeText(JSON.stringify({ sim: result, kit }, null, 2));
              }}
            >
              Copy sim + kit JSON
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {result.steps.map((s) => (
              <li
                key={s.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-xs",
                  s.ok ? "border-ok/30 bg-ok/5" : "border-danger/30 bg-danger/5",
                )}
              >
                <div>
                  <p className="font-medium">
                    {s.ok ? "✓" : "✗"} {s.label}
                  </p>
                  <p className="text-muted">{s.detail}</p>
                </div>
                <span className="font-mono text-subtle">
                  {s.status ?? "—"} · {s.ms}ms
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
