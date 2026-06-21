'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'

type ToastType = 'success' | 'warn' | 'error' | ''

interface Toast {
  id: number
  msg: string
  tipo: ToastType
}

interface ToastCtx {
  toast: (msg: string, tipo?: ToastType) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

let id = 0

function toastStyle(tipo: ToastType): React.CSSProperties {
  if (tipo === '') return { background: 'color-mix(in srgb, var(--surface2) 90%, transparent)', borderColor: 'var(--border)', color: 'var(--text)' }
  return {}
}

function toastClass(tipo: ToastType): string {
  if (tipo === 'success') return 'bg-green-950/90 border-green-700 text-green-200'
  if (tipo === 'warn') return 'bg-yellow-950/90 border-yellow-700 text-yellow-200'
  if (tipo === 'error') return 'bg-red-950/90 border-red-700 text-red-200'
  return 'border backdrop-blur-sm'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, tipo: ToastType = '') => {
    const t = { id: ++id, msg, tipo }
    setToasts(p => [...p, t])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3500)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto toast-enter px-4 py-3 rounded-xl text-sm font-medium shadow-xl border backdrop-blur-sm max-w-xs ${toastClass(t.tipo)}`}
            style={toastStyle(t.tipo)}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
