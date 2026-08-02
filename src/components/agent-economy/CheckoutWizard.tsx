import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CHECKOUT_STEPS,
  attemptUnlock,
  authorizeAgainstMandate,
  createMandate,
  fetchCart,
  fetchChallenge,
  fetchOutline,
  fetchProof,
  type ChallengeInfo,
  type CheckoutStepId,
  type SpendMandate,
} from "@/lib/agent-economy/checkout";
import { cn } from "@/components/ui/cn";
import { UpsellRail } from "@/components/agent-economy/UpsellRail";
import { loadMarketPrefs, saveMarketPrefs } from "@/lib/agent-economy/prefs";

const inputCls =
  "h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-sm outline-none focus:border-accent";

export function CheckoutWizard({
  initialSkill = "agent-x402-first-buy",
}: {
  initialSkill?: string;
}) {
  const [step, setStep] = useState<CheckoutStepId>("discover");
  const [skillId, setSkillId] = useState(initialSkill);
  const [cartSkills, setCartSkills] = useState(initialSkill);

  useEffect(() => {
    const p = loadMarketPrefs();
    if (p.lastSkill && initialSkill === "agent-x402-first-buy") {
      setSkillId(p.lastSkill);
      setCartSkills(p.cartSkills || p.lastSkill);
    }
  }, [initialSkill]);

  useEffect(() => {
    saveMarketPrefs({ lastSkill: skillId, cartSkills });
  }, [skillId, cartSkills]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [outline, setOutline] = useState<Record<string, unknown> | null>(null);
  const [cart, setCart] = useState<Awaited<ReturnType<typeof fetchCart>>["data"]>(undefined);
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [txHash, setTxHash] = useState("");
  const [unlockResult, setUnlockResult] = useState<Record<string, unknown> | null>(null);
  const [proof, setProof] = useState<Record<string, unknown> | null>(null);
  const [mandate, setMandate] = useState<SpendMandate | null>(null);
  const [mandateMax, setMandateMax] = useState(5);
  const [mandateCats, setMandateCats] = useState("Commerce,Agent Ops,Finance,Trust");

  const push = useCallback((msg: string) => {
    setLog((prev) => [`${new Date().toISOString().slice(11, 19)}  ${msg}`, ...prev].slice(0, 40));
  }, []);

  const stepIdx = CHECKOUT_STEPS.findIndex((s) => s.id === step);

  async function runEvaluate() {
    setBusy(true);
    try {
      const r = await fetchOutline(skillId);
      setOutline(r.data || null);
      push(`outline ${skillId} → HTTP ${r.status} (${r.ms}ms)`);
      if (r.ok) setStep("evaluate");
    } finally {
      setBusy(false);
    }
  }

  async function runCart() {
    setBusy(true);
    try {
      const skills = cartSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const r = await fetchCart(skills);
      setCart(r.data);
      push(`cart [${skills.join(",")}] → HTTP ${r.status} total $${r.data?.total_usd ?? "?"} (${r.ms}ms)`);
      if (r.ok) setStep("cart");
    } finally {
      setBusy(false);
    }
  }

  async function runChallenge() {
    setBusy(true);
    try {
      const r = await fetchChallenge(skillId);
      setChallenge(r.challenge);
      push(
        `challenge ${skillId} → HTTP ${r.status} amount $${r.challenge.amountUsd ?? "?"} atomic ${r.challenge.maxAmountRequired} (${r.ms}ms)`,
      );
      if (r.status === 402 || r.status === 200) setStep("challenge");
    } finally {
      setBusy(false);
    }
  }

  function runPayGate() {
    if (!challenge?.maxAmountRequired || !challenge.payTo) {
      push("missing challenge — run 402 first");
      return;
    }
    if (mandate) {
      const cat =
        (outline?.category as string) ||
        (skillId.includes("x402") ? "Commerce" : "Agent Ops");
      const auth = authorizeAgainstMandate(mandate, {
        usd: challenge.amountUsd || 0,
        category: cat,
      });
      setMandate(auth.mandate);
      if (!auth.allowed) {
        push(`mandate DENIED: ${auth.reason}`);
        return;
      }
      push(`mandate ALLOWED · remaining $${auth.remaining}`);
    }
    setStep("pay");
    push(
      `pay ${challenge.maxAmountRequired} atomic ${challenge.asset} on ${challenge.network} → ${challenge.payTo}`,
    );
  }

  async function runUnlock() {
    if (!txHash.startsWith("0x") || txHash.length < 10) {
      push("enter a Base tx hash (0x…) after USDC transfer");
      return;
    }
    setBusy(true);
    try {
      const r = await attemptUnlock(skillId, txHash);
      setUnlockResult(r.data || { status: r.status, error: r.error });
      push(`unlock POST → HTTP ${r.status} (${r.ms}ms) ${r.ok ? "OK" : "rejected"}`);
      setStep("unlock");
    } finally {
      setBusy(false);
    }
  }

  async function runProve() {
    setBusy(true);
    try {
      const r = await fetchProof();
      setProof(r.data || null);
      push(`proof → HTTP ${r.status} loop=${String(r.data?.loop_status)} (${r.ms}ms)`);
      setStep("prove");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Guided agent checkout
        </p>
        <h1 className="mt-1 text-2xl font-semibold">x402 purchase wizard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Walk the live LVL loop step-by-step: free outline → multi-skill cart → HTTP 402 → USDC pay
          instructions → unlock with txHash → public proof. Optional AP2-style spend mandate gates
          the pay step.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/marketplace/product"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs"
          >
            Product OS
          </Link>
          <Link
            to="/marketplace/x402"
            search={{ skill: skillId }}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs"
          >
            Raw x402
          </Link>
        </div>
      </section>

      {/* Stepper */}
      <nav aria-label="Checkout steps" className="flex flex-wrap gap-1">
        {CHECKOUT_STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={cn(
              "inline-flex h-11 items-center rounded-full border px-3 text-[11px] font-medium",
              step === s.id
                ? "border-accent bg-accent text-accent-fg"
                : i < stepIdx
                  ? "border-ok/40 bg-ok/10 text-ok"
                  : "border-border bg-elevated text-muted",
            )}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">1–2 · Skill & free eval</h2>
            <label className="mt-3 block text-xs">
              <span className="text-muted">Primary skill id</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={skillId}
                onChange={(e) => setSkillId(e.target.value.trim())}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void runEvaluate()}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
              >
                Fetch outline
              </button>
              {["agent-x402-first-buy", "agent-orchestration", "aie-premium-access-token"].map(
                (id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSkillId(id)}
                    className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-2 font-mono text-[10px]"
                  >
                    {id}
                  </button>
                ),
              )}
            </div>
            {outline && (
              <div className="mt-3 rounded-[var(--radius-md)] bg-elevated p-3 text-xs">
                <p className="font-semibold">{String(outline.name || skillId)}</p>
                <p className="text-muted">
                  ${String(outline.price_usd ?? "—")} · {String(outline.category || "")}
                </p>
                <p className="mt-1 text-muted leading-relaxed">
                  {String(outline.summary || "").slice(0, 220)}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">3 · Multi-skill cart</h2>
            <label className="mt-3 block text-xs">
              <span className="text-muted">Skills (comma)</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={cartSkills}
                onChange={(e) => setCartSkills(e.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runCart()}
              className="mt-2 inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-xs font-semibold disabled:opacity-50"
            >
              Build cart
            </button>
            {cart?.items && (
              <ul className="mt-3 space-y-1 text-xs">
                {cart.items.map((it) => (
                  <li key={it.skill_id} className="flex justify-between gap-2 border-b border-border py-1">
                    <span>{it.name}</span>
                    <span className="font-mono">${it.price_usd}</span>
                  </li>
                ))}
                <li className="flex justify-between font-semibold pt-1">
                  <span>Total</span>
                  <span className="font-mono">${cart.total_usd}</span>
                </li>
              </ul>
            )}
          </section>

          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">4–5 · Challenge & pay</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void runChallenge()}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
              >
                GET 402 challenge
              </button>
              <button
                type="button"
                disabled={busy || !challenge}
                onClick={runPayGate}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-xs font-semibold disabled:opacity-50"
              >
                Authorize pay (mandate)
              </button>
            </div>
            {challenge && (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-subtle">Amount</dt>
                  <dd className="font-mono text-lg">${challenge.amountUsd}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Atomic</dt>
                  <dd className="font-mono">{challenge.maxAmountRequired}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-subtle">payTo · {challenge.network} {challenge.asset}</dt>
                  <dd className="truncate font-mono text-[11px] text-muted">{challenge.payTo}</dd>
                </div>
              </dl>
            )}
            {step === "pay" && challenge && (
              <div className="mt-3 rounded-[var(--radius-md)] border border-accent/40 bg-accent/10 p-3 text-xs leading-relaxed">
                <p className="font-semibold">Human or wallet agent:</p>
                <ol className="mt-1 list-decimal space-y-1 pl-4 text-muted">
                  <li>
                    Transfer exactly <strong className="text-fg">{challenge.maxAmountRequired}</strong>{" "}
                    atomic USDC (6 decimals) on Base to payTo.
                  </li>
                  <li>Copy the transaction hash (0x…).</li>
                  <li>Paste below and unlock.</li>
                </ol>
              </div>
            )}
          </section>

          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">6–7 · Unlock & prove</h2>
            <label className="mt-3 block text-xs">
              <span className="text-muted">Base txHash after USDC transfer</span>
              <input
                className={cn(inputCls, "mt-1 font-mono text-xs")}
                placeholder="0x…"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value.trim())}
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void runUnlock()}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
              >
                POST unlock
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runProve()}
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-xs font-semibold disabled:opacity-50"
              >
                Refresh proof ledger
              </button>
            </div>
            {unlockResult && (
              <pre className="mt-3 max-h-48 overflow-auto rounded-[var(--radius-md)] bg-elevated p-3 font-mono text-[10px] text-muted">
                {JSON.stringify(unlockResult, null, 2)}
              </pre>
            )}
            {proof && (
              <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-elevated p-3 text-xs">
                <p>
                  Loop: <strong>{String(proof.loop_status)}</strong>
                </p>
                <p className="text-muted">
                  Unlocks:{" "}
                  {String((proof.activity as { unlock_count?: number })?.unlock_count ?? "—")} ·
                  volume $
                  {String((proof.activity as { volume_usdc?: number })?.volume_usdc ?? "—")}
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">Spend mandate (AP2-style)</h2>
            <p className="mt-1 text-[11px] text-muted">
              Least-privilege agent budget before pay step.
            </p>
            <label className="mt-2 block text-xs">
              <span className="text-muted">Max USD</span>
              <input
                type="number"
                className={cn(inputCls, "mt-1")}
                value={mandateMax}
                onChange={(e) => setMandateMax(Number(e.target.value))}
              />
            </label>
            <label className="mt-2 block text-xs">
              <span className="text-muted">Categories</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={mandateCats}
                onChange={(e) => setMandateCats(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated text-xs font-semibold"
              onClick={() => {
                const m = createMandate({
                  maxUsd: mandateMax,
                  categories: mandateCats.split(",").map((s) => s.trim()).filter(Boolean),
                  hours: 24,
                  agentId: "buyer-agent-1",
                });
                setMandate(m);
                push(`mandate ${m.id} max $${m.maxUsd}`);
              }}
            >
              Issue mandate
            </button>
            {mandate && (
              <pre className="mt-2 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
                {JSON.stringify(mandate, null, 2)}
              </pre>
            )}
          </section>

          <UpsellRail skillId={skillId} />

          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">Event log</h2>
            <ul className="mt-2 max-h-80 space-y-1 overflow-auto font-mono text-[10px] text-muted">
              {log.map((l, i) => (
                <li key={i} className="border-b border-border/50 py-1">
                  {l}
                </li>
              ))}
              {log.length === 0 && <li>Run steps to populate…</li>}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
