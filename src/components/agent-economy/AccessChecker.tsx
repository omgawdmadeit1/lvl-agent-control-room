import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { fetchAccess } from "@/lib/agent-economy/mcp-client";
import { cn } from "@/components/ui/cn";

export function AccessChecker() {
  const [wallet, setWallet] = useState(
    "0x0000000000000000000000000000000000000001",
  );
  const [skill, setSkill] = useState("agent-x402-first-buy");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [ms, setMs] = useState(0);

  async function run() {
    setBusy(true);
    try {
      const r = await fetchAccess(wallet, skill);
      setData(r.data || null);
      setMs(r.ms);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Entitlements
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Access checker</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          One-time sealed unlock vs subscription window vs metered pay-per-call. Live{" "}
          <code className="text-fg">/api/access</code>.
        </p>
        <div className="mt-4 grid max-w-xl gap-2">
          <label className="text-xs">
            <span className="text-muted">Wallet</span>
            <input
              className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-sm"
              value={wallet}
              onChange={(e) => setWallet(e.target.value.trim())}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted">Skill</span>
            <input
              className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-sm"
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
            {busy ? "Checking…" : "Check access"}
          </button>
        </div>
      </section>
      {data && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p
            className={cn(
              "font-mono text-2xl font-semibold",
              data.allowed ? "text-ok" : "text-warn",
            )}
          >
            {data.allowed ? "ALLOWED" : "DENIED"}
          </p>
          <p className="text-xs text-muted">
            basis {String(data.basis)} · {ms}ms
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-subtle">$/call</dt>
              <dd className="font-mono">{String(data.usd_per_call ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-subtle">Remaining cap</dt>
              <dd className="font-mono">${String(data.remaining_usd ?? "—")}</dd>
            </div>
            <div>
              <dt className="text-subtle">Perpetual sealed</dt>
              <dd>{String(data.perpetual_sealed)}</dd>
            </div>
          </dl>
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
            {JSON.stringify(data, null, 2)}
          </pre>
          <Link
            to="/marketplace/checkout"
            search={{ skill }}
            className="mt-3 inline-flex text-xs text-accent hover:underline"
          >
            Checkout skill →
          </Link>
        </section>
      )}
    </div>
  );
}
