'use client'

import { Receipt } from 'lucide-react'
import { Modal } from '@/components/shared/modal'
import { StatusBadge, PriorityBadge, PagoBadge } from '@/components/shared/status-badge'
import { Select } from '@/components/shared/form-field'
import { formatPeso, calcEstadoPago, calcRestante } from '@/lib/format'
import { ESTADOS, type EstadoOrden, type Orden } from '@/lib/types'

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-card-foreground">{value}</dd>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-background/50 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-indigo">
        {title}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </section>
  )
}

export function OrderDetailModal({
  orden,
  open,
  onClose,
  onChangeEstado,
  onTicket,
}: {
  orden: Orden | null
  open: boolean
  onClose: () => void
  onChangeEstado: (id: string, e: EstadoOrden) => void
  onTicket: (o: Orden) => void
}) {
  if (!orden) return null
  return (
    <Modal open={open} onClose={onClose} title={`Orden ${orden.id}`} size="max-w-3xl">
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-brand-indigo">
              {orden.id}
            </span>
            <StatusBadge estado={orden.servicio.estado} />
            <PriorityBadge prioridad={orden.falla.prioridad} />
          </div>
          <span className="text-xs text-muted-foreground">{orden.fecha}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Group title="Cliente">
            <Detail label="Nombre" value={orden.cliente.nombre} />
            <Detail label="Documento" value={orden.cliente.doc} />
            <Detail label="Teléfono" value={orden.cliente.tel} />
            <Detail label="Correo" value={orden.cliente.email} />
          </Group>
          <Group title="Equipo">
            <Detail label="Tipo" value={orden.equipo.tipo} />
            <Detail label="Marca" value={orden.equipo.marca} />
            <Detail label="Modelo" value={orden.equipo.modelo} />
            <Detail label="Serial" value={orden.equipo.serial} />
            <Detail label="Color" value={orden.equipo.color} />
            <Detail label="Estado" value={orden.equipo.estado} />
            {orden.equipo.accesorios.length > 0 && (
              <Detail label="Accesorios" value={orden.equipo.accesorios.join(', ')} />
            )}
            <Detail label="Obs. físicas" value={orden.equipo.obsFisica} />
          </Group>
          <Group title="Falla y diagnóstico">
            <Detail label="Falla reportada" value={orden.falla.desc} />
            <Detail label="Diagnóstico" value={orden.falla.diag} />
            <Detail label="Prioridad" value={orden.falla.prioridad} />
          </Group>
          <Group title="Costos y servicio">
            <Detail label="Costo reparación" value={formatPeso(orden.servicio.repCosto)} />
            <Detail label="Abono" value={formatPeso(orden.servicio.abonoInicial)} />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Estado pago
              </dt>
              <dd className="mt-0.5">
                <PagoBadge estado={calcEstadoPago(orden.servicio.repCosto, orden.servicio.abonoInicial)} />
              </dd>
            </div>
            <Detail label="Restante" value={formatPeso(calcRestante(orden.servicio.repCosto, orden.servicio.abonoInicial))} />
            <Detail label="Técnico" value={orden.servicio.tecnico} />
            <Detail label="Obs. cliente" value={orden.servicio.obs} />
          </Group>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="estado-detail"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Estado
            </label>
            <Select
              id="estado-detail"
              value={orden.servicio.estado}
              onChange={(e) => onChangeEstado(orden.id, e.target.value as EstadoOrden)}
              className="w-44"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <button
            onClick={() => onTicket(orden)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
          >
            <Receipt className="size-4" />
            Reimprimir tiquete
          </button>
        </div>
      </div>
    </Modal>
  )
}
