import { Link } from "@tanstack/react-router";
import type { LadderSnapshot } from "@/lib/agent-economy/commerce-api";

export function SellerHub({ data }: { data: LadderSnapshot }) {
  const om = data.openMarket || {};
  const contracts = data.contracts || {};
  const escrow = (contracts as { escrow?: Record<string, unknown> }).escrow || {};
  const treasury = (contracts as { treasury?: Record<string, unknown> }).treasury || {};

  const steps = [
    {
      t: "Choose channel",
      d: "First-party catalog skills (operator) vs open marketplace listings (third-party + escrow).",
    },
    {
      t: "Price for agents",
      d: "Sub-dollar canaries convert. Bundles raise AOV. Publish free outline.json before paywall.",
    },
    {
      t: "Ship machine contracts",
      d: "challenge URL, maxAmountRequired atomic USDC, sealed pack on unlock — no human form required.",
    },
    {
      t: "Get indexed",
      d: "Agent card skills[], MCP tools export, /api/signals demand, external x402 routers.",
    },
    {
      t: "Prove revenue",
      d: "Only /api/proof confirmed unlocks count. Never invent GMV from demos.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Monetize on LVL
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Seller hub</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Two revenue paths:{" "}
          <strong className="text-fg">first-party x402 skills</strong> (payTo treasury) and{" "}
          <strong className="text-fg">open marketplace</strong> (escrow + platform fee). Agents buy;
          you publish contracts they can settle without UI.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">First-party skill market</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li>· Catalog: 236 skills via catalog.json</li>
            <li>· Settlement: USDC on Base → treasury payTo</li>
            <li>
              · payTo:{" "}
              <span className="font-mono text-fg">
                {String(treasury.pay_to || "0xa008…")}
              </span>
            </li>
            <li>· Free eval required: outline + sample</li>
            <li>· Proof: public /api/proof ledger</li>
          </ul>
          <Link
            to="/marketplace/ladder"
            className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Pricing ladder
          </Link>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Open marketplace (third-party)</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li>· Separate from catalog.json</li>
            <li>
              · Contract:{" "}
              <span className="font-mono text-fg">
                {String(om.contract || escrow.contract || "lvl-upload-escrow-v1")}
              </span>
            </li>
            <li>
              · Fee tier:{" "}
              {String(
                om.fee_free_tier_percent ??
                  (om as { fees?: { free_tier_percent?: number } }).fees
                    ?.free_tier_percent ??
                  15,
              )}
              %
            </li>
            <li>· Flow: list → buyer pays escrow → confirmDelivery</li>
          </ul>
          <a
            href="https://lvlltd.com/hub/upload/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
          >
            Open upload hub ↗
          </a>
        </section>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Seller playbook</h2>
        <ol className="mt-3 space-y-3">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-3 text-xs">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px]">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{s.t}</p>
                <p className="text-muted leading-relaxed">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-elevated p-5">
        <h2 className="text-sm font-semibold">Listing checklist</h2>
        <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
          {[
            "Stable skill_id (kebab-case)",
            "price_usd + maxAmountRequired atomic",
            "outline.json free eval",
            "sample.md teaser",
            "HTTP 402 challenge works",
            "Sealed pack only after X-PAYMENT",
            "Category + tags for discovery",
            "Listed on agent card or MCP tools if flagship",
          ].map((c) => (
            <li key={c} className="rounded border border-border bg-surface px-2 py-1.5">
              ☐ {c}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
