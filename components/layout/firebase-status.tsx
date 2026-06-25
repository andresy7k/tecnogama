'use client'

import type { ConnStatus } from '@/hooks/use-ordenes'

const map: Record<ConnStatus, { label: string; dot: string; glow: boolean }> = {
  online: { label: 'En línea', dot: 'bg-brand-emerald', glow: true },
  connecting: { label: 'Conectando', dot: 'bg-brand-amber', glow: false },
  offline: { label: 'Sin conexión', dot: 'bg-brand-danger', glow: false },
}

export function FirebaseStatus({ status }: { status: ConnStatus }) {
  const s = map[status]
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
      aria-label="Estado de conexión con Firebase"
      role="status"
    >
      <span className="relative flex size-2.5">
        {s.glow && (
          <span
            className={`absolute inline-flex size-2.5 rounded-full ${s.dot} opacity-75 tf-glow`}
          />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${s.dot}`} />
      </span>
      <span className="hidden text-xs font-medium text-white/80 sm:inline">
        {s.label}
      </span>
    </div>
  )
}
