import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { searchIntent } from "@/lib/agent-economy/protocols-live";
import { cn } from "@/components/ui/cn";

export function IntentSearch() {
  const [q, setQ] = useState("buy skills with x402 and manage agent payments");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    status: number;
    ms: number;
    data?: Record<string, unknown>;
  } | null>(null);

  async function run() {
    setBusy(true);
    try {
      setResult(await searchIntent(q));
    } finally {
      setBusy(false);
    }
  }

  const matches = Array.isArray(result?.data?.matches)
    ? (result!.data!.matches as {
        id?: string;
        skill_id?: string;
        name?: string;
        score?: number;
        price_usd?: number;
      }[])
    : Array.isArray(result?.data?.results)
      ? (result!.data!.results as {
          id?: string;
          skill_id?: string;
          name?: string;
          score?: number;
          price_usd?: number;
        }[])
      : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          NL → skill match
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Intent search</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Agents describe a goal; LVL returns TF-IDF matched skills. Better than keyword-only catalog
          for autonomous buyers.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") void run();
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            {busy ? "Matching…" : "Match intent"}
          </button>
        </div>
      </section>

      {result && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <p className="font-mono text-[11px] text-subtle">
            HTTP {result.status} · {result.ms}ms
          </p>
          {matches.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {matches.map((m, i) => {
                const id = String(m.skill_id || m.id || i);
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium">{m.name || id}</p>
                      <p className="font-mono text-[10px] text-subtle">
                        score {m.score ?? "—"} · {id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.price_usd != null && (
                        <span className="font-mono">${m.price_usd}</span>
                      )}
                      <Link
                        to="/marketplace/checkout"
                        search={{ skill: id }}
                        className="text-accent hover:underline"
                      >
                        checkout
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <pre className="mt-3 max-h-96 overflow-auto rounded bg-elevated p-3 font-mono text-[10px] text-muted">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </section>
      )}

      <p className={cn("text-xs text-muted")}>
        Tip: pair with{" "}
        <Link to="/marketplace/wallet" className="text-accent hover:underline">
          wallet ready
        </Link>{" "}
        then checkout.
      </p>
    </div>
  );
}
