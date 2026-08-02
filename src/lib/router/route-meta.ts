/**
 * Route catalog for the Control Room — used by nav + Router Lab.
 * Keep in sync with file routes under src/routes/.
 */
export const APP_ROUTES = [
  {
    to: "/",
    label: "Overview",
    description: "Full Control Room shell (single-page ops surface)",
    group: "core",
  },
  {
    to: "/ops/board",
    label: "Board",
    description: "Action board with validated search params (q, priority, status, role, task)",
    group: "ops",
  },
  {
    to: "/ops/health",
    label: "Site health",
    description: "lvlltd.com live health score route",
    group: "ops",
  },
  {
    to: "/ops/scout",
    label: "Live scout",
    description: "Server-proxied production probes",
    group: "ops",
  },
  {
    to: "/lab/router",
    label: "Router lab",
    description: "TanStack Router integration explorer + demos",
    group: "lab",
  },
] as const;

export type AppRouteTo = (typeof APP_ROUTES)[number]["to"];
