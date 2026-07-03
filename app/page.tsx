'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Header, type ViewKey } from '@/components/layout/header'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { NuevaOrdenForm } from '@/components/registro/nueva-orden-form'
import { EquiposView } from '@/components/equipos/equipos-view'
import { ConfigView } from '@/components/config/config-view'
import { AUTOBACKUP_KEY } from '@/components/config/backup-section'
import { useOrdenes } from '@/hooks/use-ordenes'
import { useConfig } from '@/hooks/use-config'
import type { Orden } from '@/lib/types'

export default function Page() {
  const [view, setView] = useState<ViewKey>('dashboard')
  const [selected, setSelected] = useState<Orden | null>(null)
  const [editingOrden, setEditingOrden] = useState<Orden | null>(null)
  const {
    ordenes,
    status,
    saveOrden,
    deleteOrden,
    updateEstado,
    updateOrden,
    importOrdenes,
  } = useOrdenes()
  const { cfg, saveConfig } = useConfig()

  // Autobackup on order changes
  useEffect(() => {
    if (!ordenes.length) return
    try {
      localStorage.setItem(
        AUTOBACKUP_KEY,
        JSON.stringify({ ordenes, config: cfg, ts: new Date().toISOString() }),
      )
    } catch {
      /* ignore quota */
    }
  }, [ordenes, cfg])

  const goEquipos = (o: Orden) => {
    setSelected(o)
    setView('equipos')
  }

  const startEditar = (o: Orden) => {
    setEditingOrden(o)
    setView('editar')
  }

  const finishEditar = () => {
    setEditingOrden(null)
    setView('equipos')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        active={view}
        onChange={setView}
        status={status}
        businessName={cfg.nombre}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && (
              <DashboardView
                ordenes={ordenes}
                onVer={goEquipos}
                onNueva={() => setView('nueva')}
              />
            )}
            {view === 'nueva' && (
              <NuevaOrdenForm ordenes={ordenes} cfg={cfg} onSave={saveOrden} />
            )}
            {view === 'editar' && editingOrden && (
              <NuevaOrdenForm
                ordenes={ordenes}
                cfg={cfg}
                onSave={saveOrden}
                orden={editingOrden}
                onUpdate={updateOrden}
                onBack={finishEditar}
              />
            )}
            {view === 'equipos' && (
              <EquiposView
                key={selected?.id ?? 'list'}
                ordenes={ordenes}
                cfg={cfg}
                onUpdateEstado={updateEstado}
                onDelete={deleteOrden}
                onEditar={startEditar}
              />
            )}
            {view === 'config' && (
              <ConfigView
                cfg={cfg}
                saveConfig={saveConfig}
                ordenes={ordenes}
                onImport={importOrdenes}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
