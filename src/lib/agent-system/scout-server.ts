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
export const proxyLvlFetch = createServerFn({ method: "POST" })
  .validator((input: { path: string; method?: string; accept?: string }) => input)
  .handler(async ({ data }): Promise<ProxiedResponse> => {
    const path = data.path.startsWith("/") ? data.path : `/${data.path}`;
    const allowed =
      path === "/" ||
      path.startsWith("/catalog.json") ||
      path.startsWith("/api/") ||
      path.startsWith("/listings/") ||
      path.startsWith("/status") ||
      path.startsWith("/skills/") ||
      path === "/robots.txt" ||
      path === "/sitemap.xml";
    if (!allowed) {
      return { ok: false, status: 400, ms: 0, error: "path not allowlisted" };
    }
    const url = `https://lvlltd.com${path}`;
    const t0 = Date.now();
    try {
      const r = await fetch(url, {
        method: data.method || "GET",
        headers: { Accept: data.accept || "*/*" },
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
