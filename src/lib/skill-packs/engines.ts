/** Pure product logic for each skill pack workspace. */

export type AuditEvent = {
  id: string;
  t: string;
  actor: string;
  action: string;
  resource: string;
  evidence: string;
  ok: boolean;
};

export function buildAuditPack(events: AuditEvent[]) {
  const ok = events.filter((e) => e.ok).length;
  const fail = events.length - ok;
  const hash = simpleHash(JSON.stringify(events));
  return {
    generatedAt: "2026-08-01T00:00:00.000Z",
    eventCount: events.length,
    ok,
    fail,
    complianceScore: events.length ? Math.round((ok / events.length) * 100) : 0,
    chainHash: hash,
    events,
    export: {
      schema: "lvl-audit-pack-v1",
      chainHash: hash,
      events,
    },
  };
}

export function defaultAuditEvents(): AuditEvent[] {
  const t = "2026-08-01T00:00:00.000Z";
  return [
    {
      id: "ae-1",
      t,
      actor: "operator:dr-drop",
      action: "approve_ship",
      resource: "SHIP.1",
      evidence: "approval_id=apv_demo",
      ok: true,
    },
    {
      id: "ae-2",
      t,
      actor: "shipper",
      action: "deploy",
      resource: "lvlltd.com",
      evidence: "cf_deploy=4b1a5031",
      ok: true,
    },
    {
      id: "ae-3",
      t,
      actor: "x402",
      action: "payment_challenge",
      resource: "agent-orchestration",
      evidence: "HTTP 402 Base USDC",
      ok: true,
    },
    {
      id: "ae-4",
      t,
      actor: "scout",
      action: "listing_probe",
      resource: "/listings/agent-orchestration.html",
      evidence: "301 → trailing slash",
      ok: true,
    },
  ];
}

export function priceSuggestion(base: number, demand: number, trust: number) {
  // demand 0-100, trust 0-100
  const mult = 1 + (demand - 50) / 200 + (trust - 50) / 300;
  const price = Math.max(0.99, Math.round(base * mult * 100) / 100);
  return { price, mult: Math.round(mult * 100) / 100, label: `$${price.toFixed(2)}` };
}

export function revenueSplit(gross: number, platformBps: number, creatorBps: number) {
  const plat = Math.round((gross * platformBps) / 100) / 100;
  const creator = Math.round((gross * creatorBps) / 100) / 100;
  const residual = Math.round((gross - plat - creator) * 100) / 100;
  return { gross, platform: plat, creator, residual, platformBps, creatorBps };
}

export function matchBudget(
  budget: number,
  skills: { id: string; name: string; price: number; category: string }[],
) {
  const affordable = skills
    .filter((s) => s.price <= budget)
    .sort((a, b) => b.price - a.price);
  const cart: typeof skills = [];
  let spent = 0;
  for (const s of affordable) {
    if (spent + s.price <= budget) {
      cart.push(s);
      spent += s.price;
    }
  }
  return { cart, spent: Math.round(spent * 100) / 100, remaining: Math.round((budget - spent) * 100) / 100 };
}

export type RedScenario = {
  id: string;
  name: string;
  severity: "low" | "med" | "high" | "crit";
  weight: number;
  pass: boolean;
  note: string;
};

export function defaultRedScenarios(): RedScenario[] {
  return [
    { id: "rt-prompt", name: "Prompt injection via listing summary", severity: "high", weight: 20, pass: true, note: "Sanitized inputs" },
    { id: "rt-pay", name: "402 challenge replay / double unlock", severity: "crit", weight: 25, pass: true, note: "txHash uniqueness" },
    { id: "rt-ssrf", name: "Scout SSRF via crafted path", severity: "high", weight: 15, pass: true, note: "path allowlist" },
    { id: "rt-cost", name: "Token bucket exhaustion DoS", severity: "med", weight: 15, pass: true, note: "backpressure + circuit" },
    { id: "rt-leak", name: "Sealed pack leakage pre-pay", severity: "crit", weight: 25, pass: false, note: "Needs pack ACL audit" },
  ];
}

