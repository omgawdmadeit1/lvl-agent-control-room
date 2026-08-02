import type { AgentSystemState, BoardTask, RoleId, Artifact } from "./types";
import {
  admitBatch,
  applyDeferredStatuses,
  consumeBudget,
  promoteDeferred,
  recordFailure,
  recordSuccess,
  refreshBackpressure,
  tickCircuitCooldown,
  updateConfig,
} from "./backpressure";
import type { BackpressureConfig } from "./types";
import { consumeFromBuckets } from "./token-bucket-bridge";

function now() {
  return new Date().toISOString();
}

type LogLevel = "info" | "ok" | "warn" | "err";

/** Reserve tokens from hierarchical buckets; defer if empty. */
function applyTokenBuckets(
  state: AgentSystemState,
  candidates: BoardTask[],
): { state: AgentSystemState; admitted: BoardTask[]; deferred: BoardTask[] } {
  let snaps = state.tokenBuckets;
  const admitted: BoardTask[] = [];
  const deferred: BoardTask[] = [];
  for (const task of candidates) {
    const r = consumeFromBuckets(snaps, task.role, task.cost);
    snaps = r.snaps;
    if (r.ok) admitted.push(task);
    else {
      deferred.push(task);
    }
  }
  let s: AgentSystemState = {
    ...state,
    tokenBuckets: snaps,
    backpressure: {
      ...state.backpressure,
      lastDecision:
        deferred.length && !admitted.length
          ? snaps.find((b) => b.name === "global")?.lastDecision || "token_bucket_defer"
          : state.backpressure.lastDecision,
    },
  };
  if (deferred.length) {
    s = applyDeferredStatuses(s, deferred, "token_bucket");
    s = pushLog(
      s,
      `Token bucket deferred ${deferred.length}: ${deferred.map((d) => d.id).join(", ")}`,
      "warn",
    );
  }
  if (admitted.length) {
    s = pushLog(
      s,
      `Token bucket reserved for ${admitted.map((a) => a.id).join(", ")}`,
      "info",
    );
  }
  return { state: s, admitted, deferred };
}


function pushLog(state: AgentSystemState, msg: string, level: LogLevel = "info"): AgentSystemState {
  return {
    ...state,
    log: [{ t: now(), msg, level }, ...state.log].slice(0, 120),
  };
}

function recompute(state: AgentSystemState): AgentSystemState {
  const s = refreshBackpressure(state);
  const tasksDone = s.tasks.filter((t) => t.status === "DONE").length;
  const p0Open = s.tasks.filter((t) => t.priority === "P0" && t.status !== "DONE").length;
  return {
    ...s,
    metrics: {
      tasksDone,
      tasksTotal: s.tasks.length,
      artifacts: s.artifacts.length,
      p0Open,
    },
    status:
      s.status === "PAUSED"
        ? "PAUSED"
        : tasksDone === s.tasks.length
          ? "COMPLETE"
          : s.status === "IDLE" && tasksDone === 0
            ? "IDLE"
            : "RUNNING",
  };
}

function depsMet(task: BoardTask, tasks: BoardTask[]) {
  return task.dependsOn.every((id) => tasks.find((t) => t.id === id)?.status === "DONE");
}

function unlockReady(state: AgentSystemState): AgentSystemState {
  const tasks = state.tasks.map((t) => {
    if (t.status === "PENDING" && depsMet(t, state.tasks)) {
      return {
        ...t,
        status: "READY" as const,
        workLog: [...t.workLog, `${now()} unlocked by dependencies`],
      };
    }
    return t;
  });
  return { ...state, tasks };
}

const SWARM_SAFE_ROLES: RoleId[] = ["scout", "auditor", "reviewer"];
const WRITE_ROLES: RoleId[] = ["builder", "shipper", "operator", "conductor"];

const WORK: Record<
  string,
  (task: BoardTask) => { result: string; artifact: Omit<Artifact, "id" | "createdAt">; fail?: boolean }
