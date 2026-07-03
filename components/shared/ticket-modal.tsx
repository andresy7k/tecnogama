'use client'

import { Printer, X } from 'lucide-react'
import { Modal } from './modal'
import { formatPeso, calcEstadoPago, calcRestante } from '@/lib/format'
import type { NegocioConfig, Orden } from '@/lib/types'

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-0.5 text-[12px]">
      <span className="font-semibold uppercase text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value}</span>
    </div>
  )
}

function Dashed() {
  return <div className="my-2 border-t border-dashed border-neutral-300" />
}

export function TicketModal({
  open,
  onClose,
  orden,
  cfg,
}: {
  open: boolean
  onClose: () => void
  orden: Orden | null
  cfg: NegocioConfig
}) {
  if (!orden) return null

  return (
    <Modal open={open} onClose={onClose} size="max-w-sm" hideClose>
      <div id="ticket-print" className="bg-white px-6 py-5 font-mono text-neutral-900">
        <div className="text-center">
          {cfg.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cfg.logo || '/placeholder.svg'}
              alt={cfg.nombre}
              className="mx-auto mb-2 h-12 w-auto object-contain"
            />
          ) : null}
          <h3 className="text-base font-bold tracking-tight">{cfg.nombre}</h3>
          {cfg.slogan && (
            <p className="mt-0.5 text-[11px] text-neutral-500">{cfg.slogan}</p>
          )}
          <div className="mt-1 text-[11px] text-neutral-600">
            {cfg.telefono && <div>Tel: {cfg.telefono}</div>}
            {cfg.direccion && <div>{cfg.direccion}</div>}
            {cfg.ciudad && <div>{cfg.ciudad}</div>}
          </div>
        </div>

        <Dashed />
        <div className="text-center">
          <div className="text-[11px] uppercase text-neutral-500">Orden de servicio</div>
          <div className="text-xl font-bold text-indigo-600">{orden.id}</div>
          <div className="text-[11px] text-neutral-500">{orden.fecha}</div>
        </div>

        <Dashed />
        <Row label="Cliente" value={orden.cliente.nombre} />
        <Row label="Doc" value={orden.cliente.doc} />
        <Row label="Tel" value={orden.cliente.tel} />
        <Row label="Email" value={orden.cliente.email} />

        <Dashed />
        <Row label="Tipo" value={orden.equipo.tipo} />
        <Row label="Marca" value={orden.equipo.marca} />
        <Row label="Modelo" value={orden.equipo.modelo} />
        <Row label="Serial" value={orden.equipo.serial} />
        <Row label="Color" value={orden.equipo.color} />
        <Row label="Estado" value={orden.equipo.estado} />
        {orden.equipo.accesorios.length > 0 && (
          <Row label="Accesorios" value={orden.equipo.accesorios.join(', ')} />
        )}

        <Dashed />
        <div className="text-[12px]">
          <div className="font-semibold uppercase text-neutral-500">Falla reportada</div>
          <p className="mt-0.5 text-neutral-900">{orden.falla.desc}</p>
          {orden.falla.diag && (
            <>
              <div className="mt-1 font-semibold uppercase text-neutral-500">
                Diagnóstico
              </div>
              <p className="mt-0.5 text-neutral-900">{orden.falla.diag}</p>
            </>
          )}
        </div>
        <Row label="Prioridad" value={orden.falla.prioridad} />

        <Dashed />
        <Row label="Costo reparación" value={formatPeso(orden.servicio.repCosto)} />
        <Row label="Abono" value={formatPeso(orden.servicio.abonoInicial)} />
        <Row label="Estado pago" value={calcEstadoPago(orden.servicio.repCosto, orden.servicio.abonoInicial)} />
        <Row label="Restante" value={formatPeso(calcRestante(orden.servicio.repCosto, orden.servicio.abonoInicial))} />
        <Row label="Técnico" value={orden.servicio.tecnico} />
        <Row label="Estado actual" value={orden.servicio.estado} />

        {cfg.ticketNota && (
          <>
            <Dashed />
            <p className="text-center text-[10px] leading-relaxed text-neutral-500">
              {cfg.ticketNota}
            </p>
          </>
        )}
        <Dashed />
        <p className="text-center text-[10px] text-neutral-400">
          Generado con TechFix Pro
        </p>
      </div>

      <div className="no-print flex gap-3 border-t border-border bg-card p-4">
        <button
          onClick={onClose}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <X className="size-4" />
          Cerrar
        </button>
        <button
          onClick={() => window.print()}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          <Printer className="size-4" />
          Imprimir
        </button>
      </div>
    </Modal>
  )
}
