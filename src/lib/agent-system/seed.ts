import type { AgentSystemState, BoardTask, RoleCard } from "./types";
import { createBackpressureState, DEFAULT_BP_CONFIG } from "./backpressure";
import { bucketsToSnapshots, createDefaultBuckets } from "./token-bucket-bridge";

const ROLE_BUDGET: Record<string, number> = {
  conductor: 16,
  scout: 14,
  builder: 12,
  reviewer: 10,
  shipper: 6,
  auditor: 10,
  operator: 10,
};

function role(
  id: RoleCard["id"],
  title: string,
  mission: string,
  toolProfile: string,
): RoleCard {
  return {
    id,
    title,
    mission,
    toolProfile,
    status: "idle",
    tokenBudget: ROLE_BUDGET[id] ?? DEFAULT_BP_CONFIG.defaultRoleBudget,
    tokenUsed: 0,
  };
}

function task(
  partial: Omit<BoardTask, "workLog" | "cost"> & { cost?: number },
): BoardTask {
  return {
    ...partial,
    cost: partial.cost ?? (partial.priority === "P0" ? 2 : 1),
    workLog: [],
  };
}

export function createInitialState(): AgentSystemState {
  const runId = "run-lvlltd-focus-four";
  return {
    runId,
    goal:
      "Improve lvlltd.com agent skill marketplace: catalog quality, trust, checkout reliability, and multi-agent ops",
    topology: "hub-spoke",
    status: "IDLE",
    audit: {
      goNoGo: "go",
      riskScore: 0.3,
      notes: "Auditor light pass: proceed with evidence pack before expanding featured shelf.",
    },
    roles: [
      role("conductor", "Conductor", "Plan, assign, gate, merge, stop", "conductor"),
      role("scout", "Scout", "Gather facts, options, citations", "scout-readonly"),
      role("builder", "Builder", "Implement under lease", "builder-scoped"),
      role("reviewer", "Reviewer", "Defects + security gaps", "reviewer-readonly"),
      role("shipper", "Shipper", "Release under human gate", "shipper-gated"),
      role("auditor", "Auditor", "Claims, risk, go/no-go", "auditor"),
      role("operator", "Operator", "Catalog, pricing, liquidity, fees", "operator"),
    ],
    tasks: [
      task({
        id: "P0.1",
        title: "Listing claim audit gate",
        detail: "Require stages 1–5 attestation before featured / Ready-to-buy badges.",
        role: "auditor",
        status: "READY",
        priority: "P0",
        dependsOn: [],
        cost: 2,
      }),
      task({
        id: "P0.2",
        title: "Fix seal.listing URLs",
        detail: "Replace .html listing paths with trailing-slash canonical /listings/{id}/.",
        role: "builder",
        status: "READY",
        priority: "P0",
        dependsOn: [],
        cost: 2,
      }),
      task({
        id: "P0.3",
        title: "Unlock receipt evidence",
        detail: "Ensure POST /api/pay success always includes receipt block (tx, skill, pack hash).",
        role: "builder",
        status: "PENDING",
        priority: "P0",
        dependsOn: ["P0.2"],
        cost: 2,
      }),
      task({
        id: "P0.4",
        title: "Feature badge honesty",
        detail: "Demote overclaim depth badges; align free sample depth with UI labels.",
        role: "reviewer",
        status: "PENDING",
        priority: "P0",
        dependsOn: ["P0.1"],
        cost: 2,
      }),
      task({
        id: "P1.1",
        title: "Keep curated catalog default",
        detail: "Primary grid hides outline_only/stubs; opt-in for full inventory.",
        role: "operator",
        status: "PENDING",
        priority: "P1",
        dependsOn: ["P0.4"],
        cost: 1,
      }),
      task({
        id: "P1.2",
        title: "Publish fee & commission policy",
        detail: "Document 5–15% marketplace take + treasury split; close treasury pending step.",
        role: "operator",
        status: "PENDING",
        priority: "P1",
        dependsOn: [],
        cost: 1,
      }),
      task({
        id: "P1.3",
        title: "Weekly proof-based scorecard",
        detail: "GMV, unlock success, unique skills from /api/proof only — no invented volume.",
        role: "operator",
        status: "PENDING",
        priority: "P1",
        dependsOn: ["P1.2"],
        cost: 1,
      }),
      task({
        id: "P3.1",
        title: "Slim catalog fetches",
        detail: "Home uses fields=meta; marketplace uses fields=slim — stop 1.8MB full catalog downloads.",
        role: "builder",
        status: "PENDING",
        priority: "P3",
        dependsOn: ["P0.2"],
        cost: 1,
      }),
      task({
        id: "P3.2",
        title: "Slim listings JSON-LD",
        detail: "ItemList with url/name only; full Product schema stays on detail pages.",
        role: "builder",
        status: "PENDING",
        priority: "P3",
        dependsOn: ["P3.1"],
        cost: 1,
      }),
      task({
        id: "SHIP.1",
        title: "Gated production ship",
        detail: "Deploy focus-four P0 after reviewer clear + approval_id.",
        role: "shipper",
        status: "PENDING",
        priority: "P0",
        dependsOn: ["P0.2", "P0.4", "P0.3"],
        requiresApproval: true,
        cost: 3,
      }),
    ],
    artifacts: [],
    rails: [
      { id: "discovery", name: "Discovery", status: "partial", note: "Catalog/shop live; ranking weights not formalized" },
      { id: "negotiation", name: "Negotiation", status: "partial", note: "A2A cards + 402; done_when schemas sparse" },
      { id: "sandbox", name: "Sandbox", status: "partial", note: "Sealed packs as files; spend caps incomplete" },
      { id: "x402", name: "x402 payments", status: "live", note: "Base USDC challenges + verify working" },
      { id: "oracles", name: "Outcome oracles", status: "partial", note: "Log scan for payment; multi-check for high $" },
      { id: "governance", name: "Governance / audit", status: "partial", note: "Proof ledger live; hash-chain export gap" },
    ],
    log: [
      {
        t: "2026-08-01T00:00:00.000Z",
        msg: "Agent system initialized — token buckets + backpressure armed",
        level: "info",
      },
    ],
    metrics: { tasksDone: 0, tasksTotal: 10, artifacts: 0, p0Open: 5 },
    backpressure: createBackpressureState(),
    tokenBuckets: bucketsToSnapshots(createDefaultBuckets()),
    liveScout: { status: "idle", summary: "Not run yet — pull live lvlltd.com probes.", findings: [] },
  };
}

