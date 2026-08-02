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
    error: res.error,
  };
}

export type PremiumItem = {
  id: string;
  name: string;
  price_usd: number;
};

export type ShelfSnapshot = {
  loadedAt: string;
  durationMs: number;
  premium: PremiumItem[];
  flagship: PremiumItem | null;
  inventory: Record<string, number>;
  payments: Record<string, unknown>;
  categoryTop: { name: string; count: number }[];
};

export async function loadShelfSnapshot(): Promise<ShelfSnapshot> {
  const t0 = Date.now();
  const m = await get("/api/metrics");
  const d = m.data || {};
  const premium = Array.isArray(d.premium_shelf_sample)
    ? (d.premium_shelf_sample as PremiumItem[])
    : [];
  const flagshipRaw = d.flagship as PremiumItem | PremiumItem[] | undefined;
  const flagship = Array.isArray(flagshipRaw)
    ? flagshipRaw[0] || null
    : flagshipRaw || premium[0] || null;
  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    premium,
    flagship,
    inventory: (d.inventory || {}) as Record<string, number>,
    payments: (d.payments || {}) as Record<string, unknown>,
    categoryTop: Array.isArray(d.category_top)
      ? (d.category_top as { name: string; count: number }[])
      : [],
  };
}

export type RecItem = {
  skill_id: string;
  name: string;
  price_usd: number;
  category?: string;
  score?: number;
  reasons?: string[];
};

export async function loadRecommendations(skill: string) {
  const r = await get(
    `/api/recommendations?skill=${encodeURIComponent(skill)}`,
  );
  const d = r.data || {};
  return {
    status: r.status,
    ms: r.ms,
    skill: d.skill as { id?: string; name?: string; price_usd?: number } | undefined,
    recommendations: Array.isArray(d.recommendations)
      ? (d.recommendations as RecItem[])
      : [],
  };
}

export type AllowanceResult = {
  ok: boolean;
  status: number;
  ms: number;
  owner: string;
  balance_usd?: number;
  allowance_usd?: number;
  required_usd?: number;
  canPay?: boolean;
  needsApprove?: boolean;
  raw?: Record<string, unknown>;
  error?: string;
};

export async function checkAllowance(
  owner: string,
  skill: string,
): Promise<AllowanceResult> {
  const path = `/api/allowance?owner=${encodeURIComponent(owner)}&skill=${encodeURIComponent(skill)}`;
  const r = await get(path);
  const d = r.data || {};
  if (!d.ok && r.status !== 200) {
    return {
      ok: false,
      status: r.status,
      ms: r.ms,
      owner,
      error: String(d.error || r.error || "allowance failed"),
    };
  }
  const balance = Number(d.balance_usd ?? 0);
  const allowance = Number(d.allowance_usd ?? 0);
  const required = Number(d.required_usd ?? 0);
  // x402 often uses direct transfer not approve — still useful readiness
  const canPay = balance >= required;
  return {
    ok: true,
    status: r.status,
    ms: r.ms,
    owner,
    balance_usd: balance,
    allowance_usd: allowance,
    required_usd: required,
    canPay,
    needsApprove: allowance < required && required > 0,
    raw: d,
  };
}

export type AgentDirEntry = {
  slug?: string;
  skill_id?: string;
  name?: string;
  tagline?: string;
  category?: string;
  price_usd?: number;
  profile_url?: string;
  challenge?: string;
  badges?: string[];
};

export async function loadAgentDirectory(limit = 48, q = "") {
  const r = await get("/agents/index.json");
  const d = r.data || {};
  let list: AgentDirEntry[] = Array.isArray(d.agents)
    ? (d.agents as AgentDirEntry[])
    : [];
  const query = q.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(query) ||
        (a.skill_id || "").toLowerCase().includes(query) ||
        (a.category || "").toLowerCase().includes(query) ||
        (a.tagline || "").toLowerCase().includes(query),
    );
  }
  return {
    status: r.status,
    ms: r.ms,
    count: Number(d.count || list.length),
    filtered: list.length,
    url_pattern: String(d.url_pattern || "https://lvlltd.com/agents/{slug}"),
    agents: list.slice(0, limit),
  };
}
