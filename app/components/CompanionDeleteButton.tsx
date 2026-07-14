'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmDeleteDialog from '@/app/components/ConfirmDeleteDialog';
import { deleteCompanion } from '@/app/libs/actions/companions';
import { toast } from '@/app/components/toast';


type CompanionDeleteButtonProps = {
  companionId: string;
  ownerId: string;
  currentUserId: string;
  onDeleted?: () => void;
  className?: string;
};


export default function CompanionDeleteButton({
  companionId,
  ownerId,
  currentUserId,
  onDeleted,
  className,
}: CompanionDeleteButtonProps) {

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticDeleting, setOptimisticDeleting] = useOptimistic(false);

  const isOwner = currentUserId === ownerId;
  if (!isOwner) return null;


  const onConfirm = () => {
    if (optimisticDeleting) return;

    setOpen(false);
    setOptimisticDeleting(true);

    startTransition(async () => {
      try {
        await deleteCompanion(companionId);

        toast.success('Companion deleted successfully.');

        onDeleted?.();

        // If user is currently viewing this companion, redirect to list.
        router.push('/companions');
        router.refresh();
      } catch (err) {
        setOptimisticDeleting(false);
        toast.error(err instanceof Error ? err.message : 'Failed to delete companion');
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending || optimisticDeleting}
        className={
          className ??
          'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60'
        }
      >
        <span className="inline-flex items-center gap-2">
          {optimisticDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span>{optimisticDeleting ? 'Deleting…' : 'Delete'}</span>
        </span>
      </button>

      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
        isConfirming={isPending || optimisticDeleting}
        title="Delete Companion?"
        confirmLabel="Delete Companion"
        cancelLabel="Cancel"
        description={
          <>
            This action cannot be undone.
            <br />
            Deleting this companion will permanently remove:
            <ul className="mt-2 list-disc pl-5">
              <li>Learning sessions</li>
              <li>Conversations</li>
              <li>Progress</li>
              <li>Uploaded resources</li>
              <li>Voice configuration</li>
            </ul>
          </>
        }
      />
    </>
  );
}

