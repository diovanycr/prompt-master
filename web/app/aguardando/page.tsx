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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--gold)' }}>Aguardando aprovação</h1>
        <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Seu cadastro foi recebido com sucesso! Um administrador irá revisar e aprovar seu acesso em breve.
          Você receberá uma confirmação quando seu acesso for liberado.
        </p>
        <div className="rounded-xl p-4 mb-6 text-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          💡 Já possui aprovação? Tente sair e entrar novamente.
        </div>
        <button
          onClick={sair}
          className="px-6 py-2.5 rounded-lg transition-colors text-sm border"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          Sair e voltar ao login
        </button>
      </div>
    </div>
  )
}