> = {
  "P0.1": (task) => ({
    result: "Featured shelf requires Auditor stages 1–5 attestation; demote uncertified claims.",
    artifact: {
      type: "audit_policy",
      title: "Featured listing audit gate",
      body: JSON.stringify(
        {
          rule: "featured_requires_audit_stages_1_5",
          stages: [
            "context_reconstruction",
            "accuracy_counterfactuals",
            "bias_analysis",
            "regulatory_mapping",
            "risk_scoring",
          ],
          go_no_go: "go",
          risk_score: 0.3,
        },
        null,
        2,
      ),
      role: task.role,
      taskId: task.id,
    },
  }),
  "P0.2": (task) => ({
    result: "Canonical listing URL is /listings/{id}/ — seal.listing .html paths marked for rewrite.",
    artifact: {
      type: "code_fix",
      title: "seal.listing URL rewrite plan",
      body: `seal.listing = \`https://lvlltd.com/listings/\${id}/\`;`,
      role: task.role,
      taskId: task.id,
    },
  }),
  "P0.3": (task) => ({
    result: "Unlock receipt schema: txHash, skill_id, pack_hash, issued_at, re_redeem.",
    artifact: {
      type: "receipt_schema",
      title: "Unlock evidence receipt",
      body: JSON.stringify(
        {
          payment: { txHash: "0x…", network: "base", amount_usd: 2.99 },
          skill_id: "agent-orchestration",
          pack_hash: "sha256:…",
          issued_at: now(),
        },
        null,
        2,
      ),
      role: task.role,
      taskId: task.id,
    },
  }),
  "P0.4": (task) => ({
    result: "Badge honesty: outline_only cannot show Deep/Ready without quality floor.",
    artifact: {
      type: "review_findings",
      title: "Featured badge honesty review",
      body: "Demote boiler_skill_md packs from featured; free sample must support claim.",
      role: task.role,
      taskId: task.id,
    },
  }),
  "P1.1": (task) => ({
    result: "Curated default confirmed; full inventory via include_outline_only.",
    artifact: {
      type: "ops_policy",
      title: "Curated catalog default",
      body: "API default curated=true.",
      role: task.role,
      taskId: task.id,
    },
  }),
  "P1.2": (task) => ({
    result: "Fee policy draft: 10% platform take (range 5–15%); creator 90%.",
    artifact: {
      type: "fee_policy",
      title: "Marketplace commission policy",
      body: JSON.stringify({ platform_take_pct: 10, range_pct: [5, 15] }, null, 2),
      role: task.role,
      taskId: task.id,
    },
  }),
  "P1.3": (task) => ({
    result: "Scorecard fields wired to /api/proof confirmed totals only.",
    artifact: {
      type: "scorecard",
      title: "Weekly operator scorecard",
      body: "Source: /api/proof only.",
      role: task.role,
      taskId: task.id,
    },
  }),
  "P3.1": (task) => ({
    result: "Home → catalog.json?fields=meta; Hub → fields=slim.",
    artifact: {
      type: "perf_fix",
      title: "Catalog fetch slimdown",
      body: "Stop 1.8MB full catalog on home.",
      role: task.role,
      taskId: task.id,
    },
  }),
  "P3.2": (task) => ({
    result: "Listings index ItemList slimmed to ListItem url+name.",
    artifact: {
      type: "seo_fix",
      title: "Listings JSON-LD slim",
      body: "Full Product schema on detail pages only.",
      role: task.role,
      taskId: task.id,
    },
  }),
  "SHIP.1": (task) => ({
    result: "Ship package prepared — approval_id satisfied.",
    artifact: {
      type: "ship_packet",
      title: "Release packet",
      body: "P0 fixes + smoke checklist.",
      role: task.role,
      taskId: task.id,
    },
  }),
};

const SWARM_PROBES = [
  {
    id: "SWARM.catalog",
    title: "Catalog quality probe",
    body: "Sample listings: outline_only ratio, badge honesty, seal.listing 404 rate.",
  },
  {
    id: "SWARM.x402",
    title: "x402 challenge probe",
    body: "Canary + flagship 402 shape, payTo checksum, amount consistency.",
  },
  {
    id: "SWARM.proof",
    title: "Proof ledger probe",
    body: "confirmed volume vs claims; no invented GMV.",
  },
  {
    id: "SWARM.seo",
    title: "SERP/snippet probe",
    body: "Homepage title vs merch bleed; /status/ indexability.",
  },
  {
    id: "SWARM.competitors",
    title: "Competitive skill markets",
    body: "Read-only scan of agent skill market patterns.",
  },
  {
    id: "SWARM.trust",
    title: "Trust scorecard probe",
    body: "Composite trust caps for outline_only + no_data_yet.",
  },
  {
    id: "SWARM.bundles",
    title: "Bundle integrity probe",
    body: "member_skill_ids present; savings_usd coherent.",
  },
];

