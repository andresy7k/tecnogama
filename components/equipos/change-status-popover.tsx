'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { estadoStyles } from '@/lib/format'
import { ESTADOS, type EstadoOrden } from '@/lib/types'

export function ChangeStatusPopover({
  current,
  onSelect,
  onClose,
}: {
  current: EstadoOrden
  onSelect: (e: EstadoOrden) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl"
    >
      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Cambiar estado
      </p>
      {ESTADOS.map((e) => (
        <button
          key={e}
          onClick={() => {
            onSelect(e)
            onClose()
          }}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
        >
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${estadoStyles[e]}`}
          >
            {e}
          </span>
          {current === e && <Check className="size-3.5 text-brand-indigo" />}
        </button>
      ))}
    </motion.div>
  )
}
