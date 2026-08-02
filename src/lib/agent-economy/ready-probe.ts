import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

/** Diagnose /api/ready challenge_shape by comparing multiple skills. */
export async function probeChallengeShape() {
  const skills = [
    "agent-x402-first-buy",
    "agent-orchestration",
    "aie-premium-access-token",
  ];
  const readyRes = (await proxyLvlFetch({
    data: { path: "/api/ready", accept: "application/json" },
  })) as ProxiedResponse;
  const ready = parseProxiedJson(readyRes) as Record<string, unknown>;

  const challenges = [];
  for (const skill of skills) {
    const r = (await proxyLvlFetch({
      data: {
        path: `/api/pay?skill=${encodeURIComponent(skill)}`,
        accept: "application/json",
      },
    })) as ProxiedResponse;
    const body = (parseProxiedJson(r) || {}) as Record<string, unknown>;
    challenges.push({
      skill,
      status: r.status,
      maxAmountRequired: body.maxAmountRequired,
      maxType: typeof body.maxAmountRequired,
      payTo: body.payTo,
      hasAccepts: Array.isArray(body.accepts),
      accepts0: Array.isArray(body.accepts) ? body.accepts[0] : null,
      amount_usd: body.amount_usd,
      x402Version: body.x402Version ?? body.x402_version,
      keys: Object.keys(body).slice(0, 25),
    });
  }

  return {
    readyHttp: readyRes.status,
    ready,
    challenges,
    hypothesis: [
      "challenge_shape often fails when accepts[] or amount typing diverges from facilitator schema",
      "Agents can still buy if individual GET /api/pay returns 402 with maxAmountRequired + payTo",
      "Track LVL upstream; Control Room surfaces public 402 truth per skill",
    ],
  };
}
