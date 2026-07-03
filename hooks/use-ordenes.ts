'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import type { EstadoOrden, Orden } from '@/lib/types'

export type ConnStatus = 'connecting' | 'online' | 'offline'

const LS_KEY = 'techfix_ordenes'

function readCache(): Orden[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Orden[]) : []
  } catch {
    return []
  }
}

function writeCache(ordenes: Orden[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ordenes))
  } catch {
    /* ignore quota */
  }
}

function sortOrdenes(list: Orden[]) {
  return [...list].sort((a, b) => (a.fechaISO < b.fechaISO ? 1 : -1))
}

export function useOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [status, setStatus] = useState<ConnStatus>('connecting')
  const [loading, setLoading] = useState(true)
  const ordenesRef = useRef<Orden[]>([])

  const apply = useCallback((list: Orden[]) => {
    const sorted = sortOrdenes(list)
    ordenesRef.current = sorted
    setOrdenes(sorted)
    writeCache(sorted)
  }, [])

  useEffect(() => {
    // Hydrate from cache instantly
    const cached = readCache()
    if (cached.length) {
      ordenesRef.current = sortOrdenes(cached)
      setOrdenes(sortOrdenes(cached))
    }

    if (!isFirebaseConfigured || !db) {
      setStatus('offline')
      setLoading(false)
      return
    }

    setStatus('connecting')
    const q = query(collection(db, 'ordenes'), orderBy('fechaISO', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as Orden)
        apply(list)
        setStatus('online')
        setLoading(false)
      },
      (err) => {
        console.log('[v0] Firestore listener error:', err.message)
        setStatus('offline')
        setLoading(false)
      },
    )
    return () => unsub()
  }, [apply])

  const saveOrden = useCallback(
    async (orden: Orden) => {
      // optimistic local update
      const next = [
        orden,
        ...ordenesRef.current.filter((o) => o.id !== orden.id),
      ]
      apply(next)
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'ordenes', orden.id), orden)
        } catch (err) {
          console.log('[v0] saveOrden error:', (err as Error).message)
          throw err
        }
      }
    },
    [apply],
  )

  const deleteOrden = useCallback(
    async (id: string) => {
      apply(ordenesRef.current.filter((o) => o.id !== id))
      if (isFirebaseConfigured && db) {
        try {
          await deleteDoc(doc(db, 'ordenes', id))
        } catch (err) {
          console.log('[v0] deleteOrden error:', (err as Error).message)
        }
      }
    },
    [apply],
  )

  const updateEstado = useCallback(
    async (id: string, estado: EstadoOrden) => {
      apply(
        ordenesRef.current.map((o) =>
          o.id === id ? { ...o, servicio: { ...o.servicio, estado } } : o,
        ),
      )
      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'ordenes', id), { 'servicio.estado': estado })
        } catch (err) {
          console.log('[v0] updateEstado error:', (err as Error).message)
        }
      }
    },
    [apply],
  )

  const updateOrden = useCallback(
    async (orden: Orden) => {
      apply(
        ordenesRef.current.map((o) => (o.id === orden.id ? orden : o)),
      )
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'ordenes', orden.id), orden)
        } catch (err) {
          console.log('[v0] updateOrden error:', (err as Error).message)
          throw err
        }
      }
    },
    [apply],
  )

  const importOrdenes = useCallback(
    async (incoming: Orden[], mode: 'replace' | 'merge') => {
      let merged: Orden[]
      if (mode === 'replace') {
        merged = incoming
      } else {
        const map = new Map<string, Orden>()
        for (const o of ordenesRef.current) map.set(o.id, o)
        for (const o of incoming) map.set(o.id, o)
        merged = Array.from(map.values())
      }
      apply(merged)
      if (isFirebaseConfigured && db) {
        try {
          const batch = writeBatch(db)
          for (const o of incoming) batch.set(doc(db, 'ordenes', o.id), o)
          await batch.commit()
        } catch (err) {
          console.log('[v0] importOrdenes error:', (err as Error).message)
        }
      }
    },
    [apply],
  )

  return {
    ordenes,
    status,
    loading,
    saveOrden,
    deleteOrden,
    updateEstado,
    updateOrden,
    importOrdenes,
  }
}
