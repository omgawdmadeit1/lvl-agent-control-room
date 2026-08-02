import type { AgentSystemState } from "./types";

export function synthesizeRunReport(state: AgentSystemState): {
  markdown: string;
  json: Record<string, unknown>;
} {
  const done = state.tasks.filter((t) => t.status === "DONE");
  const open = state.tasks.filter((t) => t.status !== "DONE");
  const deferred = state.tasks.filter((t) => t.status === "DEFERRED");
  const p0Open = open.filter((t) => t.priority === "P0");

  const json = {
    schema: "lvl-agent-run-report-v1",
    generated_at: new Date().toISOString(),
    runId: state.runId,
    goal: state.goal,
    topology: state.topology,
    status: state.status,
    audit: state.audit,
    metrics: state.metrics,
    backpressure: {
      pressure: state.backpressure.pressure,
      circuit: state.backpressure.circuit,
      admitting: state.backpressure.admitting,
      globalTokensUsed: state.backpressure.globalTokensUsed,
      globalTokenBudget: state.backpressure.config.globalTokenBudget,
      deferredTotal: state.backpressure.deferredTotal,
      lastDecision: state.backpressure.lastDecision,
    },
    tokenBuckets: state.tokenBuckets,
    liveScout: {
      status: state.liveScout.status,
      summary: state.liveScout.summary,
      findings: state.liveScout.findings.map((f) => ({
        id: f.id,
        ok: f.ok,
        title: f.title,
        ms: f.ms,
      })),
    },
    completed: done.map((t) => ({ id: t.id, title: t.title, role: t.role, result: t.result })),
    open: open.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      deferredReason: t.deferredReason,
    })),
    artifacts: state.artifacts.slice(0, 20).map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      role: a.role,
    })),
    next_actions: [
      ...p0Open.map((t) => `Close ${t.id}: ${t.title}`),
      ...(state.liveScout.findings.some(
        (f) =>
          f.id === "listing_canonical" &&
          f.ok &&
          (f.data as { seal_listing_bug?: boolean })?.seal_listing_bug,
      )
        ? ["Ship seal.listing .html → trailing-slash fix (confirmed live)"]
        : []),
      ...(state.tasks.some((t) => t.id === "SHIP.1" && t.status !== "DONE")
        ? ["Grant approval_id then ship SHIP.1"]
        : []),
    ],
  };

  const md = `# LVL Agent Run Report

**Run:** \`${state.runId}\`  
**Status:** ${state.status} · **Topology:** ${state.topology}  
**Generated:** ${json.generated_at}

## Goal
${state.goal}

## Audit
- Go/no-go: **${state.audit.goNoGo}**
- Risk: ${state.audit.riskScore}
- Notes: ${state.audit.notes}

## Progress
- Tasks: ${state.metrics.tasksDone}/${state.metrics.tasksTotal}
- Artifacts: ${state.metrics.artifacts}
- P0 open: ${state.metrics.p0Open}
- Pressure: ${state.backpressure.pressure} · Circuit: ${state.backpressure.circuit}
- Tokens: ${state.backpressure.globalTokensUsed}/${state.backpressure.config.globalTokenBudget}

## Live scout
${state.liveScout.summary || "_Not run_"}

${state.liveScout.findings
  .map((f) => `- ${f.ok ? "OK" : "FAIL"} **${f.title}** (${f.ms}ms)`)
  .join("\n") || ""}

## Completed (${done.length})
${done.map((t) => `- **${t.id}** ${t.title} — _${t.result || "done"}_`).join("\n") || "_None_"}

## Open (${open.length})
${open.map((t) => `- **${t.id}** [${t.status}/${t.priority}] ${t.title}${t.deferredReason ? ` _(deferred: ${t.deferredReason})_` : ""}`).join("\n") || "_None_"}

## Deferred
${deferred.map((t) => `- ${t.id}: ${t.deferredReason || "—"}`).join("\n") || "_None_"}

## Next actions
${(json.next_actions as string[]).map((a) => `- ${a}`).join("\n") || "- Board clear"}

## Artifacts
${state.artifacts
  .slice(0, 15)
  .map((a) => `- \`${a.type}\` ${a.title} (${a.role})`)
  .join("\n") || "_None_"}
`;

  return { markdown: md, json };
}
