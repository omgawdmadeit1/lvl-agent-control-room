import { useEffect, useRef } from "react";
import { activateFocusTrap } from "@/lib/agent-system/focus-trap";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const handle = activateFocusTrap(rootRef.current, {
      initialFocus: cancelRef.current,
    });
    return () => handle.deactivate();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        aria-label="Cancel dialog"
        tabIndex={-1}
        onClick={onCancel}
      />
      <div
        ref={rootRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-base font-semibold">
          {title}
        </h2>
        <p id="confirm-body" className="mt-2 text-sm text-muted leading-relaxed">
          {body}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] border border-border bg-elevated px-4 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 min-target items-center rounded-[var(--radius-md)] bg-danger px-4 text-sm font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
