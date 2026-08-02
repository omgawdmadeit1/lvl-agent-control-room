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
  {
    to: "/lab/loaders",
    label: "Loaders lab",
    description: "loader, loaderDeps, pendingComponent, errorComponent, staleTime",
    group: "lab",
  },
  {
    to: "/marketplace",
    label: "Marketplace",
    description: "lvlltd.com product rails, live catalog, x402 challenges",
    group: "product",
  },
  {
    to: "/marketplace/catalog",
    label: "Catalog",
    description: "Live slim catalog browser",
    group: "product",
  },
  {
    to: "/skills",
    label: "Skill packs",
    description: "Twelve LVL skills as full products",
    group: "product",
  },
  {
    to: "/lab/interop",
    label: "Interop standards",
    description: "MCP, A2A, x402, AP2 composition + LVL compliance",
    group: "lab",
  },
  {
    to: "/lab/settlement",
    label: "Settlement intelligence",
    description: "BIS Agorá + XRPL 3.3.0 → agent settlement patterns",
    group: "lab",
  },
] as const;

export type AppRouteTo = (typeof APP_ROUTES)[number]["to"];
