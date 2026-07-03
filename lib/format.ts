import type { Abono, EstadoOrden, EstadoPago, Orden, Prioridad } from './types'

export function formatPeso(value: string | number): string {
  const num =
    typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(num) || num === 0) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatFecha(d: Date = new Date()): string {
  return d.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function genId(ordenes: Orden[]): string {
  // Find the highest existing OT number to avoid collisions
  let max = 0
  for (const o of ordenes) {
    const m = /OT-(\d+)/.exec(o.id)
    if (m) max = Math.max(max, Number(m[1]))
  }
  const n = (max + 1).toString().padStart(5, '0')
  return `OT-${n}`
}

export const estadoStyles: Record<EstadoOrden, string> = {
  Recibido: 'bg-brand-indigo/10 text-brand-indigo',
  Reparando: 'bg-brand-violet/12 text-brand-violet',
  Listo: 'bg-brand-emerald/12 text-emerald-700',
  Entregado: 'bg-muted text-muted-foreground',
}

export const prioridadStyles: Record<Prioridad, string> = {
  Normal: 'bg-muted text-muted-foreground',
  Alta: 'bg-brand-amber/15 text-amber-700',
  Urgente: 'bg-brand-danger/12 text-red-600',
}

export function parseNum(value: string | number): number {
  const num =
    typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(num) ? num : 0
}

export function calcTotalAbonos(abonos: Abono[]): number {
  return abonos.reduce((sum, a) => sum + a.monto, 0)
}

export function calcEstadoPago(repCosto: string, abonos: Abono[]): EstadoPago {
  const total = parseNum(repCosto)
  const abonado = calcTotalAbonos(abonos)
  if (total <= 0 || abonado <= 0) return 'No pagado'
  if (abonado >= total) return 'Pagado'
  return 'Pago parcial'
}

export function calcRestante(repCosto: string, abonos: Abono[]): number {
  const total = parseNum(repCosto)
  const abonado = calcTotalAbonos(abonos)
  const restante = total - abonado
  return restante > 0 ? restante : 0
}

export const estadoPagoStyles: Record<EstadoPago, string> = {
  'No pagado': 'bg-red-100 text-red-700',
  'Pago parcial': 'bg-brand-amber/15 text-amber-700',
  Pagado: 'bg-brand-emerald/12 text-emerald-700',
}
