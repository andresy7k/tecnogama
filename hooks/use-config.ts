'use client'

import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import { DEFAULT_CONFIG, type NegocioConfig } from '@/lib/types'

const LS_KEY = 'techfix_config'
const LS_LOGO = 'techfix_logo'

export function useConfig() {
  const [cfg, setCfg] = useState<NegocioConfig>(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      // localStorage first (also holds the logo, too large for Firestore)
      let local: Partial<NegocioConfig> = {}
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) local = JSON.parse(raw)
      } catch {
        /* ignore */
      }
      const logo = localStorage.getItem(LS_LOGO) || undefined

      let remote: Partial<NegocioConfig> = {}
      if (isFirebaseConfigured && db) {
        try {
          const snap = await getDoc(doc(db, 'config', 'negocio'))
          if (snap.exists()) remote = snap.data() as NegocioConfig
        } catch (err) {
          console.log('[v0] useConfig load error:', (err as Error).message)
        }
      }

      if (!cancelled) {
        setCfg({ ...DEFAULT_CONFIG, ...local, ...remote, logo })
        setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const saveConfig = useCallback(async (next: NegocioConfig) => {
    setCfg(next)
    const { logo, ...rest } = next
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(rest))
      if (logo) localStorage.setItem(LS_LOGO, logo)
      else localStorage.removeItem(LS_LOGO)
    } catch {
      /* ignore quota */
    }
    if (isFirebaseConfigured && db) {
      try {
        // logo excluded: base64 is too large for a Firestore document
        await setDoc(doc(db, 'config', 'negocio'), rest, { merge: true })
      } catch (err) {
        console.log('[v0] saveConfig error:', (err as Error).message)
        throw err
      }
    }
  }, [])

  return { cfg, saveConfig, loaded }
}
