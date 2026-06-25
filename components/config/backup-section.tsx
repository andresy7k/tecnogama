'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Upload, ShieldCheck, RotateCcw } from 'lucide-react'
import { Modal } from '@/components/shared/modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/shared/toast'
import type { NegocioConfig, Orden } from '@/lib/types'

export const AUTOBACKUP_KEY = 'techfix_autobackup'

interface BackupPayload {
  ordenes: Orden[]
  config?: NegocioConfig
  ts: string
}

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function BackupSection({
  ordenes,
  cfg,
  onImport,
  onRestoreConfig,
}: {
  ordenes: Orden[]
  cfg: NegocioConfig
  onImport: (ordenes: Orden[], mode: 'replace' | 'merge') => void
  onRestoreConfig: (cfg: NegocioConfig) => void
}) {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<BackupPayload | null>(null)
  const [confirmRestore, setConfirmRestore] = useState(false)
  const [auto, setAuto] = useState<BackupPayload | null>(null)

  const refreshAuto = () => {
    try {
      const raw = localStorage.getItem(AUTOBACKUP_KEY)
      setAuto(raw ? (JSON.parse(raw) as BackupPayload) : null)
    } catch {
      setAuto(null)
    }
  }

  useEffect(() => {
    refreshAuto()
  }, [ordenes])

  const handleExport = () => {
    download('techfix-backup.json', { ordenes, config: cfg, ts: new Date().toISOString() })
    toast({ message: 'Backup exportado', type: 'success' })
  }

  const handleFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as BackupPayload
        if (!Array.isArray(parsed.ordenes)) throw new Error('formato')
        setPending(parsed)
      } catch {
        toast({ message: 'Archivo inválido. Debe ser un backup JSON.', type: 'error' })
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const applyImport = (mode: 'replace' | 'merge') => {
    if (!pending) return
    onImport(pending.ordenes, mode)
    if (pending.config) onRestoreConfig(pending.config)
    toast({
      message: `Importadas ${pending.ordenes.length} órdenes (${mode === 'replace' ? 'reemplazo' : 'fusión'})`,
      type: 'success',
    })
    setPending(null)
  }

  const restoreAuto = () => {
    if (!auto) return
    onImport(auto.ordenes, 'replace')
    if (auto.config) onRestoreConfig(auto.config)
    toast({ message: 'Autorespaldo restaurado', type: 'success' })
    setConfirmRestore(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Export */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-emerald/12">
            <Download className="size-5 text-brand-emerald" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-card-foreground">Exportar backup</h4>
            <p className="text-xs text-muted-foreground">
              Descarga todas las órdenes y la configuración en un archivo JSON.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Download className="size-4" />
            Exportar backup.json
          </button>
        </div>

        {/* Import */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-indigo/12">
            <Upload className="size-5 text-brand-indigo" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-card-foreground">Importar backup</h4>
            <p className="text-xs text-muted-foreground">
              Carga un archivo JSON. Podrás reemplazar o fusionar los datos.
            </p>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Upload className="size-4" />
            Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Autobackup */}
      <div className="mt-4 rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-cyan/12">
            <ShieldCheck className="size-5 text-brand-cyan" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-card-foreground">
                Autorespaldo automático
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-emerald/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Activo
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {auto
                ? `Último respaldo: ${new Date(auto.ts).toLocaleString('es-CO')} · ${auto.ordenes.length} órdenes`
                : 'Se genera al guardar una orden y al cerrar la ventana.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!auto}
              onClick={() => auto && download('techfix-autorespaldo.json', auto)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Download className="size-3.5" />
              Descargar
            </button>
            <button
              disabled={!auto}
              onClick={() => setConfirmRestore(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Import choice modal */}
      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title="Importar datos"
        size="max-w-md"
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            El archivo contiene{' '}
            <span className="font-semibold text-foreground">
              {pending?.ordenes.length ?? 0} órdenes
            </span>
            . ¿Cómo deseas importarlas?
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={() => applyImport('merge')}
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-brand-indigo hover:bg-brand-indigo/5"
            >
              <p className="text-sm font-bold text-card-foreground">Fusionar</p>
              <p className="text-xs text-muted-foreground">
                Conserva las órdenes actuales y agrega/actualiza las del archivo.
              </p>
            </button>
            <button
              onClick={() => applyImport('replace')}
              className="rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-brand-danger hover:bg-brand-danger/5"
            >
              <p className="text-sm font-bold text-card-foreground">Reemplazar</p>
              <p className="text-xs text-muted-foreground">
                Elimina las órdenes actuales y deja solo las del archivo.
              </p>
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmRestore}
        title="Restaurar autorespaldo"
        message="Esto reemplazará las órdenes actuales con el último autorespaldo guardado. ¿Continuar?"
        confirmLabel="Restaurar"
        onConfirm={restoreAuto}
        onCancel={() => setConfirmRestore(false)}
      />
    </>
  )
}
