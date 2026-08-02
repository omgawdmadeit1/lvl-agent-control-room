import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { draftMandate } from "@/lib/agent-economy/mcp-client";
import { completeMandate } from "@/lib/agent-economy/mandate-complete";
import {
  connectWallet,
  hasInjectedWallet,
  issueLocalDemoMandate,
  listLocalMandates,
  personalSign,
  type LocalMandate,
} from "@/lib/agent-economy/browser-wallet";

export function MandateStudio() {
  const [principal, setPrincipal] = useState("");
  const [agent, setAgent] = useState("0x2222222222222222222222222222222222222222");
  const [maxPer, setMaxPer] = useState(10);
  const [periodLimit, setPeriodLimit] = useState(50);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState(0);
  const [injected, setInjected] = useState(false);
  const [completeResult, setCompleteResult] = useState<unknown>(null);
  const [local, setLocal] = useState<LocalMandate[]>([]);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    setInjected(hasInjectedWallet());
    setLocal(listLocalMandates());
  }, []);

  const msg = String(data?.message_to_sign || "");
  const draft = data?.draft as Record<string, unknown> | undefined;

  async function connectAsPrincipal() {
    setBusy(true);
    try {
      const w = await connectWallet();
      setPrincipal(w.address);
      setLog((l) => [`connected principal ${w.address}`, ...l]);
    } catch (e) {
      setLog((l) => [`connect: ${(e as Error).message}`, ...l]);
    } finally {
      setBusy(false);
    }
  }

  async function draftOnLvl() {
    if (!principal) {
      setLog((l) => ["set principal (connect wallet) first", ...l]);
      return;
    }
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
      setLog((l) => [`draft HTTP ${r.status}`, ...l]);
    } finally {
      setBusy(false);
    }
  }

  async function signAndRegister() {
    if (!msg || !principal) return;
    setBusy(true);
    try {
      const sig = await personalSign(msg, principal);
      setLog((l) => [`signed ${sig.slice(0, 18)}…`, ...l]);
      const result = await completeMandate({
        principal,
        agent,
        signature: sig,
        draft,
        message_to_sign: msg,
        max_per_purchase_usd: maxPer,
        period_limit_usd: periodLimit,
      });
      setCompleteResult(result);
      setLog((l) => [
        result.ok
          ? `registered OK HTTP ${result.status}`
          : `register failed HTTP ${result.status} — see attempts`,
        ...l,
      ]);
    } catch (e) {
      setLog((l) => [`sign: ${(e as Error).message}`, ...l]);
    } finally {
      setBusy(false);
    }
  }

  function localDemo() {
    const m = issueLocalDemoMandate({
      principal: principal || "0xlocalprincipal",
      agent,
      maxPerPurchaseUsd: maxPer,
      periodLimitUsd: periodLimit,
    });
    setLocal(listLocalMandates());
    setLog((l) => [`local demo mandate ${m.id}`, ...l]);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          AP2 · engineered around the sign wall
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Mandate studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          <strong className="text-fg">Path A:</strong> Connect browser wallet → draft →{" "}
          <code className="text-fg">personal_sign</code> → POST signature to LVL.
          <br />
          <strong className="text-fg">Path B:</strong> Local demo mandate for Control Room gates
          (not production-valid).
        </p>
        <p className="mt-2 text-xs">
          Wallet:{" "}
          <span className={injected ? "text-ok" : "text-warn"}>
            {injected ? "detected" : "not in this session"}
          </span>
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 space-y-3 max-w-xl">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !injected}
            onClick={() => void connectAsPrincipal()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            Connect principal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={localDemo}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Issue local demo mandate
          </button>
        </div>
        <label className="block text-xs">
          <span className="text-muted">Principal</span>
          <input
            className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value.trim())}
            placeholder="0x… or Connect"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Agent</span>
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !principal}
            onClick={() => void draftOnLvl()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-xs font-semibold disabled:opacity-50"
          >
            Draft on LVL
          </button>
          <button
            type="button"
            disabled={busy || !msg || !injected}
            onClick={() => void signAndRegister()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            Sign + register
          </button>
        </div>
      </section>

      {msg && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">message_to_sign</h2>
          <button
            type="button"
            className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
            onClick={() => void navigator.clipboard?.writeText(msg)}
          >
            Copy
          </button>
          <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-muted">
            {msg}
          </pre>
        </section>
      )}

      {completeResult != null && (
        <pre className="max-h-64 overflow-auto rounded-[var(--radius-xl)] border border-border bg-elevated p-3 font-mono text-[10px] text-muted">
          {JSON.stringify(completeResult, null, 2)}
        </pre>
      )}

      {data && (
        <pre className="max-h-48 overflow-auto rounded-[var(--radius-xl)] border border-border bg-elevated p-3 font-mono text-[10px] text-muted">
          HTTP {status}: {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {local.length > 0 && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Local demo mandates</h2>
          <ul className="mt-2 space-y-1 text-xs font-mono text-muted">
            {local.map((m) => (
              <li key={m.id}>
                {m.id} · max ${m.maxPerPurchaseUsd} · period ${m.periodLimitUsd}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="font-mono text-[10px] text-muted space-y-1">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>

      <p className="text-xs text-muted">
        Real USDC settle:{" "}
        <Link to="/marketplace/pay" className="text-accent hover:underline">
          Pay & unlock
        </Link>
      </p>
    </div>
  );
}
