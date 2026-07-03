'use client'

import { motion } from 'motion/react'
import {
  ClipboardList,
  Wrench,
  PackageCheck,
  CheckCheck,
  PlusCircle,
  CalendarDays,
  CalendarRange,
  Wallet,
} from 'lucide-react'
import { StatCard } from './stat-card'
import { RecentOrders } from './recent-orders'
import { formatPeso, parseNum } from '@/lib/format'
import type { Orden } from '@/lib/types'

function isToday(iso: string) {
  const d = new Date(iso)
  const n = new Date()
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  )
}

function isThisWeek(iso: string) {
  const d = new Date(iso).getTime()
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return d >= weekAgo
}

export function DashboardView({
  ordenes,
  onVer,
  onNueva,
}: {
  ordenes: Orden[]
  onVer: (o: Orden) => void
  onNueva: () => void
}) {
  const total = ordenes.length
  const enReparacion = ordenes.filter(
    (o) => o.servicio.estado === 'Reparando' || o.servicio.estado === 'Diagnóstico',
  ).length
  const listos = ordenes.filter((o) => o.servicio.estado === 'Listo').length
  const entregados = ordenes.filter((o) => o.servicio.estado === 'Entregado').length

  const hoy = ordenes.filter((o) => isToday(o.fechaISO)).length
  const semana = ordenes.filter((o) => isThisWeek(o.fechaISO)).length
  const pendientesPago = ordenes.filter(
    (o) =>
      o.servicio.estado !== 'Entregado' &&
      parseNum(o.servicio.repCosto) > 0 &&
      parseNum(o.servicio.abonoInicial) < parseNum(o.servicio.repCosto),
  )
  const totalPendiente = pendientesPago.reduce(
    (sum, o) => sum + (parseNum(o.servicio.repCosto) - parseNum(o.servicio.abonoInicial)),
    0,
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Resumen del taller
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Vista general de tus órdenes de reparación.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total órdenes" value={total} icon={ClipboardList} color="indigo" index={0} />
        <StatCard label="En reparación" value={enReparacion} icon={Wrench} color="amber" index={1} />
        <StatCard label="Listos para entregar" value={listos} icon={PackageCheck} color="emerald" index={2} />
        <StatCard label="Entregados" value={entregados} icon={CheckCheck} color="violet" index={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders ordenes={ordenes} onVer={onVer} onNueva={onNueva} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold tracking-tight text-card-foreground">
              Acciones rápidas
            </h2>
            <button
              onClick={onNueva}
              className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-violet p-4 text-left text-white shadow-md transition-transform hover:scale-[1.01]"
            >
              <PlusCircle className="size-6" />
              <div>
                <p className="text-sm font-bold">Registrar nueva orden</p>
                <p className="text-xs text-white/70">Crear tiquete de servicio</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <QuickStat icon={CalendarDays} label="Hoy" value={`${hoy} órdenes`} tint="text-brand-indigo" />
            <QuickStat icon={CalendarRange} label="Esta semana" value={`${semana} órdenes`} tint="text-brand-cyan" />
            <QuickStat
              icon={Wallet}
              label="Pendiente de pago"
              value={`${pendientesPago.length} · ${formatPeso(totalPendiente)}`}
              tint="text-brand-amber"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  tint: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        <Icon className={`size-5 ${tint}`} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-bold text-card-foreground">{value}</p>
      </div>
    </motion.div>
  )
}
