import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LVL Agent Control Room" },
      {
        name: "description",
        content:
          "Live hub-spoke multi-agent system for lvlltd.com — focus-four board with TanStack Router",
      },
      { name: "theme-color", content: "#0a0a0b" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <Outlet />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-elevated border border-border text-fg",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-danger">Route error</p>
      <h1 className="text-2xl font-semibold">Something failed in this route</h1>
      <p className="text-sm text-muted">{error.message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
        >
          Retry
        </button>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
        >
          Overview
        </Link>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">404</p>
      <h1 className="text-2xl font-semibold">Route not found</h1>
      <p className="text-sm text-muted">
        That path is not in the TanStack Router tree. Head back to the Control Room or open the
        Router lab.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-accent px-4 text-sm font-semibold text-accent-fg"
        >
          Overview
        </Link>
        <Link
          to="/lab/router"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
        >
          Router lab
        </Link>
      </div>
    </main>
  );
}
