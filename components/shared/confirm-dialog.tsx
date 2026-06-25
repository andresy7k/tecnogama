'use client'

import { AlertTriangle } from 'lucide-react'
import { Modal } from './modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="max-w-md" hideClose>
      <div className="p-6">
        <div className="flex gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
              destructive
                ? 'bg-brand-danger/12 text-brand-danger'
                : 'bg-brand-amber/15 text-brand-amber'
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-card-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-[1.02] ${
              destructive ? 'bg-brand-danger' : 'bg-brand-indigo'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
