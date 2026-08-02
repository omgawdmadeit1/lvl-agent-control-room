/**
 * EIP-1193 browser wallet bridge (MetaMask, Rabby, Coinbase Wallet, etc.).
 * Works in the user's preview when an injected provider exists — no private keys in the sandbox.
 */

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
};

export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = "0x2105";
export const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const LVL_PAY_TO = "0xa00876513bAA433ce2B58A5341Fd06d2b6f9A6ED";

export function getEthereum(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  return eth || null;
}

export function hasInjectedWallet() {
  return !!getEthereum();
}

export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
}> {
  const eth = getEthereum();
  if (!eth) throw new Error("No injected wallet (install MetaMask or similar)");
  const accounts = (await eth.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.[0]) throw new Error("No account returned");
  const chainHex = (await eth.request({ method: "eth_chainId" })) as string;
  return {
    address: accounts[0],
    chainId: parseInt(chainHex, 16),
  };
}

export async function switchToBase(): Promise<void> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet");
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_HEX }],
    });
  } catch (e) {
    const err = e as { code?: number };
    if (err.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BASE_CHAIN_HEX,
            chainName: "Base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}

/** EIP-191 personal_sign */
export async function personalSign(
  message: string,
  address: string,
): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet");
  const hex =
    "0x" +
    Array.from(new TextEncoder().encode(message))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const sig = (await eth.request({
    method: "personal_sign",
    params: [hex, address],
  })) as string;
  return sig;
}

function padAddress(addr: string) {
  return addr.replace(/^0x/i, "").toLowerCase().padStart(64, "0");
}

function padUint(amountAtomic: string | bigint) {
  const n = typeof amountAtomic === "bigint" ? amountAtomic : BigInt(amountAtomic);
  return n.toString(16).padStart(64, "0");
}

/** ERC-20 transfer(to, amount) */
export function encodeUsdcTransfer(to: string, amountAtomic: string) {
  const selector = "a9059cbb";
  return "0x" + selector + padAddress(to) + padUint(amountAtomic);
}

export async function sendUsdcTransfer(opts: {
  from: string;
  to: string;
  amountAtomic: string;
  usdc?: string;
}): Promise<string> {
  const eth = getEthereum();
  if (!eth) throw new Error("No wallet");
  await switchToBase();
  const data = encodeUsdcTransfer(opts.to, opts.amountAtomic);
  const txHash = (await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: opts.from,
        to: opts.usdc || USDC_BASE,
        data,
        value: "0x0",
      },
    ],
  })) as string;
  return txHash;
}

export async function waitForTx(
  txHash: string,
  timeoutMs = 120_000,
): Promise<{ status: "success" | "fail" | "timeout"; receipt?: unknown }> {
  const eth = getEthereum();
  if (!eth) return { status: "timeout" };
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const receipt = await eth.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });
    if (receipt && typeof receipt === "object") {
      const status = (receipt as { status?: string }).status;
      if (status === "0x1" || status === "0x01") return { status: "success", receipt };
      if (status === "0x0") return { status: "fail", receipt };
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return { status: "timeout" };
}

/** Local demo mandate (not accepted by LVL production — for Control Room gates only). */
export type LocalMandate = {
  kind: "local_demo";
  id: string;
  principal: string;
  agent: string;
  maxPerPurchaseUsd: number;
  periodLimitUsd: number;
  createdAt: string;
  note: string;
};

const LOCAL_KEY = "lvl-local-mandates-v1";

export function listLocalMandates(): LocalMandate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]") as LocalMandate[];
  } catch {
    return [];
  }
}

export function saveLocalMandate(m: LocalMandate) {
  const all = listLocalMandates().filter((x) => x.id !== m.id);
  all.unshift(m);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all.slice(0, 20)));
  return m;
}

export function issueLocalDemoMandate(input: {
  principal: string;
  agent: string;
  maxPerPurchaseUsd: number;
  periodLimitUsd: number;
}): LocalMandate {
  return saveLocalMandate({
    kind: "local_demo",
    id: `local_${Date.now().toString(36)}`,
    principal: input.principal,
    agent: input.agent,
    maxPerPurchaseUsd: input.maxPerPurchaseUsd,
    periodLimitUsd: input.periodLimitUsd,
    createdAt: new Date().toISOString(),
    note: "Control Room only — not registered on lvlltd.com until personal_sign + POST signature",
  });
}
