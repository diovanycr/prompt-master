'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePromptStore } from '@/store/promptStore'
import { useTheme } from '@/components/layout/ThemeProvider'
import PartidasModal from '@/components/modals/PartidasModal'

export default function Header() {
  const router = useRouter()
  const { user, role } = useAuthStore()
  const { partidas } = usePromptStore()
  const { theme, toggle } = useTheme()
  const supabase = createClient()
  const [showPartidas, setShowPartidas] = useState(false)
  const [savedLabel, setSavedLabel] = useState('')

  // Auto-save indicator: mostra brevemente quando o formulário muda
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsub = usePromptStore.subscribe((state, prev) => {
      if (state.form !== prev.form) {
        clearTimeout(timer)
        setSavedLabel('✓ Salvo')
        timer = setTimeout(() => setSavedLabel(''), 2500)
      }
    })
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  const hoje = new Date()
  const proximaPartida = partidas
    .filter(p => p.data && new Date(p.data + 'T00:00:00') >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0]
  const diasRestantes = proximaPartida
    ? Math.ceil((new Date(proximaPartida.data + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
    : null

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const btnStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }

  return (
    <>
      <header className="flex-none h-14 flex items-center px-4 gap-2 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

        <div className="flex items-center gap-2 flex-none">
          <span className="text-xl">⚽</span>
          <span className="font-bold text-sm hidden sm:block" style={{ color: 'var(--gold)' }}>Prompt Master</span>
        </div>

        {proximaPartida && diasRestantes !== null && (
          <button onClick={() => setShowPartidas(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border transition-colors"
            style={{ background: 'color-mix(in srgb, var(--gold) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gold) 30%, transparent)', color: 'var(--gold)' }}>
            📅 {diasRestantes === 0 ? 'HOJE!' : diasRestantes === 1 ? 'Amanhã' : `${diasRestantes}d`} · vs {proximaPartida.adv}
          </button>
        )}

        <div className="flex-1" />

        {savedLabel && (
          <span className="text-[10px] hidden sm:block transition-opacity" style={{ color: 'var(--text-muted)' }}>
            {savedLabel}
          </span>
        )}

        <button onClick={toggle} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          className="px-3 py-1.5 text-sm rounded-lg border transition-colors" style={btnStyle}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button onClick={() => setShowPartidas(true)} title="Partidas"
          className="px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1" style={btnStyle}>
          📅 <span className="hidden sm:inline">Partidas</span>
          {partidas.length > 0 && (
            <span className="text-[10px] px-1.5 rounded-full font-bold" style={{ background: 'var(--gold)', color: '#000' }}>
              {partidas.length}
            </span>
          )}
        </button>

        {role === 'admin' && (
          <button onClick={() => router.push('/admin')}
            className="px-3 py-1.5 text-xs rounded-lg border transition-colors" style={btnStyle}>
            ⚙️ <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs hidden lg:block truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
          <button onClick={sair}
            className="px-3 py-1.5 text-xs rounded-lg border transition-colors hover:border-red-500 hover:text-red-400"
            style={btnStyle}>
            Sair
          </button>
        </div>
      </header>

      {showPartidas && <PartidasModal onClose={() => setShowPartidas(false)} />}
    </>
  )
}
