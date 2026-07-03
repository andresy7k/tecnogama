'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

const gradients: Record<string, string> = {
  indigo: 'from-brand-indigo to-[#4f46e5]',
  amber: 'from-brand-amber to-[#ea8204]',
  emerald: 'from-brand-emerald to-[#059669]',
  violet: 'from-brand-violet to-[#7c3aed]',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  index,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: LucideIcon
  color: keyof typeof gradients
  index: number
  active?: boolean
  onClick?: () => void
}) {
  const count = useCountUp(value)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[color]} p-5 text-left shadow-lg transition-all ${active ? 'ring-2 ring-white ring-offset-2' : ''}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">{count}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/20">
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </motion.button>
  )
}
