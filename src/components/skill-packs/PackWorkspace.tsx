import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { SkillPack } from "@/lib/skill-packs/registry";
import {
  agentBlueprint,
  buildAgentCard,
  buildAuditPack,
  compactHistory,
  decomposeGoal,
  defaultAuditEvents,
  defaultRedScenarios,
  defaultWorkflow,
  discoveryWeights,
  exportWorkflow,
  matchBudget,
  memoryBudget,
  orchestrationRunbook,
  priceSuggestion,
  revenueSplit,
  scoreProcess,
  scoreRedTeam,
  supervise,
  type FlowNode,
  type ProcessStep,
  type RedScenario,
  type Topology,
} from "@/lib/skill-packs/engines";
import { cn } from "@/components/ui/cn";

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
    <section className={cn("rounded-[var(--radius-xl)] border border-border bg-surface p-4 sm:p-5", className)}>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs">
      <span className="text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none focus:border-accent";

export function PackWorkspace({ pack }: { pack: SkillPack }) {
  return (
    <div className="space-y-4">
      <header className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
          {pack.category} · skill pack product
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{pack.productName}</h1>
        <p className="mt-1 text-sm text-muted">{pack.productSummary}</p>
        <p className="mt-2 text-xs text-subtle leading-relaxed">{pack.thesis}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`https://lvlltd.com/listings/${pack.catalogId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium"
          >
            Live listing ↗
          </a>
          <a
            href={`https://lvlltd.com/api/pay?skill=${pack.catalogId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            x402 challenge
          </a>
          <Link
            to="/marketplace/skill/$skillId"
            params={{ skillId: pack.catalogId }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          >
            Marketplace skill page
          </Link>
        </div>
      </header>

      {pack.id === "agent-auditor-compliance-specialist" && <AuditorProduct />}
      {pack.id === "agent-economy-marketplace-operator" && <MarketOpsProduct />}
      {pack.id === "agent-evaluation-red-teaming-certification-specialist" && <RedTeamProduct />}
      {pack.id === "agent-goal-decomposer-orchestrator" && <DecomposerProduct />}
      {pack.id === "agent-marketplace-infrastructure" && <InfraProduct />}
      {pack.id === "agent-memory-context-engineer" && <MemoryProduct />}
      {pack.id === "agent-orchestration" && <OrchestrationProduct />}
      {pack.id === "agent-supervisor" && <SupervisorProduct />}
      {pack.id === "agent-to-agent-a2a-protocols" && <A2AProduct />}
      {pack.id === "agentic-process-redesigner" && <ProcessProduct />}
      {pack.id === "ai-agent-building-orchestration" && <BlueprintProduct />}
      {pack.id === "ai-workflow-automation-no-code-agentic" && <NoCodeProduct />}
    </div>
  );
}

function AuditorProduct() {
  const [events, setEvents] = useState(defaultAuditEvents);
  const pack = useMemo(() => buildAuditPack(events), [events]);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Authorization & evidence chain">
        <ul className="space-y-2">
          {events.map((e, i) => (
            <li key={e.id} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs">
              <div className="flex justify-between gap-2">
                <span className="font-mono text-subtle">{e.id}</span>
                <button
                  type="button"
                  className={cn("font-semibold uppercase", e.ok ? "text-ok" : "text-danger")}
                  onClick={() =>
                    setEvents((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, ok: !x.ok } : x)),
                    )
                  }
                >
                  {e.ok ? "ok" : "fail"}
                </button>
              </div>
              <p className="mt-1 font-medium">
                {e.actor} · {e.action}
              </p>
              <p className="text-muted">
                {e.resource} — {e.evidence}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          onClick={() =>
            setEvents((prev) => [
              ...prev,
              {
                id: `ae-${prev.length + 1}`,
                t: new Date().toISOString(),
                actor: "operator",
                action: "manual_note",
                resource: "audit",
                evidence: "operator attestation",
                ok: true,
              },
            ])
          }
        >
          Append event
        </button>
      </Panel>
      <Panel title="Compliance pack export">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[10px] uppercase text-subtle">Score</dt>
            <dd className="font-mono text-2xl font-semibold">{pack.complianceScore}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase text-subtle">Chain hash</dt>
            <dd className="font-mono text-xs break-all">{pack.chainHash}</dd>
          </div>
        </dl>
        <pre className="mt-3 max-h-80 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(pack.export, null, 2)}
        </pre>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
          onClick={() => {
            void navigator.clipboard?.writeText(JSON.stringify(pack.export, null, 2));
          }}
        >
          Copy audit pack JSON
        </button>
      </Panel>
    </div>
  );
}

function MarketOpsProduct() {
  const [base, setBase] = useState(6.99);
  const [demand, setDemand] = useState(62);
  const [trust, setTrust] = useState(70);
  const [platformBps, setPlatformBps] = useState(15);
  const [budget, setBudget] = useState(25);
  const price = priceSuggestion(base, demand, trust);
  const split = revenueSplit(price.price * 10, platformBps, 100 - platformBps);
  const inventory = [
    { id: "agent-orchestration", name: "Agent Orchestration", price: 2.99, category: "Agent Ops" },
    { id: "agent-marketplace-infrastructure", name: "Marketplace Infra", price: 5.99, category: "Commerce" },
    { id: "agent-economy-marketplace-operator", name: "Market Operator", price: 6.99, category: "Commerce" },
    { id: "agent-to-agent-a2a-protocols", name: "A2A Protocols", price: 4.99, category: "Agent Ops" },
    { id: "agent-auditor-compliance-specialist", name: "Agent Auditor", price: 11.99, category: "Trust" },
    { id: "deep-research-synthesizer", name: "Deep Research", price: 9.99, category: "Research" },
  ];
  const match = matchBudget(budget, inventory);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Pricing desk">
        <div className="space-y-3">
          <Field label="Base price USD">
            <input type="number" className={inputCls} value={base} onChange={(e) => setBase(Number(e.target.value))} />
          </Field>
          <Field label={`Demand ${demand}`}>
            <input type="range" min={0} max={100} value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="w-full" />
          </Field>
          <Field label={`Trust ${trust}`}>
            <input type="range" min={0} max={100} value={trust} onChange={(e) => setTrust(Number(e.target.value))} className="w-full" />
          </Field>
          <p className="text-2xl font-semibold text-accent">{price.label}</p>
          <p className="text-xs text-muted">Multiplier {price.mult}× base</p>
        </div>
      </Panel>
      <Panel title="Revenue splits (10 sales)">
        <Field label={`Platform ${platformBps}%`}>
          <input type="range" min={5} max={40} value={platformBps} onChange={(e) => setPlatformBps(Number(e.target.value))} className="w-full" />
        </Field>
        <dl className="mt-3 space-y-2 font-mono text-sm">
          <div className="flex justify-between"><dt className="text-muted">Gross</dt><dd>${split.gross.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Platform</dt><dd>${split.platform.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Creator</dt><dd>${split.creator.toFixed(2)}</dd></div>
        </dl>
      </Panel>
      <Panel title="Buyer budget match">
        <Field label="Budget USD">
          <input type="number" className={inputCls} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        </Field>
        <ul className="mt-3 space-y-1 text-xs">
          {match.cart.map((s) => (
            <li key={s.id} className="flex justify-between border-b border-border py-1">
              <span>{s.name}</span>
              <span className="font-mono">${s.price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          Spent ${match.spent} · remaining ${match.remaining}
        </p>
      </Panel>
    </div>
  );
}

function RedTeamProduct() {
  const [scenarios, setScenarios] = useState<RedScenario[]>(defaultRedScenarios);
  const result = useMemo(() => scoreRedTeam(scenarios), [scenarios]);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Adversarial scenarios">
        <ul className="space-y-2">
          {scenarios.map((s, i) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-muted">
                  {s.severity} · weight {s.weight} — {s.note}
                </p>
              </div>
              <button
                type="button"
                className={cn(
                  "inline-flex h-11 min-w-[4.5rem] items-center justify-center rounded-[var(--radius-md)] border px-3 font-semibold uppercase",
                  s.pass ? "border-ok/40 text-ok" : "border-danger/40 text-danger",
                )}
                onClick={() =>
                  setScenarios((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, pass: !x.pass } : x)),
                  )
                }
              >
                {s.pass ? "pass" : "fail"}
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Certification scorecard">
        <p className="font-mono text-4xl font-semibold">{result.score}</p>
        <p className="text-sm text-muted">Grade {result.grade}</p>
        {result.certificate ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-ok/40 bg-ok/10 p-4">
            <p className="text-xs font-semibold uppercase text-ok">Certified</p>
            <p className="mt-1 font-mono text-sm">{result.certificate.id}</p>
            <p className="text-xs text-muted">{result.certificate.standard}</p>
            <p className="text-xs text-muted">{result.certificate.issuedAt}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-danger/40 bg-danger/10 p-4 text-sm">
            Not certified — fix critical fails:{" "}
            {result.fails.map((f) => f.name).join("; ") || "raise score ≥ 80"}
          </div>
        )}
      </Panel>
    </div>
  );
}

function DecomposerProduct() {
  const [goal, setGoal] = useState(
    "Ship x402 marketplace trust rails and multi-agent ops for lvlltd.com",
  );
  const nodes = useMemo(() => decomposeGoal(goal), [goal]);
  return (
    <div className="space-y-4">
      <Panel title="Goal input">
        <textarea
          className={cn(inputCls, "h-24 py-2")}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </Panel>
      <Panel title="Dependency-aware task graph">
        <ol className="space-y-2">
          {nodes.map((n) => (
            <li key={n.id} className="rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{n.title}</span>
                <span className="font-mono text-[11px] text-subtle">
                  {n.priority} · {n.role}
                </span>
              </div>
              {n.dependsOn.length > 0 && (
                <p className="mt-1 font-mono text-[11px] text-muted">
                  depends: {n.dependsOn.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

function InfraProduct() {
  const [fresh, setFresh] = useState(25);
  const [trust, setTrust] = useState(35);
  const [completion, setCompletion] = useState(25);
  const [priceFit, setPriceFit] = useState(15);
  const w = discoveryWeights(fresh, trust, completion, priceFit);
  const schema = {
    listing: {
      id: "string",
      name: "string",
      price_usd: "number",
      category: "string",
      tier: "free|premium",
      outline_url: "url",
      challenge_url: "url",
      sealed_pack: "object",
    },
    settlement: {
      network: "eip155:8453",
      asset: "USDC",
      protocol: "x402",
      unlock: "POST /api/pay X-PAYMENT",
    },
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Listing schema">
        <pre className="overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </Panel>
      <Panel title="Discovery ranking weights">
        {(
          [
            ["Freshness", fresh, setFresh],
            ["Trust", trust, setTrust],
            ["Completion", completion, setCompletion],
            ["Price fit", priceFit, setPriceFit],
          ] as const
        ).map(([label, val, set]) => (
          <Field key={label} label={`${label} ${val}`}>
            <input type="range" min={0} max={100} value={val} onChange={(e) => set(Number(e.target.value))} className="w-full" />
          </Field>
        ))}
        <pre className="mt-3 rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(w, null, 2)}
        </pre>
      </Panel>
    </div>
  );
}

function MemoryProduct() {
  const [limit, setLimit] = useState(128000);
  const [system, setSystem] = useState(4000);
  const [tools, setTools] = useState(12000);
  const [history, setHistory] = useState(60000);
  const [task, setTask] = useState(8000);
  const budget = memoryBudget(limit, system, tools, history, task);
  const [msgs, setMsgs] = useState([
    "user: list skills under $10",
    "agent: returned 42 skills",
    "user: focus agent ops",
    "agent: filtered 12",
    "user: open orchestration x402",
    "agent: HTTP 402 $2.99",
  ]);
  const compacted = compactHistory(msgs, 3);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Token budget simulator">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["Context limit", limit, setLimit],
              ["System", system, setSystem],
              ["Tools", tools, setTools],
              ["History", history, setHistory],
              ["Task", task, setTask],
            ] as const
          ).map(([label, val, set]) => (
            <Field key={label} label={label}>
              <input type="number" className={inputCls} value={val} onChange={(e) => set(Number(e.target.value))} />
            </Field>
          ))}
        </div>
        <p className="mt-3 text-sm">
          Pressure <strong className="font-mono">{budget.pressure}%</strong> · free{" "}
          <span className="font-mono">{budget.free}</span> · action{" "}
          <span className="text-accent">{budget.action}</span>
        </p>
      </Panel>
      <Panel title="History compaction">
        <ul className="space-y-1 font-mono text-[11px] text-muted">
          {msgs.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-3 text-xs font-semibold text-accent-fg"
          onClick={() => setMsgs(compacted.summary ? [compacted.summary, ...compacted.kept] : compacted.kept)}
        >
          Compact to last 3 + summary
        </button>
        {compacted.summary && (
          <p className="mt-2 text-xs text-muted">{compacted.summary}</p>
        )}
      </Panel>
    </div>
  );
}

function OrchestrationProduct() {
  const [topology, setTopology] = useState<Topology>("hub-spoke");
  const [goal, setGoal] = useState("Focus-four ship for lvlltd.com");
  const book = orchestrationRunbook(topology, goal);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Topology">
        <div className="flex flex-wrap gap-2">
          {(["hub-spoke", "pipeline", "swarm"] as Topology[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopology(t)}
              className={cn(
                "inline-flex h-11 items-center rounded-[var(--radius-md)] border px-3 text-xs font-medium",
                topology === t ? "border-accent bg-accent text-accent-fg" : "border-border bg-elevated",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Field label="Goal">
          <input className={cn(inputCls, "mt-3")} value={goal} onChange={(e) => setGoal(e.target.value)} />
        </Field>
      </Panel>
      <Panel title="Runbook">
        <p className="text-xs text-muted">Roles: {book.roles.join(" → ")}</p>
        <p className="mt-1 text-xs text-muted">Handoffs: {book.handoffs.join(" · ")}</p>
        <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm">
          {book.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <Link to="/" className="mt-4 inline-flex h-11 items-center text-xs text-accent hover:underline">
          Open live Control Room board →
        </Link>
      </Panel>
    </div>
  );
}

function SupervisorProduct() {
  const [sla, setSla] = useState(5000);
  const [beats, setBeats] = useState([
    { agent: "scout", lastMs: 420, status: "ok" as const },
    { agent: "builder", lastMs: 1200, status: "ok" as const },
    { agent: "reviewer", lastMs: 8200, status: "stale" as const },
    { agent: "shipper", lastMs: 200, status: "ok" as const },
    { agent: "auditor", lastMs: 15000, status: "down" as const },
  ]);
  const report = supervise(beats, sla);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Heartbeats">
        <Field label={`SLA ${sla}ms`}>
          <input type="range" min={1000} max={20000} step={500} value={sla} onChange={(e) => setSla(Number(e.target.value))} className="w-full" />
        </Field>
        <ul className="mt-3 space-y-2">
          {beats.map((b, i) => (
            <li key={b.agent} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-mono">{b.agent}</span>
              <input
                type="number"
                className="h-11 w-28 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
                value={b.lastMs}
                onChange={(e) =>
                  setBeats((prev) =>
                    prev.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            lastMs: Number(e.target.value),
                            status:
                              Number(e.target.value) > sla * 2
                                ? "down"
                                : Number(e.target.value) > sla
                                  ? "stale"
                                  : "ok",
                          }
                        : x,
                    ),
                  )
                }
              />
              <span className={cn("text-xs uppercase", b.status === "ok" ? "text-ok" : b.status === "stale" ? "text-warn" : "text-danger")}>
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Interventions">
        <p className="text-sm">
          Healthy {report.healthy}/{report.total}
        </p>
        <ul className="mt-3 space-y-2">
          {report.interventions.map((iv) => (
            <li key={iv.agent} className="rounded-[var(--radius-md)] border border-warn/40 bg-warn/10 p-3 text-xs">
              <strong>{iv.agent}</strong> → {iv.action}: {iv.reason}
            </li>
          ))}
          {report.interventions.length === 0 && (
            <li className="text-sm text-ok">All agents within SLA</li>
          )}
        </ul>
      </Panel>
    </div>
  );
}

function A2AProduct() {
  const [name, setName] = useState("lvl-scout");
  const [url, setUrl] = useState("https://lvlltd.com/a2a/scout");
  const [skills, setSkills] = useState("probe,catalog,health");
  const card = buildAgentCard({
    name,
    url,
    skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    auth: "x402",
  });
  const lifecycle = ["submitted", "working", "input-required", "completed", "failed", "canceled"];
  const [state, setState] = useState("submitted");
  const rpc = {
    jsonrpc: "2.0",
    id: 1,
    method: "tasks/send",
    params: {
      id: "task-demo",
      message: { role: "user", parts: [{ type: "text", text: "Run catalog health" }] },
    },
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Agent Card author">
        <div className="space-y-2">
          <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="URL"><input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
          <Field label="Skills (comma)"><input className={inputCls} value={skills} onChange={(e) => setSkills(e.target.value)} /></Field>
        </div>
        <pre className="mt-3 max-h-64 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(card, null, 2)}
        </pre>
      </Panel>
      <Panel title="Task lifecycle + JSON-RPC">
        <div className="flex flex-wrap gap-1">
          {lifecycle.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setState(s)}
              className={cn(
                "inline-flex h-11 items-center rounded-full border px-3 text-[11px]",
                state === s ? "border-accent bg-accent text-accent-fg" : "border-border bg-elevated",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Current state: <strong className="text-fg">{state}</strong></p>
        <pre className="mt-3 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(rpc, null, 2)}
        </pre>
      </Panel>
    </div>
  );
}

function ProcessProduct() {
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "1", name: "Triage support ticket", owner: "human", minutes: 8, agentable: true },
    { id: "2", name: "Lookup catalog skill", owner: "human", minutes: 5, agentable: true },
    { id: "3", name: "Approve refund", owner: "human", minutes: 4, agentable: false },
    { id: "4", name: "Send buyer message", owner: "human", minutes: 3, agentable: true },
    { id: "5", name: "Update CRM", owner: "human", minutes: 6, agentable: true },
  ]);
  const scored = scoreProcess(steps);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="As-is process">
        <ul className="space-y-2">
          {steps.map((s, i) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="min-w-[10rem] flex-1 font-medium">{s.name}</span>
              <span className="font-mono">{s.minutes}m</span>
              <button
                type="button"
                className={cn(
                  "inline-flex h-11 items-center rounded-[var(--radius-md)] border px-2",
                  s.agentable ? "border-ok/40 text-ok" : "border-border text-muted",
                )}
                onClick={() =>
                  setSteps((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, agentable: !x.agentable } : x)),
                  )
                }
              >
                {s.agentable ? "agentable" : "human-only"}
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Automation score & to-be">
        <p className="font-mono text-3xl font-semibold">{scored.score}%</p>
        <p className="text-sm text-muted">{scored.recommendation}</p>
        <ul className="mt-3 space-y-1 text-xs">
          {scored.toBe.map((s) => (
            <li key={s.id} className="rounded-[var(--radius-md)] bg-elevated px-2 py-1.5">
              {s.name} · {s.owner} · {s.minutes}m
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function BlueprintProduct() {
  const [name, setName] = useState("LVL Marketplace Swarm");
  const [mission, setMission] = useState("Operate discovery, x402 unlock, and trust rails");
  const bp = agentBlueprint(name, mission);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Blueprint inputs">
        <Field label="System name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Mission"><input className={cn(inputCls, "mt-2")} value={mission} onChange={(e) => setMission(e.target.value)} /></Field>
      </Panel>
      <Panel title="Generated blueprint">
        <pre className="overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(bp, null, 2)}
        </pre>
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {bp.launchGate.map((g) => (
            <li key={g}>☐ {g}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function NoCodeProduct() {
  const [nodes, setNodes] = useState<FlowNode[]>(defaultWorkflow());
  const exported = exportWorkflow(nodes);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Workflow canvas">
        <ol className="space-y-2">
          {nodes.map((n, i) => (
            <li key={n.id} className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-border bg-elevated font-mono text-[10px]">
                {i + 1}
              </span>
              <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] uppercase text-muted">
                {n.type}
              </span>
              <input
                className="h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-elevated px-2 text-xs"
                value={n.label}
                onChange={(e) =>
                  setNodes((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          onClick={() =>
            setNodes((prev) => [
              ...prev.slice(0, -1),
              {
                id: `n${prev.length + 1}`,
                type: "agent",
                label: "New agent step",
              },
              prev[prev.length - 1],
            ])
          }
        >
          Add agent node
        </button>
      </Panel>
      <Panel title="Export JSON">
        <pre className="max-h-96 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[11px] text-muted">
          {JSON.stringify(exported, null, 2)}
        </pre>
        <button
          type="button"
          className="mt-3 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg"
          onClick={() => void navigator.clipboard?.writeText(JSON.stringify(exported, null, 2))}
        >
          Copy workflow
        </button>
      </Panel>
    </div>
  );
}
