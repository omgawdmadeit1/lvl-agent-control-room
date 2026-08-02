import { Link, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ops/")({
  beforeLoad: () => {
    throw redirect({ to: "/ops/board" });
  },
  component: () => (
    <p className="text-sm text-muted">
      Redirecting to <Link to="/ops/board">board</Link>…
    </p>
  ),
});