function completeTask(state: AgentSystemState, task: BoardTask, mode: string): AgentSystemState {
  const worker = WORK[task.id];
  const payload = worker
    ? worker(task)
    : {
        result: `Completed ${task.title}`,
        artifact: {
          type: "note" as const,
          title: task.title,
          body: task.detail,
          role: task.role,
          taskId: task.id,
        },
      };

  let s = consumeBudget(state, task.role, task.cost);

  const art: Artifact = {
    ...payload.artifact,
    id: `art-${task.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now(),
    body:
      mode.includes("swarm")
        ? `[${mode} · outbox/${task.role} · cost=${task.cost}]\n${payload.artifact.body}`
        : payload.artifact.body,
  };

  const tasks = s.tasks.map((t) =>
    t.id === task.id
      ? {
          ...t,
          status: "DONE" as const,
          result: payload.result,
          workLog: [...t.workLog, `${now()} ${task.role} completed (${mode}) cost=${task.cost}`, payload.result],
        }
      : t.status === "RUNNING" && t.id === task.id
        ? t
        : t,
  );

  let rails = s.rails;
  if (task.id === "P0.3") {
    rails = rails.map((r) =>
      r.id === "x402" ? { ...r, note: "Live + unlock receipts standardized" } : r,
    );
  }

  const roles = s.roles.map((r) => {
    if (r.id === task.role) return { ...r, status: "done" as const, lastAction: payload.result };
    if (r.id === "conductor" && !mode.includes("swarm"))
      return { ...r, status: "working" as const, lastAction: `Assigned ${task.id}` };
    return r;
  });

  s = {
    ...s,
    tasks,
    roles,
    rails,
    artifacts: [art, ...s.artifacts],
    status: "RUNNING",
  };

  s = recordSuccess(s);
  return pushLog(s, `${mode}: ${task.role} finished ${task.id} (−${task.cost} tokens)`, "ok");
}

function ensureSwarmProbes(state: AgentSystemState): AgentSystemState {
  if (state.topology !== "swarm") return state;
  const existing = new Set(state.tasks.map((t) => t.id));
  const extras: BoardTask[] = SWARM_PROBES.filter((p) => !existing.has(p.id)).map((p) => ({
    id: p.id,
    title: p.title,
    detail: p.body,
    role: "scout" as RoleId,
    status: "READY" as const,
    priority: "P1" as const,
    dependsOn: [],
    cost: 1,
    workLog: [`${now()} injected as swarm read-only probe`],
  }));
  if (!extras.length) return state;
  // If queue would exceed max, mark extras as QUEUED/DEFERRED via admit later
  return pushLog(
    { ...state, tasks: [...extras, ...state.tasks] },
    `Swarm: injected ${extras.length} probes (subject to backpressure admit)`,
    "info",
  );
}

function runAdmitted(
  state: AgentSystemState,
  admitted: BoardTask[],
  mode: string,
): AgentSystemState {
  let s = state;
  for (const task of admitted) {
    // mark running briefly for metrics
    s = {
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === task.id
          ? { ...t, status: "RUNNING" as const, workLog: [...t.workLog, `${now()} admitted under backpressure`] }
          : t,
      ),
    };

    if (task.id.startsWith("SWARM.")) {
      const probe = SWARM_PROBES.find((p) => p.id === task.id);
      s = consumeBudget(s, task.role, task.cost);
      const art: Artifact = {
        id: `art-${task.id}-${Date.now().toString(36)}`,
        type: "swarm_probe",
        title: task.title,
        body: JSON.stringify(
          {
            pattern: "read-only-fan-out",
            backpressure: {
              pressure: s.backpressure.pressure,
              cost: task.cost,
              globalUsed: s.backpressure.globalTokensUsed,
            },
            outbox: `outbox/scout/${task.id}/v1.json`,
            findings: probe?.body,
          },
          null,
          2,
        ),
        createdAt: now(),
        role: "scout",
        taskId: task.id,
      };
      s = {
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: "DONE" as const,
                result: `Swarm probe complete → ${art.id}`,
                workLog: [...t.workLog, `${now()} swarm parallel complete`],
              }
            : t,
        ),
        artifacts: [art, ...s.artifacts],
        roles: s.roles.map((r) =>
          r.id === "scout"
            ? { ...r, status: "working" as const, lastAction: `Fan-out ${task.id}` }
            : r,
        ),
      };
      s = recordSuccess(s);
      s = pushLog(s, `${mode}: scout finished ${task.id} (−${task.cost} tok)`, "ok");
    } else {
      s = completeTask(s, task, mode);
    }
  }
  return s;
}

function tickSwarm(state: AgentSystemState): AgentSystemState {
  let s = tickCircuitCooldown(ensureSwarmProbes(unlockReady(state)));
  s = promoteDeferred(s);
  s = refreshBackpressure(s);

  const candidates = s.tasks.filter(
    (t) =>
      (t.status === "READY" || t.status === "DEFERRED") &&
      SWARM_SAFE_ROLES.includes(t.role) &&
      !t.requiresApproval,
  );

  const limit = Math.min(s.backpressure.config.maxFanOut, s.backpressure.config.maxConcurrent);
  const { admitted, deferred, state: gated } = admitBatch(s, candidates, limit);
  s = gated;

  if (deferred.length) {
    s = applyDeferredStatuses(s, deferred, s.backpressure.lastDecision);
    s = pushLog(
      s,
      `Backpressure deferred ${deferred.length}: ${deferred.map((d) => d.id).join(", ")}`,
      "warn",
    );
  }

  if (admitted.length) {
    s = pushLog(
      s,
      `Swarm admit ${admitted.length}/${candidates.length} (pressure=${s.backpressure.pressure}, concurrent≤${limit})`,
      "info",
    );
    const tb = applyTokenBuckets(s, admitted);
    s = tb.state;
    if (tb.admitted.length) {
      s = runAdmitted(s, tb.admitted, "swarm");
    }
    return recompute(unlockReady(s));
  }

  // Write path collapse under hub rules with backpressure
  const writeReady = s.tasks.filter(
    (t) =>
      (t.status === "READY" || t.status === "DEFERRED") &&
      (!t.requiresApproval || t.approvalId) &&
      (WRITE_ROLES.includes(t.role) || t.requiresApproval),
  );
  if (writeReady.length) {
    const { admitted: wAdmitted, deferred: wDef, state: wState } = admitBatch(s, writeReady, 1);
    s = wState;
    if (wDef.length) s = applyDeferredStatuses(s, wDef, "write_path_backpressure");
    if (wAdmitted.length) {
      s = pushLog(s, `Swarm collapse → hub sequential ${wAdmitted[0].id}`, "warn");
      const tb = applyTokenBuckets(s, wAdmitted);
      s = tb.state;
      if (tb.admitted.length) s = runAdmitted(s, tb.admitted, "swarm→hub");
      return recompute(unlockReady(s));
    }
  }

  const needsApproval = s.tasks.find(
    (t) => t.status === "READY" && t.requiresApproval && !t.approvalId,
  );
  if (needsApproval) {
    return recompute(
      pushLog(
        {
          ...s,
          roles: s.roles.map((r) =>
            r.id === "shipper"
              ? { ...r, status: "blocked", lastAction: "Waiting for approval_id" }
              : r,
          ),
        },
        `Shipper blocked on ${needsApproval.id}`,
        "warn",
      ),
    );
  }

  // synthesis when probes done
  const probes = s.tasks.filter((t) => t.id.startsWith("SWARM."));
  const allProbesDone = probes.length > 0 && probes.every((t) => t.status === "DONE");
  const hasSynthesis = s.artifacts.some((a) => a.type === "swarm_synthesis");
  if (allProbesDone && !hasSynthesis) {
    const synthesis: Artifact = {
      id: `art-synth-${Date.now().toString(36)}`,
      type: "swarm_synthesis",
      title: "Swarm merge — conductor synthesis",
      body: JSON.stringify(
        {
          pattern: "map-reduce",
          inputs: probes.map((p) => p.id),
          backpressure: s.backpressure.pressure,
          rule: "Single conductor owns merge",
          topology_after: "collapse to hub-spoke for implement/ship",
        },
        null,
        2,
      ),
      createdAt: now(),
      role: "conductor",
    };
    s = pushLog(
      {
        ...s,
        artifacts: [synthesis, ...s.artifacts],
        roles: s.roles.map((r) =>
          r.id === "conductor"
            ? { ...r, status: "done", lastAction: "Published swarm synthesis" }
            : r,
        ),
      },
      "Swarm synthesis published",
      "ok",
    );
  }

  // stalled with deferred work and no admits → note budget/circuit
  if (
    s.tasks.some((t) => t.status === "DEFERRED") &&
    s.backpressure.globalTokensUsed >= s.backpressure.config.globalTokenBudget
  ) {
    s = pushLog(s, "Hard stop: global token budget exhausted — raise budget or reset", "err");
  }

  return recompute(s);
}

function tickHubOrPipeline(state: AgentSystemState): AgentSystemState {
  let s = tickCircuitCooldown(unlockReady(state));
  s = promoteDeferred(s);
  s = refreshBackpressure(s);

  const ready = s.tasks.filter(
    (t) =>
      (t.status === "READY" || t.status === "DEFERRED") &&
      (!t.requiresApproval || t.approvalId),
  );

  if (s.topology === "pipeline") {
    const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
    ready.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  const limit = s.backpressure.config.maxConcurrent > 0 ? 1 : 0; // hub/pipeline: one at a time
  const { admitted, deferred, state: gated } = admitBatch(s, ready, Math.max(1, limit));
  s = gated;

  if (deferred.length) {
    s = applyDeferredStatuses(s, deferred, s.backpressure.lastDecision);
    if (deferred.length === ready.length && admitted.length === 0) {
      s = pushLog(
        s,
        `Backpressure holding all ${deferred.length} ready tasks (${s.backpressure.pressure})`,
        "warn",
      );
    }
  }

  if (!admitted.length) {
    const needsApproval = s.tasks.find(
      (t) => t.status === "READY" && t.requiresApproval && !t.approvalId,
    );
    if (needsApproval) {
      return recompute(
        pushLog(
          {
            ...s,
            roles: s.roles.map((r) =>
              r.id === "shipper"
                ? { ...r, status: "blocked", lastAction: "Waiting for approval_id" }
                : r,
            ),
          },
          `Shipper blocked on ${needsApproval.id}`,
          "warn",
        ),
      );
    }
    return recompute(s);
  }

  const tb = applyTokenBuckets(s, admitted);
  s = tb.state;
  if (tb.admitted.length) s = runAdmitted(s, tb.admitted, s.topology);
  return recompute(unlockReady(s));
}

export function tick(state: AgentSystemState): AgentSystemState {
  if (state.topology === "swarm") return tickSwarm(state);
  return tickHubOrPipeline(state);
}

export function grantApproval(state: AgentSystemState, approvalId: string): AgentSystemState {
  const tasks = state.tasks.map((t) =>
    t.requiresApproval && t.status !== "DONE"
      ? {
          ...t,
          approvalId,
          workLog: [...t.workLog, `${now()} approval ${approvalId}`],
        }
      : t,
  );
  return recompute(
    pushLog(
      {
        ...state,
        tasks,
        roles: state.roles.map((r) =>
          r.id === "shipper"
            ? { ...r, status: "idle", lastAction: `Approved ${approvalId}` }
            : r,
        ),
      },
      `Approval granted: ${approvalId}`,
      "ok",
    ),
  );
}

export function setTopology(
  state: AgentSystemState,
  topology: AgentSystemState["topology"],
): AgentSystemState {
  let s = pushLog({ ...state, topology }, `Topology set to ${topology}`, "info");
  if (topology === "swarm") {
    s = ensureSwarmProbes(s);
    // tighten fan-out under backpressure defaults for swarm demo
    s = {
      ...s,
      backpressure: {
        ...s.backpressure,
        lastDecision: "swarm mode · maxFanOut enforced",
      },
    };
    s = pushLog(
      s,
      "Swarm + backpressure: fan-out capped, budgets enforced, writes collapse to hub",
      "warn",
    );
  }
  return recompute(s);
}

export function assignFocusRole(state: AgentSystemState, roleId: RoleId): AgentSystemState {
  return {
    ...state,
    roles: state.roles.map((r) =>
      r.id === roleId
        ? { ...r, status: "working", lastAction: "Manual focus" }
        : r.status === "working"
          ? { ...r, status: "idle" }
          : r,
    ),
  };
}

export function setBackpressureConfig(
  state: AgentSystemState,
  patch: Partial<BackpressureConfig>,
): AgentSystemState {
  return recompute(
    pushLog(updateConfig(state, patch), `Backpressure config: ${JSON.stringify(patch)}`, "info"),
  );
}

/** Simulate saturation: inject many cheap scout probes to exercise backpressure */
export function floodQueue(state: AgentSystemState, n = 12): AgentSystemState {
  const extras: BoardTask[] = Array.from({ length: n }, (_, i) => ({
    id: `FLOOD.${i + 1}`,
    title: `Flood probe ${i + 1}`,
    detail: "Synthetic load to exercise queue depth, admit gate, and token budgets.",
    role: "scout" as RoleId,
    status: "READY" as const,
    priority: "P2" as const,
    dependsOn: [],
    cost: 1,
    workLog: [`${now()} flood injected`],
  }));
  return recompute(
    pushLog(
      { ...state, tasks: [...extras, ...state.tasks] },
      `Injected ${n} flood probes — watch queue depth & admit gate`,
      "warn",
    ),
  );
}

export function tripCircuit(state: AgentSystemState): AgentSystemState {
  let s = state;
  for (let i = 0; i < s.backpressure.config.circuitFailureThreshold; i++) {
    s = recordFailure(s, "manual_trip");
  }
  return recompute(pushLog(s, "Circuit breaker OPEN (manual trip)", "err"));
}

export const SWARM_PATTERNS = [
  {
    id: "read-only-fan-out",
    name: "Read-only fan-out",
    when: "Parallel research, competitive scans, multi-source fact gathering",
    how: "N scouts write only to private outbox/scout/{id}/v*; no shared mutable state",
    risk: "Low if deny fs.write/deploy/pay",
    lvlltd: "Catalog quality + x402 + SERP probes",
  },
  {
    id: "map-reduce",
    name: "Map → Reduce (synthesis)",
    when: "Many partial findings need one decision memo",
    how: "Map probes in parallel; single conductor merges with citations",
    risk: "Medium if merge invents peer results",
    lvlltd: "Swarm synthesis artifact before builder work",
  },
  {
    id: "router-workers",
    name: "Router + reputation workers",
    when: "Marketplace dispatch by cert, cost, latency",
    how: "Router scores workers; workers pull tasks; no peer-to-peer write",
    risk: "Medium — bad ranking → bad assignment",
    lvlltd: "DogeForge-style skill dispatch",
  },
  {
    id: "blackboard",
    name: "Blackboard (constrained)",
    when: "Shared hypotheses under strict schema",
    how: "Append-only versioned facts; never overwrite; leases on keys",
    risk: "High without leases — write races",
    lvlltd: "Avoid for catalog mutations; OK for research notes",
  },
  {
    id: "pipeline-legs",
    name: "Swarm island under hub",
    when: "Product crew with one research burst",
    how: "Hub assigns swarm island for research, then collapses to pipeline for build/review/ship",
    risk: "Low — blast radius bounded",
    lvlltd: "Default recommendation for focus-four",
  },
  {
    id: "never-swarm",
    name: "Never-swarm zones",
    when: "Money, deploy, secrets, SSI/PASS, treasury",
    how: "Single shipper + approval_id; auditor gate; no mesh",
    risk: "Critical if violated",
    lvlltd: "SHIP.1, /api/pay, fee treasury",
  },
  {
    id: "backpressure",
    name: "Backpressure & bulkheads",
    when: "Queue growth, budget burn, cascading failures",
    how: "Admit gate + max concurrent + token budgets + circuit breaker + hysteresis",
    risk: "Starvation if P0 not prioritized",
    lvlltd: "Live in Control Room backpressure panel",
  },
] as const;

// re-export for store
export type { BackpressureConfig };


export function ingestLiveScout(
  state: AgentSystemState,
  payload: { summary: string; artifactBody: string; okCount: number; total: number },
): AgentSystemState {
  const art: Artifact = {
    id: `art-live-scout-${Date.now().toString(36)}`,
    type: "live_scout",
    title: "Live lvlltd.com scout suite",
    body: payload.artifactBody,
    createdAt: now(),
    role: "scout",
  };
  // Mark related swarm probes done if present
  const probeIds = new Set(
    ["SWARM.catalog", "SWARM.x402", "SWARM.proof", "SWARM.seo", "SWARM.trust"].filter(Boolean),
  );
  const tasks = state.tasks.map((t) =>
    probeIds.has(t.id) && t.status !== "DONE"
      ? {
          ...t,
          status: "DONE" as const,
          result: "Satisfied by live scout suite",
          workLog: [...t.workLog, `${now()} closed by live scout`],
        }
      : t,
  );
  let s: AgentSystemState = {
    ...state,
    tasks,
    artifacts: [art, ...state.artifacts],
    roles: state.roles.map((r) =>
      r.id === "scout"
        ? {
            ...r,
            status: "done",
            lastAction: payload.summary,
            tokenUsed: r.tokenUsed + 2,
          }
        : r.id === "conductor"
          ? { ...r, lastAction: "Ingested live scout findings" }
          : r,
    ),
    status: "RUNNING",
  };
  s = pushLog(
    s,
    `Live scout: ${payload.okCount}/${payload.total} ok — ${payload.summary.slice(0, 120)}`,
    payload.okCount === payload.total ? "ok" : "warn",
  );
  return recompute(s);
}
