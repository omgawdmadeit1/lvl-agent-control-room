/**
 * Accessibility compliance standards — reference catalog for product & audit work.
 * Not legal advice; maps common frameworks teams actually ship against.
 */

export type StandardId =
  | "wcag22"
  | "wcag21"
  | "section508"
  | "en301549"
  | "ada"
  | "euaa"
  | "aria"
  | "atag"
  | "uaag";

export type Standard = {
  id: StandardId;
  name: string;
  fullName: string;
  body: string;
  year: string;
  summary: string;
  appliesTo: string;
  levels?: string;
  relation: string;
  url: string;
};

export const A11Y_STANDARDS: Standard[] = [
  {
    id: "wcag22",
    name: "WCAG 2.2",
    fullName: "Web Content Accessibility Guidelines 2.2",
    body: "W3C WAI",
    year: "2023",
    summary:
      "Primary technical standard for web content. Four principles: Perceivable, Operable, Understandable, Robust (POUR). Success criteria at A / AA / AAA.",
    appliesTo: "Websites, web apps, many mobile web views",
    levels: "A (minimum) · AA (common legal target) · AAA (enhanced)",
    relation: "Basis for Section 508, EN 301 549, and most org policies",
    url: "https://www.w3.org/TR/WCAG22/",
  },
  {
    id: "wcag21",
    name: "WCAG 2.1",
    fullName: "Web Content Accessibility Guidelines 2.1",
    body: "W3C WAI",
    year: "2018",
    summary:
      "Still widely cited in contracts and regulations. WCAG 2.2 is backward-compatible; 2.2 adds criteria (e.g. focus appearance, target size, dragging).",
    appliesTo: "Same as 2.2; older RFPs may still say 2.1 AA",
    levels: "A / AA / AAA",
    relation: "Superseded for new work by 2.2; still valid conformance target",
    url: "https://www.w3.org/TR/WCAG21/",
  },
  {
    id: "section508",
    name: "Section 508",
    fullName: "Section 508 of the Rehabilitation Act (Revised)",
    body: "US federal",
    year: "2017 refresh",
    summary:
      "US federal ICT accessibility law. Revised standards incorporate WCAG 2.0 Level AA by reference for web content.",
    appliesTo: "Federal agencies and many vendors selling ICT to them",
    levels: "Aligned to WCAG 2.0 AA (web)",
    relation: "Use WCAG 2.x AA practices; document VPAT/ACR for procurement",
    url: "https://www.section508.gov/",
  },
  {
    id: "en301549",
    name: "EN 301 549",
    fullName: "EN 301 549 — Accessibility requirements for ICT",
    body: "CEN/CENELEC/ETSI (EU)",
    year: "Ongoing revisions",
    summary:
      "European ICT accessibility standard. Web clauses map to WCAG. Used with the European Accessibility Act and public procurement.",
    appliesTo: "ICT products/services in EU public sector and EAA scope",
    levels: "WCAG-aligned (version depends on EN edition)",
    relation: "Pair with EAA timelines for commercial services in scope",
    url: "https://www.etsi.org/human-factors-accessibility",
  },
  {
    id: "ada",
    name: "ADA",
    fullName: "Americans with Disabilities Act",
    body: "US civil rights law",
    year: "1990+ (case law evolving)",
    summary:
      "Prohibits discrimination; Title II (public entities) and Title III (public accommodations) drive many web lawsuits. DOJ has pointed to WCAG 2.1 AA as a standard for state/local web (Title II rule).",
    appliesTo: "Public entities, many businesses open to the public",
    levels: "Often WCAG 2.1 AA in practice / Title II rule",
    relation: "Legal obligation; WCAG is the technical yardstick courts/DOJ use",
    url: "https://www.ada.gov/",
  },
  {
    id: "euaa",
    name: "European Accessibility Act",
    fullName: "Directive (EU) 2019/882 — European Accessibility Act",
    body: "EU",
    year: "Apply from 2025 (phased)",
    summary:
      "Requires accessibility of certain products and services (e.g. e-commerce, banking, e-books, some digital services). Harmonized standards (often EN 301 549 / WCAG) define presumption of conformity.",
    appliesTo: "In-scope products/services offered in the EU",
    relation: "Business compliance program + EN 301 549 / WCAG evidence",
    url: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act_en",
  },
  {
    id: "aria",
    name: "WAI-ARIA",
    fullName: "Accessible Rich Internet Applications",
    body: "W3C WAI",
    year: "1.2 current",
    summary:
      "Roles, states, properties for dynamic UI when native HTML is not enough. Rule of thumb: prefer native elements; ARIA is a patch, not a default.",
    appliesTo: "SPAs, custom widgets, dialogs, live regions, tabs, trees",
    relation: "Supports WCAG Robust + Operable (name, role, value)",
    url: "https://www.w3.org/TR/wai-aria-1.2/",
  },
  {
    id: "atag",
    name: "ATAG 2.0",
    fullName: "Authoring Tool Accessibility Guidelines",
    body: "W3C WAI",
    year: "2015",
    summary:
      "For tools that create content (CMS, design tools, AI builders): UI of the tool must be accessible AND output should help produce accessible content.",
    appliesTo: "Editors, CMS, no-code builders, agent UIs that emit HTML",
    relation: "Complements WCAG for authoring products",
    url: "https://www.w3.org/TR/ATAG20/",
  },
  {
    id: "uaag",
    name: "UAAG 2.0",
    fullName: "User Agent Accessibility Guidelines",
    body: "W3C WAI",
    year: "2015",
    summary:
      "For browsers, media players, and other user agents. Less often owned by app teams; relevant if you ship a custom WebView shell.",
    appliesTo: "Browsers, players, custom agents rendering content",
    relation: "Complements WCAG (content) with user-agent duties",
    url: "https://www.w3.org/TR/UAAG20/",
  },
];

