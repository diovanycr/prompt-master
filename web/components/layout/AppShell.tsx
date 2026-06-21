'use client'

import { useEffect, useState } from 'react'
import FormSection from '@/components/sidebar/FormSection'
import PromptOutput from '@/components/output/PromptOutput'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { usePromptStore } from '@/store/promptStore'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  useKeyboardShortcuts()

  // Dispara notificações de jogos próximos (uma vez por sessão)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    const key = `pm_notif_${new Date().toDateString()}`
    if (sessionStorage.getItem(key)) return

    const partidas = usePromptStore.getState().partidas
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)

    const proximas = partidas.filter(p => {
      if (!p.data) return false
      const diff = Math.round((new Date(p.data + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
      return diff >= 0 && diff <= 1
    })

    if (proximas.length > 0) {
      proximas.forEach(p => {
        const diff = Math.round((new Date(p.data + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
        setTimeout(() => {
          new Notification('⚽ Prompt Master Futsal', {
            body: diff === 0
              ? `JOGO HOJE vs ${p.adv}! Gere os prompts agora.`
              : `Jogo amanhã vs ${p.adv} — Prepare as artes!`,
            icon: '/icon-192.png',
          })
        }, 1000)
      })
      sessionStorage.setItem(key, '1')
    }
  }, [])

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar toggle (mobile) */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 text-black rounded-full shadow-xl text-lg font-bold flex items-center justify-center"
        style={{ background: 'var(--gold)' }}>
        {sidebarOpen ? '←' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`flex-none w-80 xl:w-96 overflow-y-auto border-r transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:relative fixed inset-y-0 left-0 z-40 top-14 lg:top-0`}
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="p-4">
          <FormSection />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <PromptOutput />
      </main>
    </div>
  )
}
