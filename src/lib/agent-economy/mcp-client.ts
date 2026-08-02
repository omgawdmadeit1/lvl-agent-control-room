import {
  parseProxiedJson,
  proxyLvlFetch,
  type ProxiedResponse,
} from "@/lib/agent-system/scout-server";

export async function mcpRpc(
  method: string,
  params?: Record<string, unknown>,
  id = 1,
) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params: params || {},
  });
  const res = (await proxyLvlFetch({
    data: {
      path: "/api/mcp",
      method: "POST",
      accept: "application/json",
      body,
      headers: { "Content-Type": "application/json" },
    },
  })) as ProxiedResponse;
  const data = parseProxiedJson(res) as {
    result?: unknown;
    error?: { message?: string; code?: number };
  };
  return {
    status: res.status,
    ms: res.ms,
    data,
    error: res.error,
  };
}

export async function mcpToolsList() {
  const r = await mcpRpc("tools/list");
  const tools =
    (r.data?.result as { tools?: { name: string; description?: string; inputSchema?: unknown }[] })
      ?.tools || [];
  return { ...r, tools };
}

export async function mcpToolCall(
  name: string,
  args: Record<string, unknown>,
) {
  const r = await mcpRpc("tools/call", { name, arguments: args });
  // unwrap text content if present
  const content = (r.data?.result as { content?: { type: string; text?: string }[] })
    ?.content;
  let parsed: unknown = r.data?.result;
  if (content?.[0]?.text) {
    try {
      parsed = JSON.parse(content[0].text);
    } catch {
      parsed = content[0].text;
    }
  }
  return { ...r, parsed };
}

export async function draftMandate(input: {
  principal: string;
  agent: string;
  max_per_purchase_usd?: number;
  period_limit_usd?: number;
  period?: string;
}) {
  const body = JSON.stringify({
    principal: input.principal,
    agent: input.agent,
    max_per_purchase_usd: input.max_per_purchase_usd ?? 10,
    period_limit_usd: input.period_limit_usd ?? 50,
    period: input.period || "month",
  });
  const res = (await proxyLvlFetch({
    data: {
      path: "/api/mandates",
      method: "POST",
      accept: "application/json",
      body,
      headers: { "Content-Type": "application/json" },
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
    error: res.error,
  };
}

export async function fetchAccess(wallet: string, skill: string) {
  const res = (await proxyLvlFetch({
    data: {
      path: `/api/access?wallet=${encodeURIComponent(wallet)}&skill=${encodeURIComponent(skill)}`,
      accept: "application/json",
    },
  })) as ProxiedResponse;
  return {
    status: res.status,
    ms: res.ms,
    data: parseProxiedJson(res) as Record<string, unknown> | undefined,
  };
}
