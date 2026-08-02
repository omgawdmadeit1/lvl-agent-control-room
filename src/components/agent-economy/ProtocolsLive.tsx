import { Link } from "@tanstack/react-router";
import type { ProtocolsLiveSnapshot } from "@/lib/agent-economy/protocols-live";

export function ProtocolsLive({ data }: { data: ProtocolsLiveSnapshot }) {
  const tools = Array.isArray(data.mcp?.tools)
    ? (data.mcp!.tools as string[])
    : [];
  const mandateNote = String(data.mandates?.note || "");
  const rates = Array.isArray(data.meter?.rates)
    ? (data.meter!.rates as { max_list_usd: number; usd_per_call: number }[])
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Machine protocols
        </p>
        <h1 className="mt-1 text-2xl font-semibold">MCP · A2A · AP2 · x402</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Live interoperability surfaces on lvlltd.com. Wire purchasing agents through MCP tools or
          A2A agent cards; optional AP2 mandates; settle with x402.
        </p>
        <p className="mt-2 font-mono text-[11px] text-subtle">{data.durationMs}ms snapshot</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/mcp"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            MCP console
          </Link>
          <Link
            to="/marketplace/intent"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
          >
            Intent search
          </Link>
          <Link
            to="/marketplace/trust"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          >
            Trust scores
          </Link>
          <Link
            to="/lab/interop"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Interop lab
          </Link>
          <Link
            to="/marketplace/credentials"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Buyer credentials
          </Link>
          <Link
            to="/marketplace/orchestrate"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Orchestrate
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">MCP tools</h2>
          <p className="mt-1 font-mono text-[11px] text-subtle">
            {String(data.mcp?.endpoint || "/api/mcp")} ·{" "}
            {String(data.mcp?.protocolVersion || "")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1">
            {tools.map((t) => (
              <li
                key={t}
                className="rounded-full border border-border bg-elevated px-2 py-0.5 font-mono text-[10px]"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">A2A</h2>
          <dl className="mt-2 space-y-1 text-xs">
            <div>
              <dt className="text-subtle">Agent card</dt>
              <dd className="truncate font-mono text-muted">
                {String(data.a2a?.agent_card || "")}
              </dd>
            </div>
            <div>
              <dt className="text-subtle">JWKS</dt>
              <dd className="truncate font-mono text-muted">{String(data.a2a?.jwks || "")}</dd>
            </div>
            <div>
              <dt className="text-subtle">Signed</dt>
              <dd>{String(data.a2a?.signed)}</dd>
            </div>
          </dl>
          <Link
            to="/marketplace/agent-economy"
            className="mt-3 inline-flex text-xs text-accent hover:underline"
          >
            Open economy cockpit →
          </Link>
        </section>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">AP2 mandates</h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">{mandateNote}</p>
        <pre className="mt-3 max-h-40 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
          {JSON.stringify(data.mandates?.endpoints || data.mandates, null, 2)}
        </pre>
        <p className="mt-2 text-xs text-muted">
          Control Room also issues client-side spend mandates in{" "}
          <Link to="/marketplace/checkout" className="text-accent hover:underline">
            checkout
          </Link>
          .
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold">Bundles (one pay, N packs)</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {data.bundles.map((b, i) => {
            const id = String(b.skill_id || b.id || i);
            return (
              <li key={id} className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3 text-xs">
                <p className="font-semibold">{b.name || id}</p>
                <p className="font-mono text-accent">${b.price_usd}</p>
                {b.savings_usd != null && (
                  <p className="text-ok">save ${b.savings_usd}</p>
                )}
                <Link
                  to="/marketplace/checkout"
                  search={{ skill: id }}
                  className="mt-2 inline-flex text-accent hover:underline"
                >
                  Checkout
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Subscription rails</h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            {String(
              (data.subscribe?.coexistence as { never_force_migrate?: boolean })
                ?.never_force_migrate
                ? "One-time unlocks stay perpetual; subscriptions are time-boxed live access."
                : JSON.stringify(data.subscribe?.coexistence || {}).slice(0, 200),
            )}
          </p>
          <a
            href="https://lvlltd.com/api/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-xs text-accent hover:underline"
          >
            /api/subscribe ↗
          </a>
        </section>
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Meter (pay-per-call)</h2>
          <p className="mt-1 text-xs text-muted">
            Default cap ${String(data.meter?.default_spend_cap_usd)} · hard $
            {String(data.meter?.hard_cap_usd)}
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {rates.map((r) => (
              <li key={r.max_list_usd} className="flex justify-between border-b border-border py-1">
                <span>list ≤ ${r.max_list_usd}</span>
                <span className="font-mono">${r.usd_per_call}/call</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
