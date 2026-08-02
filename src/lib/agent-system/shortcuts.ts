/**
 * Single source of truth for Control Room keyboard shortcuts.
 * Keep handlers in AgentControlRoom aligned with this catalog.
 */

export type ShortcutAction =
  | "step"
  | "autoRun"
  | "approve"
  | "liveScout"
  | "export"
  | "artifacts"
  | "undo"
  | "palette"
  | "redo"
  | "topology"
  | "help";

export type ShortcutDef = {
  action: ShortcutAction;
  /** Display label for the key (e.g. "S", "Space") */
  keys: string[];
  /** Match KeyboardEvent.key values (lowercase compared where noted) */
  match: (e: KeyboardEvent) => boolean;
  title: string;
  description: string;
  category: "Run" | "Scout" | "Data" | "Help";
};

export const SHORTCUTS: ShortcutDef[] = [
  {
    action: "step",
    keys: ["S"],
    match: (e) => e.key === "s" || e.key === "S",
    title: "Step",
    description: "Advance the board by one tick (next admitted task under backpressure).",
    category: "Run",
  },
  {
    action: "autoRun",
    keys: ["Space"],
    match: (e) => e.key === " ",
    title: "Toggle auto-run",
    description: "Start or pause continuous stepping until complete, blocked, or circuit open.",
    category: "Run",
  },
  {
    action: "approve",
    keys: ["A"],
    match: (e) => e.key === "a" || e.key === "A",
    title: "Approve ship",
    description: "Grant approval_id so gated SHIP.1 can run under shipper policy.",
    category: "Run",
  },
  {
    action: "liveScout",
    keys: ["L"],
    match: (e) => e.key === "l" || e.key === "L",
    title: "Live scout",
    description: "Probe lvlltd.com (catalog, proof, x402, listings, status). Auto-applies if enabled.",
    category: "Scout",
  },
  {
    action: "export",
    keys: ["E"],
    match: (e) => e.key === "e" || e.key === "E",
    title: "Export run",
    description: "Download full run JSON (tasks, artifacts, pressure, scout, log).",
    category: "Data",
  },
  {
    action: "artifacts",
    keys: ["F"],
    match: (e) => e.key === "f" || e.key === "F",
    title: "Artifacts",
    description: "Open or close the artifact browser.",
    category: "Data",
  },
  {
    action: "undo",
    keys: ["U"],
    match: (e) => e.key === "u" || e.key === "U",
    title: "Undo",
    description: "Restore the previous board snapshot (step, flood, approve, etc.).",
    category: "Run",
  },
  {
    action: "palette",
    keys: ["K", "⌘K"],
    match: (e) => e.key === "k" || e.key === "K",
    title: "Command palette",
    description: "Open the command palette to run actions or jump sections.",
    category: "Run",
  },
  {
    action: "redo",
    keys: ["⇧U"],
    match: (e) => (e.key === "u" || e.key === "U") && e.shiftKey,
    title: "Redo",
    description: "Re-apply the last undone board snapshot.",
    category: "Run",
  },
  {
    action: "topology",
    keys: ["T"],
    match: (e) => e.key === "t" || e.key === "T",
    title: "Cycle topology",
    description: "Hub-spoke → pipeline → swarm → hub-spoke.",
    category: "Run",
  },
  {
    action: "help",
    keys: ["?", "/"],
    match: (e) => e.key === "?" || (e.key === "/" && e.shiftKey) || e.key === "/",
    title: "Shortcut help",
    description: "Show or hide this keyboard shortcut documentation overlay.",
    category: "Help",
  },
];

export const SHORTCUT_FOOTER =
  "S step · U undo · ⇧U redo · K palette · T topology · Space auto · A approve · L scout · E export · F artifacts · ? help";

export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}
