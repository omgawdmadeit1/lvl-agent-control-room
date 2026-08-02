export type RoleId =
  | "conductor"
  | "scout"
  | "builder"
  | "reviewer"
  | "shipper"
  | "auditor"
  | "operator";
export type TaskStatus = "READY" | "RUNNING" | "BLOCKED" | "DONE" | "PENDING" | "QUEUED" | "DEFERRED";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type PressureLevel = "normal" | "elevated" | "high" | "critical";
export type CircuitState = "closed" | "open" | "half-open";

/** Serialized token bucket for UI / persistence */
export interface TokenBucketSnapshot {
  name: string;
  capacity: number;
  tokens: number;
  refillRate: number;
  admitted: number;
  rejected: number;
  totalConsumed: number;
  lastDecision: string;
}

export interface RoleCard {
  id: RoleId;
  title: string;
  mission: string;
  toolProfile: string;
  status: "idle" | "working" | "blocked" | "done";
  lastAction?: string;
  /** Remaining tool-call budget this run */
  tokenBudget: number;
  tokenUsed: number;
}

export interface Artifact {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  role: RoleId;
  taskId?: string;
}

export interface BoardTask {
  id: string;
  title: string;
  detail: string;
  role: RoleId;
  status: TaskStatus;
  priority: Priority;
  dependsOn: string[];
  requiresApproval?: boolean;
  approvalId?: string;
  result?: string;
  workLog: string[];
  /** Estimated tool-call cost for backpressure accounting */
  cost: number;
  deferredReason?: string;
}

export interface RailStatus {
  id: string;
  name: string;
  status: "live" | "partial" | "gap";
  note: string;
}

export interface BackpressureConfig {
  /** Max tasks executing in one tick (swarm fan-out cap) */
  maxConcurrent: number;
  /** Max READY+QUEUED depth before admitting new work stops */
  maxQueueDepth: number;
  /** Soft warning threshold (queue depth) */
  highWaterMark: number;
  /** Resume full admit when depth falls to this */
  lowWaterMark: number;
  /** Global tool-call budget per run */
  globalTokenBudget: number;
  /** Default per-role tool budget */
  defaultRoleBudget: number;
  /** Consecutive failures before circuit opens */
  circuitFailureThreshold: number;
  /** Ticks to wait while circuit open before half-open probe */
  circuitCooldownTicks: number;
  /** Max swarm probes admitted per tick under pressure */
  maxFanOut: number;
}

export interface BackpressureState {
  config: BackpressureConfig;
  /** Tasks waiting for admit (pressure deferred) */
  queueDepth: number;
  inFlight: number;
  globalTokensUsed: number;
  pressure: PressureLevel;
  admitting: boolean;
  circuit: CircuitState;
  circuitFailures: number;
  circuitCooldownLeft: number;
  deferredTotal: number;
  rejectedTotal: number;
  lastDecision: string;
  history: { t: string; pressure: PressureLevel; queueDepth: number; inFlight: number }[];
}

export interface LiveScoutFinding {
  id: string;
  ok: boolean;
  title: string;
  detail: string;
  ms: number;
  data?: unknown;
}

export interface LiveScoutState {
  status: "idle" | "running" | "done" | "error";
  summary: string;
  findings: LiveScoutFinding[];
  ranAt?: string;
}

export interface AgentSystemState {

  runId: string;
  goal: string;
  topology: "hub-spoke" | "pipeline" | "swarm";
  status: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETE";
  audit: { goNoGo: "go" | "no-go" | "pending"; riskScore: number; notes: string };
  roles: RoleCard[];
  tasks: BoardTask[];
  artifacts: Artifact[];
  rails: RailStatus[];
  log: { t: string; msg: string; level: "info" | "ok" | "warn" | "err" }[];
  metrics: {
    tasksDone: number;
    tasksTotal: number;
    artifacts: number;
    p0Open: number;
  };
  backpressure: BackpressureState;
  /** Live token buckets (global + bulkheads) */
  tokenBuckets: TokenBucketSnapshot[];
  liveScout: LiveScoutState;
}

