'use client';

import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel
}) {
  // Do not render anything until a page asks the dialog to open.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md rounded-md border border-line bg-white p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-coral/10 text-coral">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn bg-coral text-white hover:bg-coral/90" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
