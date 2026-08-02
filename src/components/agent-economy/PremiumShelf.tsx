import { Link } from "@tanstack/react-router";
import type { ShelfSnapshot } from "@/lib/agent-economy/growth";

export function PremiumShelf({ data }: { data: ShelfSnapshot }) {
  const gmv = Number(data.payments.confirmed_volume_usdc ?? 0);
  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          High AOV inventory
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Premium shelf</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Flagship and premium packs from live metrics — primary profit SKUs for agent and human
          buyers. Confirmed GMV ${gmv} (proof ledger only).
        </p>
        <p className="mt-2 font-mono text-[11px] text-subtle">
          {data.durationMs}ms · {data.inventory.skills ?? "—"} skills ·{" "}
          {data.inventory.premium ?? "—"} premium
        </p>
      </section>

      {data.flagship && (
        <section className="rounded-[var(--radius-xl)] border border-accent/40 bg-accent/5 p-6">
          <p className="text-[10px] font-semibold uppercase text-accent">Flagship</p>
          <h2 className="mt-1 text-xl font-semibold">{data.flagship.name}</h2>
          <p className="mt-1 font-mono text-3xl">${data.flagship.price_usd}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/marketplace/checkout"
              search={{ skill: data.flagship.id }}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
            >
              Checkout flagship
            </Link>
            <Link
              to="/marketplace/x402"
              search={{ skill: data.flagship.id }}
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            >
              402 challenge
            </Link>
          </div>
        </section>
      )}

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Premium sample</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.premium.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
            >
              <p className="text-sm font-medium leading-snug">{p.name}</p>
              <p className="mt-1 font-mono text-lg text-accent">${p.price_usd}</p>
              <p className="font-mono text-[10px] text-subtle">{p.id}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/marketplace/checkout"
                  search={{ skill: p.id }}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Buy
                </Link>
                <Link
                  to="/marketplace/skill/$skillId"
                  params={{ skillId: p.id }}
                  className="text-xs text-muted hover:underline"
                >
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Category density</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {data.categoryTop.map((c) => (
            <li key={c.name} className="flex justify-between border-b border-border py-1">
              <span>{c.name}</span>
              <span className="font-mono text-muted">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
