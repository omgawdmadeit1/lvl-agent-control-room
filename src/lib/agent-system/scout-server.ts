import { createServerFn } from "@tanstack/react-start";

export type ProxiedResponse = {
  ok: boolean;
  status: number;
  ms: number;
  text?: string;
  /** JSON string body when content-type is JSON */
  jsonText?: string;
  error?: string;
};

export function parseProxiedJson(res: ProxiedResponse): unknown {
  if (!res.jsonText) return undefined;
  try {
    return JSON.parse(res.jsonText);
  } catch {
    return undefined;
  }
}

/**
 * Server-side fetch so browser console is not spammed with client 402/404.
 */
export type ProxyLvlInput = {
  path: string;
  method?: string;
  accept?: string;
  /** Optional JSON body for POST (e.g. unlock) */
  body?: string;
  /** Extra headers (X-PAYMENT, Content-Type, …) */
  headers?: Record<string, string>;
};

export const proxyLvlFetch = createServerFn({ method: "POST" })
  .validator((input: ProxyLvlInput) => input)
  .handler(async ({ data }): Promise<ProxiedResponse> => {
    const path = data.path.startsWith("/") ? data.path : `/${data.path}`;
    const method = (data.method || "GET").toUpperCase();
    const allowed =
      path === "/" ||
      path.startsWith("/catalog.json") ||
      path.startsWith("/api/") ||
      path.startsWith("/listings/") ||
      path.startsWith("/status") || path === "/status.json" ||
      path.startsWith("/skills/") ||
      path.startsWith("/.well-known/") ||
      path === "/agent.json" ||
      path === "/fleet.json" ||
      path === "/open-market.json" ||
      path === "/protocols.json" ||
      path === "/openapi.json" ||
      path === "/llms.txt" ||
      path === "/robots.txt" ||
      path === "/sitemap.xml" ||
      path.startsWith("/sdk/") ||
      path.startsWith("/about") ||
      path.startsWith("/agents");
    if (!allowed) {
      return { ok: false, status: 400, ms: 0, error: "path not allowlisted" };
    }
    // Only allow mutating methods on pay/unlock-related paths
    if (method !== "GET" && method !== "HEAD") {
      const mutOk =
        path.startsWith("/api/pay") ||
        path.startsWith("/api/cart") ||
        path.startsWith("/api/proof") ||
        path.startsWith("/api/mcp") ||
        path.startsWith("/api/mandates") ||
        path.startsWith("/api/orchestrate") ||
        path.startsWith("/api/intent");
      if (!mutOk) {
        return {
          ok: false,
          status: 400,
          ms: 0,
          error: "POST only allowed for pay/cart/proof/mcp/mandates",
        };
      }
    }
    const url = `https://lvlltd.com${path}`;
    const t0 = Date.now();
    try {
      const r = await fetch(url, {
        method,
        headers: {
          Accept: data.accept || "application/json",
          ...(data.body ? { "Content-Type": "application/json" } : {}),
          ...(data.headers || {}),
        },
        body: data.body && method !== "GET" && method !== "HEAD" ? data.body : undefined,
        redirect: "manual",
      });
      const ct = r.headers.get("content-type") || "";
      const ms = Date.now() - t0;
      if (ct.includes("application/json")) {
        const jsonText = await r.text();
        return {
          ok: (r.status >= 200 && r.status < 400) || r.status === 402,
          status: r.status,
          ms,
          jsonText,
        };
      }
      const text = await r.text();
      return {
        ok: r.status >= 200 && r.status < 400,
        status: r.status,
        ms,
        text,
      };
    } catch (e) {
      return {
        ok: false,
        status: 0,
        ms: Date.now() - t0,
        error: String((e as Error)?.message || e).slice(0, 240),
      };
    }
  });