/** WCAG 2.2 POUR principles + sample AA criteria relevant to this Control Room */
export type WcagCriterion = {
  id: string;
  name: string;
  level: "A" | "AA" | "AAA";
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust";
  controlRoomNote: string;
};

export const WCAG_FOCUS_CRITERIA: WcagCriterion[] = [
  {
    id: "1.1.1",
    name: "Non-text Content",
    level: "A",
    principle: "Perceivable",
    controlRoomNote: "Icon-only buttons need accessible names (aria-label).",
  },
  {
    id: "1.3.1",
    name: "Info and Relationships",
    level: "A",
    principle: "Perceivable",
    controlRoomNote: "Use headings, lists, and dialog roles — not style alone.",
  },
  {
    id: "1.4.3",
    name: "Contrast (Minimum)",
    level: "AA",
    principle: "Perceivable",
    controlRoomNote: "Body text ≥ 4.5:1; large text ≥ 3:1 against surfaces.",
  },
  {
    id: "1.4.11",
    name: "Non-text Contrast",
    level: "AA",
    principle: "Perceivable",
    controlRoomNote: "Borders/icons that convey state need ~3:1 contrast.",
  },
  {
    id: "2.1.1",
    name: "Keyboard",
    level: "A",
    principle: "Operable",
    controlRoomNote: "All actions reachable via keyboard shortcuts + tab order.",
  },
  {
    id: "2.1.2",
    name: "No Keyboard Trap",
    level: "A",
    principle: "Operable",
    controlRoomNote: "Dialogs must close with Esc and return focus.",
  },
  {
    id: "2.4.3",
    name: "Focus Order",
    level: "A",
    principle: "Operable",
    controlRoomNote: "Tab order follows visual reading order in panels.",
  },
  {
    id: "2.4.7",
    name: "Focus Visible",
    level: "AA",
    principle: "Operable",
    controlRoomNote: "Focus ring on controls; don’t remove outline without replacement.",
  },
  {
    id: "2.5.5",
    name: "Target Size (Enhanced)",
    level: "AAA",
    principle: "Operable",
    controlRoomNote: "Aim for ≥ 44×44px hit targets (we use h-11 ≈ 44px).",
  },
  {
    id: "2.5.8",
    name: "Target Size (Minimum)",
    level: "AA",
    principle: "Operable",
    controlRoomNote: "WCAG 2.2 AA: ≥ 24×24px CSS pixels (with exceptions).",
  },
  {
    id: "3.2.2",
    name: "On Input",
    level: "A",
    principle: "Understandable",
    controlRoomNote: "Changing filters shouldn’t yank focus unexpectedly.",
  },
  {
    id: "3.3.2",
    name: "Labels or Instructions",
    level: "A",
    principle: "Understandable",
    controlRoomNote: "Settings number fields and selects need visible labels.",
  },
  {
    id: "4.1.2",
    name: "Name, Role, Value",
    level: "A",
    principle: "Robust",
    controlRoomNote: "role=dialog, aria-modal, button names for overlays.",
  },
  {
    id: "4.1.3",
    name: "Status Messages",
    level: "AA",
    principle: "Robust",
    controlRoomNote: "Toasts/live scout results should be announced (aria-live).",
  },
];

export const COMPLIANCE_STACK = [
  {
    layer: "Law / policy",
    items: ["ADA (US)", "Section 508 (US federal ICT)", "European Accessibility Act", "Org policy / contracts"],
  },
  {
    layer: "Technical standard",
    items: ["WCAG 2.2 AA (preferred target)", "EN 301 549 (EU ICT)", "WCAG 2.1 AA (legacy RFP)"],
  },
  {
    layer: "Implementation",
    items: ["Semantic HTML", "WAI-ARIA when needed", "Keyboard & focus", "Contrast tokens", "Labels"],
  },
  {
    layer: "Evidence",
    items: ["Automated scans", "Manual keyboard/SR testing", "VPAT / ACR", "Issue tracker + retest"],
  },
];
