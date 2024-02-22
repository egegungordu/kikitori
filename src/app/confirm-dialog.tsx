"use client";

import * as Dialog from "@radix-ui/react-dialog";

export default function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  children,
}: {
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 animate-opacity-in" />
        <Dialog.Content className="bg-neutral-900 rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-md animate-opacity-in p-4">
          <Dialog.Title className="mb-4">{title}</Dialog.Title>

          <Dialog.Description className="text-neutral-400 text-xs max-w-64">
            {description}
          </Dialog.Description>

          <div className="flex gap-2 justify-end mt-4">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="text-xs text-neutral-300 hover:bg-neutral-800 px-3 py-2 rounded-full"
              >
                Cancel
              </button>
            </Dialog.Close>

            <Dialog.Close asChild>
              <button
                onClick={onConfirm}
                className="text-xs bg-neutral-200 text-neutral-800 px-3 py-2 rounded-full hover:bg-neutral-300"
              >
                Confirm
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
