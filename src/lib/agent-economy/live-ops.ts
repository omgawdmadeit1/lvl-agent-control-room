import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";
import {
  fetchCart,
  fetchChallenge,
  fetchOutline,
  fetchProof,
} from "@/lib/agent-economy/checkout";

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

export type LiveOpsSnapshot = {
  loadedAt: string;
  durationMs: number;
  health: Record<string, unknown> | null;
  ready: Record<string, unknown> | null;
  readyHttp: number;
  metrics: Record<string, unknown> | null;
  funnel: Record<string, unknown> | null;
  proof: Record<string, unknown> | null;
  status: Record<string, unknown> | null;
};

export async function loadLiveOpsSnapshot(): Promise<LiveOpsSnapshot> {
  const t0 = Date.now();
  const [health, ready, metrics, funnel, proof, status] = await Promise.all([
    get("/api/health"),
    get("/api/ready"),
    get("/api/metrics"),
    get("/api/funnel"),
    get("/api/proof"),
    get("/status.json"),
  ]);
  return {
    loadedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    health: health.data || null,
    ready: ready.data || null,
    readyHttp: ready.status,
    metrics: metrics.data || null,
    funnel: funnel.data || null,
    proof: proof.data || null,
    status: status.data || null,
  };
}

export type SimStep = {
  id: string;
  label: string;
  ok: boolean;
  ms: number;
  detail: string;
  status?: number;
};

export type BuyerSimResult = {
  score: number;
  grade: string;
  steps: SimStep[];
  skillId: string;
  durationMs: number;
  readyForProduction: boolean;
};

/** Automated buyer-agent dry run against live LVL (no real payment). */
export async function runBuyerAgentSimulation(
  skillId = "agent-x402-first-buy",
): Promise<BuyerSimResult> {
  const t0 = Date.now();
  const steps: SimStep[] = [];

  // 1 discovery
  {
    const t = Date.now();
    const r = await get("/agent.json");
    steps.push({
      id: "discovery",
      label: "Discovery (agent.json)",
      ok: r.status === 200 && !!r.data,
      ms: Date.now() - t,
      status: r.status,
      detail: r.data ? `v${String((r.data as { version?: string }).version || "?")}` : r.error || "fail",
    });
  }

  // 2 shop
  {
    const t = Date.now();
    const r = await get("/api/shop?budget_usd=5");
    const n = Number(
      ((r.data as { budget?: { matching_skills?: number } })?.budget
        ?.matching_skills as number) || 0,
    );
    steps.push({
      id: "shop",
      label: "Shop budget ladder",
      ok: r.status === 200 && n > 0,
      ms: Date.now() - t,
      status: r.status,
      detail: `${n} skills under $5`,
    });
  }

  // 3 outline
  {
    const t = Date.now();
    const r = await fetchOutline(skillId);
    steps.push({
      id: "outline",
      label: "Free outline eval",
      ok: r.ok,
      ms: Date.now() - t,
      status: r.status,
      detail: r.ok
        ? String((r.data as { name?: string })?.name || skillId)
        : `HTTP ${r.status}`,
    });
  }

  // 4 cart
  {
    const t = Date.now();
    const r = await fetchCart([skillId]);
    steps.push({
      id: "cart",
      label: "Cart total",
      ok: !!r.ok && !!r.data,
      ms: Date.now() - t,
      status: r.status,
      detail: r.data ? `$${r.data.total_usd} atomic ${r.data.total_atomic}` : "fail",
    });
  }

  // 5 challenge 402
  {
    const t = Date.now();
    const r = await fetchChallenge(skillId);
    const ok =
      r.status === 402 &&
      !!r.challenge.maxAmountRequired &&
      !!r.challenge.payTo;
    steps.push({
      id: "challenge",
      label: "HTTP 402 challenge",
      ok,
      ms: Date.now() - t,
      status: r.status,
      detail: ok
        ? `$${r.challenge.amountUsd} → ${r.challenge.payTo?.slice(0, 12)}…`
        : `HTTP ${r.status} missing fields`,
    });
  }

  // 6 proof
  {
    const t = Date.now();
    const r = await fetchProof();
    const loop = String(r.data?.loop_status || "");
    steps.push({
      id: "proof",
      label: "Proof ledger",
      ok: r.status === 200 && loop.length > 0,
      ms: Date.now() - t,
      status: r.status,
      detail: `loop=${loop}`,
    });
  }

  // 7 agent card
  {
    const t = Date.now();
    const r = await get("/.well-known/agent-card.json");
    const skills = Array.isArray(r.data?.skills) ? r.data!.skills.length : 0;
    steps.push({
      id: "card",
      label: "A2A agent card",
      ok: r.status === 200 && skills > 0,
      ms: Date.now() - t,
      status: r.status,
      detail: `${skills} card skills`,
    });
  }

  const passed = steps.filter((s) => s.ok).length;
  const score = Math.round((passed / steps.length) * 100);
  const grade =
    score >= 95 ? "A" : score >= 85 ? "B" : score >= 70 ? "C" : score >= 50 ? "D" : "F";

  return {
    score,
    grade,
    steps,
    skillId,
    durationMs: Date.now() - t0,
    readyForProduction: score >= 85 && steps.find((s) => s.id === "challenge")?.ok === true,
  };
}

export function buildIntegrationKit(opts: {
  base?: string;
  defaultSkill?: string;
  budgetUsd?: number;
  generatedAt?: string;
}) {
  const base = opts.base || "https://lvlltd.com";
  const skill = opts.defaultSkill || "agent-x402-first-buy";
  const budget = opts.budgetUsd ?? 5;
  return {
    schema: "lvl-agent-integration-kit-v1",
    generatedAt: opts.generatedAt || "2026-08-01T00:00:00.000Z",
    site: base,
    product: "LVL LTD x402 Agent Skill Market",
    sdk: `${base}/sdk/agent-shop.mjs`,
    discovery: {
      agent: `${base}/agent.json`,
      agentCard: `${base}/.well-known/agent-card.json`,
      openapi: `${base}/openapi.json`,
      llms: `${base}/llms.txt`,
      protocols: `${base}/protocols.json`,
    },
    commerce: {
      shop: `${base}/api/shop?budget_usd=${budget}`,
      catalog: `${base}/api/catalog`,
      cart: `${base}/api/cart?skills=${skill}`,
      challenge: `${base}/api/pay?skill=${skill}`,
      unlock: `POST ${base}/api/pay  X-PAYMENT: {"txHash":"0x…","skill":"${skill}"}`,
      proof: `${base}/api/proof`,
      signals: `${base}/api/signals?sort=demand`,
      x402: `${base}/api/x402`,
    },
    network: {
      chain: "base",
      chainId: 8453,
      asset: "USDC",
      assetContract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    defaults: { skill, budgetUsd: budget },
    sequence: [
      "GET discovery.agent",
      "GET commerce.shop",
      "GET outline /skills/{id}/outline.json",
      "GET commerce.challenge → expect 402",
      "Transfer maxAmountRequired atomic USDC to payTo on Base",
      "POST unlock with X-PAYMENT",
      "GET commerce.proof",
    ],
    controlRoom: {
      productOs: "/marketplace/product",
      checkout: "/marketplace/checkout",
      sdk: "/marketplace/sdk",
      liveOps: "/marketplace/live",
      simulate: "/marketplace/simulate",
    },
  };
}
