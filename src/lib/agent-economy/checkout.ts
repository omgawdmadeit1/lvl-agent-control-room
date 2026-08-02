import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";
import { atomicToUsd } from "@/lib/agent-economy/product-engine";

export type CheckoutStepId =
  | "discover"
  | "evaluate"
  | "cart"
  | "challenge"
  | "pay"
  | "unlock"
  | "prove";

export type ChallengeInfo = {
  skillId: string;
  status: number;
  amountUsd?: number;
  maxAmountRequired?: string;
  payTo?: string;
  network?: string;
  asset?: string;
  outline?: string;
  sample?: string;
  name?: string;
  accepts?: unknown;
  raw?: Record<string, unknown>;
};

export type CartInfo = {
  total_usd: number;
  total_atomic: string;
  payTo: string;
  items: {
    skill_id: string;
    name: string;
    price_usd: number;
    maxAmountRequired: string;
    challenge: string;
  }[];
};

export async function fetchOutline(skillId: string) {
  const res = (await proxyLvlFetch({
    data: { path: `/skills/${skillId}/outline.json`, accept: "application/json" },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ok: res.status === 200,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    ms: res.ms,
  };
}

export async function fetchCart(skills: string[]) {
  const qs = skills.filter(Boolean).join(",");
  const res = (await proxyLvlFetch({
    data: { path: `/api/cart?skills=${encodeURIComponent(qs)}`, accept: "application/json" },
  })) as ProxiedResponse;
  const data = parseProxiedJson(res) as Record<string, unknown> | undefined;
  return {
    status: res.status,
    ok: !!data?.ok,
    data: data as (CartInfo & { ok?: boolean }) | undefined,
    ms: res.ms,
  };
}

export async function fetchChallenge(skillId: string): Promise<{
  status: number;
  ms: number;
  challenge: ChallengeInfo;
}> {
  const res = (await proxyLvlFetch({
    data: { path: `/api/pay?skill=${encodeURIComponent(skillId)}`, accept: "application/json" },
  })) as ProxiedResponse;
  const body = (parseProxiedJson(res) || {}) as Record<string, unknown>;
  const max =
    (body.maxAmountRequired as string) ||
    (Array.isArray(body.accepts)
      ? String((body.accepts[0] as { maxAmountRequired?: string })?.maxAmountRequired || "")
      : "");
  return {
    status: res.status,
    ms: res.ms,
    challenge: {
      skillId,
      status: res.status,
      amountUsd:
        typeof body.amount_usd === "number"
          ? body.amount_usd
          : max
            ? atomicToUsd(max)
            : undefined,
      maxAmountRequired: max || undefined,
      payTo: (body.payTo as string) || undefined,
      network: (body.network as string) || "base",
      asset: (body.asset as string) || "USDC",
      outline: (body.outline as string) || undefined,
      sample: (body.sample as string) || undefined,
      name: (body.name as string) || skillId,
      accepts: body.accepts,
      raw: body,
    },
  };
}

/** Attempt unlock with a real or test txHash (will fail verification if fake). */
export async function attemptUnlock(skillId: string, txHash: string) {
  const payment = JSON.stringify({ txHash, skill: skillId });
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/pay?skill=${encodeURIComponent(skillId)}`,
      method: "POST",
      accept: "application/json",
      body: "{}",
      headers: {
        "X-PAYMENT": payment,
        "Content-Type": "application/json",
      },
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    ok: res.status >= 200 && res.status < 300,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    error: res.error,
  };
}

export async function fetchProof() {
  const res = (await proxyLvlFetch({
    data: { path: "/api/proof", accept: "application/json" },
  })) as ProxiedResponse;
  return {
    status: res.status,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    ms: res.ms,
  };
}

export async function fetchDemand(limit = 12) {
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/signals?sort=demand&limit=${limit}`,
      accept: "application/json",
    },
  })) as ProxiedResponse;
  const data = parseProxiedJson(res) as {
    skills?: {
      id: string;
      name: string;
      price_usd: number;
      confirmed_unlocks?: number;
      demand_score?: number;
      category?: string;
      next_action?: string;
    }[];
    note?: string;
  };
  return { status: res.status, skills: data?.skills || [], note: data?.note, ms: res.ms };
}

export type SpendMandate = {
  id: string;
  maxUsd: number;
  categories: string[];
  expiresAt: string;
  agentId: string;
  status: "active" | "exhausted" | "expired";
  spentUsd: number;
};

export function createMandate(input: {
  maxUsd: number;
  categories: string[];
  hours: number;
  agentId: string;
}): SpendMandate {
  const expires = new Date(Date.now() + input.hours * 3600_000).toISOString();
  return {
    id: `mnd_${Math.random().toString(36).slice(2, 10)}`,
    maxUsd: input.maxUsd,
    categories: input.categories,
    expiresAt: expires,
    agentId: input.agentId,
    status: "active",
    spentUsd: 0,
  };
}

export function authorizeAgainstMandate(
  m: SpendMandate,
  purchase: { usd: number; category: string },
) {
  const now = Date.now();
  if (new Date(m.expiresAt).getTime() < now) {
    return { allowed: false, reason: "mandate expired", mandate: { ...m, status: "expired" as const } };
  }
  if (m.spentUsd + purchase.usd > m.maxUsd + 1e-9) {
    return {
      allowed: false,
      reason: "exceeds remaining budget",
      mandate: m,
      remaining: Math.round((m.maxUsd - m.spentUsd) * 100) / 100,
    };
  }
  if (
    m.categories.length &&
    !m.categories.includes("*") &&
    !m.categories.includes(purchase.category)
  ) {
    return { allowed: false, reason: "category not in mandate", mandate: m };
  }
  const next: SpendMandate = {
    ...m,
    spentUsd: Math.round((m.spentUsd + purchase.usd) * 100) / 100,
    status:
      m.spentUsd + purchase.usd >= m.maxUsd - 1e-9 ? "exhausted" : "active",
  };
  return { allowed: true, reason: "ok", mandate: next, remaining: Math.round((next.maxUsd - next.spentUsd) * 100) / 100 };
}

export const CHECKOUT_STEPS: { id: CheckoutStepId; label: string }[] = [
  { id: "discover", label: "Discover" },
  { id: "evaluate", label: "Evaluate" },
  { id: "cart", label: "Cart" },
  { id: "challenge", label: "402 Challenge" },
  { id: "pay", label: "Pay USDC" },
  { id: "unlock", label: "Unlock" },
  { id: "prove", label: "Prove" },
];
