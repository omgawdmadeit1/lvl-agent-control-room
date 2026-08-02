/**
 * Distilled X.com discourse (Aug 2026) relevant to lvlltd.com domains.
 * Used as product requirements, not hype.
 */
export type XInsight = {
  id: string;
  theme: string;
  signal: string;
  lvlAction: string;
  priority: "P0" | "P1" | "P2";
};

export const X_AGENT_ECONOMY_INSIGHTS: XInsight[] = [
  {
    id: "x-micropay",
    theme: "Sub-cent x402 hops",
    signal:
      "Sellers advertise 0.001 USDC endpoints and reciprocal agent snacks — agents pay agents with no account middleman.",
    lvlAction:
      "Surface budget_usd shop ladder + $0.05 first-buy canary; emphasize free outline before pay.",
    priority: "P0",
  },
  {
    id: "x-no-human-ux",
    theme: "URL/UI secondary to machine contracts",
    signal:
      "Builders say webpage design no longer matters for bot buyers — challenge + machine JSON does.",
    lvlAction:
      "Prioritize agent-card, openapi, llms.txt, shop, signals, proof over human-only chrome.",
    priority: "P0",
  },
  {
    id: "x-mcp-index",
    theme: "MCP + x402 endpoint indexes",
    signal:
      "Operators list 80+ x402 tools into smart order routers; MCP tags on discovery skills.",
    lvlAction:
      "Export MCP tools/list from LVL agent card skills + REST surfaces.",
    priority: "P0",
  },
  {
    id: "x-a2a-x402-split",
    theme: "A2A discovers; x402 settles",
    signal:
      "Agent Cards describe capabilities; payment stays HTTP 402 + X-PAYMENT, not inside JSON-RPC.",
    lvlAction:
      "Show live /.well-known/agent-card.json with securitySchemes.x402_http + purchase sequence.",
    priority: "P0",
  },
  {
    id: "x-identity",
    theme: "Verifiable agent identity",
    signal:
      "Discourse pairs x402 with ERC-8004 / signed identity for trust between strangers.",
    lvlAction:
      "Surface card signatures + proof ledger; link AP2 mandate headers when present.",
    priority: "P1",
  },
  {
    id: "x-eval",
    theme: "Reproducible agent eval harnesses",
    signal:
      "Open-source agent eval (tasks × configs × pass@k + evidence chains) is active.",
    lvlAction:
      "Keep Audit Evidence Desk + Red-Team Lab; attach proof URLs to unlock path.",
    priority: "P1",
  },
  {
    id: "x-intent-apis",
    theme: "Intent-driven APIs for agents",
    signal:
      "Platforms redesign APIs from endpoint wrapping to intent/MCP-first contracts.",
    lvlAction:
      "Document agent_purchase_sequence as the intent path; skill search by goal not menu.",
    priority: "P1",
  },
];
