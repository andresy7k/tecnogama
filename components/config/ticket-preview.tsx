'use client'

import type { NegocioConfig } from '@/lib/types'

export function TicketPreview({ cfg }: { cfg: NegocioConfig }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Vista previa del tiquete
      </p>
      <div className="mx-auto w-full max-w-[280px] rounded-lg bg-white p-4 font-mono text-neutral-900 shadow-sm">
        <div className="text-center">
          {cfg.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cfg.logo || '/placeholder.svg'}
              alt={cfg.nombre}
              className="mx-auto mb-2 h-10 w-auto object-contain"
            />
          ) : null}
          <h3 className="text-sm font-bold">{cfg.nombre || 'Nombre del negocio'}</h3>
          {cfg.slogan && (
            <p className="mt-0.5 text-[10px] text-neutral-500">{cfg.slogan}</p>
          )}
          <div className="mt-1 text-[10px] text-neutral-600">
            {cfg.telefono && <div>Tel: {cfg.telefono}</div>}
            {cfg.email && <div>{cfg.email}</div>}
            {cfg.direccion && <div>{cfg.direccion}</div>}
            {cfg.ciudad && <div>{cfg.ciudad}</div>}
          </div>
        </div>
        <div className="my-2 border-t border-dashed border-neutral-300" />
        <div className="text-center text-[10px] text-neutral-400">
          OT-00001 · {new Date().toLocaleDateString('es-CO')}
        </div>
        {cfg.ticketNota && (
          <>
            <div className="my-2 border-t border-dashed border-neutral-300" />
            <p className="text-center text-[9px] leading-relaxed text-neutral-500">
              {cfg.ticketNota}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
