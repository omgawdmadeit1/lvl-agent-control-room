import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SDK_METHODS, runSdkMethod } from "@/lib/agent-economy/commerce-api";
import { cn } from "@/components/ui/cn";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none";

export function SdkPlayground() {
  const [method, setMethod] = useState("shop");
  const [skill, setSkill] = useState("agent-orchestration");
  const [q, setQ] = useState("agent");
  const [skills, setSkills] = useState("agent-x402-first-buy,agent-orchestration");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    method: string;
    path: string;
    status: number;
    ms: number;
    body: unknown;
  } | null>(null);

  async function run() {
    setBusy(true);
    try {
      const r = await runSdkMethod(method, { skill, q, skills, limit: 5 });
      setResult(r);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          LvlAgentShop SDK
        </p>
        <h1 className="mt-1 text-2xl font-semibold">SDK playground</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Exercise the same REST surfaces the official{" "}
          <a
            href="https://lvlltd.com/sdk/agent-shop.mjs"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            agent-shop.mjs
          </a>{" "}
          client uses — discovery, shop, cart, challenge, proof, pipelines. Wire these into your
          purchasing agent.
        </p>
        <pre className="mt-3 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
{`import { LvlAgentShop } from "https://lvlltd.com/sdk/agent-shop.mjs";
const shop = new LvlAgentShop();
await shop.discovery();
await shop.shopBudget(10);
await shop.outline("agent-x402-first-buy");
const ch = await shop.challenge("agent-x402-first-buy"); // 402
// await shop.unlock({ skill, txHash });`}
        </pre>
      </section>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[var(--radius-xl)] border border-border bg-surface p-3">
          <p className="px-1 text-[10px] uppercase text-subtle">Methods</p>
          <ul className="mt-2 max-h-[28rem] space-y-1 overflow-auto">
            {SDK_METHODS.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex w-full flex-col rounded-[var(--radius-md)] px-2 py-2 text-left text-xs",
                    method === m.id ? "bg-accent/15 text-fg" : "text-muted hover:bg-elevated",
                  )}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="font-mono text-[10px] text-subtle">{m.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs">
              <span className="text-muted">skill</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </label>
            <label className="text-xs">
              <span className="text-muted">search q</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <label className="text-xs sm:col-span-2">
              <span className="text-muted">cart skills (comma)</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Running…" : `Run ${method}`}
          </button>
          {result && (
            <>
              <p className="mt-3 font-mono text-[11px] text-subtle">
                {result.method} → {result.path} · HTTP {result.status} · {result.ms}ms
              </p>
              <pre className="mt-2 max-h-[28rem] overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
                {JSON.stringify(result.body, null, 2)}
              </pre>
              <button
                type="button"
                className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
                onClick={() =>
                  void navigator.clipboard?.writeText(JSON.stringify(result.body, null, 2))
                }
              >
                Copy JSON
              </button>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/marketplace/checkout" className="text-xs text-accent hover:underline">
              Checkout wizard
            </Link>
            <Link to="/marketplace/product" className="text-xs text-muted hover:underline">
              Product OS
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
