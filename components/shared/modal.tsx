'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  /** max width tailwind class, e.g. max-w-2xl */
  size?: string
  hideClose?: boolean
}

export function Modal({
  open,
  onClose,
  children,
  title,
  size = 'max-w-2xl',
  hideClose,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`relative z-10 flex max-h-[92vh] w-full ${size} flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl outline-none sm:rounded-2xl`}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-lg font-bold tracking-tight text-card-foreground">
                  {title}
                </h2>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </div>
            )}
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
