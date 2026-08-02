import type { RoleId, TokenBucketSnapshot } from "./types";
import {
  createTokenBucket,
  refillTick,
  tryConsume,
  type TokenBucketState,
} from "./token-bucket";

export type BucketMap = {
  global: TokenBucketState;
  scout: TokenBucketState;
  builder: TokenBucketState;
  default: TokenBucketState;
};

export function createDefaultBuckets(): BucketMap {
  return {
    global: createTokenBucket({ capacity: 40, refillRate: 2, initialTokens: 40 }),
    scout: createTokenBucket({ capacity: 14, refillRate: 0.8, initialTokens: 14 }),
    builder: createTokenBucket({ capacity: 12, refillRate: 0.5, initialTokens: 12 }),
    default: createTokenBucket({ capacity: 12, refillRate: 0.5, initialTokens: 12 }),
  };
}

export function roleBucketKey(role: RoleId): keyof BucketMap {
  if (role === "scout" || role === "auditor" || role === "reviewer") return "scout";
  if (role === "builder" || role === "shipper" || role === "operator") return "builder";
  return "default";
}

export function bucketsToSnapshots(
  map: BucketMap,
  lastDecision = "init",
): TokenBucketSnapshot[] {
  return (Object.entries(map) as [string, TokenBucketState][]).map(([name, b]) => ({
    name,
    capacity: b.config.capacity,
    tokens: round2(b.tokens),
    refillRate: b.config.refillRate,
    admitted: b.admitted,
    rejected: b.rejected,
    totalConsumed: round2(b.totalConsumed),
    lastDecision,
  }));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function snapshotsToBuckets(snaps: TokenBucketSnapshot[]): BucketMap {
  const by = Object.fromEntries(snaps.map((s) => [s.name, s]));
  const load = (name: keyof BucketMap, fallback: TokenBucketState): TokenBucketState => {
    const s = by[name];
    if (!s) return fallback;
    return {
      config: { capacity: s.capacity, refillRate: s.refillRate },
      tokens: s.tokens,
      lastRefillMs: Date.now(),
      admitted: s.admitted,
      rejected: s.rejected,
      totalConsumed: s.totalConsumed,
    };
  };
  const d = createDefaultBuckets();
  return {
    global: load("global", d.global),
    scout: load("scout", d.scout),
    builder: load("builder", d.builder),
    default: load("default", d.default),
  };
}

/** Tick-based refill then try global + role bulkhead. */
export function consumeFromBuckets(
  snaps: TokenBucketSnapshot[],
  role: RoleId,
  cost: number,
): { ok: boolean; snaps: TokenBucketSnapshot[]; reason: string; retryAfterMs?: number } {
  let map = snapshotsToBuckets(snaps);
  // discrete refill each admit attempt (simulates step clock)
  map = {
    global: refillTick(map.global),
    scout: refillTick(map.scout),
    builder: refillTick(map.builder),
    default: refillTick(map.default),
  };

  const g = tryConsume(map.global, cost, Date.now());
  if (!g.ok) {
    map.global = g.bucket;
    return {
      ok: false,
      snaps: bucketsToSnapshots(map, `defer global deficit=${g.deficit.toFixed(2)}`),
      reason: "token_bucket_global",
      retryAfterMs: Number.isFinite(g.retryAfterMs) ? g.retryAfterMs : undefined,
    };
  }
  map.global = g.bucket;

  const key = roleBucketKey(role);
  const r = tryConsume(map[key], cost, Date.now());
  if (!r.ok) {
    // refund global on role failure (no partial charge)
    map.global = {
      ...map.global,
      tokens: Math.min(map.global.config.capacity, map.global.tokens + cost),
      admitted: Math.max(0, map.global.admitted - 1),
      totalConsumed: Math.max(0, map.global.totalConsumed - cost),
      rejected: map.global.rejected + 1,
    };
    map[key] = r.bucket;
    return {
      ok: false,
      snaps: bucketsToSnapshots(map, `defer ${key} deficit=${r.deficit.toFixed(2)}`),
      reason: `token_bucket_${key}`,
      retryAfterMs: Number.isFinite(r.retryAfterMs) ? r.retryAfterMs : undefined,
    };
  }
  map[key] = r.bucket;
  return {
    ok: true,
    snaps: bucketsToSnapshots(map, `consume ${cost} · ${role} via ${key}`),
    reason: "token_bucket_ok",
  };
}
