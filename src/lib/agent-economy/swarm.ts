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
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
  };
}

export async function loadAuditor() {
  return get("/api/auditor");
}

export async function loadX402Discovery() {
  return get("/api/x402");
}

export async function loadJwks() {
  return get("/.well-known/jwks.json");
}

export async function loadWellKnownAgent() {
  return get("/.well-known/agent.json");
}

export async function fetchBuyerCredential(wallet: string) {
  return get(
    `/api/credentials/buyer?wallet=${encodeURIComponent(wallet)}`,
  );
}

export async function runOrchestrate(goal: string, budget_usd: number) {
  const res = (await proxyLvlFetch({
    data: {
      path: "/api/orchestrate",
      method: "POST",
      accept: "application/json",
      body: JSON.stringify({ goal, budget_usd }),
      headers: { "Content-Type": "application/json" },
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    error: res.error,
  };
}

/** Machine-readable map of Control Room → LVL product surfaces */
export function controlRoomManifest() {
  return {
    schema: "lvl-control-room-manifest-v1",
    product: "LVL Agent Control Room",
    site: "https://lvlltd.com",
    generatedAt: "static",
    routes: {
      buy: [
        "/marketplace/pay",
        "/marketplace/checkout",
        "/marketplace/wallet",
        "/marketplace/receipts",
      ],
      grow: [
        "/marketplace/ladder",
        "/marketplace/shelf",
        "/marketplace/demand",
        "/marketplace/intent",
      ],
      operate: [
        "/marketplace/live",
        "/marketplace/ready",
        "/marketplace/auditor",
        "/marketplace/simulate",
      ],
      integrate: [
        "/marketplace/mcp",
        "/marketplace/sdk",
        "/marketplace/kit",
        "/marketplace/protocols",
        "/marketplace/orchestrate",
      ],
      trust: [
        "/marketplace/trust",
        "/marketplace/credentials",
        "/marketplace/mandates",
        "/marketplace/access",
      ],
      supply: ["/marketplace/sell", "/marketplace/agents", "/marketplace/catalog"],
    },
    lvlApis: [
      "/api/shop",
      "/api/cart",
      "/api/pay",
      "/api/proof",
      "/api/mcp",
      "/api/orchestrate",
      "/api/auditor",
      "/api/signals",
      "/api/intent",
      "/api/mandates",
      "/api/credentials/buyer",
      "/api/purchases",
    ],
  };
}
