export type EstadoOrden =
  | 'Recibido'
  | 'Diagnóstico'
  | 'Reparando'
  | 'Listo'
  | 'Entregado'

export type Prioridad = 'Normal' | 'Alta' | 'Urgente'

export interface Orden {
  id: string // "OT-00001"
  fecha: string // "15/1/2025, 10:30:00 a. m."
  fechaISO: string // ISO 8601 for ordering
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
    estado: string // estético
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
    diagCosto: string
    repCosto: string
    tecnico: string
    obs: string
    estado: EstadoOrden
  }
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
  'Diagnóstico',
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
  'Vidrio templado',
  'Batería externa',
  'Mouse',
  'Teclado',
  'Caja original',
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
