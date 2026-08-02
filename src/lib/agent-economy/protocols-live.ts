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

export type ProtocolsLiveSnapshot = {
  loadedAt: string;
  durationMs: number;
  mcp: Record<string, unknown> | null;
  a2a: Record<string, unknown> | null;
  mandates: Record<string, unknown> | null;
  bundles: {
    id?: string;
    name?: string;
    price_usd?: number;
    members?: string[];
    savings_usd?: number;
    skill_id?: string;
  }[];
  subscribe: Record<string, unknown> | null;
  meter: Record<string, unknown> | null;
};

export async function loadProtocolsLive(): Promise<ProtocolsLiveSnapshot> {
  const t0 = Date.now();
  const [mcp, a2a, mandates, bundles, subscribe, meter] = await Promise.all([
    get("/api/mcp"),
    get("/api/a2a"),
    get("/api/mandates"),
    get("/api/bundles"),
    get("/api/subscribe"),
    get("/api/meter"),
  ]);
  const b = bundles.data || {};
  const list = Array.isArray(b.bundles)
    ? (b.bundles as ProtocolsLiveSnapshot["bundles"])
    : Array.isArray(b.items)
      ? (b.items as ProtocolsLiveSnapshot["bundles"])
      : [];
  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    mcp: mcp.data || null,
    a2a: a2a.data || null,
    mandates: mandates.data || null,
    bundles: list,
    subscribe: subscribe.data || null,
    meter: meter.data || null,
  };
}

export async function searchIntent(q: string) {
  const path = `/api/intent?q=${encodeURIComponent(q)}`;
  const r = await get(path);
  return {
    status: r.status,
    ms: r.ms,
    data: r.data,
  };
}

export async function loadTrustTop(limit = 12) {
  const r = await get("/api/trust");
  const skills = Array.isArray(r.data?.skills)
    ? (r.data!.skills as {
        id: string;
        name: string;
        composite_score?: number;
        composite_label?: string;
        unproven?: boolean;
      }[])
    : [];
  // sort by score desc
  const sorted = [...skills].sort(
    (a, b) => (b.composite_score || 0) - (a.composite_score || 0),
  );
  return {
    status: r.status,
    ms: r.ms,
    count: Number(r.data?.count || skills.length),
    top: sorted.slice(0, limit),
    bottom: sorted.filter((s) => s.unproven).slice(0, 8),
  };
}

export async function loadSecuritySummary() {
  const r = await get("/api/security");
  return { status: r.status, ms: r.ms, data: r.data || null };
}

export async function loadEvalSummary() {
  const r = await get("/api/eval");
  return { status: r.status, ms: r.ms, data: r.data || null };
}

export async function checkAccess(wallet: string, skill: string) {
  const r = await get(
    `/api/access?wallet=${encodeURIComponent(wallet)}&skill=${encodeURIComponent(skill)}`,
  );
  return { status: r.status, ms: r.ms, data: r.data || null };
}
