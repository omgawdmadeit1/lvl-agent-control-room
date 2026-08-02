import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

const KEY = "lvl-receipt-vault-v1";

export type PurchaseReceipt = {
  id: string;
  skillId: string;
  txHash?: string;
  status: "pending" | "unlocked" | "failed" | "manual";
  amountUsd?: number;
  atomic?: string;
  payTo?: string;
  at: string;
  note?: string;
  unlockBody?: unknown;
};

export function listReceipts(): PurchaseReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as PurchaseReceipt[];
  } catch {
    return [];
  }
}

export function saveReceipt(
  r: Omit<PurchaseReceipt, "id" | "at"> & { id?: string; at?: string },
) {
  const entry: PurchaseReceipt = {
    id: r.id || `rcpt_${Date.now().toString(36)}`,
    at: r.at || new Date().toISOString(),
    skillId: r.skillId,
    txHash: r.txHash,
    status: r.status,
    amountUsd: r.amountUsd,
    atomic: r.atomic,
    payTo: r.payTo,
    note: r.note,
    unlockBody: r.unlockBody,
  };
  const all = listReceipts().filter((x) => x.id !== entry.id);
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
  return entry;
}

export function clearReceipts() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export async function fetchPurchases(wallet: string) {
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/purchases?wallet=${encodeURIComponent(wallet)}`,
      accept: "application/json",
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
  };
}

export async function fetchPriceHistory(skill: string) {
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/price-history?skill=${encodeURIComponent(skill)}`,
      accept: "application/json",
    },
  })) as ProxiedResponse;
  const data = parseProxiedJson(res) as {
    events?: {
      at: string;
      skill_id?: string;
      price_usd?: number;
      [k: string]: unknown;
    }[];
    event_count?: number;
  };
  return {
    status: res.status,
    ms: res.ms,
    events: data?.events || [],
    count: Number(data?.event_count || 0),
  };
}

export async function fetchStatusHistory() {
  const res = (await proxyLvlFetch({
    data: { path: "/api/status-history", accept: "application/json" },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
  };
}
