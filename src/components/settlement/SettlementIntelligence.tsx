import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AGORA_BRIEF,
  AGENT_PATTERNS,
  RAIL_COMPARE,
  TREND_META,
  XRPL_330_AMENDMENTS,
  simulateAtomicBatch,
  simulateDelegation,
  sponsoredFeeModel,
  type BatchLeg,
} from "@/lib/settlement/agora-xrpl";
import { cn } from "@/components/ui/cn";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none";

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const DEFAULT_LEGS: BatchLeg[] = [
  {
    id: "leg-1",
    from: "buyer-agent",
    to: "lvl-treasury",
    action: "USDC pay (x402)",
    amountUsd: 2.99,
  },
  {
    id: "leg-2",
    from: "lvl-oracle",
    to: "buyer-agent",
    action: "Unlock sealed pack",
    amountUsd: 0,
  },
  {
    id: "leg-3",
    from: "lvl-proof",
    to: "audit-log",
    action: "Write payment proof",
    amountUsd: 0,
  },
];

export function SettlementIntelligence() {
  const [failLeg, setFailLeg] = useState("");
  const [maxUsd, setMaxUsd] = useState(25);
  const [reqUsd, setReqUsd] = useState(11.99);
  const [category, setCategory] = useState("Trust");
  const [cats, setCats] = useState("Agent Ops,Trust,Commerce");
  const [hours, setHours] = useState(24);
  const [txCount, setTxCount] = useState(40);
  const [feeXrp, setFeeXrp] = useState(0.000012);
  const [xrpUsd, setXrpUsd] = useState(1.06);
  const [sponsor, setSponsor] = useState(true);

  const batch = useMemo(
    () => simulateAtomicBatch(DEFAULT_LEGS, failLeg || undefined),
    [failLeg],
  );
  const del = useMemo(
    () =>
      simulateDelegation({
        maxUsd,
        categories: cats.split(",").map((s) => s.trim()).filter(Boolean),
        expiresHours: hours,
        requestUsd: reqUsd,
        category,
      }),
    [maxUsd, cats, hours, reqUsd, category],
  );
  const fees = useMemo(
    () =>
      sponsoredFeeModel({
        agentTxCount: txCount,
        feePerTxXrp: feeXrp,
        xrpUsd,
        sponsorCovers: sponsor,
      }),
    [txCount, feeXrp, xrpUsd, sponsor],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          From X trend · tokenized settlement
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {TREND_META.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted leading-relaxed">
          Distilled from BIS Project Agorá primary materials, xrpld 3.3.0 amendment reporting, and
          X discourse around{" "}
          <a
            href={TREND_META.xTrend}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            this trend
          </a>
          . Separates <strong className="text-fg">verified wholesale tokenisation</strong> from{" "}
          <strong className="text-fg">public-chain capability upgrades</strong>, then turns both into
          patterns LVL agents can use (atomic multi-leg, delegated spend, fee sponsorship).
        </p>
        <p className="mt-2 text-[11px] text-subtle">
          As of {TREND_META.asOf} · discourse price mention {TREND_META.xrpPriceMention} · not
          financial advice
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/lab/interop"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Interop standards
          </Link>
          <Link
            to="/marketplace/x402"
            search={{ skill: "agent-orchestration" }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Live LVL x402
          </Link>
          <a
            href="https://www.bis.org/about/bisih/topics/fmis/agora.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            BIS Agorá ↗
          </a>
        </div>
      </section>

      {/* Agorá facts */}
      <Panel title="Project Agorá — verified brief">
        <ul className="space-y-3">
          {AGORA_BRIEF.map((f) => (
            <li
              key={f.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium">{f.claim}</p>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                    f.confidence === "high"
                      ? "border-ok/40 text-ok"
                      : f.confidence === "medium"
                        ? "border-warn/40 text-warn"
                        : "border-border text-muted",
                  )}
                >
                  {f.confidence}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed">{f.detail}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {f.sources.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    [{s.kind}] {s.label}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* XRPL amendments */}
      <Panel title="XRPL xrpld 3.3.0 — five amendments (proposed / revised)">
        <p className="mb-3 text-xs text-muted">
          Software release ≠ activation. Amendments typically need ~80% validator support for two
          weeks. Batch & Permission Delegation return after earlier security pullbacks.
        </p>
        <div className="grid gap-3 lg:grid-cols-2">
          {XRPL_330_AMENDMENTS.map((a) => (
            <article
              key={a.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{a.name}</h3>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted">
                  {a.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed">{a.oneLiner}</p>
              <ul className="mt-2 space-y-0.5 text-[11px] text-fg">
                {a.enables.map((e) => (
                  <li key={e}>· {e}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-accent leading-relaxed">
                <strong>Agent angle:</strong> {a.agentAngle}
              </p>
              {a.riskNote && (
                <p className="mt-2 text-[11px] text-warn">{a.riskNote}</p>
              )}
            </article>
          ))}
        </div>
      </Panel>

      {/* Rail compare */}
      <Panel title="Three rails — compare honestly">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase text-subtle">
                <th className="py-2 pr-2">Rail</th>
                <th className="py-2 pr-2">Domain</th>
                <th className="py-2 pr-2">Asset</th>
                <th className="py-2 pr-2">Atomicity</th>
                <th className="py-2 pr-2">Agent fit</th>
                <th className="py-2">Maturity</th>
              </tr>
            </thead>
            <tbody>
              {RAIL_COMPARE.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-2 font-medium">{r.name}</td>
                  <td className="py-2.5 pr-2 text-muted">{r.domain}</td>
                  <td className="py-2.5 pr-2 text-muted">{r.settlementAsset}</td>
                  <td className="py-2.5 pr-2 text-muted">{r.atomicity}</td>
                  <td className="py-2.5 pr-2 text-muted">{r.agentFit}</td>
                  <td className="py-2.5">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                        r.maturity === "production"
                          ? "border-ok/40 text-ok"
                          : r.maturity === "prototype"
                            ? "border-warn/40 text-warn"
                            : "border-border text-muted",
                      )}
                    >
                      {r.maturity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Patterns */}
      <Panel title="Patterns to steal for agent commerce">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AGENT_PATTERNS.map((p) => (
            <div
              key={p.id}
              className="rounded-[var(--radius-lg)] border border-border bg-elevated p-3"
            >
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="mt-1 font-mono text-[10px] text-subtle">{p.from}</p>
              <p className="mt-2 text-xs text-muted leading-relaxed">{p.apply}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Simulators */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Atomic batch simulator">
          <p className="text-xs text-muted mb-2">
            Inspired by Agorá atomic settlement + XRPL Batch — multi-leg agent unlock.
          </p>
          <ul className="space-y-1 text-xs font-mono">
            {DEFAULT_LEGS.map((l) => (
              <li key={l.id} className="rounded bg-elevated px-2 py-1.5">
                {l.id}: {l.action} (${l.amountUsd})
              </li>
            ))}
          </ul>
          <label className="mt-3 block text-xs">
            <span className="text-muted">Force-fail leg id (empty = success)</span>
            <select
              className={cn(inputCls, "mt-1")}
              value={failLeg}
              onChange={(e) => setFailLeg(e.target.value)}
            >
              <option value="">(none)</option>
              {DEFAULT_LEGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id}
                </option>
              ))}
            </select>
          </label>
          <p
            className={cn(
              "mt-3 rounded-[var(--radius-md)] border p-3 text-xs",
              batch.ok ? "border-ok/40 bg-ok/10 text-ok" : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {batch.reason}
            {batch.ok && ` · total $${batch.totalUsd}`}
          </p>
        </Panel>

        <Panel title="Permission delegation gate">
          <p className="text-xs text-muted mb-2">
            Least-privilege agent spend — XRPL Permission Delegation angle.
          </p>
          <div className="space-y-2">
            <label className="block text-xs">
              <span className="text-muted">Max USD</span>
              <input
                type="number"
                className={cn(inputCls, "mt-1")}
                value={maxUsd}
                onChange={(e) => setMaxUsd(Number(e.target.value))}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted">Categories (comma)</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={cats}
                onChange={(e) => setCats(e.target.value)}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted">Request USD / category / hours left</span>
              <div className="mt-1 grid grid-cols-3 gap-1">
                <input
                  type="number"
                  className={inputCls}
                  value={reqUsd}
                  onChange={(e) => setReqUsd(Number(e.target.value))}
                />
                <input
                  className={inputCls}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <input
                  type="number"
                  className={inputCls}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                />
              </div>
            </label>
          </div>
          <p
            className={cn(
              "mt-3 rounded-[var(--radius-md)] border p-3 text-xs",
              del.allowed
                ? "border-ok/40 bg-ok/10 text-ok"
                : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {del.allowed
              ? `Allowed · remaining budget $${del.remainingUsd}`
              : `Denied: ${del.reasons.join(", ")}`}
          </p>
        </Panel>

        <Panel title="Sponsored fee model">
          <p className="text-xs text-muted mb-2">
            Platform covers rail fees so agents only budget skill USDC (Sponsored Fees angle).
          </p>
          <div className="space-y-2">
            <label className="block text-xs">
              <span className="text-muted">Agent tx count</span>
              <input
                type="number"
                className={cn(inputCls, "mt-1")}
                value={txCount}
                onChange={(e) => setTxCount(Number(e.target.value))}
              />
            </label>
            <label className="block text-xs">
              <span className="text-muted">Fee/tx (XRP) · XRP/USD</span>
              <div className="mt-1 grid grid-cols-2 gap-1">
                <input
                  type="number"
                  step="0.000001"
                  className={inputCls}
                  value={feeXrp}
                  onChange={(e) => setFeeXrp(Number(e.target.value))}
                />
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  value={xrpUsd}
                  onChange={(e) => setXrpUsd(Number(e.target.value))}
                />
              </div>
            </label>
            <label className="flex h-11 items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={sponsor}
                onChange={(e) => setSponsor(e.target.checked)}
              />
              Platform sponsors fees
            </label>
          </div>
          <dl className="mt-3 space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <dt className="text-muted">Agent pays</dt>
              <dd>${fees.agentPaysUsd}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Sponsor pays</dt>
              <dd>${fees.sponsorPaysUsd}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Gross XRP</dt>
              <dd>{fees.grossXrp}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-muted">{fees.note}</p>
        </Panel>
      </div>

      <Panel title="What LVL should build next (from this signal)">
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted leading-relaxed">
          <li>
            <strong className="text-fg">Atomic unlock package</strong> — treat x402 pay + pack
            deliver + proof append as a batch with compensating rollback on any failure.
          </li>
          <li>
            <strong className="text-fg">Delegated agent wallets</strong> — scoped max USD / category /
            TTL (Permission Delegation pattern) for swarm workers.
          </li>
          <li>
            <strong className="text-fg">Fee abstraction</strong> — keep Base gas invisible; agents
            only see skill USDC price tags (Sponsored Fees pattern).
          </li>
          <li>
            <strong className="text-fg">Multi-rail readiness</strong> — abstract settlement behind
            x402 accepts[] so future tokenised-deposit or XRPL MPT rails can plug in without rewriting
            catalog UX.
          </li>
          <li>
            <strong className="text-fg">Discourse hygiene</strong> — publish primary-source links
            (BIS) next to chain marketing claims to keep agent buyers trust-aligned.
          </li>
        </ol>
      </Panel>
    </div>
  );
}
