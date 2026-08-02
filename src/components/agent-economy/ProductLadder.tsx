import { Link } from "@tanstack/react-router";
import type { LadderSnapshot } from "@/lib/agent-economy/commerce-api";
import { cn } from "@/components/ui/cn";

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ProductLadder({ data }: { data: LadderSnapshot }) {
  const f = data.featured as {
    start_here?: {
      id: string;
      name?: string;
      price_usd: number;
      blurb?: string;
    };
    tripwire?: { id: string; name?: string; price_usd: number };
    flagship?: {
      id: string;
      name?: string;
      price_usd: number;
      product_page?: string;
    };
    networking?: {
      blurb?: string;
      starter_pack?: { id: string; price_usd: number };
    };
    ladder?: { id: string; price_usd: number; role: string }[];
  };

  const roles = [
    {
      key: "entry",
      title: "Entry canary",
      item: f.start_here,
      why: "Prove the full x402 loop for every agent integration at minimal risk.",
    },
    {
      key: "tripwire",
      title: "Tripwire",
      item: f.tripwire
        ? {
            id: f.tripwire.id,
            name: f.tripwire.name || f.tripwire.id,
            price_usd: f.tripwire.price_usd,
          }
        : undefined,
      why: "Serious buyers clear a small paid skill — filters tire-kickers.",
    },
    {
      key: "flagship",
      title: "Flagship AOV",
      item: f.flagship
        ? {
            id: f.flagship.id,
            name: f.flagship.name || f.flagship.id,
            price_usd: f.flagship.price_usd,
          }
        : undefined,
      why: "High-ticket digital good — primary profit driver for operators.",
    },
  ];

  const ledger = (data.coverage?.ledger || {}) as {
    unlock_count?: number;
    confirmed_volume_usdc?: number;
  };
  const cats = Array.isArray(data.coverage?.categories)
    ? (data.coverage!.categories as { category: string; skill_count: number }[]).slice(0, 8)
    : [];

  const treasury = (data.contracts?.treasury || {}) as {
    pay_to?: string;
    role?: string;
  };
  const escrow = (data.contracts?.escrow || data.openMarket || {}) as {
    escrow_contract?: string;
    fee_free_tier_percent?: number;
    contract?: string;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Conversion ladder · pricing architecture
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Sell more to agents</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Live LVL featured ladder + bundles + pipelines. Move agents from $0.05 canary → tripwire →
          flagship / multi-skill bundles without human sales calls.
        </p>
        <p className="mt-2 font-mono text-[11px] text-subtle">
          {data.durationMs}ms · confirmed unlocks {ledger.unlock_count ?? 0} · volume $
          {ledger.confirmed_volume_usdc ?? 0}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/checkout"
            search={{ skill: f.start_here?.id || "agent-x402-first-buy" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Start canary checkout
          </Link>
          <Link
            to="/marketplace/sdk"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          >
            SDK playground
          </Link>
          <Link
            to="/marketplace/sell"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Seller hub
          </Link>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {roles.map((r, i) => (
          <article
            key={r.key}
            className={cn(
              "rounded-[var(--radius-xl)] border p-5",
              r.key === "flagship"
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-surface",
            )}
          >
            <p className="font-mono text-[10px] uppercase text-subtle">
              {i + 1}. {r.title}
            </p>
            {r.item ? (
              <>
                <h2 className="mt-2 text-lg font-semibold">
                  {r.item.name || r.item.id}
                </h2>
                <p className="mt-1 font-mono text-2xl text-accent">${r.item.price_usd}</p>
                {"blurb" in r.item && r.item.blurb && (
                  <p className="mt-2 text-xs text-muted">{String(r.item.blurb)}</p>
                )}
                <p className="mt-2 text-xs text-muted leading-relaxed">{r.why}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to="/marketplace/checkout"
                    search={{ skill: r.item.id }}
                    className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
                  >
                    Checkout
                  </Link>
                  <Link
                    to="/marketplace/x402"
                    search={{ skill: r.item.id }}
                    className="inline-flex h-11 items-center text-xs text-accent hover:underline"
                  >
                    402
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted">Not configured on shop.featured</p>
            )}
          </article>
        ))}
      </div>

      {f.networking && (
        <Panel title="Networking vertical">
          <p className="text-xs text-muted">{f.networking.blurb}</p>
          {f.networking.starter_pack && (
            <Link
              to="/marketplace/checkout"
              search={{ skill: f.networking.starter_pack.id }}
              className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
            >
              Starter pack ${f.networking.starter_pack.price_usd}
            </Link>
          )}
        </Panel>
      )}

      <Panel title="Bundles (higher AOV, one gas)">
        <div className="grid gap-3 lg:grid-cols-3">
          {data.bundles.map((b) => (
            <article
              key={b.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
            >
              <h3 className="text-sm font-semibold">{b.name}</h3>
              <p className="mt-1 font-mono text-xl">${b.price_usd}</p>
              {b.savings_usd != null && (
                <p className="text-xs text-ok">
                  Save ${b.savings_usd}
                  {b.savings_pct != null ? ` (${b.savings_pct}%)` : ""}
                </p>
              )}
              <p className="mt-2 text-xs text-muted leading-relaxed">{b.blurb}</p>
              <ol className="mt-2 list-decimal space-y-0.5 pl-4 font-mono text-[10px] text-subtle">
                {(b.execution_order || b.members || []).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ol>
              <Link
                to="/marketplace/checkout"
                search={{ skill: b.id }}
                className="mt-3 inline-flex h-11 items-center text-xs font-semibold text-accent hover:underline"
              >
                Buy bundle via checkout →
              </Link>
            </article>
          ))}
          {data.bundles.length === 0 && (
            <p className="text-xs text-muted">No bundles in shop response.</p>
          )}
        </div>
      </Panel>

      <Panel title="Editorial pipelines">
        <ul className="space-y-2">
          {data.pipelines.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="font-mono text-[10px] text-subtle">
                  {p.id} · {p.steps} steps · {p.kind}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.price_usd != null && (
                  <span className="font-mono">${p.price_usd}</span>
                )}
                {p.bundle_sku && (
                  <Link
                    to="/marketplace/checkout"
                    search={{ skill: p.bundle_sku }}
                    className="text-accent hover:underline"
                  >
                    {p.bundle_sku}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Catalog coverage">
          <ul className="space-y-1 text-xs">
            {cats.map((c) => (
              <li key={c.category} className="flex justify-between border-b border-border py-1">
                <span>{c.category}</span>
                <span className="font-mono text-muted">{c.skill_count}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Contracts (pay vs escrow)">
          <dl className="space-y-2 text-xs">
            <div>
              <dt className="text-subtle">Skill x402 payTo</dt>
              <dd className="truncate font-mono text-muted">{treasury.pay_to || "—"}</dd>
            </div>
            <div>
              <dt className="text-subtle">Open-market escrow</dt>
              <dd className="truncate font-mono text-muted">
                {String(
                  escrow.escrow_contract ||
                    (data.openMarket as { escrow?: { address?: string } })?.escrow
                      ?.address ||
                    "—",
                )}
              </dd>
            </div>
            <p className="text-muted leading-relaxed">
              Skills settle to treasury. Third-party listings use escrow — never mix payTo addresses.
            </p>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
