import type { CodeExample } from "./backpressure-examples";

export const TOKEN_BUCKET_EXAMPLES: CodeExample[] = [
  {
    id: "classic",
    title: "1. Classic token bucket",
    summary: "Capacity C, refill rate R. Burst ≤ C; long-run rate ≤ R.",
    language: "ts",
    code: `type TokenBucket = {
  capacity: number;   // max burst
  tokens: number;     // current tokens
  refillRate: number; // tokens per second
  lastRefillMs: number;
};

function refill(b: TokenBucket, now = Date.now()): TokenBucket {
  const elapsed = (now - b.lastRefillMs) / 1000;
  const tokens = Math.min(b.capacity, b.tokens + elapsed * b.refillRate);
  return { ...b, tokens, lastRefillMs: now };
}

function tryConsume(b: TokenBucket, cost: number, now = Date.now()) {
  b = refill(b, now);
  if (b.tokens < cost) {
    const deficit = cost - b.tokens;
    const retryAfterMs = Math.ceil((deficit / b.refillRate) * 1000);
    return { ok: false as const, bucket: b, retryAfterMs };
  }
  return {
    ok: true as const,
    bucket: { ...b, tokens: b.tokens - cost },
  };
}

// Example: 10 tool-calls burst, sustain 2/sec
let bucket: TokenBucket = {
  capacity: 10,
  tokens: 10,
  refillRate: 2,
  lastRefillMs: Date.now(),
};

const r = tryConsume(bucket, 3);
if (r.ok) bucket = r.bucket;
else console.log("defer", r.retryAfterMs, "ms");`,
  },
  {
    id: "hierarchical",
    title: "2. Hierarchical buckets",
    summary: "Global + per-role bulkheads — all buckets must have enough tokens.",
    language: "ts",
    code: `function tryConsumeAll(
  buckets: TokenBucket[],
  cost: number,
  now = Date.now(),
) {
  const refilled = buckets.map((b) => refill(b, now));
  if (refilled.some((b) => b.tokens < cost)) {
    return { ok: false as const, buckets: refilled, reason: "empty" };
  }
  return {
    ok: true as const,
    buckets: refilled.map((b) => ({ ...b, tokens: b.tokens - cost })),
  };
}

// Agent system bulkheads
const global = createBucket({ capacity: 40, refillRate: 1 });
const scout = createBucket({ capacity: 14, refillRate: 0.5 });
const builder = createBucket({ capacity: 12, refillRate: 0.4 });

// Scout probe costs 1 against global + scout only
const gate = tryConsumeAll([global, scout], 1);
// Builder fix costs 2 against global + builder
const gate2 = tryConsumeAll([global, builder], 2);`,
  },
  {
    id: "agent-tick",
    title: "3. Discrete tick refill (sim)",
    summary: "Control Room style: each Step refills R tokens, then admits work.",
    language: "ts",
    code: `// Useful when your scheduler is tick-based (not wall-clock)
function refillTick(b: TokenBucket, tokensPerTick: number): TokenBucket {
  return {
    ...b,
    tokens: Math.min(b.capacity, b.tokens + tokensPerTick),
  };
}

function tickAdmit(state: { bucket: TokenBucket; queue: Job[] }) {
  let bucket = refillTick(state.bucket, /* refillRate as per-tick */ 2);
  const admitted: Job[] = [];
  const deferred: Job[] = [];

  for (const job of state.queue) {
    const r = tryConsume(bucket, job.cost);
    if (!r.ok) {
      deferred.push(job);
      bucket = r.bucket;
      continue;
    }
    bucket = r.bucket;
    admitted.push(job);
    if (admitted.length >= MAX_CONCURRENT) break;
  }
  return { bucket, admitted, deferred };
}`,
  },
  {
    id: "vs-leaky",
    title: "4. Token vs leaky bucket",
    summary: "Token bucket = credit account. Leaky bucket = queue that drains steadily.",
    language: "ts",
    code: `// Token bucket: idle time accrues burst credit (up to capacity)
// Leaky bucket: smooths outflow; excess arrivals are dropped

type Leaky = { capacity: number; level: number; leakRate: number; lastMs: number };

function leakyEnqueue(b: Leaky, now = Date.now()) {
  const elapsed = (now - b.lastMs) / 1000;
  const level = Math.max(0, b.level - elapsed * b.leakRate);
  if (level + 1 > b.capacity) {
    return { ok: false, state: { ...b, level, lastMs: now } }; // drop
  }
  return { ok: true, state: { ...b, level: level + 1, lastMs: now } };
}

/*
| | Token bucket | Leaky bucket |
|---|---|---|
| Allows burst? | Yes (up to C) | No (outflow fixed) |
| Shape | Rate + burst | Smooth constant rate |
| Agent fit | Tool budgets, API keys | Outbound webhook drain |
*/`,
  },
  {
    id: "gcr",
    title: "5. GCRA / equalizer note",
    summary: "Generic Cell Rate Algorithm is a compact token-bucket relative used by Redis etc.",
    language: "ts",
    code: `// GCRA stores only "theoretical arrival time" (TAT) — O(1) memory
// emissionInterval = 1 / rate
// If request arrives before TAT - tolerance → deny
// Else admit and TAT = max(now, TAT) + emissionInterval

function gcraAllow(
  tat: number,
  now: number,
  emissionInterval: number,
  delayTolerance: number,
): { allow: boolean; tat: number } {
  const earliest = tat - delayTolerance;
  if (now < earliest) return { allow: false, tat };
  const newTat = Math.max(now, tat) + emissionInterval;
  return { allow: true, tat: newTat };
}

// rate = 5/sec → emissionInterval = 200ms
// delayTolerance ≈ capacity * emissionInterval  (burst)`,
  },
  {
    id: "control-room",
    title: "6. Wire into agent admit gate",
    summary: "Compose token bucket with circuit breaker and max concurrent.",
    language: "ts",
    code: `function canAdmit(state: AgentState, task: Task) {
  if (state.circuit === "open") return deny("circuit_open");

  // 1) Rate / burst (token bucket)
  const take = tryConsume(state.globalBucket, task.cost);
  if (!take.ok) {
    return deny("rate_limited", take.retryAfterMs);
  }

  // 2) Concurrency semaphore (separate from rate)
  if (state.inFlight >= state.maxConcurrent) {
    // return tokens? optional — or keep consumed as reservation
    return deny("max_concurrent");
  }

  // 3) Priority under pressure
  if (state.pressure === "critical" && task.priority !== "P0") {
    return deny("critical_pressure");
  }

  return allow(take.bucket);
}`,
  },
];
