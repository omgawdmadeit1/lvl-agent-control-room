/** Copy-paste oriented examples mirroring live Control Room backpressure. */

export type CodeExample = {
  id: string;
  title: string;
  summary: string;
  language: "ts" | "js";
  code: string;
};

export const BACKPRESSURE_EXAMPLES: CodeExample[] = [
  {
    id: "config",
    title: "1. Config & water marks",
    summary: "Cap concurrency, fan-out, queue depth; use hysteresis so admit doesn’t flap.",
    language: "ts",
    code: `export type BackpressureConfig = {
  maxConcurrent: number;      // tasks in flight per tick
  maxFanOut: number;          // swarm parallel admit cap
  maxQueueDepth: number;      // hard queue ceiling
  highWaterMark: number;      // close admit gate
  lowWaterMark: number;       // reopen admit gate
  globalTokenBudget: number;  // tool-calls per run
  defaultRoleBudget: number;
  circuitFailureThreshold: number;
  circuitCooldownTicks: number;
};

export const DEFAULT_BP_CONFIG: BackpressureConfig = {
  maxConcurrent: 2,
  maxFanOut: 3,
  maxQueueDepth: 8,
  highWaterMark: 5,
  lowWaterMark: 2, // hysteresis: reopen only after drain
  globalTokenBudget: 40,
  defaultRoleBudget: 12,
  circuitFailureThreshold: 3,
  circuitCooldownTicks: 3,
};`,
  },
  {
    id: "pressure",
    title: "2. Measure pressure",
    summary: "Queue depth + in-flight → normal / elevated / high / critical.",
    language: "ts",
    code: `function measureQueueDepth(tasks: BoardTask[]) {
  return tasks.filter((t) =>
    t.status === "READY" || t.status === "QUEUED" || t.status === "DEFERRED"
  ).length;
}

function computePressure(
  depth: number,
  inFlight: number,
  cfg: BackpressureConfig,
): "normal" | "elevated" | "high" | "critical" {
  if (depth >= cfg.maxQueueDepth || inFlight >= cfg.maxConcurrent * 2) {
    return "critical";
  }
  if (depth >= cfg.highWaterMark) return "high";
  if (depth >= Math.ceil(cfg.highWaterMark * 0.6) || inFlight >= cfg.maxConcurrent) {
    return "elevated";
  }
  return "normal";
}

// Hysteresis on the admit gate
if (queueDepth >= cfg.highWaterMark) admitting = false;
if (queueDepth <= cfg.lowWaterMark && circuit !== "open") admitting = true;`,
  },
  {
    id: "admit",
    title: "3. Admit gate (canAdmitTask)",
    summary: "Reject or defer work when circuit is open, budgets are spent, or concurrency is full. P0 can bypass soft closes.",
    language: "ts",
    code: `function canAdmitTask(state: AgentSystemState, task: BoardTask) {
  const { backpressure: bp } = state;
  const cfg = bp.config;

  if (bp.circuit === "open") {
    return { ok: false, reason: "circuit_open" };
  }
  // Soft close: still allow P0 (trust / checkout)
  if (!bp.admitting && task.priority !== "P0") {
    return { ok: false, reason: "admit_closed_non_p0" };
  }
  if (bp.pressure === "critical" && task.priority !== "P0") {
    return { ok: false, reason: "critical_pressure" };
  }

  const tokensLeft = cfg.globalTokenBudget - bp.globalTokensUsed;
  if (tokensLeft < task.cost) {
    return { ok: false, reason: "global_budget_exhausted" };
  }

  const role = state.roles.find((r) => r.id === task.role);
  if (role && role.tokenBudget - role.tokenUsed < task.cost) {
    return { ok: false, reason: \`role_budget_\${task.role}\` };
  }

  const running = state.tasks.filter((t) => t.status === "RUNNING").length;
  if (running >= cfg.maxConcurrent) {
    return { ok: false, reason: "max_concurrent" };
  }
  // Half-open circuit: single probe only
  if (bp.circuit === "half-open" && running >= 1) {
    return { ok: false, reason: "half_open_probe_only" };
  }

  return { ok: true, reason: "admitted" };
}`,
  },
  {
    id: "batch",
    title: "4. Batch admit + defer",
    summary: "Sort by priority, admit up to limit, mark the rest DEFERRED with a reason.",
    language: "ts",
    code: `function admitBatch(
  state: AgentSystemState,
  candidates: BoardTask[],
  limit: number,
) {
  const admitted: BoardTask[] = [];
  const deferred: BoardTask[] = [];
  let s = refreshBackpressure(state);

  const ranked = [...candidates].sort((a, b) => {
    const pr = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return pr[a.priority] - pr[b.priority];
  });

  for (const task of ranked) {
    if (admitted.length >= limit) {
      deferred.push(task);
      continue;
    }
    const gate = canAdmitTask(s, task);
    if (gate.ok) {
      admitted.push(task);
      // Tentatively count in-flight for this tick
      s = {
        ...s,
        backpressure: {
          ...s.backpressure,
          inFlight: s.backpressure.inFlight + 1,
          lastDecision: \`admit \${task.id}\`,
        },
      };
    } else {
      deferred.push(task);
      s = {
        ...s,
        backpressure: {
          ...s.backpressure,
          deferredTotal: s.backpressure.deferredTotal + 1,
          lastDecision: \`defer \${task.id} · \${gate.reason}\`,
        },
      };
    }
  }
  return { admitted, deferred, state: s };
}

// Apply deferred status (caller)
tasks = tasks.map((t) =>
  deferredIds.has(t.id)
    ? { ...t, status: "DEFERRED", deferredReason: reason }
    : t,
);`,
  },
  {
    id: "budget",
    title: "5. Token / tool budgets",
    summary: "Charge global + per-role budgets on every completed unit of work.",
    language: "ts",
    code: `function consumeBudget(
  state: AgentSystemState,
  roleId: RoleId,
  cost: number,
): AgentSystemState {
  return {
    ...state,
    backpressure: {
      ...state.backpressure,
      globalTokensUsed: state.backpressure.globalTokensUsed + cost,
    },
    roles: state.roles.map((r) =>
      r.id === roleId ? { ...r, tokenUsed: r.tokenUsed + cost } : r,
    ),
  };
}

// Task cost model
const task = {
  id: "P0.2",
  priority: "P0",
  role: "builder",
  cost: 2, // P0 checkout work costs more than a scout probe
};

// After successful work:
state = consumeBudget(state, task.role, task.cost);

// Hard stop when empty
if (cfg.globalTokenBudget - state.backpressure.globalTokensUsed <= 0) {
  pressure = "critical";
  admitting = false;
}`,
  },
  {
    id: "circuit",
    title: "6. Circuit breaker",
    summary: "Trip open after N failures, cool down, then half-open single probe.",
    language: "ts",
    code: `function recordFailure(state: AgentSystemState, reason: string) {
  const cfg = state.backpressure.config;
  let failures = state.backpressure.circuitFailures + 1;
  let circuit = state.backpressure.circuit;
  let cooldown = state.backpressure.circuitCooldownLeft;

  if (failures >= cfg.circuitFailureThreshold) {
    circuit = "open";           // admit closed
    cooldown = cfg.circuitCooldownTicks;
  }

  return {
    ...state,
    backpressure: {
      ...state.backpressure,
      circuit,
      circuitFailures: failures,
      circuitCooldownLeft: cooldown,
      lastDecision: \`failure · \${reason} · circuit=\${circuit}\`,
    },
  };
}

function tickCircuitCooldown(state: AgentSystemState) {
  if (state.backpressure.circuit !== "open") return state;
  const left = Math.max(0, state.backpressure.circuitCooldownLeft - 1);
  // when left hits 0 → half-open on next refresh (one probe allowed)
  return {
    ...state,
    backpressure: { ...state.backpressure, circuitCooldownLeft: left },
  };
}

function recordSuccess(state: AgentSystemState) {
  // half-open success closes circuit and clears failure streak
  if (state.backpressure.circuit === "half-open") {
    return {
      ...state,
      backpressure: {
        ...state.backpressure,
        circuit: "closed",
        circuitFailures: 0,
      },
    };
  }
  return state;
}`,
  },
  {
    id: "swarm",
    title: "7. Swarm fan-out under backpressure",
    summary: "Cap parallel read-only probes; collapse writes to hub sequential.",
    language: "ts",
    code: `const SWARM_SAFE = new Set(["scout", "auditor", "reviewer"]);

function tickSwarm(state: AgentSystemState) {
  let s = tickCircuitCooldown(promoteDeferred(unlockReady(state)));
  s = refreshBackpressure(s);

  const candidates = s.tasks.filter(
    (t) =>
      (t.status === "READY" || t.status === "DEFERRED") &&
      SWARM_SAFE.has(t.role) &&
      !t.requiresApproval,
  );

  const limit = Math.min(
    s.backpressure.config.maxFanOut,
    s.backpressure.config.maxConcurrent,
  );

  const { admitted, deferred, state: gated } = admitBatch(s, candidates, limit);
  s = applyDeferredStatuses(gated, deferred, gated.backpressure.lastDecision);

  // Run only what passed the gate
  for (const task of admitted) {
    s = runTask(s, task); // each call consumeBudget(...)
  }

  // Writes never mesh — admit 1 builder/shipper under hub rules
  // ... collapse path with admitBatch(writeCandidates, 1)

  return s;
}`,
  },
  {
    id: "worker",
    title: "8. Drop-in worker loop (portable)",
    summary: "Minimal async worker you can paste into any agent runtime.",
    language: "ts",
    code: `type Job = { id: string; priority: number; cost: number; run: () => Promise<void> };

class BackpressureWorker {
  constructor(
    private cfg = {
      maxConcurrent: 2,
      maxQueue: 20,
      highWater: 10,
      lowWater: 3,
      budget: 100,
    },
    private queue: Job[] = [],
    private inFlight = 0,
    private spent = 0,
    private admitting = true,
  ) {}

  enqueue(job: Job) {
    if (this.queue.length >= this.cfg.maxQueue) {
      throw new Error(\`reject \${job.id}: queue_full\`);
    }
    this.queue.push(job);
    this.queue.sort((a, b) => a.priority - b.priority);
    void this.pump();
  }

  private async pump() {
    this.admitting =
      this.queue.length <= this.cfg.lowWater
        ? true
        : this.queue.length >= this.cfg.highWater
          ? false
          : this.admitting;

    while (
      this.admitting &&
      this.inFlight < this.cfg.maxConcurrent &&
      this.queue.length &&
      this.spent < this.cfg.budget
    ) {
      const job = this.queue.shift()!;
      if (this.spent + job.cost > this.cfg.budget) {
        this.queue.unshift(job); // put back
        break;
      }
      this.inFlight++;
      this.spent += job.cost;
      void job
        .run()
        .catch(() => {
          /* recordFailure → circuit */
        })
        .finally(() => {
          this.inFlight--;
          void this.pump();
        });
    }
  }
}

// Usage
const worker = new BackpressureWorker();
worker.enqueue({
  id: "scout-catalog",
  priority: 1,
  cost: 1,
  run: async () => {
    /* read-only probe */
  },
});`,
  },
];
