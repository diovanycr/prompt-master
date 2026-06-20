'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePromptStore } from '@/store/promptStore'

export default function Header() {
  const router = useRouter()
  const { user, role } = useAuthStore()
  const { partidas } = usePromptStore()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle')
  const supabase = createClient()

  // próximo jogo
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
    <header className="flex-none h-14 bg-[#14141e] border-b border-[#2a2a3e] flex items-center px-4 gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-none">
        <span className="text-xl">⚽</span>
        <span className="font-bold text-[#f0b429] text-sm hidden sm:block">Prompt Master</span>
      </div>

      {/* Próximo jogo badge */}
      {proximaPartida && diasRestantes !== null && (
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#f0b429]/10 border border-[#f0b429]/30 rounded-full text-[10px] text-[#f0b429]">
          <span>📅</span>
          <span>{diasRestantes === 0 ? 'JOGO HOJE!' : diasRestantes === 1 ? 'Amanhã' : `${diasRestantes}d`} · vs {proximaPartida.adv}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Admin link */}
      {role === 'admin' && (
        <button
          onClick={() => router.push('/admin')}
          className="px-3 py-1.5 text-xs bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#f0b429] text-[#888898] hover:text-[#f0b429] rounded-lg transition-colors"
        >
          ⚙️ Admin
        </button>
      )}

      {/* User */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#888898] hidden sm:block truncate max-w-[140px]">
          {user?.email}
        </span>
        <button
          onClick={sair}
          className="px-3 py-1.5 text-xs bg-[#1e1e2e] border border-[#2a2a3e] hover:border-red-700 text-[#888898] hover:text-red-400 rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
