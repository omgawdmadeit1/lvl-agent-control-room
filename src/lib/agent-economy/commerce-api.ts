import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

async function get(path: string) {
  const res = (await proxyLvlFetch({
    data: { path, accept: "application/json" },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    ok: res.status >= 200 && res.status < 300 || res.status === 402,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    error: res.error,
  };
}

export type LadderSnapshot = {
  loadedAt: string;
  durationMs: number;
  featured: Record<string, unknown>;
  bundles: {
    id: string;
    name: string;
    price_usd: number;
    savings_usd?: number;
    savings_pct?: number;
    members?: string[];
    execution_order?: string[];
    blurb?: string;
    challenge?: string;
  }[];
  pipelines: {
    id: string;
    name: string;
    kind?: string;
    price_usd?: number;
    steps?: number;
    bundle_sku?: string;
    url?: string;
  }[];
  coverage: Record<string, unknown> | null;
  contracts: Record<string, unknown> | null;
  openMarket: Record<string, unknown> | null;
};

export async function loadLadderSnapshot(): Promise<LadderSnapshot> {
  const t0 = Date.now();
  const [shop, pipelines, coverage, contracts, openMarket] = await Promise.all([
    get("/api/shop?budget_usd=50"),
    get("/api/pipelines"),
    get("/api/coverage"),
    get("/api/contracts"),
    get("/open-market.json"),
  ]);
  const s = shop.data || {};
  const bundlesObj = (s.bundles || {}) as {
    items?: LadderSnapshot["bundles"];
  };
  const featured = (s.featured || {}) as Record<string, unknown>;
  const pipe = pipelines.data || {};
  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    featured,
    bundles: Array.isArray(bundlesObj.items) ? bundlesObj.items : [],
    pipelines: Array.isArray(pipe.pipelines)
      ? (pipe.pipelines as LadderSnapshot["pipelines"])
      : [],
    coverage: coverage.data || null,
    contracts: contracts.data || null,
    openMarket: openMarket.data || null,
  };
}

export type SdkCallResult = {
  method: string;
  path: string;
  status: number;
  ms: number;
  body: unknown;
};

/** Map SDK methods → live REST for playground (no browser CORS noise). */
export async function runSdkMethod(
  method: string,
  args: Record<string, string | number | undefined> = {},
): Promise<SdkCallResult> {
  const map: Record<string, string> = {
    discovery: "/agent.json",
    shop: "/api/shop?budget_usd=10",
    proof: "/api/proof",
    contracts: "/api/contracts",
    pipelines: "/api/pipelines",
    coverage: "/api/coverage",
    search: `/api/catalog?q=${encodeURIComponent(String(args.q || "agent"))}&limit=${args.limit || 5}`,
    outline: `/skills/${encodeURIComponent(String(args.skill || "agent-orchestration"))}/outline.json`,
    challenge: `/api/pay?skill=${encodeURIComponent(String(args.skill || "agent-x402-first-buy"))}`,
    cart: `/api/cart?skills=${encodeURIComponent(String(args.skills || "agent-x402-first-buy,agent-orchestration"))}`,
    recommendations: `/api/recommendations?skill=${encodeURIComponent(String(args.skill || "agent-orchestration"))}`,
    agentCard: "/.well-known/agent-card.json",
    signals: "/api/signals?sort=demand&limit=8",
    x402: "/api/x402",
  };
  const path = map[method];
  if (!path) {
    return {
      method,
      path: "",
      status: 0,
      ms: 0,
      body: { error: `unknown method ${method}`, available: Object.keys(map) },
    };
  }
  const r = await get(path);
  return { method, path, status: r.status, ms: r.ms, body: r.data ?? { error: r.error } };
}

export const SDK_METHODS = [
  { id: "discovery", label: "discovery()", hint: "agent.json" },
  { id: "agentCard", label: "agentCard", hint: ".well-known card" },
  { id: "shop", label: "shop()", hint: "budget shop" },
  { id: "search", label: "search({q})", hint: "catalog search" },
  { id: "outline", label: "outline(skill)", hint: "free eval" },
  { id: "challenge", label: "challenge(skill)", hint: "HTTP 402" },
  { id: "cart", label: "cart(skills)", hint: "multi-skill total" },
  { id: "proof", label: "proof()", hint: "ledger" },
  { id: "signals", label: "signals", hint: "demand" },
  { id: "pipelines", label: "pipelines()", hint: "editorial loops" },
  { id: "coverage", label: "coverage()", hint: "category stats" },
  { id: "contracts", label: "contracts()", hint: "treasury + escrow" },
  { id: "recommendations", label: "recommendations(skill)", hint: "upsell" },
  { id: "x402", label: "x402 discovery", hint: "pay rails" },
] as const;
