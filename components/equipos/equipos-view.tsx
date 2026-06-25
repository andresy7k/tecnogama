'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, Eye, Pencil, Receipt, Trash2, PackageSearch } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { OrderDetailModal } from './order-detail-modal'
import { ChangeStatusPopover } from './change-status-popover'
import { TicketModal } from '@/components/shared/ticket-modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/shared/toast'
import { ESTADOS, type EstadoOrden, type NegocioConfig, type Orden } from '@/lib/types'

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function EquiposView({
  ordenes,
  cfg,
  onUpdateEstado,
  onDelete,
}: {
  ordenes: Orden[]
  cfg: NegocioConfig
  onUpdateEstado: (id: string, e: EstadoOrden) => void
  onDelete: (id: string) => void
}) {
  const { toast } = useToast()
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounced(searchInput, 300)
  const [filter, setFilter] = useState<'all' | EstadoOrden>('all')
  const [detail, setDetail] = useState<Orden | null>(null)
  const [ticket, setTicket] = useState<Orden | null>(null)
  const [statusOpenId, setStatusOpenId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Orden | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ordenes.filter((o) => {
      if (filter !== 'all' && o.servicio.estado !== filter) return false
      if (!q) return true
      return [
        o.id,
        o.cliente.nombre,
        o.cliente.tel,
        o.equipo.marca,
        o.equipo.modelo,
        o.falla.desc,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [ordenes, search, filter])

  const handleEstado = (id: string, e: EstadoOrden) => {
    onUpdateEstado(id, e)
    setDetail((d) => (d && d.id === id ? { ...d, servicio: { ...d.servicio, estado: e } } : d))
    toast({ message: `Estado actualizado a "${e}"`, type: 'success' })
  }

  const confirmDelete = () => {
    if (!toDelete) return
    onDelete(toDelete.id)
    toast({ message: `Orden ${toDelete.id} eliminada`, type: 'info' })
    setToDelete(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Equipos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Todas las órdenes registradas en el taller.
        </p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por orden, cliente, teléfono, equipo o falla…"
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-brand-indigo focus:ring-4 focus:ring-brand-indigo/15"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | EstadoOrden)}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-brand-indigo focus:ring-4 focus:ring-brand-indigo/15"
        >
          <option value="all">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="inline-flex items-center justify-center rounded-lg bg-brand-indigo/10 px-3 py-2.5 text-sm font-semibold text-brand-indigo">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <PackageSearch className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                {ordenes.length === 0
                  ? 'Aún no hay órdenes registradas.'
                  : 'Prueba con otros términos de búsqueda o filtros.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Orden</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Equipo</th>
                  <th className="px-4 py-3 font-semibold">Falla</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -60 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                      className="border-t border-border odd:bg-background/40 hover:bg-brand-indigo/5"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-brand-indigo">
                          {o.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {o.fecha}
                      </td>
                      <td className="px-4 py-3 font-medium text-card-foreground">
                        {o.cliente.nombre}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {o.cliente.tel}
                      </td>
                      <td className="px-4 py-3 text-card-foreground">
                        {o.equipo.marca} {o.equipo.modelo}
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        <span
                          className="block truncate text-muted-foreground"
                          title={o.falla.desc}
                        >
                          {o.falla.desc}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge estado={o.servicio.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center justify-end gap-1">
                          <IconBtn label="Ver" onClick={() => setDetail(o)}>
                            <Eye className="size-4" />
                          </IconBtn>
                          <IconBtn
                            label="Cambiar estado"
                            onClick={() =>
                              setStatusOpenId(statusOpenId === o.id ? null : o.id)
                            }
                          >
                            <Pencil className="size-4" />
                          </IconBtn>
                          <IconBtn label="Tiquete" onClick={() => setTicket(o)}>
                            <Receipt className="size-4" />
                          </IconBtn>
                          <IconBtn
                            label="Eliminar"
                            danger
                            onClick={() => setToDelete(o)}
                          >
                            <Trash2 className="size-4" />
                          </IconBtn>
                          {statusOpenId === o.id && (
                            <ChangeStatusPopover
                              current={o.servicio.estado}
                              onSelect={(e) => handleEstado(o.id, e)}
                              onClose={() => setStatusOpenId(null)}
                            />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDetailModal
        orden={detail}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        onChangeEstado={handleEstado}
        onTicket={(o) => {
          setDetail(null)
          setTicket(o)
        }}
      />
      <TicketModal
        open={Boolean(ticket)}
        onClose={() => setTicket(null)}
        orden={ticket}
        cfg={cfg}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar orden"
        message={`¿Seguro que deseas eliminar la orden ${toDelete?.id}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg border border-transparent p-1.5 transition-colors hover:border-border ${
        danger
          ? 'text-muted-foreground hover:bg-brand-danger/10 hover:text-brand-danger'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