export function scoreRedTeam(scenarios: RedScenario[]) {
  const totalW = scenarios.reduce((a, s) => a + s.weight, 0) || 1;
  const earned = scenarios.reduce((a, s) => a + (s.pass ? s.weight : 0), 0);
  const score = Math.round((earned / totalW) * 100);
  const fails = scenarios.filter((s) => !s.pass);
  const certified = score >= 80 && !fails.some((f) => f.severity === "crit");
  return {
    score,
    certified,
    grade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F",
    fails,
    certificate: certified
      ? {
          id: `cert-${simpleHash(scenarios.map((s) => s.id + s.pass).join("|")).slice(0, 8)}`,
          issuedAt: "2026-08-01T00:00:00.000Z",
          score,
          standard: "LVL Red-Team Certification v1",
        }
      : null,
  };
}

export type DecompNode = {
  id: string;
  title: string;
  role: string;
  dependsOn: string[];
  priority: "P0" | "P1" | "P2";
};

export function decomposeGoal(goal: string): DecompNode[] {
  const g = goal.trim() || "Improve agent marketplace reliability";
  const base = simpleHash(g).slice(0, 4);
  return [
    { id: `${base}-1`, title: `Scope: ${g.slice(0, 60)}`, role: "conductor", dependsOn: [], priority: "P0" },
    { id: `${base}-2`, title: "Probe production surfaces", role: "scout", dependsOn: [`${base}-1`], priority: "P0" },
    { id: `${base}-3`, title: "Implement critical fixes", role: "builder", dependsOn: [`${base}-2`], priority: "P0" },
    { id: `${base}-4`, title: "Review risk + a11y", role: "reviewer", dependsOn: [`${base}-3`], priority: "P1" },
    { id: `${base}-5`, title: "Audit trail + compliance note", role: "auditor", dependsOn: [`${base}-3`], priority: "P1" },
    { id: `${base}-6`, title: "Ship with approval gate", role: "shipper", dependsOn: [`${base}-4`, `${base}-5`], priority: "P0" },
    { id: `${base}-7`, title: "Operate + observe", role: "operator", dependsOn: [`${base}-6`], priority: "P2" },
  ];
}

export function discoveryWeights(fresh: number, trust: number, completion: number, priceFit: number) {
  const sum = fresh + trust + completion + priceFit || 1;
  const norm = (n: number) => Math.round((n / sum) * 1000) / 1000;
  return {
    freshness: norm(fresh),
    trust: norm(trust),
    completion: norm(completion),
    priceFit: norm(priceFit),
    formula: "rank = 0.w·fresh + 0.w·trust + 0.w·completion + 0.w·priceFit",
  };
}

export function memoryBudget(contextLimit: number, system: number, tools: number, history: number, task: number) {
  const used = system + tools + history + task;
  const free = contextLimit - used;
  const pressure = used / contextLimit;
  let action = "ok";
  if (pressure > 0.9) action = "hard_compact";
  else if (pressure > 0.75) action = "soft_compact";
  else if (pressure > 0.6) action = "summarize_history";
  return {
    contextLimit,
    used,
    free,
    pressure: Math.round(pressure * 100),
    action,
    segments: { system, tools, history, task },
  };
}

export function compactHistory(messages: string[], keep: number) {
  if (messages.length <= keep) return { kept: messages, summary: null as string | null };
  const drop = messages.slice(0, messages.length - keep);
  const kept = messages.slice(-keep);
  const summary = `Compacted ${drop.length} turns: ${drop.map((m) => m.slice(0, 40)).join(" · ").slice(0, 200)}`;
  return { kept, summary };
}

export type Topology = "hub-spoke" | "pipeline" | "swarm";

export function orchestrationRunbook(topology: Topology, goal: string) {
  const roles =
    topology === "pipeline"
      ? ["scout", "builder", "reviewer", "shipper"]
      : topology === "swarm"
        ? ["scout", "builder", "builder", "reviewer", "auditor"]
        : ["conductor", "scout", "builder", "reviewer", "shipper", "auditor", "operator"];
  return {
    topology,
    goal,
    roles,
    handoffs:
      topology === "hub-spoke"
        ? ["conductor→role", "role→conductor", "conductor→shipper"]
        : topology === "pipeline"
          ? ["scout→builder", "builder→reviewer", "reviewer→shipper"]
          : ["peer↔peer", "collapse→conductor"],
    steps: [
      "Admit work under backpressure",
      "Reserve tokens from role bucket",
      "Execute with work log",
      "Handoff artifacts",
      "Gate ship on approval",
    ],
  };
}

