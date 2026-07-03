'use client'

import { useEffect, useState } from 'react'
import { Save, Store, Receipt, Database } from 'lucide-react'
import { Field, Input, Textarea } from '@/components/shared/form-field'
import { useToast } from '@/components/shared/toast'
import { LogoUpload } from './logo-upload'
import { TicketPreview } from './ticket-preview'
import { BackupSection } from './backup-section'
import type { NegocioConfig, Orden } from '@/lib/types'

export function ConfigView({
  cfg,
  saveConfig,
  ordenes,
  onImport,
}: {
  cfg: NegocioConfig
  saveConfig: (cfg: NegocioConfig) => Promise<void>
  ordenes: Orden[]
  onImport: (ordenes: Orden[], mode: 'replace' | 'merge') => void
}) {
  const { toast } = useToast()
  const [draft, setDraft] = useState<NegocioConfig>(cfg)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(cfg)
  }, [cfg])

  const set = <K extends keyof NegocioConfig>(key: K, value: NegocioConfig[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleSave = async () => {
    if (!draft.nombre.trim()) {
      toast({ message: 'El nombre del negocio es obligatorio', type: 'error' })
      return
    }
    setSaving(true)
    try {
      await saveConfig(draft)
      toast({ message: 'Configuración guardada', type: 'success' })
    } catch {
      toast({
        message: 'Guardado local. No se pudo sincronizar con la nube.',
        type: 'warning',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Configuración</h2>
          <p className="text-sm text-muted-foreground">
            Personaliza tu negocio, el tiquete y administra tus datos.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          <Save className="size-4" />
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Business info */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-indigo/12">
                <Store className="size-5 text-brand-indigo" />
              </div>
              <div>
                <h3 className="text-base font-bold text-card-foreground">Datos del negocio</h3>
                <p className="text-xs text-muted-foreground">
                  Aparecerán en el encabezado del tiquete.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre del negocio" htmlFor="nombre" required className="sm:col-span-2">
                <Input
                  id="nombre"
                  value={draft.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  placeholder="Tecnogama"
                />
              </Field>
              <Field label="Slogan" htmlFor="slogan" className="sm:col-span-2">
                <Input
                  id="slogan"
                  value={draft.slogan}
                  onChange={(e) => set('slogan', e.target.value)}
                  placeholder="Reparación profesional"
                />
              </Field>
              <Field label="Teléfono" htmlFor="telefono">
                <Input
                  id="telefono"
                  value={draft.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                  placeholder="300 000 0000"
                />
              </Field>
              <Field label="Correo" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="contacto@negocio.com"
                />
              </Field>
              <Field label="Dirección" htmlFor="direccion">
                <Input
                  id="direccion"
                  value={draft.direccion}
                  onChange={(e) => set('direccion', e.target.value)}
                  placeholder="Calle 1 # 2-34"
                />
              </Field>
              <Field label="Ciudad" htmlFor="ciudad">
                <Input
                  id="ciudad"
                  value={draft.ciudad}
                  onChange={(e) => set('ciudad', e.target.value)}
                  placeholder="Bogotá"
                />
              </Field>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logo
              </p>
              <LogoUpload logo={draft.logo} onChange={(logo) => set('logo', logo)} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-violet/12">
                <Receipt className="size-5 text-brand-violet" />
              </div>
              <div>
                <h3 className="text-base font-bold text-card-foreground">Tiquete</h3>
                <p className="text-xs text-muted-foreground">
                  Nota legal que se imprime al final del tiquete.
                </p>
              </div>
            </div>
            <Field label="Nota del tiquete" htmlFor="nota">
              <Textarea
                id="nota"
                value={draft.ticketNota}
                onChange={(e) => set('ticketNota', e.target.value)}
                rows={4}
                placeholder="Términos y condiciones del servicio…"
              />
            </Field>
          </div>
        </section>

        {/* Live preview */}
        <aside className="lg:col-span-2">
          <div className="sticky top-24">
            <TicketPreview cfg={draft} />
          </div>
        </aside>
      </div>

      {/* Data management */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-emerald/12">
            <Database className="size-5 text-brand-emerald" />
          </div>
          <div>
            <h3 className="text-base font-bold text-card-foreground">Datos y respaldos</h3>
            <p className="text-xs text-muted-foreground">
              Exporta, importa y restaura toda tu información.
            </p>
          </div>
        </div>
        <BackupSection
          ordenes={ordenes}
          cfg={draft}
          onImport={onImport}
          onRestoreConfig={(c) => {
            setDraft(c)
            void saveConfig(c)
          }}
        />
      </section>
    </div>
  )
}
