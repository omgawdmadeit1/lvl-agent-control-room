import { create } from "zustand";
import type { AgentSystemState, Artifact, BackpressureConfig, RoleId } from "./types";
import { createInitialState } from "./seed";
import {
  tick,
  grantApproval,
  setTopology,
  assignFocusRole,
  setBackpressureConfig,
  floodQueue,
  tripCircuit,
} from "./engine";
import { clearSaved, downloadJson, loadState, saveState } from "./persist";
import { runLiveScoutSuite } from "./live-scout";
import { applyScoutToBoard } from "./apply-scout";
import { loadPrefs, savePrefs, type AgentPrefs } from "./prefs";
import { toast } from "sonner";

const MAX_UNDO = 30;

function snapshotCore(s: Store): AgentSystemState {
  return {
    runId: s.runId,
    goal: s.goal,
    topology: s.topology,
    status: s.status,
    audit: s.audit,
    roles: s.roles,
    tasks: s.tasks,
    artifacts: s.artifacts,
    rails: s.rails,
    log: s.log,
    metrics: s.metrics,
    backpressure: s.backpressure,
    tokenBuckets: s.tokenBuckets,
    liveScout: s.liveScout,
  };
}

interface Store extends AgentSystemState {
  autoRun: boolean;
  hydrated: boolean;
  prefs: AgentPrefs;
  undoStack: AgentSystemState[];
  redoStack: AgentSystemState[];
  canUndo: boolean;
  canRedo: boolean;
  setAutoRun: (v: boolean) => void;
  hydrate: () => void;
  reset: () => void;
  step: () => void;
  approve: (id?: string) => void;
  setTopology: (t: AgentSystemState["topology"]) => void;
  focusRole: (id: RoleId) => void;
  patchBackpressure: (patch: Partial<BackpressureConfig>) => void;
  flood: (n?: number) => void;
  openCircuit: () => void;
  runLiveScout: () => Promise<void>;
  exportRun: () => void;
  clearPersistence: () => void;
  applyScout: () => void;
  setPrefs: (patch: Partial<AgentPrefs>) => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  importRun: (data: unknown) => void;
  chaosProbe: () => void;
}

function persistSlice(get: () => Store) {
  const s = get();
  const {
    autoRun: _a,
    hydrated: _h,
    setAutoRun: _1,
    hydrate: _2,
    reset: _3,
    step: _4,
    approve: _5,
    setTopology: _6,
    focusRole: _7,
    patchBackpressure: _8,
    flood: _9,
    openCircuit: _10,
    runLiveScout: _11,
    exportRun: _12,
    clearPersistence: _13,
    applyScout: _14,
    setPrefs: _15,
    prefs: _prefs,
    undoStack: _undo,
    redoStack: _redo,
    canUndo: _canUndo,
    canRedo: _canRedo,
    undo: _16,
    pushUndo: _17,
    redo: _18,
    importRun: _19,
    chaosProbe: _20,
    ...state
  } = s;
  saveState(state);
}

