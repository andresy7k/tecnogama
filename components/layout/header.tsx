'use client'

import { motion } from 'motion/react'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Settings,
  Wrench,
} from 'lucide-react'
import { FirebaseStatus } from './firebase-status'
import type { ConnStatus } from '@/hooks/use-ordenes'

export type ViewKey = 'dashboard' | 'nueva' | 'equipos' | 'config'

const NAV: { key: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'nueva', label: 'Nueva Orden', icon: PlusCircle },
  { key: 'equipos', label: 'Equipos', icon: ClipboardList },
  { key: 'config', label: 'Configurar', icon: Settings },
]

export function Header({
  active,
  onChange,
  status,
  businessName,
}: {
  active: ViewKey
  onChange: (v: ViewKey) => void
  status: ConnStatus
  businessName: string
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-br from-brand-ink via-[#1e1040] to-[#0d1b3c]">
      <div className="bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-violet shadow-lg">
              <Wrench className="size-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight text-white">
                {businessName || 'TechFix Pro'}
              </p>
              <p className="hidden text-[10px] font-medium uppercase tracking-wider text-white/40 sm:block">
                Gestión de reparaciones
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {NAV.map(({ key, label, icon: Icon }) => {
              const isActive = active === key
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet shadow-md"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 size-4 ${isActive ? 'text-white' : 'text-white/60'}`}
                  />
                  <span
                    className={`relative z-10 hidden md:inline ${isActive ? 'text-white' : 'text-white/60'}`}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </nav>

          <FirebaseStatus status={status} />
        </div>
      </div>
    </header>
  )
}
