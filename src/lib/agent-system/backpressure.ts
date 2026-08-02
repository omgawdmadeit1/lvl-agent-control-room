import type {
  AgentSystemState,
  BackpressureConfig,
  BackpressureState,
  BoardTask,
  PressureLevel,
  RoleId,
} from "./types";

export const DEFAULT_BP_CONFIG: BackpressureConfig = {
  maxConcurrent: 2,
  maxQueueDepth: 8,
  highWaterMark: 5,
  lowWaterMark: 2,
  globalTokenBudget: 40,
  defaultRoleBudget: 12,
  circuitFailureThreshold: 3,
  circuitCooldownTicks: 3,
  maxFanOut: 3,
};

export function createBackpressureState(config: BackpressureConfig = DEFAULT_BP_CONFIG): BackpressureState {
  return {
    config: { ...config },
    queueDepth: 0,
    inFlight: 0,
    globalTokensUsed: 0,
    pressure: "normal",
    admitting: true,
    circuit: "closed",
    circuitFailures: 0,
    circuitCooldownLeft: 0,
    deferredTotal: 0,
    rejectedTotal: 0,
    lastDecision: "init · admitting open",
    history: [],
  };
}

function now() {
  return new Date().toISOString();
}

export function measureQueueDepth(tasks: BoardTask[]): number {
  return tasks.filter((t) => t.status === "READY" || t.status === "QUEUED" || t.status === "DEFERRED")
    .length;
}

export function computePressure(depth: number, inFlight: number, cfg: BackpressureConfig): PressureLevel {
  if (depth >= cfg.maxQueueDepth || inFlight >= cfg.maxConcurrent * 2) return "critical";
  if (depth >= cfg.highWaterMark) return "high";
  if (depth >= Math.ceil(cfg.highWaterMark * 0.6) || inFlight >= cfg.maxConcurrent) return "elevated";
  return "normal";
}

export function refreshBackpressure(state: AgentSystemState): AgentSystemState {
  const cfg = state.backpressure.config;
  const queueDepth = measureQueueDepth(state.tasks);
  const inFlight = state.tasks.filter((t) => t.status === "RUNNING").length;
  let pressure = computePressure(queueDepth, inFlight, cfg);
  let admitting = state.backpressure.admitting;
  let circuit = state.backpressure.circuit;
  let circuitCooldownLeft = state.backpressure.circuitCooldownLeft;

  // hysteresis for admit gate
  if (queueDepth >= cfg.highWaterMark) admitting = false;
  if (queueDepth <= cfg.lowWaterMark && circuit !== "open") admitting = true;

  // global token exhaustion = critical + stop admit
  const tokensLeft = cfg.globalTokenBudget - state.backpressure.globalTokensUsed;
  if (tokensLeft <= 0) {
    pressure = "critical";
    admitting = false;
  }

  // circuit cooldown
  if (circuit === "open") {
    admitting = false;
    if (circuitCooldownLeft <= 0) {
      circuit = "half-open";
      admitting = true; // allow one probe
    }
  }

  const bp: BackpressureState = {
    ...state.backpressure,
    queueDepth,
    inFlight,
    pressure,
    admitting,
    circuit,
    circuitCooldownLeft,
    history: [
      { t: now(), pressure, queueDepth, inFlight },
      ...state.backpressure.history,
    ].slice(0, 40),
  };

  return { ...state, backpressure: bp };
}

export function canAdmitTask(
  state: AgentSystemState,
  task: BoardTask,
): { ok: boolean; reason: string } {
  const bp = state.backpressure;
  const cfg = bp.config;

  if (bp.circuit === "open") {
    return { ok: false, reason: "circuit_open" };
  }

  if (!bp.admitting && task.priority !== "P0") {
    return { ok: false, reason: "admit_closed_non_p0" };
  }

  // under critical pressure only P0 may proceed if tokens remain
  if (bp.pressure === "critical" && task.priority !== "P0") {
    return { ok: false, reason: "critical_pressure" };
  }

  const tokensLeft = cfg.globalTokenBudget - bp.globalTokensUsed;
  if (tokensLeft < task.cost) {
    return { ok: false, reason: "global_budget_exhausted" };
  }

  const role = state.roles.find((r) => r.id === task.role);
  if (role && role.tokenBudget - role.tokenUsed < task.cost) {
    return { ok: false, reason: `role_budget_${task.role}` };
  }

  const running = state.tasks.filter((t) => t.status === "RUNNING").length;
  if (running >= cfg.maxConcurrent) {
    return { ok: false, reason: "max_concurrent" };
  }

  // half-open: only one task
  if (bp.circuit === "half-open" && running >= 1) {
    return { ok: false, reason: "half_open_probe_only" };
  }

  return { ok: true, reason: "admitted" };
}

