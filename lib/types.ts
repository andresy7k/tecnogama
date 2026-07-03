export type EstadoOrden =
  | 'Recibido'
  | 'Reparando'
  | 'Listo'
  | 'Entregado'

export type EstadoPago = 'No pagado' | 'Pago parcial' | 'Pagado'

export type Prioridad = 'Normal' | 'Alta' | 'Urgente'

export interface Abono {
  monto: number
  fecha: string
  fechaISO: string
  nota?: string
}

export interface LogCambio {
  campo: string
  valorAnterior: string
  nuevoValor: string
  fecha: string
  fechaISO: string
}

export interface Orden {
  id: string
  fecha: string
  fechaISO: string
  cliente: {
    nombre: string
    doc: string
    tel: string
    email: string
  }
  equipo: {
    tipo: string
    marca: string
    modelo: string
    serial: string
    color: string
    estado: string
    accesorios: string[]
    obsFisica: string
  }
  falla: {
    desc: string
    diag: string
    clave: string
    prioridad: Prioridad
  }
  servicio: {
    repCosto: string
    abonoInicial: string
    abonos: Abono[]
    tecnico: string
    obs: string
    estado: EstadoOrden
  }
  modificado?: boolean
  fechaModificacion?: string
  log?: LogCambio[]
}

export interface NegocioConfig {
  nombre: string
  slogan: string
  ticketNota: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  logo?: string // base64, stored in localStorage only
}

export const ESTADOS: EstadoOrden[] = [
  'Recibido',
  'Reparando',
  'Listo',
  'Entregado',
]

export const TIPOS_EQUIPO = [
  'Celular/Smartphone',
  'Tablet',
  'Portátil/Laptop',
  'PC Escritorio',
  'All-in-One',
  'Smartwatch',
  'Otro',
]

export const ESTADOS_ESTETICOS = ['Excelente', 'Bueno', 'Regular', 'Malo']

export const ACCESORIOS = [
  'Cargador',
  'Cable USB',
  'Audífonos',
  'Funda',
  'Simcard',
  'Batería externa',
  'Mouse',
  'Teclado',
  'Caja original',
  'Memoria',
]

export const PRIORIDADES: Prioridad[] = ['Normal', 'Alta', 'Urgente']

export const DEFAULT_CONFIG: NegocioConfig = {
  nombre: 'TechFix Pro',
  slogan: 'Reparación profesional de celulares y computadores',
  ticketNota:
    'Conserve este tiquete. Es indispensable para reclamar su equipo. Pasados 60 días sin reclamar, el equipo se considera abandonado.',
  telefono: '',
  email: '',
  direccion: '',
  ciudad: '',
}
