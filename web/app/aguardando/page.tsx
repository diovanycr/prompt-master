'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AguardandoPage() {
  const router = useRouter()
  const supabase = createClient()

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-[#f0b429] mb-2">Aguardando aprovação</h1>
        <p className="text-[#888898] mb-6 leading-relaxed">
          Seu cadastro foi recebido com sucesso! Um administrador irá revisar e aprovar seu acesso em breve.
          Você receberá uma confirmação quando seu acesso for liberado.
        </p>
        <div className="bg-[#14141e] border border-[#2a2a3e] rounded-xl p-4 mb-6 text-sm text-[#888898]">
          💡 Já possui aprovação? Tente sair e entrar novamente.
        </div>
        <button
          onClick={sair}
          className="px-6 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#f0b429] text-[#e8e8f0] rounded-lg transition-colors text-sm"
        >
          Sair e voltar ao login
        </button>
      </div>
    </div>
  )
}
