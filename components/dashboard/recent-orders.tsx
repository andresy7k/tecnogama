'use client'

import { motion } from 'motion/react'
import { Inbox, Eye, PlusCircle } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import type { EstadoOrden, Orden } from '@/lib/types'

export function RecentOrders({
  ordenes,
  filterStatus,
  onVer,
  onNueva,
}: {
  ordenes: Orden[]
  filterStatus?: EstadoOrden | null
  onVer: (o: Orden) => void
  onNueva: () => void
}) {
  const filtered = filterStatus
    ? ordenes.filter((o) => o.servicio.estado === filterStatus)
    : ordenes
  const recent = filtered.slice(0, 5)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight text-card-foreground">
          Órdenes recientes
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {filterStatus ? `${filterStatus} · ` : ''}Últimas {recent.length}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Inbox className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-card-foreground">No hay órdenes aún</p>
            <p className="text-sm text-muted-foreground">
              Registra tu primera orden de reparación.
            </p>
          </div>
          <button
            onClick={onNueva}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
          >
            <PlusCircle className="size-4" />
            Nueva orden
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {recent.map((o, i) => (
            <motion.li
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/50"
            >
              <span className="font-mono text-xs font-semibold text-brand-indigo">
                {o.id}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-card-foreground">
                  {o.cliente.nombre}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.equipo.marca} {o.equipo.modelo} — {o.falla.desc}
                </p>
              </div>
              <StatusBadge estado={o.servicio.estado} />
              <button
                onClick={() => onVer(o)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Eye className="size-3.5" />
                Ver
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}
