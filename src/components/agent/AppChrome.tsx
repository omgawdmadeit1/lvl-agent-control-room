import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const NAV = [
  { href: "#main-board", label: "Board" },
  { href: "#site-health", label: "Health" },
  { href: "#live-scout", label: "Scout" },
  { href: "#observability", label: "Observability" },
  { href: "#backpressure", label: "Backpressure" },
  { href: "#settings", label: "Settings" },
  { href: "#next-100", label: "Next 100" },
  { href: "/ops/board", label: "Ops board", route: true },
  { href: "/lab/router", label: "Router lab", route: true },
  { href: "/lab/loaders", label: "Loaders", route: true },
  { href: "/lab/interop", label: "Interop", route: true },
  { href: "/lab/settlement", label: "Settlement", route: true },
  { href: "/marketplace", label: "Marketplace", route: true },
  { href: "/skills", label: "Skill packs", route: true },
  { href: "https://lvlltd.com", label: "lvlltd.com", external: true },
  { href: "#drawer-code", label: "Drawer code" },
  { href: "#keyboard-shortcuts", label: "Shortcuts" },
  { href: "#a11y-standards", label: "A11y" },
  { href: "#wcag22-criteria", label: "WCAG 2.2" },
];

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:border focus:border-border focus:bg-accent focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-accent-fg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

export function QuickNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onHash() {
      setOpen(false);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <nav
      aria-label="On this page"
      className="border-b border-border bg-surface/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2">
        <button
          type="button"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-3 text-xs font-medium lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          On this page
        </button>
        <ul
          className={
            open
              ? "flex flex-col gap-1 py-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-1 lg:py-0"
              : "hidden lg:flex lg:flex-wrap lg:items-center lg:gap-1"
          }
        >
          {NAV.map((item) => (
            <li key={item.href}>
              {"route" in item && item.route ? (
                <Link
                  to={item.href as "/ops/board" | "/lab/router" | "/lab/loaders" | "/lab/interop" | "/lab/settlement" | "/marketplace" | "/skills"}
                  className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] px-3 text-xs font-medium text-muted transition hover:bg-elevated hover:text-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  {...("external" in item && item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] px-3 text-xs font-medium text-muted transition hover:bg-elevated hover:text-fg"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
