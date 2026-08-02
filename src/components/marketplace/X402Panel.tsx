import type { X402Challenge } from "@/lib/marketplace/types";
import { cn } from "@/components/ui/cn";

export function X402Panel({ challenge }: { challenge: X402Challenge }) {
  const accept = challenge.accepts?.[0];
  return (
    <section
      aria-labelledby="x402-heading"
      className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="x402-heading" className="text-sm font-semibold">
            x402 payment challenge
          </h2>
          <p className="mt-1 text-xs text-muted">
            Live challenge from lvlltd.com — agents pay USDC on Base, then POST payment proof to
            unlock the sealed pack.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold",
            challenge.status === 402
              ? "border-warn/40 bg-warn/10 text-warn"
              : challenge.ok
                ? "border-ok/40 bg-ok/10 text-ok"
                : "border-danger/40 bg-danger/10 text-danger",
          )}
        >
          HTTP {challenge.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
          <dt className="text-[10px] uppercase text-subtle">Skill</dt>
          <dd className="font-mono text-sm">{challenge.skillId || "—"}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
          <dt className="text-[10px] uppercase text-subtle">Price (USDC)</dt>
          <dd className="font-mono text-sm">
            {challenge.priceUsd != null ? `$${challenge.priceUsd.toFixed(2)}` : "—"}
          </dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
          <dt className="text-[10px] uppercase text-subtle">Network</dt>
          <dd className="font-mono text-xs break-all">{challenge.network || accept?.network || "—"}</dd>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-3">
          <dt className="text-[10px] uppercase text-subtle">Pay to</dt>
          <dd className="font-mono text-[11px] break-all">{challenge.payTo || accept?.payTo || "—"}</dd>
        </div>
      </dl>

      {(challenge.message || challenge.description) && (
        <p className="mt-3 text-xs text-muted leading-relaxed">
          {challenge.message || challenge.description}
        </p>
      )}

      {accept?.extra?.outline && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={accept.extra.outline}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          >
            Free outline
          </a>
          {accept.extra.sample && (
            <a
              href={accept.extra.sample}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
            >
              Sample
            </a>
          )}
        </div>
      )}

      <ol className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted">
        <li>
          <strong className="text-fg">1. Discover</strong> — agent reads catalog / shop / listing
        </li>
        <li>
          <strong className="text-fg">2. Challenge</strong> — GET /api/pay → HTTP 402 + accepts[]
        </li>
        <li>
          <strong className="text-fg">3. Pay</strong> — USDC transfer on Base to payTo
        </li>
        <li>
          <strong className="text-fg">4. Unlock</strong> — POST X-PAYMENT &#123;txHash, skill&#125; → sealed pack
        </li>
        <li>
          <strong className="text-fg">5. Prove</strong> — /api/proof for audit trail
        </li>
      </ol>
    </section>
  );
}
