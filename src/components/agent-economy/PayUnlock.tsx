import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BASE_CHAIN_ID,
  LVL_PAY_TO,
  USDC_BASE,
  connectWallet,
  getEthereum,
  hasInjectedWallet,
  sendUsdcTransfer,
  switchToBase,
  waitForTx,
} from "@/lib/agent-economy/browser-wallet";
import { fetchChallenge } from "@/lib/agent-economy/checkout";
import { unlockWithPayment } from "@/lib/agent-economy/mandate-complete";
import { checkAllowance } from "@/lib/agent-economy/growth";
import { cn } from "@/components/ui/cn";

/**
 * End-to-end pay path using the USER's injected wallet in the browser preview.
 * Sandbox has no keys — but when the human opens preview with MetaMask, this unblocks real unlocks.
 */
export function PayUnlock({ initialSkill = "agent-x402-first-buy" }: { initialSkill?: string }) {
  const [skill, setSkill] = useState(initialSkill);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [injected, setInjected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [challenge, setChallenge] = useState<Awaited<
    ReturnType<typeof fetchChallenge>
  > | null>(null);
  const [txHash, setTxHash] = useState("");
  const [unlock, setUnlock] = useState<Record<string, unknown> | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const push = (m: string) =>
    setLog((prev) => [`${new Date().toISOString().slice(11, 19)}  ${m}`, ...prev].slice(0, 50));

  useEffect(() => {
    setInjected(hasInjectedWallet());
  }, []);

  async function connect() {
    setBusy(true);
    try {
      const w = await connectWallet();
      setAddress(w.address);
      setChainId(w.chainId);
      push(`connected ${w.address.slice(0, 10)}… chain ${w.chainId}`);
      if (w.chainId !== BASE_CHAIN_ID) {
        await switchToBase();
        setChainId(BASE_CHAIN_ID);
        push("switched to Base");
      }
      const a = await checkAllowance(w.address, skill);
      setBalance(a.balance_usd ?? null);
      push(`USDC balance ~$${a.balance_usd} (required $${a.required_usd})`);
    } catch (e) {
      push(`connect error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadChallenge() {
    setBusy(true);
    try {
      const c = await fetchChallenge(skill);
      setChallenge(c);
      push(`402 HTTP ${c.status} amount $${c.challenge.amountUsd} atomic ${c.challenge.maxAmountRequired}`);
    } finally {
      setBusy(false);
    }
  }

  async function payWithWallet() {
    if (!address || !challenge?.challenge.maxAmountRequired) {
      push("connect + load challenge first");
      return;
    }
    setBusy(true);
    try {
      const to = challenge.challenge.payTo || LVL_PAY_TO;
      const amount = challenge.challenge.maxAmountRequired;
      push(`sending ${amount} atomic USDC → ${to.slice(0, 12)}…`);
      const hash = await sendUsdcTransfer({
        from: address,
        to,
        amountAtomic: amount,
        usdc: USDC_BASE,
      });
      setTxHash(hash);
      push(`tx submitted ${hash}`);
      const wait = await waitForTx(hash);
      push(`receipt ${wait.status}`);
      if (wait.status === "success" || wait.status === "timeout") {
        // timeout: still try unlock — chain may confirm later
        const u = await unlockWithPayment(skill, hash);
        setUnlock(u.data || { status: u.status });
        push(`unlock HTTP ${u.status}`);
      }
    } catch (e) {
      push(`pay error: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function unlockOnly() {
    if (!txHash) return;
    setBusy(true);
    try {
      const u = await unlockWithPayment(skill, txHash);
      setUnlock(u.data || { status: u.status });
      push(`unlock HTTP ${u.status}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Wallet bridge · unblock real payments
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Pay & unlock</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Uses <strong className="text-fg">your</strong> browser wallet (MetaMask etc.) in this
          preview — not the sandbox. Connect → Base → USDC transfer → POST unlock. Smallest live
          canary is $0.05.
        </p>
        <p className="mt-2 text-xs">
          Injected provider:{" "}
          <span className={injected ? "text-ok" : "text-warn"}>
            {injected ? "detected" : "not found — install a wallet extension"}
          </span>
          {address && (
            <span className="ml-2 font-mono text-muted">
              {address.slice(0, 8)}…{address.slice(-6)} · chain {chainId}
            </span>
          )}
        </p>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 space-y-3">
        <label className="block text-xs">
          <span className="text-muted">Skill</span>
          <input
            className="mt-1 h-11 w-full max-w-md rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-sm"
            value={skill}
            onChange={(e) => setSkill(e.target.value.trim())}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !injected}
            onClick={() => void connect()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-xs font-semibold text-accent-fg disabled:opacity-50"
          >
            1. Connect wallet
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadChallenge()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-xs font-semibold disabled:opacity-50"
          >
            2. Load 402
          </button>
          <button
            type="button"
            disabled={busy || !address || !challenge}
            onClick={() => void payWithWallet()}
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-accent/40 bg-accent/10 px-4 text-xs font-semibold text-accent disabled:opacity-50"
          >
            3. Pay USDC + unlock
          </button>
        </div>
        {balance != null && (
          <p className="text-xs text-muted">
            Balance ${balance}
            {challenge?.challenge.amountUsd != null &&
              (balance >= (challenge.challenge.amountUsd || 0)
                ? " · enough for this skill"
                : " · fund USDC on Base to continue")}
          </p>
        )}
        {challenge && (
          <dl className="grid grid-cols-2 gap-2 text-xs max-w-lg">
            <div>
              <dt className="text-subtle">Amount</dt>
              <dd className="font-mono">${challenge.challenge.amountUsd}</dd>
            </div>
            <div>
              <dt className="text-subtle">Atomic</dt>
              <dd className="font-mono">{challenge.challenge.maxAmountRequired}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-subtle">payTo</dt>
              <dd className="truncate font-mono text-muted">{challenge.challenge.payTo}</dd>
            </div>
          </dl>
        )}
        <label className="block text-xs max-w-xl">
          <span className="text-muted">txHash (auto-filled after pay, or paste)</span>
          <input
            className="mt-1 h-11 w-full rounded-[var(--radius-md)] border border-border bg-elevated px-3 font-mono text-xs"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value.trim())}
          />
        </label>
        <button
          type="button"
          disabled={busy || !txHash}
          onClick={() => void unlockOnly()}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-3 text-xs disabled:opacity-50"
        >
          Unlock only (existing tx)
        </button>
        {unlock && (
          <pre className="max-h-48 overflow-auto rounded bg-elevated p-2 font-mono text-[10px] text-muted">
            {JSON.stringify(unlock, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold">Log</h2>
        <ul className="mt-2 max-h-64 space-y-1 overflow-auto font-mono text-[10px] text-muted">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
          {!log.length && <li>Connect a browser wallet to begin…</li>}
        </ul>
      </section>

      {!injected && (
        <div className={cn("rounded-[var(--radius-lg)] border border-warn/40 bg-warn/10 p-4 text-xs")}>
          <p className="font-semibold text-warn">No wallet in this browser session</p>
          <p className="mt-1 text-muted leading-relaxed">
            Open this Control Room in a browser with MetaMask (or another EIP-1193 wallet), switch to
            Base, hold ≥$0.05 USDC, then use Pay & unlock. The agent sandbox cannot hold keys by
            design — the workaround is <em>your</em> wallet in the preview.
          </p>
          <Link to="/marketplace/checkout" className="mt-2 inline-flex text-accent hover:underline">
            Or use checkout without wallet (manual txHash)
          </Link>
        </div>
      )}
    </div>
  );
}
