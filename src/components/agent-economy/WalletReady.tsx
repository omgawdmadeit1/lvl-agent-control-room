import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { checkAllowance, type AllowanceResult } from "@/lib/agent-economy/growth";
import { cn } from "@/components/ui/cn";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm font-mono outline-none";

export function WalletReady() {
  const [owner, setOwner] = useState("0xa00876513baa433ce2b58a5341fd06d2b6f9a6ed");
  const [skill, setSkill] = useState("agent-x402-first-buy");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AllowanceResult | null>(null);

  async function run() {
    setBusy(true);
    try {
      setResult(await checkAllowance(owner, skill));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Pre-flight
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Wallet readiness</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Check Base USDC balance for an owner address against a skill's required amount via
          live <code className="text-fg">/api/allowance</code>. Agents should pass this before
          attempting unlock.
        </p>
        <div className="mt-4 grid gap-2 max-w-xl">
          <label className="text-xs">
            <span className="text-muted">Owner address</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={owner}
              onChange={(e) => setOwner(e.target.value.trim())}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted">Skill id</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={skill}
              onChange={(e) => setSkill(e.target.value.trim())}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Checking…" : "Check readiness"}
          </button>
        </div>
      </section>

      {result && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          {result.ok ? (
            <>
              <p
                className={cn(
                  "font-mono text-3xl font-semibold",
                  result.canPay ? "text-ok" : "text-warn",
                )}
              >
                {result.canPay ? "READY" : "INSUFFICIENT"}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Balance</dt>
                  <dd className="font-mono">${result.balance_usd}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Required</dt>
                  <dd className="font-mono">${result.required_usd}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Allowance</dt>
                  <dd className="font-mono">${result.allowance_usd}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-subtle">Latency</dt>
                  <dd className="font-mono">{result.ms}ms</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted leading-relaxed">
                x402 typically uses direct USDC transfer to payTo (allowance may stay 0). Balance ≥
                required is the critical gate.
              </p>
              {result.canPay && (
                <Link
                  to="/marketplace/checkout"
                  search={{ skill }}
                  className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
                >
                  Continue to checkout
                </Link>
              )}
              <pre className="mt-3 max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </>
          ) : (
            <p className="text-sm text-danger">{result.error}</p>
          )}
        </section>
      )}
    </div>
  );
}