export const useAgentSystem = create<Store>((set, get) => ({
  ...createInitialState(),
  autoRun: false,
  hydrated: false,
  prefs: loadPrefs(),
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  hydrate: () => {
    if (get().hydrated) return;
    const saved = loadState();
    if (saved) {
      const base = createInitialState();
      set({
        ...base,
        ...saved,
        liveScout: saved.liveScout || base.liveScout,
        tokenBuckets: saved.tokenBuckets || base.tokenBuckets,
        backpressure: saved.backpressure || base.backpressure,
        autoRun: false,
        hydrated: true,
        log: [
          {
            t: new Date().toISOString(),
            msg: "Restored run from browser storage",
            level: "info" as const,
          },
          ...(saved.log || []),
        ].slice(0, 120),
      });
    } else {
      set({ hydrated: true });
    }
  },

  setAutoRun: (v) => set({ autoRun: v }),

  reset: () => {
    clearSaved();
    const next = createInitialState();
    next.runId = `run-lvlltd-${Date.now().toString(36)}`;
    next.log = [
      {
        t: new Date().toISOString(),
        msg: "Agent system reset — backpressure & token buckets re-armed",
        level: "info" as const,
      },
    ];
    set({ ...next, autoRun: false, hydrated: true });
    persistSlice(get);
  },

  pushUndo: () => {
    const snap = snapshotCore(get());
    const stack = [...get().undoStack, snap].slice(-MAX_UNDO);
    set({ undoStack: stack, canUndo: stack.length > 0, redoStack: [], canRedo: false });
  },

  undo: () => {
    const stack = [...get().undoStack];
    const prev = stack.pop();
    if (!prev) {
      if (get().prefs.toasts) toast.message("Nothing to undo");
      return;
    }
    const current = snapshotCore(get());
    const redo = [...get().redoStack, current].slice(-MAX_UNDO);
    set({
      ...prev,
      undoStack: stack,
      canUndo: stack.length > 0,
      redoStack: redo,
      canRedo: redo.length > 0,
      autoRun: false,
      hydrated: true,
      prefs: get().prefs,
    });
    persistSlice(get);
    if (get().prefs.toasts) toast.message("Undid last change");
  },

  redo: () => {
    const stack = [...get().redoStack];
    const next = stack.pop();
    if (!next) {
      if (get().prefs.toasts) toast.message("Nothing to redo");
      return;
    }
    const current = snapshotCore(get());
    const undo = [...get().undoStack, current].slice(-MAX_UNDO);
    set({
      ...next,
      redoStack: stack,
      canRedo: stack.length > 0,
      undoStack: undo,
      canUndo: undo.length > 0,
      autoRun: false,
      hydrated: true,
      prefs: get().prefs,
    });
    persistSlice(get);
    if (get().prefs.toasts) toast.message("Redid change");
  },

  importRun: (data: unknown) => {
    try {
      const raw = data as Partial<AgentSystemState>;
      if (!raw || !raw.tasks || !raw.runId) throw new Error("Invalid run JSON");
      get().pushUndo();
      const base = createInitialState();
      set({
        ...base,
        ...raw,
        liveScout: raw.liveScout || base.liveScout,
        tokenBuckets: raw.tokenBuckets || base.tokenBuckets,
        backpressure: raw.backpressure || base.backpressure,
        autoRun: false,
        hydrated: true,
        prefs: get().prefs,
        undoStack: get().undoStack,
        canUndo: get().canUndo,
        redoStack: [],
        canRedo: false,
        log: [
          {
            t: new Date().toISOString(),
            msg: `Imported run ${raw.runId}`,
            level: "ok" as const,
          },
          ...(raw.log || []).slice(0, 40),
        ].slice(0, 120),
      });
      persistSlice(get);
      if (get().prefs.toasts) toast.success("Run imported");
    } catch (e) {
      toast.error(`Import failed: ${(e as Error).message}`);
    }
  },

  chaosProbe: () => {
    get().pushUndo();
    const now = new Date().toISOString();
    const flooded = floodQueue(get(), 8);
    set({
      ...flooded,
      autoRun: false,
      backpressure: {
        ...flooded.backpressure,
        circuitFailures: flooded.backpressure.config.circuitFailureThreshold,
        circuit: "open",
        circuitCooldownLeft: flooded.backpressure.config.circuitCooldownTicks,
        lastDecision: "chaos_probe_trip",
        admitting: false,
      },
      log: [
        {
          t: now,
          msg: "Chaos probe: forced circuit open + queue stress",
          level: "warn" as const,
        },
        ...flooded.log,
      ].slice(0, 120),
    });
    persistSlice(get);
    if (get().prefs.toasts) toast.error("Chaos: circuit open");
  },

  step: () => {
    get().pushUndo();
    const before = get().metrics.tasksDone;
    set(tick(get()));
    const after = get();
    persistSlice(get);
    if (after.prefs.toasts && after.metrics.tasksDone > before) {
      toast.success(`Task done · ${after.metrics.tasksDone}/${after.metrics.tasksTotal}`);
    }
    if (after.prefs.toasts && after.status === "COMPLETE") {
      toast.message("Board complete");
    }
    if (after.backpressure.circuit === "open") {
      if (after.autoRun) set({ autoRun: false });
      if (after.prefs.toasts) toast.error("Circuit breaker open — auto-run paused");
    }
  },

  approve: (id) => {
    get().pushUndo();
    const aid = id || `apr-${Date.now().toString(36)}`;
    set(grantApproval(get(), aid));
    persistSlice(get);
    if (get().prefs.toasts) toast.success(`Approved ${aid}`);
  },

  setTopology: (t) => {
    get().pushUndo();
    set(setTopology(get(), t));
    persistSlice(get);
  },

  focusRole: (id) => set(assignFocusRole(get(), id)),

  patchBackpressure: (patch) => {
    set(setBackpressureConfig(get(), patch));
    persistSlice(get);
  },

  flood: (n = 12) => {
    get().pushUndo();
    set(floodQueue(get(), n));
    persistSlice(get);
  },

  openCircuit: () => {
    get().pushUndo();
    set(tripCircuit(get()));
    persistSlice(get);
  },

  runLiveScout: async () => {
    set({
      liveScout: {
        status: "running",
        summary: "Probing lvlltd.com…",
        findings: get().liveScout.findings,
      },
    });
    try {
      const result = await runLiveScoutSuite("https://lvlltd.com");
      const art: Artifact = {
        id: `art-live-scout-${Date.now().toString(36)}`,
        type: "live_scout",
        title: "Live scout — lvlltd.com",
        body: result.artifactBody,
        createdAt: new Date().toISOString(),
        role: "scout",
      };
      set({
        liveScout: {
          status: "done",
          summary: result.summary,
          findings: result.findings,
          ranAt: new Date().toISOString(),
        },
        artifacts: [art, ...get().artifacts],
        roles: get().roles.map((r) =>
          r.id === "scout"
            ? { ...r, status: "done", lastAction: result.summary }
            : r,
        ),
        log: [
          {
            t: new Date().toISOString(),
            msg: result.summary,
            level: (result.findings.every((f) => f.ok) ? "ok" : "warn") as "ok" | "warn",
          },
          ...get().log,
        ].slice(0, 120),
      });
      if (get().prefs.autoApplyScout) {
        set(applyScoutToBoard(get()));
      }
      persistSlice(get);
      if (get().prefs.toasts) {
        toast.success(result.summary.slice(0, 80));
        if (get().prefs.autoApplyScout) toast.message("Scout applied to board");
      }
    } catch (e) {
      set({
        liveScout: {
          status: "error",
          summary: String((e as Error)?.message || e),
          findings: [],
          ranAt: new Date().toISOString(),
        },
        log: [
          {
            t: new Date().toISOString(),
            msg: `Live scout failed: ${(e as Error)?.message || e}`,
            level: "err" as const,
          },
          ...get().log,
        ].slice(0, 120),
      });
    }
  },

  exportRun: () => {
    const s = get();
    downloadJson(`lvl-agent-run-${s.runId}.json`, {
      exported_at: new Date().toISOString(),
      runId: s.runId,
      goal: s.goal,
      topology: s.topology,
      status: s.status,
      audit: s.audit,
      metrics: s.metrics,
      tasks: s.tasks,
      roles: s.roles,
      artifacts: s.artifacts,
      rails: s.rails,
      backpressure: s.backpressure,
      tokenBuckets: s.tokenBuckets,
      liveScout: s.liveScout,
      log: s.log,
    });
  },

  clearPersistence: () => {
    clearSaved();
    set({
      log: [
        {
          t: new Date().toISOString(),
          msg: "Cleared saved run from browser storage",
          level: "info" as const,
        },
        ...get().log,
      ].slice(0, 120),
    });
  },

  applyScout: () => {
    get().pushUndo();
    set(applyScoutToBoard(get()));
    persistSlice(get);
    if (get().prefs.toasts) toast.success("Scout findings applied");
  },

  setPrefs: (patch) => {
    const prefs = { ...get().prefs, ...patch };
    savePrefs(prefs);
    set({ prefs });
    if (prefs.toasts) toast.message("Preferences saved");
  },
}));
