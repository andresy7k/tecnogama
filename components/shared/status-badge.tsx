import { estadoStyles, prioridadStyles, estadoPagoStyles } from '@/lib/format'
import type { EstadoOrden, EstadoPago, Prioridad } from '@/lib/types'

export function StatusBadge({ estado }: { estado: EstadoOrden }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoStyles[estado]}`}
    >
      {estado}
    </span>
  )
}

export function PriorityBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${prioridadStyles[prioridad]}`}
    >
      {prioridad}
    </span>
  )
}

export function PagoBadge({ estado }: { estado: EstadoPago }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoPagoStyles[estado]}`}
    >
      {estado}
    </span>
  )
}