export function admitBatch(
  state: AgentSystemState,
  candidates: BoardTask[],
  limit: number,
): { admitted: BoardTask[]; deferred: BoardTask[]; state: AgentSystemState } {
  const admitted: BoardTask[] = [];
  const deferred: BoardTask[] = [];
  let s = refreshBackpressure(state);

  // priority: P0 first, then READY over DEFERRED, then original order
  const ranked = [...candidates].sort((a, b) => {
    const pr = { P0: 0, P1: 1, P2: 2, P3: 3 };
    if (pr[a.priority] !== pr[b.priority]) return pr[a.priority] - pr[b.priority];
    return 0;
  });

  for (const task of ranked) {
    if (admitted.length >= limit) {
      deferred.push(task);
      continue;
    }
    const gate = canAdmitTask(s, task);
    if (gate.ok) {
      admitted.push(task);
      // tentatively count in-flight for subsequent admits this tick
      s = {
        ...s,
        backpressure: {
          ...s.backpressure,
          inFlight: s.backpressure.inFlight + 1,
          lastDecision: `admit ${task.id} (${gate.reason})`,
        },
      };
    } else {
      deferred.push(task);
      s = {
        ...s,
        backpressure: {
          ...s.backpressure,
          deferredTotal: s.backpressure.deferredTotal + 1,
          lastDecision: `defer ${task.id} · ${gate.reason}`,
        },
      };
    }
  }

  return { admitted, deferred, state: s };
}

export function consumeBudget(state: AgentSystemState, roleId: RoleId, cost: number): AgentSystemState {
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

export function recordSuccess(state: AgentSystemState): AgentSystemState {
  let circuit = state.backpressure.circuit;
  let failures = state.backpressure.circuitFailures;
  if (circuit === "half-open") {
    circuit = "closed";
    failures = 0;
  } else {
    failures = Math.max(0, failures - 1);
  }
  return {
    ...state,
    backpressure: {
      ...state.backpressure,
      circuit,
      circuitFailures: failures,
      lastDecision: "success · circuit healthy",
    },
  };
}

export function recordFailure(state: AgentSystemState, reason: string): AgentSystemState {
  const cfg = state.backpressure.config;
  let failures = state.backpressure.circuitFailures + 1;
  let circuit = state.backpressure.circuit;
  let cooldown = state.backpressure.circuitCooldownLeft;
  if (failures >= cfg.circuitFailureThreshold) {
    circuit = "open";
    cooldown = cfg.circuitCooldownTicks;
  }
  return {
    ...state,
    backpressure: {
      ...state.backpressure,
      circuit,
      circuitFailures: failures,
      circuitCooldownLeft: cooldown,
      rejectedTotal: state.backpressure.rejectedTotal + 1,
      lastDecision: `failure · ${reason} · circuit=${circuit}`,
    },
  };
}

export function tickCircuitCooldown(state: AgentSystemState): AgentSystemState {
  if (state.backpressure.circuit !== "open") return state;
  const left = Math.max(0, state.backpressure.circuitCooldownLeft - 1);
  return {
    ...state,
    backpressure: {
      ...state.backpressure,
      circuitCooldownLeft: left,
      lastDecision:
        left === 0
          ? "circuit cooldown elapsed → half-open next admit"
          : `circuit open · cooldown ${left}`,
    },
  };
}

export function applyDeferredStatuses(
  state: AgentSystemState,
  deferred: BoardTask[],
  reason: string,
): AgentSystemState {
  if (!deferred.length) return state;
  const ids = new Set(deferred.map((d) => d.id));
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      ids.has(t.id) && (t.status === "READY" || t.status === "QUEUED")
        ? {
            ...t,
            status: "DEFERRED" as const,
            deferredReason: reason,
            workLog: [...t.workLog, `${now()} deferred: ${reason}`],
          }
        : t,
    ),
  };
}

export function promoteDeferred(state: AgentSystemState): AgentSystemState {
  const bp = refreshBackpressure(state).backpressure;
  if (!bp.admitting && bp.pressure === "critical") return state;
  return {
    ...state,
    tasks: state.tasks.map((t) =>
      t.status === "DEFERRED" && (bp.admitting || t.priority === "P0")
        ? {
            ...t,
            status: "READY" as const,
            deferredReason: undefined,
            workLog: [...t.workLog, `${now()} promoted from deferred (pressure=${bp.pressure})`],
          }
        : t,
    ),
  };
}

export function updateConfig(
  state: AgentSystemState,
  patch: Partial<BackpressureConfig>,
): AgentSystemState {
  return refreshBackpressure({
    ...state,
    backpressure: {
      ...state.backpressure,
      config: { ...state.backpressure.config, ...patch },
      lastDecision: `config update ${JSON.stringify(patch)}`,
    },
  });
}
