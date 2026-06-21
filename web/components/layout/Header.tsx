'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePromptStore } from '@/store/promptStore'
import { useTheme } from '@/components/layout/ThemeProvider'

export default function Header() {
  const router = useRouter()
  const { user, role } = useAuthStore()
  const { partidas } = usePromptStore()
  const { theme, toggle } = useTheme()
  const supabase = createClient()

  const hoje = new Date()
  const proximaPartida = partidas
    .filter(p => p.data && new Date(p.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0]
  const diasRestantes = proximaPartida
    ? Math.ceil((new Date(proximaPartida.data).getTime() - hoje.getTime()) / 86400000)
    : null

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex-none h-14 flex items-center px-4 gap-3 border-b transition-colors"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 flex-none">
        <span className="text-xl">⚽</span>
        <span className="font-bold text-sm hidden sm:block" style={{ color: 'var(--gold)' }}>Prompt Master</span>
      </div>

      {proximaPartida && diasRestantes !== null && (
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] border"
          style={{ background: 'color-mix(in srgb, var(--gold) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gold) 30%, transparent)', color: 'var(--gold)' }}>
          <span>📅</span>
          <span>{diasRestantes === 0 ? 'JOGO HOJE!' : diasRestantes === 1 ? 'Amanhã' : `${diasRestantes}d`} · vs {proximaPartida.adv}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Theme toggle */}
      <button onClick={toggle} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
        style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {role === 'admin' && (
        <button onClick={() => router.push('/admin')}
          className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          ⚙️ Admin
        </button>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs hidden sm:block truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
          {user?.email}
        </span>
        <button onClick={sair}
          className="px-3 py-1.5 text-xs rounded-lg border transition-colors hover:border-red-500 hover:text-red-400"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Sair
        </button>
      </div>
    </header>
  )
}
