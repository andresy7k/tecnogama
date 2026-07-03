'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  Save,
  Trash2,
  User,
  Smartphone,
  AlertCircle,
  Receipt,
  Plus,
  History,
} from 'lucide-react'
import { Field, Input, Select, Textarea, Label } from '@/components/shared/form-field'
import { PriorityBadge, PagoBadge } from '@/components/shared/status-badge'
import { TicketModal } from '@/components/shared/ticket-modal'
import { useToast } from '@/components/shared/toast'
import {
  formatFecha,
  genId,
  calcEstadoPago,
  calcRestante,
  formatPeso,
  calcTotalAbonos,
} from '@/lib/format'
import {
  ACCESORIOS,
  ESTADOS,
  ESTADOS_ESTETICOS,
  PRIORIDADES,
  TIPOS_EQUIPO,
  type Abono,
  type LogCambio,
  type NegocioConfig,
  type Orden,
  type Prioridad,
  type EstadoOrden,
} from '@/lib/types'

const DRAFT_KEY = 'techfix_draft'

const emptyForm = {
  cliente: { nombre: '', doc: '', tel: '', email: '' },
  equipo: {
    tipo: 'Celular/Smartphone',
    marca: '',
    modelo: '',
    serial: '',
    color: '',
    estado: 'Bueno',
    accesorios: [] as string[],
    obsFisica: '',
  },
  falla: { desc: '', diag: '', clave: '', prioridad: 'Normal' as Prioridad },
  servicio: {
    repCosto: '',
    abonoInicial: '',
    tecnico: '',
    obs: '',
    estado: 'Recibido' as EstadoOrden,
  },
}

type FormState = typeof emptyForm

