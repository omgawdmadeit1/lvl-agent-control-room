import { useState } from "react";
import {
  connectWallet,
  hasInjectedWallet,
} from "@/lib/agent-economy/browser-wallet";
import { fetchBuyerCredential } from "@/lib/agent-economy/swarm";

export function CredentialsPanel() {
  const [wallet, setWallet] = useState(
    "0xa00876513baa433ce2b58a5341fd06d2b6f9a6ed",
  );
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [ms, setMs] = useState(0);

  async function load(addr?: string) {
    const w = addr || wallet;
    setBusy(true);
    try {
      const r = await fetchBuyerCredential(w);
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
          Buyer identity
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Buyer credentials</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Compact JWS buyer credential from LVL — confirmed unlock counts only (honest zeros). Use
          after real purchases to prove buyer reputation to other agents.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="h-11 min-w-[16rem] flex-1 rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
            value={wallet}
            onChange={(e) => setWallet(e.target.value.trim())}
          />
          <button
            type="button"
            disabled={busy || !hasInjectedWallet()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs disabled:opacity-50"
            onClick={() =>
              void connectWallet().then((w) => {
                setWallet(w.address);
                return load(w.address);
              })
            }
          >
            Connect
          </button>
          <button
            type="button"
            disabled={busy}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
            onClick={() => void load()}
          >
            Fetch credential
          </button>
        </div>
      </section>
      {data && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p className="font-mono text-[11px] text-subtle">{ms}ms</p>
          <p className="mt-1 text-xs">
            format {String(data.format)} · badge{" "}
            {String(
              (data.claims as { lvl_buyer?: { badge?: string } })?.lvl_buyer
                ?.badge || "—",
            )}
          </p>
          {typeof data.token === "string" && (
            <button
              type="button"
              className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
              onClick={() => void navigator.clipboard?.writeText(String(data.token))}
            >
              Copy token
            </button>
          )}
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded bg-elevated p-3 font-mono text-[10px] text-muted">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
