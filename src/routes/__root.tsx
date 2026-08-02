import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
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
        content: "Live hub-spoke multi-agent system for lvlltd.com — focus-four action board",
      },
      { name: "theme-color", content: "#0a0a0b" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
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
