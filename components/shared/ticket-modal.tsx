'use client'

import { Printer, X } from 'lucide-react'
import { Modal } from './modal'
import { formatPeso, calcEstadoPago, calcRestante, calcTotalAbonos } from '@/lib/format'
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

function buildTicketHtml(orden: Orden, cfg: NegocioConfig): string {
  const abonos = orden.servicio.abonos ?? []
  const abonosHtml = abonos.length > 0
    ? abonos.map((a, i) => `<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="font-weight:600;text-transform:uppercase;color:#6b7280">Abono ${i + 1}</span><span style="color:#111827">${formatPeso(a.monto)} — ${a.fecha}</span></div>`).join('') +
      `<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="font-weight:600;text-transform:uppercase;color:#6b7280">Total abonado</span><span style="color:#111827">${formatPeso(calcTotalAbonos(abonos))}</span></div>`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ticket ${orden.id}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; background: #fff; padding: 10px; width: 300px; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 2px 0; }
  .label { font-weight: 600; text-transform: uppercase; color: #6b7280; font-size: 10px; }
  .value { text-align: right; color: #111827; }
  .dashed { margin: 8px 0; border-top: 1px dashed #d1d5db; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  @media print { @page { margin: 5mm; size: 80mm auto; } }
</style>
</head>
<body>
  <div class="center">
    ${cfg.logo ? `<img src="${cfg.logo}" style="max-height:48px;margin:0 auto 8px;display:block">` : ''}
    <div class="bold" style="font-size:14px">${cfg.nombre}</div>
    ${cfg.slogan ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${cfg.slogan}</div>` : ''}
    <div style="font-size:10px;color:#4b5563;margin-top:4px">
      ${cfg.telefono ? `<div>Tel: ${cfg.telefono}</div>` : ''}
      ${cfg.direccion ? `<div>${cfg.direccion}</div>` : ''}
      ${cfg.ciudad ? `<div>${cfg.ciudad}</div>` : ''}
    </div>
  </div>

  <div class="dashed"></div>
  <div class="center">
    <div style="font-size:10px;text-transform:uppercase;color:#6b7280">Orden de servicio</div>
    <div class="bold" style="font-size:18px;color:#4f46e5">${orden.id}</div>
    <div style="font-size:10px;color:#6b7280">${orden.fecha}</div>
  </div>

  <div class="dashed"></div>
  <div class="row"><span class="label">Cliente</span><span class="value">${orden.cliente.nombre}</span></div>
  ${orden.cliente.doc ? `<div class="row"><span class="label">Doc</span><span class="value">${orden.cliente.doc}</span></div>` : ''}
  <div class="row"><span class="label">Tel</span><span class="value">${orden.cliente.tel}</span></div>
  ${orden.cliente.email ? `<div class="row"><span class="label">Email</span><span class="value">${orden.cliente.email}</span></div>` : ''}

  <div class="dashed"></div>
  <div class="row"><span class="label">Tipo</span><span class="value">${orden.equipo.tipo}</span></div>
  <div class="row"><span class="label">Marca</span><span class="value">${orden.equipo.marca}</span></div>
  <div class="row"><span class="label">Modelo</span><span class="value">${orden.equipo.modelo}</span></div>
  ${orden.equipo.serial ? `<div class="row"><span class="label">Serial</span><span class="value">${orden.equipo.serial}</span></div>` : ''}
  ${orden.equipo.color ? `<div class="row"><span class="label">Color</span><span class="value">${orden.equipo.color}</span></div>` : ''}
  <div class="row"><span class="label">Estado</span><span class="value">${orden.equipo.estado}</span></div>
  ${orden.equipo.accesorios.length > 0 ? `<div class="row"><span class="label">Accesorios</span><span class="value">${orden.equipo.accesorios.join(', ')}</span></div>` : ''}

  <div class="dashed"></div>
  <div style="font-size:11px">
    <div class="bold" style="text-transform:uppercase;color:#6b7280;font-size:10px">Falla reportada</div>
    <div style="margin-top:2px;color:#111827">${orden.falla.desc}</div>
    ${orden.falla.diag ? `<div class="bold" style="text-transform:uppercase;color:#6b7280;font-size:10px;margin-top:4px">Diagnóstico</div><div style="margin-top:2px;color:#111827">${orden.falla.diag}</div>` : ''}
  </div>

  <div class="dashed"></div>
  <div class="row"><span class="label">Costo reparación</span><span class="value">${formatPeso(orden.servicio.repCosto)}</span></div>
  ${abonosHtml}
  <div class="row"><span class="label">Estado pago</span><span class="value">${calcEstadoPago(orden.servicio.repCosto, abonos)}</span></div>
  <div class="row"><span class="label">Restante</span><span class="value">${formatPeso(calcRestante(orden.servicio.repCosto, abonos))}</span></div>
  ${orden.servicio.tecnico ? `<div class="row"><span class="label">Técnico</span><span class="value">${orden.servicio.tecnico}</span></div>` : ''}
  <div class="row"><span class="label">Estado actual</span><span class="value">${orden.servicio.estado}</span></div>

  ${cfg.ticketNota ? `<div class="dashed"></div><div class="center" style="font-size:9px;color:#6b7280;line-height:1.4">${cfg.ticketNota}</div>` : ''}
  <div class="dashed"></div>
  <div class="center" style="font-size:9px;color:#9ca3af">Generado con Tecnogama</div>
</body>
</html>`
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

  const abonos = orden.servicio.abonos ?? []

  const handlePrint = () => {
    const html = buildTicketHtml(orden, cfg)
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

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
        {abonos.length > 0 && (
          <>
            {abonos.map((a, i) => (
              <Row
                key={i}
                label={`Abono ${i + 1}`}
                value={`${formatPeso(a.monto)} — ${a.fecha}`}
              />
            ))}
            <Row label="Total abonado" value={formatPeso(calcTotalAbonos(abonos))} />
          </>
        )}
        <Row label="Estado pago" value={calcEstadoPago(orden.servicio.repCosto, abonos)} />
        <Row label="Restante" value={formatPeso(calcRestante(orden.servicio.repCosto, abonos))} />
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
          Generado con Tecnogama
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
          onClick={handlePrint}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          <Printer className="size-4" />
          Imprimir
        </button>
      </div>
    </Modal>
  )
}
