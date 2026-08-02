import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

/** Complete AP2 mandate with EIP-191 signature from principal. */
export async function completeMandate(input: {
  principal: string;
  agent: string;
  signature: string;
  draft?: Record<string, unknown>;
  message_to_sign?: string;
  max_per_purchase_usd?: number;
  period_limit_usd?: number;
  period?: string;
}) {
  // Try common body shapes LVL may accept
  const attempts = [
    {
      principal: input.principal,
      agent: input.agent,
      signature: input.signature,
      draft: input.draft,
      message_to_sign: input.message_to_sign,
      max_per_purchase_usd: input.max_per_purchase_usd ?? 10,
      period_limit_usd: input.period_limit_usd ?? 50,
      period: input.period || "month",
    },
    {
      principal: input.principal,
      agent: input.agent,
      signature: input.signature,
      mandate: input.draft,
      max_per_purchase_usd: input.max_per_purchase_usd ?? 10,
      period_limit_usd: input.period_limit_usd ?? 50,
      period: input.period || "month",
    },
    {
      action: "create",
      principal: input.principal,
      agent: input.agent,
      signature: input.signature,
      draft: input.draft,
    },
  ];

  const results: { body: unknown; status: number; data?: Record<string, unknown> }[] = [];
  for (const body of attempts) {
    const res = (await proxyLvlFetch({
      data: {
        path: "/api/mandates",
        method: "POST",
        accept: "application/json",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      },
    })) as ProxiedResponse;
    const data = parseProxiedJson(res) as Record<string, unknown> | undefined;
    results.push({ body, status: res.status, data });
    if (res.status >= 200 && res.status < 300 && data?.ok !== false) {
      return { ok: true as const, status: res.status, data, attempts: results };
    }
    // if still signature_required, try next shape; if other success break
    if (data?.ok === true || data?.mandate_id || data?.id) {
      return { ok: true as const, status: res.status, data, attempts: results };
    }
  }
  return {
    ok: false as const,
    status: results[results.length - 1]?.status || 0,
    data: results[results.length - 1]?.data,
    attempts: results,
  };
}

export async function unlockWithPayment(skill: string, txHash: string) {
  const payment = JSON.stringify({ txHash, skill });
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/pay?skill=${encodeURIComponent(skill)}`,
      method: "POST",
      accept: "application/json",
      body: "{}",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT": payment,
      },
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    error: res.error,
  };
}
