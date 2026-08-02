import { parseProxiedJson, proxyLvlFetch, type ProxiedResponse } from "@/lib/agent-system/scout-server";
import { MARKETPLACE_RAILS } from "./rails";
import type {
  CatalogMeta,
  CatalogSkill,
  MarketplaceSnapshot,
  X402Challenge,
} from "./types";

function asSkill(raw: unknown): CatalogSkill | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string" || typeof s.name !== "string") return null;
  return {
    id: s.id,
    name: s.name,
    price_usd: Number(s.price_usd) || 0,
    price_label: String(s.price_label || `$${s.price_usd ?? 0}`),
    category: String(s.category || "Other"),
    tier: String(s.tier || "premium"),
    summary: String(s.summary || ""),
    tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
    listing_url: String(s.listing_url || `https://lvlltd.com/listings/${s.id}/`),
    outline: s.outline ? String(s.outline) : undefined,
    challenge: s.challenge ? String(s.challenge) : undefined,
  };
}

export async function loadCatalogMeta(): Promise<CatalogMeta> {
  const res = (await proxyLvlFetch({
    data: { path: "/catalog.json?fields=meta", accept: "application/json" },
  })) as ProxiedResponse;
  const j = (parseProxiedJson(res) || {}) as CatalogMeta;
  return {
    ok: res.status === 200,
    schema: j.schema,
    skill_count: j.skill_count ?? 0,
    premium_count: j.premium_count,
    version: j.version,
    updated_at: j.updated_at,
    links: j.links,
  };
}

export async function loadCatalogSkills(): Promise<CatalogSkill[]> {
  const res = (await proxyLvlFetch({
    data: { path: "/catalog.json?fields=slim", accept: "application/json" },
  })) as ProxiedResponse;
  const j = (parseProxiedJson(res) || {}) as { skills?: unknown[] };
  const skills = (j.skills || []).map(asSkill).filter(Boolean) as CatalogSkill[];
  return skills;
}

export async function loadMarketplaceSnapshot(): Promise<MarketplaceSnapshot> {
  const t0 = Date.now();
  const [meta, skills] = await Promise.all([loadCatalogMeta(), loadCatalogSkills()]);

  const catMap = new Map<string, number>();
  let premiumCount = 0;
  let freeCount = 0;
  for (const s of skills) {
    catMap.set(s.category, (catMap.get(s.category) || 0) + 1);
    if (s.price_usd <= 0 || s.tier === "free") freeCount++;
    else premiumCount++;
  }
  const categories = [...catMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const buckets = [
    { label: "Free", min: 0, max: 0 },
    { label: "< $5", min: 0.01, max: 4.99 },
    { label: "$5–15", min: 5, max: 15 },
    { label: "$15–50", min: 15.01, max: 50 },
    { label: "$50+", min: 50.01, max: 1e9 },
  ].map((b) => ({
    ...b,
    count: skills.filter((s) => {
      if (b.label === "Free") return s.price_usd <= 0;
      return s.price_usd >= b.min && s.price_usd <= b.max;
    }).length,
  }));

  // Featured: agent-ops + orchestration-ish + top priced research
  const featuredIds = [
    "agent-orchestration",
    "agent-marketplace-infrastructure",
    "agent-economy-marketplace-operator",
    "deep-research-synthesizer",
  ];
  const featured = featuredIds
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean) as CatalogSkill[];
  if (featured.length < 4) {
    for (const s of skills) {
      if (featured.some((f) => f.id === s.id)) continue;
      featured.push(s);
      if (featured.length >= 6) break;
    }
  }

  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    meta: {
      ...meta,
      skill_count: meta.skill_count || skills.length,
    },
    skills,
    categories,
    premiumCount,
    freeCount,
    priceBuckets: buckets,
    rails: MARKETPLACE_RAILS.map((r) =>
      r.id === "discovery"
        ? { ...r, metric: `${skills.length} skills · v${meta.version || "?"}` }
        : r,
    ),
    featured,
  };
}

/** Fetch + parse x402 payment challenge for a skill (HTTP 402 expected). */
export async function loadX402Challenge(skillId: string): Promise<X402Challenge> {
  const safe = skillId.replace(/[^a-z0-9-]/gi, "").slice(0, 80);
  const res = (await proxyLvlFetch({
    data: { path: `/api/pay?skill=${encodeURIComponent(safe)}`, accept: "application/json" },
  })) as ProxiedResponse;

  const body = (parseProxiedJson(res) || {}) as Record<string, unknown>;
  const accepts = (Array.isArray(body.accepts) ? body.accepts : []) as X402Challenge["accepts"];
  const first = accepts?.[0];
  const extra = first?.extra;

  return {
    ok: res.status === 402 || res.status === 200,
    status: res.status,
    error: body.error ? String(body.error) : res.error,
    message: body.message ? String(body.message) : undefined,
    protocol: body.protocol ? String(body.protocol) : body.x402Version ? "x402" : undefined,
    description: body.description ? String(body.description) : undefined,
    resource: body.resource as X402Challenge["resource"],
    accepts,
    rawKeys: Object.keys(body),
    priceUsd: extra?.price_usd ?? (first?.amount ? Number(first.amount) / 1e6 : undefined),
    network: first?.network,
    payTo: first?.payTo,
    skillId: extra?.skill_id || safe,
  };
}

export function filterSkills(
  skills: CatalogSkill[],
  opts: { q?: string; category?: string; tier?: string; maxPrice?: number },
): CatalogSkill[] {
  const q = (opts.q || "").trim().toLowerCase();
  return skills.filter((s) => {
    if (opts.category && opts.category !== "ALL" && s.category !== opts.category) return false;
    if (opts.tier && opts.tier !== "ALL" && s.tier !== opts.tier) return false;
    if (opts.maxPrice != null && opts.maxPrice > 0 && s.price_usd > opts.maxPrice) return false;
    if (!q) return true;
    return (
      s.id.includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}
