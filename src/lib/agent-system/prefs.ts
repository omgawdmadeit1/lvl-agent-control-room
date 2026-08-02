const KEY = "lvl-agent-prefs-v1";

export type AgentPrefs = {
  autoApplyScout: boolean;
  toasts: boolean;
  /** WCAG 2.1.4 — allow turning off single-key shortcuts */
  keyboardShortcuts: boolean;
  /** Prefer quieter motion (also pairs with prefers-reduced-motion) */
  reduceMotion: boolean;
  density: "comfy" | "compact";
  highContrast: boolean;
  boardView: "list" | "kanban";
};

export const DEFAULT_PREFS: AgentPrefs = {
  autoApplyScout: true,
  toasts: true,
  keyboardShortcuts: true,
  reduceMotion: false,
  density: "comfy",
  highContrast: false,
  boardView: "list",
};

export function loadPrefs(): AgentPrefs {
  if (typeof localStorage === "undefined") return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(p: AgentPrefs) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}
