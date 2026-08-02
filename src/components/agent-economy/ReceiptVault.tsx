import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  clearReceipts,
  fetchPurchases,
  listReceipts,
  type PurchaseReceipt,
} from "@/lib/agent-economy/receipts";
import { connectWallet, hasInjectedWallet } from "@/lib/agent-economy/browser-wallet";
import { cn } from "@/components/ui/cn";

export function ReceiptVault() {
  const [local, setLocal] = useState<PurchaseReceipt[]>([]);
  const [wallet, setWallet] = useState("");
  const [remote, setRemote] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [injected, setInjected] = useState(false);

  useEffect(() => {
    setLocal(listReceipts());
    setInjected(hasInjectedWallet());
  }, []);

  async function loadRemote(addr?: string) {
    const w = addr || wallet;
    if (!w.startsWith("0x") || w.length < 10) return;
    setBusy(true);
    try {
      const r = await fetchPurchases(w);
      setRemote(r.data || { status: r.status });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Buyer records
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Receipt vault</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Local receipts from Pay & unlock in this browser, plus LVL{" "}
          <code className="text-fg">/api/purchases</code> for a wallet (when the market has recorded
          unlocks).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/pay"
            search={{ skill: "agent-x402-first-buy" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Pay & unlock
          </Link>
          <Link
            to="/marketplace/credentials"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Buyer credentials
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
            onClick={() => {
              clearReceipts();
              setLocal([]);
            }}
          >
            Clear local
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Local vault ({local.length})</h2>
        {local.length === 0 ? (
          <p className="mt-2 text-xs text-muted">
            No local receipts yet. Complete Pay & unlock or save a manual txHash.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {local.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{r.skillId}</span>
                  <span
                    className={cn(
                      "font-mono uppercase",
                      r.status === "unlocked"
                        ? "text-ok"
                        : r.status === "failed"
                          ? "text-danger"
                          : "text-muted",
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-subtle">
                  {r.at} · ${r.amountUsd ?? "—"} · {r.txHash?.slice(0, 18) || "no tx"}…
                </p>
                {r.txHash && (
                  <a
                    href={`https://basescan.org/tx/${r.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Basescan ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">LVL purchases by wallet</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="h-11 min-w-[16rem] flex-1 rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
            placeholder="0x…"
            value={wallet}
            onChange={(e) => setWallet(e.target.value.trim())}
          />
          <button
            type="button"
            disabled={busy || !injected}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs disabled:opacity-50"
            onClick={() =>
              void connectWallet().then((w) => {
                setWallet(w.address);
                return loadRemote(w.address);
              })
            }
          >
            Use connected wallet
          </button>
          <button
            type="button"
            disabled={busy}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg disabled:opacity-50"
            onClick={() => void loadRemote()}
          >
            Fetch
          </button>
        </div>
        {remote && (
          <pre className="mt-3 max-h-80 overflow-auto rounded bg-elevated p-3 font-mono text-[10px] text-muted">
            {JSON.stringify(remote, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