function SectionCard({
  num,
  title,
  subtitle,
  icon: Icon,
  complete,
  open,
  onToggle,
  children,
}: {
  num: string
  title: string
  subtitle: string
  icon: typeof User
  complete: boolean
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            complete
              ? 'bg-brand-emerald text-white'
              : 'bg-gradient-to-br from-brand-indigo to-brand-violet text-white'
          }`}
        >
          {complete ? <Check className="size-4" /> : num}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-bold tracking-tight text-card-foreground">
              {title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <ChevronDown
          className={`size-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="border-t border-border px-5 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function NuevaOrdenForm({
  ordenes,
  cfg,
  onSave,
  orden,
  onUpdate,
  onBack,
}: {
  ordenes: Orden[]
  cfg: NegocioConfig
  onSave: (o: Orden) => Promise<void> | void
  orden?: Orden | null
  onUpdate?: (o: Orden) => Promise<void> | void
  onBack?: () => void
}) {
  const { toast } = useToast()
  const isEdit = Boolean(orden)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [shake, setShake] = useState(false)
  const [showClave, setShowClave] = useState(false)
  const [openSection, setOpenSection] = useState<number>(1)
  const [ticket, setTicket] = useState<Orden | null>(null)
  const [abonos, setAbonos] = useState<Abono[]>(orden?.servicio.abonos ?? [])
  const [log, setLog] = useState<LogCambio[]>(orden?.log ?? [])
  const [nuevoAbonoMonto, setNuevoAbonoMonto] = useState('')
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const hydrated = useRef(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (orden) {
      setForm({
        cliente: { ...orden.cliente },
        equipo: { ...orden.equipo, accesorios: [...orden.equipo.accesorios] },
        falla: { ...orden.falla },
        servicio: {
          repCosto: orden.servicio.repCosto,
          abonoInicial: orden.servicio.abonoInicial,
          tecnico: orden.servicio.tecnico,
          obs: orden.servicio.obs,
          estado: orden.servicio.estado,
        },
      })
      setAbonos(orden.servicio.abonos ?? [])
      setLog(orden.log ?? [])
      setOpenSection(1)
    }
  }, [orden])

  // Restore draft from sessionStorage (only in create mode)
  useEffect(() => {
    if (isEdit) return
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      if (raw) setForm({ ...emptyForm, ...JSON.parse(raw) })
    } catch {
      /* ignore */
    }
    hydrated.current = true
    firstFieldRef.current?.focus()
  }, [isEdit])

  // Persist draft (only in create mode)
  useEffect(() => {
    if (isEdit || !hydrated.current) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    } catch {
      /* ignore */
    }
  }, [form, isEdit])

  const set = <S extends keyof FormState>(
    section: S,
    field: keyof FormState[S],
    value: unknown,
  ) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }))
  }

  const toggleAccesorio = (a: string) => {
    setForm((f) => {
      const has = f.equipo.accesorios.includes(a)
      return {
        ...f,
        equipo: {
          ...f.equipo,
          accesorios: has
            ? f.equipo.accesorios.filter((x) => x !== a)
            : [...f.equipo.accesorios, a],
        },
      }
    })
  }

  const s1 = Boolean(form.cliente.nombre && form.cliente.tel)
  const s2 = Boolean(form.equipo.tipo && form.equipo.marca && form.equipo.modelo)
  const s3 = Boolean(form.falla.desc)
  const s4 = Boolean(form.servicio.repCosto || abonos.length > 0 || form.servicio.tecnico)

  const validate = () => {
    const e: Record<string, boolean> = {}
    if (!form.cliente.nombre) e['cliente.nombre'] = true
    if (!form.cliente.tel) e['cliente.tel'] = true
    if (!form.equipo.tipo) e['equipo.tipo'] = true
    if (!form.equipo.marca) e['equipo.marca'] = true
    if (!form.equipo.modelo) e['equipo.modelo'] = true
    if (!form.falla.desc) e['falla.desc'] = true
    setErrors(e)
    return e
  }

  const reset = () => {
    setForm(emptyForm)
    setErrors({})
    setAbonos([])
    setLog([])
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
  }

  const addAbono = () => {
    const monto = Number(nuevoAbonoMonto)
    if (!monto || monto <= 0) {
      toast({ message: 'Ingresa un monto válido', type: 'error' })
      return
    }
    const now = new Date()
    const abono: Abono = {
      monto,
      fecha: formatFecha(now),
      fechaISO: now.toISOString(),
    }
    setAbonos((prev) => [...prev, abono])
    setNuevoAbonoMonto('')
    toast({ message: `Abono de ${formatPeso(monto)} registrado`, type: 'success' })
  }

  const removeAbono = (index: number) => {
    setAbonos((prev) => prev.filter((_, i) => i !== index))
  }

  const buildLog = (oldOrden: Orden, newForm: FormState, newAbonos: Abono[]): LogCambio[] => {
    const now = new Date()
    const fecha = formatFecha(now)
    const fechaISO = now.toISOString()
    const changes: LogCambio[] = []

    const compare = (campo: string, oldVal: string, newVal: string) => {
      if (oldVal !== newVal) {
        changes.push({ campo, valorAnterior: oldVal, nuevoValor: newVal, fecha, fechaISO })
      }
    }

    compare('Cliente nombre', oldOrden.cliente.nombre, newForm.cliente.nombre)
    compare('Cliente doc', oldOrden.cliente.doc, newForm.cliente.doc)
    compare('Cliente tel', oldOrden.cliente.tel, newForm.cliente.tel)
    compare('Cliente email', oldOrden.cliente.email, newForm.cliente.email)
    compare('Tipo equipo', oldOrden.equipo.tipo, newForm.equipo.tipo)
    compare('Marca', oldOrden.equipo.marca, newForm.equipo.marca)
    compare('Modelo', oldOrden.equipo.modelo, newForm.equipo.modelo)
    compare('Serial', oldOrden.equipo.serial, newForm.equipo.serial)
    compare('Color', oldOrden.equipo.color, newForm.equipo.color)
    compare('Estado estético', oldOrden.equipo.estado, newForm.equipo.estado)
    compare('Obs. físicas', oldOrden.equipo.obsFisica, newForm.equipo.obsFisica)
    compare('Falla', oldOrden.falla.desc, newForm.falla.desc)
    compare('Diagnóstico', oldOrden.falla.diag, newForm.falla.diag)
    compare('Clave', oldOrden.falla.clave, newForm.falla.clave)
    compare('Prioridad', oldOrden.falla.prioridad, newForm.falla.prioridad)
    compare('Costo reparación', oldOrden.servicio.repCosto, newForm.servicio.repCosto)
    compare('Técnico', oldOrden.servicio.tecnico, newForm.servicio.tecnico)
    compare('Obs. cliente', oldOrden.servicio.obs, newForm.servicio.obs)
    compare('Estado', oldOrden.servicio.estado, newForm.servicio.estado)

    const oldAccesorios = [...oldOrden.equipo.accesorios].sort().join(',')
    const newAccesorios = [...newForm.equipo.accesorios].sort().join(',')
    compare('Accesorios', oldAccesorios, newAccesorios)

    const oldAbonado = calcTotalAbonos(oldOrden.servicio.abonos ?? [])
    const newAbonado = calcTotalAbonos(newAbonos)
    if (oldAbonado !== newAbonado) {
      changes.push({
        campo: 'Abonos totales',
        valorAnterior: formatPeso(oldAbonado),
        nuevoValor: formatPeso(newAbonado),
        fecha,
        fechaISO,
      })
    }

    return changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
      toast({ message: 'Por favor completa los campos obligatorios', type: 'error' })
      if (!s1) setOpenSection(1)
      else if (!s2) setOpenSection(2)
      else setOpenSection(3)
      return
    }

    const now = new Date()

    if (isEdit && orden && onUpdate) {
      const newLog = buildLog(orden, form, abonos)
      const updatedLog = [...(orden.log ?? []), ...newLog]
      const updated: Orden = {
        ...orden,
        cliente: { ...form.cliente },
        equipo: { ...form.equipo, accesorios: [...form.equipo.accesorios] },
        falla: { ...form.falla },
        servicio: {
          repCosto: form.servicio.repCosto,
          abonoInicial: form.servicio.abonoInicial,
          abonos,
          tecnico: form.servicio.tecnico,
          obs: form.servicio.obs,
          estado: form.servicio.estado,
        },
        modificado: true,
        fechaModificacion: formatFecha(now),
        log: updatedLog,
      }

      try {
        await onUpdate(updated)
        toast({ message: `Orden ${orden.id} actualizada correctamente`, type: 'success' })
        onBack?.()
      } catch {
        toast({ message: 'Error al actualizar', type: 'error' })
      }
    } else {
      const abonoInicialNum = Number(form.servicio.abonoInicial)
      const abonosIniciales: Abono[] = abonoInicialNum > 0
        ? [{
            monto: abonoInicialNum,
            fecha: formatFecha(now),
            fechaISO: now.toISOString(),
          }]
        : []

      const newOrden: Orden = {
        id: genId(ordenes),
        fecha: formatFecha(now),
        fechaISO: now.toISOString(),
        cliente: { ...form.cliente },
        equipo: { ...form.equipo, accesorios: [...form.equipo.accesorios] },
        falla: { ...form.falla },
        servicio: {
          repCosto: form.servicio.repCosto,
          abonoInicial: form.servicio.abonoInicial,
          abonos: abonosIniciales,
          tecnico: form.servicio.tecnico,
          obs: form.servicio.obs,
          estado: form.servicio.estado,
        },
      }

      try {
        await onSave(newOrden)
        setTicket(newOrden)
        toast({ message: `Orden ${newOrden.id} guardada correctamente`, type: 'success' })
        reset()
      } catch {
        toast({ message: 'Error al guardar. Datos guardados localmente.', type: 'warning' })
        setTicket(newOrden)
        reset()
      }
    }
  }

  const err = (k: string) => Boolean(errors[k])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? `Editar orden ${orden?.id}` : 'Nueva orden'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEdit
              ? `Modificada el ${orden?.fechaModificacion ?? 'N/A'}`
              : 'Registra un equipo y genera el tiquete de servicio.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {[s1, s2, s3, s4].map((done, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors ${
                done ? 'bg-brand-emerald/12 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <Check className="size-3" /> : <span>0{i + 1}</span>}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        animate={shake ? { x: 0 } : {}}
        className={`flex flex-col gap-4 ${shake ? 'tf-shake' : ''}`}
      >
        {/* Section 1 - Cliente */}
        <SectionCard
          num="01"
          title="Datos del cliente"
          subtitle="Información de contacto"
          icon={User}
          complete={s1}
          open={openSection === 1}
          onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" htmlFor="nombre" required>
              <Input
                id="nombre"
                ref={firstFieldRef}
                value={form.cliente.nombre}
                invalid={err('cliente.nombre')}
                onChange={(e) => set('cliente', 'nombre', e.target.value)}
                placeholder="Juan Pérez"
              />
            </Field>
            <Field label="Documento / Cédula" htmlFor="doc">
              <Input
                id="doc"
                value={form.cliente.doc}
                onChange={(e) => set('cliente', 'doc', e.target.value)}
                placeholder="1.234.567.890"
              />
            </Field>
            <Field label="Teléfono" htmlFor="tel" required>
              <Input
                id="tel"
                type="tel"
                value={form.cliente.tel}
                invalid={err('cliente.tel')}
                onChange={(e) => set('cliente', 'tel', e.target.value)}
                placeholder="300 123 4567"
              />
            </Field>
            <Field label="Correo electrónico" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={form.cliente.email}
                onChange={(e) => set('cliente', 'email', e.target.value)}
                placeholder="cliente@correo.com"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Section 2 - Equipo */}
        <SectionCard
          num="02"
          title="Datos del equipo"
          subtitle="Marca, modelo y estado físico"
          icon={Smartphone}
          complete={s2}
          open={openSection === 2}
          onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Tipo de equipo" htmlFor="tipo" required>
              <Select
                id="tipo"
                value={form.equipo.tipo}
                invalid={err('equipo.tipo')}
                onChange={(e) => set('equipo', 'tipo', e.target.value)}
              >
                {TIPOS_EQUIPO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Marca" htmlFor="marca" required>
              <Input
                id="marca"
                value={form.equipo.marca}
                invalid={err('equipo.marca')}
                onChange={(e) => set('equipo', 'marca', e.target.value)}
                placeholder="Samsung, Apple, HP…"
              />
            </Field>
            <Field label="Modelo" htmlFor="modelo" required>
              <Input
                id="modelo"
                value={form.equipo.modelo}
                invalid={err('equipo.modelo')}
                onChange={(e) => set('equipo', 'modelo', e.target.value)}
                placeholder="Galaxy S21, iPhone 13…"
              />
            </Field>
            <Field label="IMEI / Serial" htmlFor="serial">
              <Input
                id="serial"
                className="font-mono"
                value={form.equipo.serial}
                onChange={(e) => set('equipo', 'serial', e.target.value)}
                placeholder="356789…"
              />
            </Field>
            <Field label="Color" htmlFor="color">
              <Input
                id="color"
                value={form.equipo.color}
                onChange={(e) => set('equipo', 'color', e.target.value)}
                placeholder="Negro"
              />
            </Field>
            <Field label="Estado estético" htmlFor="estadoEstetico">
              <Select
                id="estadoEstetico"
                value={form.equipo.estado}
                onChange={(e) => set('equipo', 'estado', e.target.value)}
              >
                {ESTADOS_ESTETICOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <Label>Accesorios recibidos</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESORIOS.map((a) => {
                const active = form.equipo.accesorios.includes(a)
                return (
                  <motion.button
                    key={a}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleAccesorio(a)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-brand-indigo bg-brand-indigo/10 text-brand-indigo'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {active && <Check className="size-3" />}
                    {a}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="mt-4">
            <Field label="Observaciones físicas" htmlFor="obsFisica">
              <Textarea
                id="obsFisica"
                value={form.equipo.obsFisica}
                onChange={(e) => set('equipo', 'obsFisica', e.target.value)}
                placeholder="Rayones en la pantalla, golpe en esquina inferior…"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Section 3 - Falla */}
        <SectionCard
          num="03"
          title="Falla y diagnóstico"
          subtitle="Problema reportado y prioridad"
          icon={AlertCircle}
          complete={s3}
          open={openSection === 3}
          onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Falla reportada por el cliente" htmlFor="falla" required>
              <Textarea
                id="falla"
                value={form.falla.desc}
                invalid={err('falla.desc')}
                onChange={(e) => set('falla', 'desc', e.target.value)}
                placeholder="No enciende, pantalla rota, no carga…"
              />
            </Field>
            <Field label="Diagnóstico técnico inicial" htmlFor="diag">
              <Textarea
                id="diag"
                value={form.falla.diag}
                onChange={(e) => set('falla', 'diag', e.target.value)}
                placeholder="Posible daño en…"
              />
            </Field>
            <Field label="Clave / Patrón de desbloqueo" htmlFor="clave">
              <div className="relative">
                <Input
                  id="clave"
                  type={showClave ? 'text' : 'password'}
                  value={form.falla.clave}
                  onChange={(e) => set('falla', 'clave', e.target.value)}
                  placeholder="••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowClave((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label={showClave ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="Prioridad" htmlFor="prioridad">
              <div className="flex items-center gap-3">
                <Select
                  id="prioridad"
                  value={form.falla.prioridad}
                  onChange={(e) => set('falla', 'prioridad', e.target.value as Prioridad)}
                  className="flex-1"
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <PriorityBadge prioridad={form.falla.prioridad} />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* Section 4 - Servicio */}
        <SectionCard
          num="04"
          title="Servicio y costos"
          subtitle="Valores estimados y técnico"
          icon={Receipt}
          complete={s4}
          open={openSection === 4}
          onToggle={() => setOpenSection(openSection === 4 ? 0 : 4)}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Costo reparación" htmlFor="repCosto">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="repCosto"
                  type="number"
                  min="0"
                  value={form.servicio.repCosto}
                  onChange={(e) => set('servicio', 'repCosto', e.target.value)}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </Field>
            <Field label="Abono Inicial" htmlFor="abonoInicial">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="abonoInicial"
                  type="number"
                  min="0"
                  value={form.servicio.abonoInicial}
                  onChange={(e) => set('servicio', 'abonoInicial', e.target.value)}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </Field>
            <Field label="Técnico asignado" htmlFor="tecnico">
              <Input
                id="tecnico"
                value={form.servicio.tecnico}
                onChange={(e) => set('servicio', 'tecnico', e.target.value)}
                placeholder="Nombre del técnico"
              />
            </Field>
          </div>

          {/* Abonos */}
          <div className="mt-4">
            <Label>Abonos registrados</Label>
            {abonos.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">No hay abonos registrados aún.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {abonos.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-card-foreground">
                        {formatPeso(a.monto)}
                      </span>
                      <span className="text-xs text-muted-foreground">{a.fecha}</span>
                    </div>
                    {isEdit && (
                      <button
                        type="button"
                        onClick={() => removeAbono(i)}
                        className="text-muted-foreground hover:text-brand-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isEdit && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <Field label="Nuevo abono" htmlFor="nuevoAbono" className="flex-1">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="nuevoAbono"
                      type="number"
                      min="0"
                      value={nuevoAbonoMonto}
                      onChange={(e) => setNuevoAbonoMonto(e.target.value)}
                      placeholder="Monto"
                      className="pl-7"
                    />
                  </div>
                </Field>
                <button
                  type="button"
                  onClick={addAbono}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-indigo bg-brand-indigo/10 px-4 py-2.5 text-sm font-semibold text-brand-indigo transition-colors hover:bg-brand-indigo/20"
                >
                  <Plus className="size-4" />
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Resumen de pago */}
          {(form.servicio.repCosto || form.servicio.abonoInicial || abonos.length > 0) && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-background/50 px-4 py-3">
              <PagoBadge
                estado={calcEstadoPago(
                  form.servicio.repCosto,
                  isEdit
                    ? abonos
                    : [
                        ...abonos,
                        ...(Number(form.servicio.abonoInicial) > 0
                          ? [{
                              monto: Number(form.servicio.abonoInicial),
                              fecha: '',
                              fechaISO: '',
                            }]
                          : []),
                      ],
                )}
              />
              <span className="text-sm text-muted-foreground">
                Abonado:{' '}
                <span className="font-bold text-card-foreground">
                  {formatPeso(
                    calcTotalAbonos(abonos) + (isEdit ? 0 : Number(form.servicio.abonoInicial) || 0),
                  )}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">
                Restante:{' '}
                <span className="font-bold text-card-foreground">
                  {formatPeso(
                    calcRestante(
                      form.servicio.repCosto,
                      isEdit
                        ? abonos
                        : [
                            ...abonos,
                            ...(Number(form.servicio.abonoInicial) > 0
                              ? [{
                                  monto: Number(form.servicio.abonoInicial),
                                  fecha: '',
                                  fechaISO: '',
                                }]
                              : []),
                          ],
                    ),
                  )}
                </span>
              </span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Observaciones para el cliente" htmlFor="obsCliente">
              <Textarea
                id="obsCliente"
                value={form.servicio.obs}
                onChange={(e) => set('servicio', 'obs', e.target.value)}
                placeholder="Notas visibles en el tiquete…"
              />
            </Field>
            <Field label="Estado inicial" htmlFor="estadoInicial">
              <Select
                id="estadoInicial"
                value={form.servicio.estado}
                onChange={(e) => set('servicio', 'estado', e.target.value as EstadoOrden)}
              >
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </SectionCard>

        {/* Log de cambios (solo en modo edición) */}
        {isEdit && log.length > 0 && (
          <SectionCard
            num="05"
            title="Historial de cambios"
            subtitle={`${log.length} cambio${log.length !== 1 ? 's' : ''} registrado${log.length !== 1 ? 's' : ''}`}
            icon={History}
            complete={false}
            open={openSection === 5}
            onToggle={() => setOpenSection(openSection === 5 ? 0 : 5)}
          >
            <div className="flex flex-col gap-2">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-background/50 px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-card-foreground">{entry.campo}</span>
                    <span className="text-muted-foreground">{entry.fecha}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <span className="line-through">{entry.valorAnterior || '(vacío)'}</span>
                    <span>→</span>
                    <span className="font-medium text-card-foreground">
                      {entry.nuevoValor || '(vacío)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </motion.div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {isEdit && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
        )}
        {!isEdit && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Trash2 className="size-4" />
            Limpiar formulario
          </button>
        )}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-violet px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
        >
          <Save className="size-4" />
          {isEdit ? 'Guardar cambios' : 'Guardar y generar tiquete'}
        </motion.button>
      </div>

      <TicketModal
        open={Boolean(ticket)}
        onClose={() => setTicket(null)}
        orden={ticket}
        cfg={cfg}
      />
    </form>
  )
}
