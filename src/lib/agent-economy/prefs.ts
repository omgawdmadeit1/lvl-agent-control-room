const KEY = "lvl-marketplace-prefs-v1";

export type MarketPrefs = {
  lastSkill?: string;
  cartSkills?: string;
  wallet?: string;
  budgetUsd?: number;
};

export function loadMarketPrefs(): MarketPrefs {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as MarketPrefs;
  } catch {
    return {};
  }
}

export function saveMarketPrefs(patch: MarketPrefs) {
  if (typeof window === "undefined") return;
  const next = { ...loadMarketPrefs(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
