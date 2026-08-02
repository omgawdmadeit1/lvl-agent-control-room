import type { AgentSystemState } from "./types";

const KEY = "lvl-agent-control-room-v1";

export function saveState(state: AgentSystemState) {
  if (typeof localStorage === "undefined") return;
  try {
    const slim = {
      runId: state.runId,
      goal: state.goal,
      topology: state.topology,
      status: state.status,
      audit: state.audit,
      roles: state.roles,
      tasks: state.tasks,
      artifacts: state.artifacts.slice(0, 40),
      rails: state.rails,
      log: state.log.slice(0, 60),
      metrics: state.metrics,
      backpressure: {
        ...state.backpressure,
        history: state.backpressure.history.slice(0, 20),
      },
      tokenBuckets: state.tokenBuckets,
    };
    localStorage.setItem(KEY, JSON.stringify(slim));
  } catch {
    /* quota */
  }
}

export function loadState(): Partial<AgentSystemState> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AgentSystemState>;
  } catch {
    return null;
  }
}

export function clearSaved() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(KEY);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
