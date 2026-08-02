/**
 * Lightweight focus trap + focus restore for modal drawers/dialogs.
 * WCAG 2.1.2 No Keyboard Trap — Esc / close still dismisses (trap is while open only).
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && isVisible(el),
  );
}

function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

export type FocusTrapOptions = {
  /** Element that receives initial focus (defaults to first focusable / container) */
  initialFocus?: HTMLElement | null;
  /** Restore focus to this node on deactivate (defaults to document.activeElement at activate) */
  returnFocus?: HTMLElement | null;
};

export type FocusTrapHandle = {
  deactivate: () => void;
};

/**
 * Activate trap on `root`. Call `deactivate()` on unmount/close.
 */
export function activateFocusTrap(
  root: HTMLElement,
  options: FocusTrapOptions = {},
): FocusTrapHandle {
  const previouslyFocused =
    options.returnFocus ??
    (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  const focusInitial = () => {
    const target =
      options.initialFocus ??
      getFocusable(root)[0] ??
      root;
    // Prevent scroll jump on open
    target.focus({ preventScroll: true });
  };

  // Double rAF: ensure drawer is painted before focus moves
  let raf1 = 0;
  let raf2 = 0;
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(focusInitial);
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    const focusable = getFocusable(root);
    if (focusable.length === 0) {
      e.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Keep focus inside if something steals it to body
  function onFocusIn(e: FocusEvent) {
    const target = e.target as Node | null;
    if (target && root.contains(target)) return;
    const focusable = getFocusable(root);
    (focusable[0] ?? root).focus({ preventScroll: true });
  }

  root.addEventListener("keydown", onKeyDown);
  document.addEventListener("focusin", onFocusIn);

  return {
    deactivate() {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      root.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    },
  };
}