export type Heartbeat = { agent: string; lastMs: number; status: "ok" | "stale" | "down" };

export function supervise(heartbeats: Heartbeat[], slaMs: number) {
  const now = 0; // relative
  const interventions = heartbeats
    .filter((h) => h.lastMs > slaMs || h.status !== "ok")
    .map((h) => ({
      agent: h.agent,
      action: h.status === "down" || h.lastMs > slaMs * 2 ? "restart" : "nudge",
      reason: h.status === "down" ? "heartbeat missing" : `latency ${h.lastMs}ms > SLA ${slaMs}ms`,
    }));
  return {
    healthy: heartbeats.filter((h) => h.status === "ok" && h.lastMs <= slaMs).length,
    total: heartbeats.length,
    interventions,
    slaMs,
  };
}

export function buildAgentCard(input: {
  name: string;
  url: string;
  skills: string[];
  auth: string;
}) {
  return {
    protocolVersion: "0.2.0",
    name: input.name,
    description: `A2A card for ${input.name}`,
    url: input.url,
    provider: { organization: "LVL LTD", url: "https://lvlltd.com" },
    capabilities: { streaming: true, pushNotifications: false },
    defaultInputModes: ["text", "data"],
    defaultOutputModes: ["text", "data"],
    skills: input.skills.map((s) => ({
      id: s,
      name: s,
      description: `Skill surface ${s}`,
      tags: ["lvl", "x402"],
    })),
    securitySchemes: { [input.auth]: { type: input.auth } },
  };
}

export type ProcessStep = {
  id: string;
  name: string;
  owner: "human" | "agent" | "hybrid";
  minutes: number;
  agentable: boolean;
};

export function scoreProcess(steps: ProcessStep[]) {
  const totalMin = steps.reduce((a, s) => a + s.minutes, 0) || 1;
  const agentMin = steps.filter((s) => s.agentable).reduce((a, s) => a + s.minutes, 0);
  const score = Math.round((agentMin / totalMin) * 100);
  const toBe = steps.map((s) =>
    s.agentable ? { ...s, owner: "agent" as const, name: `[agent] ${s.name}` } : s,
  );
  return { score, totalMin, agentMin, toBe, recommendation: score >= 60 ? "automate" : "pilot hybrid" };
}

export function agentBlueprint(name: string, mission: string) {
  return {
    name,
    mission,
    roles: [
      { id: "planner", tools: ["search", "decompose"] },
      { id: "worker", tools: ["code", "browser"] },
      { id: "critic", tools: ["eval", "redteam"] },
    ],
    evals: ["unit", "scenario", "redteam"],
    launchGate: ["tests green", "redteam ≥80", "audit trail on", "approval_id"],
  };
}

export type FlowNode = {
  id: string;
  type: "trigger" | "agent" | "gate" | "action" | "end";
  label: string;
};

export function defaultWorkflow(): FlowNode[] {
  return [
    { id: "n1", type: "trigger", label: "Catalog update webhook" },
    { id: "n2", type: "agent", label: "Scout health" },
    { id: "n3", type: "gate", label: "Score ≥ 80?" },
    { id: "n4", type: "action", label: "Notify operator" },
    { id: "n5", type: "agent", label: "Auto-open P0 tasks" },
    { id: "n6", type: "end", label: "Done" },
  ];
}

export function exportWorkflow(nodes: FlowNode[]) {
  return {
    schema: "lvl-nocode-workflow-v1",
    edges: nodes.slice(0, -1).map((n, i) => ({ from: n.id, to: nodes[i + 1].id })),
    nodes,
    exportedAt: "2026-08-01T00:00:00.000Z",
  };
}

function simpleHash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
