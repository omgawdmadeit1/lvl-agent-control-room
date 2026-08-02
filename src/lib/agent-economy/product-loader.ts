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
    ok: res.status >= 200 && res.status < 400 || res.status === 402,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    text: res.text,
  };
}

export type ProductSnapshot = {
  loadedAt: string;
  durationMs: number;
  health: Record<string, unknown> | null;
  ready: Record<string, unknown> | null;
  readyHttp: number;
  proof: Record<string, unknown> | null;
  fleet: Record<string, unknown> | null;
  protocols: Record<string, unknown> | null;
  agentDiscovery: Record<string, unknown> | null;
  shop: Record<string, unknown> | null;
  cart: Record<string, unknown> | null;
  cartSkills: string[];
  featured: {
    start_here?: { id: string; name: string; price_usd: number; blurb?: string; challenge?: string };
    tripwire?: { id: string; name?: string; price_usd?: number };
  };
  inventory: { skills: number; premium: number; sealed_packs?: number };
  lastPurchase: {
    skill_id?: string;
    price_usd?: number;
    txHash?: string;
    explorer?: string;
    confirmed_at?: string;
  } | null;
  activity: { unlock_count?: number; volume_usdc?: number };
  openMarket?: {
    url?: string;
    fee_free_tier_percent?: number;
    escrow_contract?: string;
  };
};

export async function loadProductSnapshot(
  cartSkills: string[] = [
    "agent-x402-first-buy",
    "agent-orchestration",
    "x402-retry-idempotency-kit",
  ],
): Promise<ProductSnapshot> {
  const t0 = Date.now();
  const skillsParam = cartSkills.filter(Boolean).join(",");
  const [health, ready, proof, fleet, protocols, agent, shop, cart] =
    await Promise.all([
      getJson("/api/health"),
      getJson("/api/ready"),
      getJson("/api/proof"),
      getJson("/fleet.json"),
      getJson("/protocols.json"),
      getJson("/agent.json"),
      getJson("/api/shop?budget_usd=25"),
      getJson(`/api/cart?skills=${encodeURIComponent(skillsParam)}`),
    ]);

  const h = health.data || null;
  const p = proof.data || null;
  const f = fleet.data || null;
  const s = shop.data || null;
  const featured = (s?.featured || {}) as ProductSnapshot["featured"];
  const invRaw = (h?.inventory || s?.inventory || {}) as Record<string, unknown>;
  const markets = (f?.markets || {}) as Record<string, Record<string, unknown>>;
  const open = markets.open_marketplace || {};

  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    health: h,
    ready: ready.data || null,
    readyHttp: ready.status,
    proof: p,
    fleet: f,
    protocols: protocols.data || null,
    agentDiscovery: agent.data || null,
    shop: s,
    cart: cart.data || null,
    cartSkills,
    featured,
    inventory: {
      skills: Number(invRaw.skills || invRaw.skill_count || 236),
      premium: Number(invRaw.premium || 176),
      sealed_packs: Number(invRaw.sealed_packs || 0),
    },
    lastPurchase:
      (p?.last_successful_agent_purchase as ProductSnapshot["lastPurchase"]) ||
      null,
    activity: (p?.activity as ProductSnapshot["activity"]) || {},
    openMarket: {
      url: String(open.url || "https://lvlltd.com/hub/upload/"),
      fee_free_tier_percent: Number(open.fee_free_tier_percent ?? 15),
      escrow_contract: open.escrow_contract
        ? String(open.escrow_contract)
        : undefined,
    },
  };
}
