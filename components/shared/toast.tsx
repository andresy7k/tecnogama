'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (opts: { message: string; type?: ToastType }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION = 3500

const config: Record<
  ToastType,
  { icon: typeof CheckCircle2; bar: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-brand-emerald',
    iconColor: 'text-brand-emerald',
  },
  error: { icon: XCircle, bar: 'bg-brand-danger', iconColor: 'text-brand-danger' },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-brand-amber',
    iconColor: 'text-brand-amber',
  },
  info: { icon: Info, bar: 'bg-brand-indigo', iconColor: 'text-brand-indigo' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, type = 'info' }: { message: string; type?: ToastType }) => {
      const id = ++counter.current
      setToasts((t) => [...t.slice(-2), { id, message, type }])
      setTimeout(() => remove(id), DURATION)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        aria-live="polite"
        role="status"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const c = config[t.type]
            const Icon = c.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              >
                <div className="flex items-start gap-3 p-4">
                  <Icon className={`mt-0.5 size-5 shrink-0 ${c.iconColor}`} />
                  <p className="flex-1 text-sm font-medium text-card-foreground">
                    {t.message}
                  </p>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Cerrar notificación"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${c.bar}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: DURATION / 1000, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
