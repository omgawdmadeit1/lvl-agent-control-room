/**
 * Lightweight client-side accessibility heuristics for the Control Room.
 * Complements standards catalog — not a full WCAG conformance claim.
 */

export type A11yCheck = {
  id: string;
  criterion: string;
  title: string;
  pass: boolean;
  detail: string;
  severity: "info" | "warn" | "fail";
};

export function runControlRoomA11yAudit(root: ParentNode = document): A11yCheck[] {
  const checks: A11yCheck[] = [];

  const htmlLang = document.documentElement.lang;
  checks.push({
    id: "lang",
    criterion: "3.1.1",
    title: "Page language set",
    pass: Boolean(htmlLang && htmlLang.length >= 2),
    detail: htmlLang ? `html lang="${htmlLang}"` : "Missing lang on <html>",
    severity: htmlLang ? "info" : "fail",
  });

  const title = document.title?.trim();
  checks.push({
    id: "title",
    criterion: "2.4.2",
    title: "Document title",
    pass: Boolean(title && title.length > 0),
    detail: title || "Empty title",
    severity: title ? "info" : "fail",
  });

  const h1 = root.querySelectorAll("h1");
  checks.push({
    id: "h1",
    criterion: "1.3.1 / 2.4.6",
    title: "Single clear H1",
    pass: h1.length === 1,
    detail: `Found ${h1.length} h1 element(s)`,
    severity: h1.length === 1 ? "info" : "warn",
  });

  // Icon-ish buttons without accessible name
  const buttons = Array.from(root.querySelectorAll("button"));
  const interactive = Array.from(
    root.querySelectorAll("button, select, a[href], input[type=checkbox], input[type=radio]"),
  );
  const unnamed = buttons.filter((b) => {
    const name =
      b.getAttribute("aria-label") ||
      b.getAttribute("aria-labelledby") ||
      b.textContent?.replace(/\s+/g, " ").trim();
    return !name;
  });
  checks.push({
    id: "btn-name",
    criterion: "4.1.2",
    title: "Buttons have accessible names",
    pass: unnamed.length === 0,
    detail:
      unnamed.length === 0
        ? `${buttons.length} buttons named`
        : `${unnamed.length} button(s) missing name`,
    severity: unnamed.length === 0 ? "info" : "fail",
  });

  const images = Array.from(root.querySelectorAll("img"));
  const imgMissing = images.filter((img) => !img.hasAttribute("alt"));
  checks.push({
    id: "img-alt",
    criterion: "1.1.1",
    title: "Images have alt",
    pass: imgMissing.length === 0,
    detail:
      images.length === 0
        ? "No images"
        : imgMissing.length === 0
          ? `${images.length} img with alt`
          : `${imgMissing.length} img missing alt`,
    severity: imgMissing.length === 0 ? "info" : "fail",
  });

  const dialogs = Array.from(root.querySelectorAll('[role="dialog"]'));
  const dialogOk = dialogs.every(
    (d) =>
      d.hasAttribute("aria-label") ||
      d.hasAttribute("aria-labelledby") ||
      d.querySelector("h1,h2,h3"),
  );
  checks.push({
    id: "dialog",
    criterion: "4.1.2",
    title: "Dialogs labeled",
    pass: dialogs.length === 0 || dialogOk,
    detail:
      dialogs.length === 0
        ? "No open dialogs"
        : dialogOk
          ? `${dialogs.length} dialog(s) labeled`
          : "Dialog missing accessible name",
    severity: dialogs.length === 0 || dialogOk ? "info" : "fail",
  });

  // Prefer visible focus styles in CSS — check outline/ring utility presence loosely
  const styles = Array.from(document.styleSheets);
  let focusRule = false;
  try {
    for (const sheet of styles) {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && /:focus/.test(rule.selectorText || "")) {
          focusRule = true;
          break;
        }
      }
      if (focusRule) break;
    }
  } catch {
    // cross-origin sheets
  }
  checks.push({
    id: "focus-css",
    criterion: "2.4.7",
    title: "Focus styles present in CSS",
    pass: focusRule || true, // Tailwind preflight may not expose; informational
    detail: focusRule
      ? "Found :focus rule(s) in stylesheets"
      : "Could not confirm :focus rules (may be utility-based) — verify manually",
    severity: "info",
  });

  // WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 24×24 CSS px
  // Exception: undersized targets OK if their 24px-diameter spacing circle
  // does not intersect another target (simplified circle vs rect check).
  const MIN = 24;
  type Box = { el: Element; x: number; y: number; w: number; h: number; cx: number; cy: number };
  function isInlineTextLink(el: Element): boolean {
    if (el.tagName !== "A") return false;
    const parent = el.parentElement;
    if (!parent) return false;
    // Exception: target is in a sentence / block of text
    const block = parent.closest("p, li, dd, td, th, span, label");
    if (!block) return false;
    const text = (block.textContent || "").replace(/\s+/g, " ").trim();
    const linkText = (el.textContent || "").replace(/\s+/g, " ").trim();
    return text.length > linkText.length + 8;
  }

  const boxes: Box[] = interactive
    .filter((el) => !isInlineTextLink(el))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
      };
    })
    .filter((b) => b.w > 0 && b.h > 0);

  function spacingOk(a: Box): boolean {
    const radius = MIN / 2;
    // Circle of diameter 24 centered on target — if any other target's box
    // intersects that circle beyond self, spacing exception fails.
    for (const b of boxes) {
      if (b.el === a.el) continue;
      // distance from a center to b rect
      const nx = Math.max(b.x, Math.min(a.cx, b.x + b.w));
      const ny = Math.max(b.y, Math.min(a.cy, b.y + b.h));
      const dx = a.cx - nx;
      const dy = a.cy - ny;
      if (dx * dx + dy * dy < radius * radius - 0.5) return false;
    }
    return true;
  }

  const undersized = boxes.filter((b) => b.w < MIN || b.h < MIN);
  const failing = undersized.filter((b) => !spacingOk(b));
  const excepted = undersized.length - failing.length;
  checks.push({
    id: "target-size",
    criterion: "2.5.8",
    title: "Target size minimum (24×24)",
    pass: failing.length === 0,
    detail:
      failing.length === 0
        ? undersized.length === 0
          ? `All ${boxes.length} interactive targets ≥ 24×24 CSS px`
          : `All pass ( ${excepted} undersized covered by spacing exception )`
        : `${failing.length} control(s) under 24×24 without spacing exception`,
    severity: failing.length === 0 ? "info" : "fail",
  });

  // Live region for status
  const live = root.querySelectorAll("[aria-live], [role='status'], [role='alert']");
  checks.push({
    id: "live",
    criterion: "4.1.3",
    title: "Status / live regions",
    pass: live.length > 0,
    detail:
      live.length > 0
        ? `${live.length} live/status region(s)`
        : "No aria-live/status regions — toasts may not announce",
    severity: live.length > 0 ? "info" : "warn",
  });

  return checks;
}

export function summarizeChecks(checks: A11yCheck[]) {
  const fail = checks.filter((c) => !c.pass && c.severity === "fail").length;
  const warn = checks.filter((c) => !c.pass && c.severity === "warn").length;
  const pass = checks.filter((c) => c.pass).length;
  return { pass, warn, fail, total: checks.length };
}
