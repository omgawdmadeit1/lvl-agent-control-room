import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { draftMandate } from "@/lib/agent-economy/mcp-client";

/**
 * Draft AP2 mandates against live LVL.
 * Full activation requires principal personal_sign — blocked without a connected wallet in this sandbox.
 */
export function MandateStudio() {
  const [principal, setPrincipal] = useState(
    "0x1111111111111111111111111111111111111111",
  );
  const [agent, setAgent] = useState("0x2222222222222222222222222222222222222222");
  const [maxPer, setMaxPer] = useState(10);
  const [periodLimit, setPeriodLimit] = useState(50);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState(0);

  async function draft() {
    setBusy(true);
    try {
      const r = await draftMandate({
        principal,
        agent,
        max_per_purchase_usd: maxPer,
        period_limit_usd: periodLimit,
      });
      setData(r.data || null);
      setStatus(r.status);
    } finally {
      setBusy(false);
    }
  }

  const msg = String(data?.message_to_sign || "");
  const needsSig = status === 400 && !!msg;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          AP2 spending authority
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Mandate studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Draft a live IntentMandate on lvlltd.com. Agents can buy without a mandate; a signed
          mandate adds verified_authorized_purchase on receipts.
        </p>
        <div className="mt-4 grid max-w-xl gap-2">
          <label className="text-xs">
            <span className="text-muted">Principal (signer)</span>
            <input
              className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.trim())}
            />
          </label>
          <label className="text-xs">
            <span className="text-muted">Agent (spender)</span>
            <input
              className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
              value={agent}
              onChange={(e) => setAgent(e.target.value.trim())}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              <span className="text-muted">Max / purchase $</span>
              <input
                type="number"
                className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
                value={maxPer}
                onChange={(e) => setMaxPer(Number(e.target.value))}
              />
            </label>
            <label className="text-xs">
              <span className="text-muted">Period limit $</span>
              <input
                type="number"
                className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm"
                value={periodLimit}
                onChange={(e) => setPeriodLimit(Number(e.target.value))}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void draft()}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Drafting…" : "Draft mandate"}
          </button>
        </div>
      </section>

      {needsSig && (
        <section className="rounded-[var(--radius-xl)] border border-warn/40 bg-warn/10 p-5">
          <h2 className="text-sm font-semibold text-warn">Signature required (roadblock)</h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            LVL returns a draft + <code className="text-fg">message_to_sign</code>. Completing the
            mandate needs <code className="text-fg">personal_sign</code> from the principal wallet
            (MetaMask / agent wallet). This sandbox has no injected wallet — copy the message and
            sign externally, then POST again with signature to{" "}
            <a
              href="https://lvlltd.com/mandates/"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              lvlltd.com/mandates
            </a>
            .
          </p>
          <button
            type="button"
            className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            onClick={() => void navigator.clipboard?.writeText(msg)}
          >
            Copy message_to_sign
          </button>
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted whitespace-pre-wrap">
            {msg}
          </pre>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
            {JSON.stringify(data?.draft || data, null, 2)}
          </pre>
        </section>
      )}

      {data && !needsSig && (
        <pre className="rounded-[var(--radius-xl)] border border-border bg-elevated p-4 font-mono text-[10px] text-muted overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <p className="text-xs text-muted">
        Client-side soft mandates (no chain signature) still gate the{" "}
        <Link to="/marketplace/checkout" className="text-accent hover:underline">
          checkout wizard
        </Link>
        .
      </p>
    </div>
  );
}
