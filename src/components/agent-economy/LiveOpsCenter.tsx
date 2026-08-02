import { Link } from "@tanstack/react-router";
import type { LiveOpsSnapshot } from "@/lib/agent-economy/live-ops";
import { cn } from "@/components/ui/cn";
import { StatusHistoryStrip } from "@/components/agent-economy/StatusHistoryStrip";

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

export function LiveOpsCenter({ data }: { data: LiveOpsSnapshot }) {
  const ready = data.ready as {
    ready?: boolean;
    checks?: { id: string; ok: boolean; [k: string]: unknown }[];
    agent_purchase?: string;
  } | null;
  const payments = (data.metrics?.payments || data.health?.payments || {}) as {
    live?: boolean;
    confirmed_volume_usdc?: number;
    unlock_count?: number;
    note?: string;
    network?: string;
  };
  const inv = (data.metrics?.inventory || data.health?.inventory || {}) as {
    skills?: number;
    premium?: number;
    sealed_packs?: number;
    agent_profiles?: number;
  };
  const windows = (data.funnel?.windows || {}) as {
    today?: {
      totals?: {
        catalog_fetch?: { total?: number; pay_entry?: number };
        challenge_served?: { total?: number };
        page_view?: { total?: number };
      };
      by_actor?: {
        agent?: {
          catalog_fetch?: { total?: number };
          challenge_served?: { total?: number };
        };
        human?: {
          catalog_fetch?: { total?: number };
          challenge_served?: { total?: number };
        };
      };
    };
  };
  const today = windows.today?.totals;
  const agentToday = windows.today?.by_actor?.agent;
  const humanToday = windows.today?.by_actor?.human;
  const failChecks = (ready?.checks || []).filter((c) => !c.ok);

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Live operator command
        </p>
        <h1 className="mt-1 text-2xl font-semibold">LVL Live Ops</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Public health, readiness, funnel, and confirmed commerce — no OPS_SECRET required. Use this
          before routing agent traffic.
        </p>
        <p className="mt-2 font-mono text-[11px] text-subtle">
          snapshot {data.durationMs}ms · ready HTTP {data.readyHttp}
        </p>
        <div className="mt-3">
          <StatusHistoryStrip />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/auditor"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Auditor
          </Link>
          <Link
            to="/marketplace/orchestrate"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-semibold"
          >
            Orchestrate
          </Link>
          <Link
            to="/marketplace/simulate"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold"
          >
            Buyer agent sim
          </Link>
          <Link
            to="/marketplace/kit"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          >
            Integration kit
          </Link>
          <Link
            to="/marketplace/product"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Product OS
          </Link>
          <Link
            to="/marketplace/ready"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Ready probe
          </Link>
          <Link
            to="/marketplace/receipts"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Receipts
          </Link>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Ready",
            value: ready?.ready ? "yes" : "no",
            ok: !!ready?.ready,
          },
          {
            label: "Payments",
            value: payments.live ? "live" : "off",
            ok: !!payments.live,
          },
          {
            label: "Confirmed GMV",
            value: `$${payments.confirmed_volume_usdc ?? 0}`,
            ok: true,
          },
          {
            label: "Unlocks",
            value: String(payments.unlock_count ?? 0),
            ok: true,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <p className="text-[10px] uppercase text-subtle">{k.label}</p>
            <p
              className={cn(
                "mt-1 font-mono text-2xl font-semibold",
                k.ok ? "text-fg" : "text-warn",
              )}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Readiness checks">
          <ul className="space-y-1">
            {(ready?.checks || []).map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded bg-elevated px-2 py-2 text-xs"
              >
                <span className="font-mono">{c.id}</span>
                <span className={c.ok ? "text-ok" : "text-warn"}>
                  {c.ok ? "ok" : "fail"}
                </span>
                {!c.ok && (
                  <pre className="w-full overflow-auto font-mono text-[10px] text-muted">
                    {JSON.stringify(c, null, 0)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
          {failChecks.length > 0 && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-warn/40 bg-warn/10 p-3 text-xs text-muted leading-relaxed">
              <p className="font-semibold text-warn">Action</p>
              <p className="mt-1">
                <code className="text-fg">challenge_shape</code> is failing while maxAmountRequired
                and payTo are present — often a schema strictness check (field types / accepts[]).
                Verify GET /api/pay still returns HTTP 402 with atomic amount; agents can buy even if
                aggregate ready is false, but fix before SLA claims.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Funnel today (aggregate, no PII)">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[10px] uppercase text-subtle">Catalog fetches</dt>
              <dd className="font-mono text-xl">{today?.catalog_fetch?.total ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Challenges</dt>
              <dd className="font-mono text-xl">{today?.challenge_served?.total ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Pay entry</dt>
              <dd className="font-mono text-xl">{today?.catalog_fetch?.pay_entry ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-subtle">Page views</dt>
              <dd className="font-mono text-xl">{today?.page_view?.total ?? 0}</dd>
            </div>
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-border bg-elevated p-2">
              <p className="text-subtle">Agent today</p>
              <p className="font-mono">
                fetch {agentToday?.catalog_fetch?.total ?? 0} · 402{" "}
                {agentToday?.challenge_served?.total ?? 0}
              </p>
            </div>
            <div className="rounded border border-border bg-elevated p-2">
              <p className="text-subtle">Human today</p>
              <p className="font-mono">
                fetch {humanToday?.catalog_fetch?.total ?? 0} · 402{" "}
                {humanToday?.challenge_served?.total ?? 0}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Conversion hint: challenges / pay_entry ={" "}
            {today?.catalog_fetch?.pay_entry
              ? Math.round(
                  ((today.challenge_served?.total || 0) /
                    (today.catalog_fetch.pay_entry || 1)) *
                    100,
                )
              : 0}
            %
          </p>
        </Panel>
      </div>


      <Panel title="Conversion goals & alerts">
        {(() => {
          const payEntry = today?.catalog_fetch?.pay_entry ?? 0;
          const challenges = today?.challenge_served?.total ?? 0;
          const agentCh = agentToday?.challenge_served?.total ?? 0;
          const rate = payEntry > 0 ? Math.round((challenges / payEntry) * 100) : 0;
          const alerts: { level: string; msg: string }[] = [];
          if (!ready?.ready) {
            alerts.push({
              level: "warn",
              msg: "Aggregate /api/ready is false — investigate challenge_shape before SLA claims.",
            });
          }
          if (!payments.live) {
            alerts.push({ level: "danger", msg: "Payments not live." });
          }
          if (agentCh === 0 && payEntry > 10) {
            alerts.push({
              level: "warn",
              msg: "Human/catalog traffic without agent 402s — push SDK + agent card distribution.",
            });
          }
          if ((payments.unlock_count ?? 0) < 2 && challenges > 20) {
            alerts.push({
              level: "info",
              msg: "Many challenges, few confirmed unlocks — fix wallet UX / canary onboarding.",
            });
          }
          if (rate < 50 && payEntry > 5) {
            alerts.push({
              level: "info",
              msg: `Challenge conversion ${rate}% of pay_entry — target ≥70% for healthy agent funnel.`,
            });
          }
          if (alerts.length === 0) {
            alerts.push({ level: "ok", msg: "No critical funnel alerts on current public window." });
          }
          return (
            <div className="space-y-3">
              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-subtle">Goal: canary unlocks</dt>
                  <dd className="font-mono text-lg">≥1 / week</dd>
                </div>
                <div>
                  <dt className="text-subtle">402 / pay_entry</dt>
                  <dd className="font-mono text-lg">{rate}%</dd>
                </div>
                <div>
                  <dt className="text-subtle">Agent 402s today</dt>
                  <dd className="font-mono text-lg">{agentCh}</dd>
                </div>
              </dl>
              <ul className="space-y-2">
                {alerts.map((a, i) => (
                  <li
                    key={i}
                    className={
                      a.level === "danger"
                        ? "rounded border border-danger/40 bg-danger/10 p-2 text-xs"
                        : a.level === "warn"
                          ? "rounded border border-warn/40 bg-warn/10 p-2 text-xs"
                          : a.level === "ok"
                            ? "rounded border border-ok/40 bg-ok/10 p-2 text-xs"
                            : "rounded border border-border bg-elevated p-2 text-xs"
                    }
                  >
                    {a.msg}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Inventory">
          <ul className="space-y-1 text-xs">
            <li className="flex justify-between border-b border-border py-1">
              <span>Skills</span>
              <span className="font-mono">{inv.skills ?? "—"}</span>
            </li>
            <li className="flex justify-between border-b border-border py-1">
              <span>Premium</span>
              <span className="font-mono">{inv.premium ?? "—"}</span>
            </li>
            <li className="flex justify-between border-b border-border py-1">
              <span>Sealed packs</span>
              <span className="font-mono">{inv.sealed_packs ?? "—"}</span>
            </li>
            <li className="flex justify-between border-b border-border py-1">
              <span>Agent profiles</span>
              <span className="font-mono">{inv.agent_profiles ?? "—"}</span>
            </li>
          </ul>
          <p className="mt-2 text-[11px] text-muted">{payments.note}</p>
        </Panel>
        <Panel title="Confirmed commerce">
          <p className="text-xs text-muted">
            Loop:{" "}
            <strong className="text-fg">
              {String((data.proof as { loop_status?: string })?.loop_status || "—")}
            </strong>
          </p>
          {Boolean(
            (data.proof as { last_successful_agent_purchase?: { skill_id?: string } })
              ?.last_successful_agent_purchase,
          ) && (
            <div className="mt-2 rounded bg-elevated p-2 text-xs">
              Last:{" "}
              {String(
                (
                  data.proof as {
                    last_successful_agent_purchase: {
                      skill_id: string;
                      price_usd?: number;
                    };
                  }
                ).last_successful_agent_purchase.skill_id,
              )}{" "}
              · $
              {String(
                (
                  data.proof as {
                    last_successful_agent_purchase: { price_usd?: number };
                  }
                ).last_successful_agent_purchase.price_usd,
              )}
            </div>
          )}
          <a
            href="https://lvlltd.com/api/proof"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs text-accent hover:underline"
          >
            Raw proof ↗
          </a>
        </Panel>
      </div>
    </div>
  );
}
