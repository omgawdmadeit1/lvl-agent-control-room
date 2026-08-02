/**
 * Token bucket — classic rate limiter used for backpressure.
 *
 * Capacity C, refill rate R tokens/sec (or tokens/tick).
 * Each request costs N tokens; if tokens >= N, admit and subtract N,
 * else reject/defer (or wait). Burst up to C; sustained rate ≤ R.
 */

export type TokenBucketConfig = {
  /** Max tokens held (burst size) */
  capacity: number;
  /** Tokens added per second (continuous) or per tick if using tick refill */
  refillRate: number;
  /** Starting tokens (default = capacity) */
  initialTokens?: number;
};

export type TokenBucketState = {
  config: TokenBucketConfig;
  tokens: number;
  /** Last refill timestamp (ms) */
  lastRefillMs: number;
  admitted: number;
  rejected: number;
  totalConsumed: number;
};

export function createTokenBucket(
  config: TokenBucketConfig,
  nowMs: number = Date.now(),
): TokenBucketState {
  const capacity = Math.max(0, config.capacity);
  const initial =
    config.initialTokens !== undefined
      ? clamp(config.initialTokens, 0, capacity)
      : capacity;
  return {
    config: { ...config, capacity },
    tokens: initial,
    lastRefillMs: nowMs,
    admitted: 0,
    rejected: 0,
    totalConsumed: 0,
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Refill based on elapsed wall time (continuous rate). */
export function refill(bucket: TokenBucketState, nowMs: number = Date.now()): TokenBucketState {
  const elapsedSec = Math.max(0, (nowMs - bucket.lastRefillMs) / 1000);
  if (elapsedSec <= 0) return bucket;
  const add = elapsedSec * bucket.config.refillRate;
  const tokens = clamp(bucket.tokens + add, 0, bucket.config.capacity);
  return { ...bucket, tokens, lastRefillMs: nowMs };
}

/** Discrete refill: add `refillRate` tokens once per tick (simulation-friendly). */
export function refillTick(bucket: TokenBucketState): TokenBucketState {
  const tokens = clamp(bucket.tokens + bucket.config.refillRate, 0, bucket.config.capacity);
  return { ...bucket, tokens, lastRefillMs: Date.now() };
}

export type TryConsumeResult =
  | { ok: true; bucket: TokenBucketState; waitedMs: 0 }
  | { ok: false; bucket: TokenBucketState; deficit: number; retryAfterMs: number };

/**
 * Attempt to take `cost` tokens. On failure, report deficit and estimated wait
 * until enough tokens refill (if refillRate > 0).
 */
export function tryConsume(
  bucket: TokenBucketState,
  cost: number,
  nowMs: number = Date.now(),
): TryConsumeResult {
  let b = refill(bucket, nowMs);
  const need = Math.max(0, cost);
  if (need === 0) return { ok: true, bucket: b, waitedMs: 0 };

  if (b.tokens + 1e-9 >= need) {
    b = {
      ...b,
      tokens: b.tokens - need,
      admitted: b.admitted + 1,
      totalConsumed: b.totalConsumed + need,
    };
    return { ok: true, bucket: b, waitedMs: 0 };
  }

  const deficit = need - b.tokens;
  const rate = b.config.refillRate;
  const retryAfterMs = rate > 0 ? Math.ceil((deficit / rate) * 1000) : Number.POSITIVE_INFINITY;
  b = { ...b, rejected: b.rejected + 1 };
  return { ok: false, bucket: b, deficit, retryAfterMs };
}

/** Hierarchical / multi-bucket: all must admit (e.g. global + role). */
export function tryConsumeAll(
  buckets: TokenBucketState[],
  cost: number,
  nowMs: number = Date.now(),
): { ok: boolean; buckets: TokenBucketState[]; reason?: string; retryAfterMs?: number } {
  // Speculative refill + check without commit
  const refilled = buckets.map((b) => refill(b, nowMs));
  for (let i = 0; i < refilled.length; i++) {
    if (refilled[i].tokens + 1e-9 < cost) {
      const deficit = cost - refilled[i].tokens;
      const rate = refilled[i].config.refillRate;
      return {
        ok: false,
        buckets: refilled.map((b, j) =>
          j === i ? { ...b, rejected: b.rejected + 1 } : b,
        ),
        reason: `bucket_${i}_empty`,
        retryAfterMs: rate > 0 ? Math.ceil((deficit / rate) * 1000) : undefined,
      };
    }
  }
  // Commit all
  const committed = refilled.map((b) => ({
    ...b,
    tokens: b.tokens - cost,
    admitted: b.admitted + 1,
    totalConsumed: b.totalConsumed + cost,
  }));
  return { ok: true, buckets: committed };
}

/** Leaky-bucket cousin: constant drain rate; queue of requests (for comparison). */
export type LeakyBucketState = {
  capacity: number;
  leakRate: number; // items/sec
  level: number;
  lastMs: number;
};

export function leakyEnqueue(
  state: LeakyBucketState,
  nowMs: number = Date.now(),
): { ok: boolean; state: LeakyBucketState } {
  const elapsed = Math.max(0, (nowMs - state.lastMs) / 1000);
  const level = Math.max(0, state.level - elapsed * state.leakRate);
  if (level + 1 > state.capacity) {
    return { ok: false, state: { ...state, level, lastMs: nowMs } };
  }
  return { ok: true, state: { ...state, level: level + 1, lastMs: nowMs } };
}

export const TOKEN_BUCKET_NOTES = {
  vsFixedWindow: "Token bucket allows short bursts up to capacity; fixed windows can stampede at boundaries.",
  vsLeakyBucket: "Token bucket meters tokens (credit); leaky bucket meters a queue that drains at constant rate.",
  vsSemaphore: "Semaphore limits concurrency (in-flight); token bucket limits sustained rate + burst.",
  agentUse:
    "Use global bucket for run-level tool budget, per-role buckets for bulkheads, per-route buckets for API rate limits.",
} as const;
