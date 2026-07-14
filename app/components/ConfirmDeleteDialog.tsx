'use client';


import { useEffect } from 'react';

import { Loader2, Trash2 } from 'lucide-react';


type ConfirmDeleteDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  isConfirming?: boolean;
};

export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onOpenChange,
  onConfirm,
  isConfirming = false,
}: ConfirmDeleteDialogProps) {
  useEffect(() => {

    // Avoid calling setState in an effect.

    // For this dialog, SSR is safe; mounting guard is no longer necessary.
    // Keeping it as a no-op ensures consistent behavior.
  }, []);

  if (!open) return null;


  const handleCancel = () => {
    if (isConfirming) return;
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            {description ? (
              <div className="mt-2 text-sm text-neutral-600">{description}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isConfirming}
            className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isConfirming}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

