import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

async function getJson(path: string) {
  const res = (await proxyLvlFetch({
    data: { path, accept: "application/json" },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    ok: res.status >= 200 && res.status < 300,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    text: res.text,
    error: res.error,
  };
}

async function getText(path: string) {
  const res = (await proxyLvlFetch({ data: { path } })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    ok: res.status >= 200 && res.status < 300,
    text: res.text || res.jsonText || "",
    error: res.error,
  };
}

export type DomainSurface = {
  id: string;
  path: string;
  status: number;
  ms: number;
  ok: boolean;
  role: string;
};

export type McpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  lvlPath?: string;
};

export type AgentEconomySnapshot = {
  loadedAt: string;
  durationMs: number;
  agentCard: Record<string, unknown> | null;
  agentCardStatus: number;
  shop: Record<string, unknown> | null;
  signals: Record<string, unknown> | null;
  x402: Record<string, unknown> | null;
  proof: Record<string, unknown> | null;
  surfaces: DomainSurface[];
  mcpTools: McpTool[];
  purchaseSequence: string[];
  budgetSkills: {
    id: string;
    name: string;
    price_usd: number;
    category: string;
    challenge?: string;
    outline?: string;
  }[];
  bundles: {
    id: string;
    name: string;
    price_usd: number;
    savings_usd?: number;
    blurb?: string;
    members?: string[];
  }[];
  featuredStart?: { id: string; name: string; price_usd: number; blurb?: string };
  topDemand: {
    skill_id: string;
    name: string;
    price_usd: number;
    confirmed_unlocks?: number;
    demand_score?: number;
  }[];
};

function cardToMcpTools(card: Record<string, unknown> | null): McpTool[] {
  const tools: McpTool[] = [
    {
      name: "lvl_search_catalog",
      description: "Search LVL skill catalog by query and optional max price",
      lvlPath: "/api/catalog?q={q}&max_price={max}",
      inputSchema: {
        type: "object",
        properties: {
          q: { type: "string" },
          max_price: { type: "number" },
          limit: { type: "number" },
        },
        required: ["q"],
      },
    },
    {
      name: "lvl_shop_budget",
      description: "List skills and bundles affordable under a USDC budget",
      lvlPath: "/api/shop?budget_usd={budget}",
      inputSchema: {
        type: "object",
        properties: { budget_usd: { type: "number" } },
        required: ["budget_usd"],
      },
    },
    {
      name: "lvl_get_outline",
      description: "Free skill outline JSON before payment",
      lvlPath: "/skills/{skill_id}/outline.json",
      inputSchema: {
        type: "object",
        properties: { skill_id: { type: "string" } },
        required: ["skill_id"],
      },
    },
    {
      name: "lvl_x402_challenge",
      description: "GET payment challenge (HTTP 402) for a skill",
      lvlPath: "/api/pay?skill={skill_id}",
      inputSchema: {
        type: "object",
        properties: { skill_id: { type: "string" } },
        required: ["skill_id"],
      },
    },
    {
      name: "lvl_proof_heartbeat",
      description: "Public purchase proof ledger / loop status",
      lvlPath: "/api/proof",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "lvl_demand_signals",
      description: "Rank skills by confirmed commerce demand",
      lvlPath: "/api/signals?sort=demand&limit=20",
      inputSchema: {
        type: "object",
        properties: { limit: { type: "number" }, skill: { type: "string" } },
      },
    },
    {
      name: "lvl_x402_discovery",
      description: "Network, asset, pay_to, verification modes for x402",
      lvlPath: "/api/x402",
      inputSchema: { type: "object", properties: {} },
    },
  ];

  const skills = Array.isArray(card?.skills) ? (card!.skills as { id?: string; name?: string; description?: string }[]) : [];
  for (const s of skills.slice(0, 12)) {
    if (!s.id) continue;
    tools.push({
      name: `a2a_${s.id}`.replace(/[^a-z0-9_]/gi, "_").slice(0, 64),
      description: s.description || s.name || s.id,
      inputSchema: {
        type: "object",
        properties: { input: { type: "string" } },
      },
    });
  }
  return tools;
}

export async function loadAgentEconomySnapshot(budgetUsd = 15): Promise<AgentEconomySnapshot> {
  const t0 = Date.now();
  const surfacePaths: { path: string; role: string }[] = [
    { path: "/.well-known/agent-card.json", role: "A2A Agent Card" },
    { path: "/.well-known/agent.json", role: "Agent discovery alias" },
    { path: "/agent.json", role: "Root agent descriptor" },
    { path: "/api/shop", role: "Shop / budget commerce" },
    { path: "/api/signals?sort=demand&limit=5", role: "Demand signals" },
    { path: "/api/x402", role: "x402 discovery" },
    { path: "/api/proof", role: "Proof ledger" },
    { path: "/api/catalog?q=agent&limit=3", role: "Catalog search" },
    { path: "/catalog.json?fields=meta", role: "Catalog meta" },
    { path: "/protocols.json", role: "Protocols map" },
    { path: "/openapi.json", role: "OpenAPI" },
    { path: "/llms.txt", role: "LLMs.txt" },
    { path: "/fleet.json", role: "Fleet" },
    { path: "/api/ready", role: "Ready probe" },
    { path: "/api/health", role: "Health probe" },
  ];

  const [cardRes, shopRes, signalsRes, x402Res, proofRes, ...surfaceRes] =
    await Promise.all([
      getJson("/.well-known/agent-card.json"),
      getJson(`/api/shop?budget_usd=${budgetUsd}`),
      getJson("/api/signals?sort=demand&limit=12"),
      getJson("/api/x402"),
      getJson("/api/proof"),
      ...surfacePaths.map((s) =>
        s.path.endsWith(".txt") ? getText(s.path) : getJson(s.path),
      ),
    ]);

  const surfaces: DomainSurface[] = surfacePaths.map((s, i) => {
    const r = surfaceRes[i];
    return {
      id: s.path,
      path: s.path,
      status: r.status,
      ms: r.ms,
      ok: r.ok,
      role: s.role,
    };
  });

  const shop = shopRes.data || null;
  const budget = (shop?.budget || {}) as {
    skills?: {
      id: string;
      name: string;
      price_usd: number;
      category: string;
      challenge?: string;
      outline?: string;
    }[];
    matching_bundles?: {
      id: string;
      name: string;
      price_usd: number;
      savings_usd?: number;
      blurb?: string;
      members?: string[];
    }[];
  };
  const featured = (shop?.featured || {}) as {
    start_here?: { id: string; name: string; price_usd: number; blurb?: string };
  };
  const topDemand = Array.isArray(shop?.top_by_demand)
    ? (shop!.top_by_demand as AgentEconomySnapshot["topDemand"])
    : [];
  const purchaseSequence = Array.isArray(shop?.agent_purchase_sequence)
    ? (shop!.agent_purchase_sequence as string[])
    : [];

  const agentCard = cardRes.data || null;

  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    agentCard,
    agentCardStatus: cardRes.status,
    shop,
    signals: signalsRes.data || null,
    x402: x402Res.data || null,
    proof: proofRes.data || null,
    surfaces,
    mcpTools: cardToMcpTools(agentCard),
    purchaseSequence,
    budgetSkills: budget.skills || [],
    bundles: budget.matching_bundles || [],
    featuredStart: featured.start_here,
    topDemand,
  };
}
