'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'register'

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>
}

function LoginContent() {
  const router = useRouter()
  const params = useSearchParams()
  const erroParam = params.get('erro')

  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(erroParam === 'acesso_negado' ? '❌ Seu acesso foi negado pelo administrador.' : '')
  const [sucesso, setSucesso] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) { setErro('❌ ' + error.message); return }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) { setErro('⚠️ Informe seu nome completo.'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome } } })
      if (error) { setErro('❌ ' + error.message); return }
      const userId = data.user?.id
      if (userId) {
        await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email }),
        })
      }
      setSucesso('✅ Cadastro realizado! Aguarde a aprovação do administrador para acessar o sistema.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>Prompt Master Futsal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gerador de artes para marketing esportivo</p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setErro(''); setSucesso('') }}
                className="flex-1 py-3 text-sm font-medium transition-colors border-b-2"
                style={{
                  borderColor: tab === t ? 'var(--gold)' : 'transparent',
                  color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                {t === 'login' ? '🔑 Entrar' : '📝 Criar conta'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {erro && <div className="mb-4 px-4 py-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm">{erro}</div>}
            {sucesso && <div className="mb-4 px-4 py-3 bg-green-950/60 border border-green-800 rounded-lg text-green-300 text-sm">{sucesso}</div>}

            <form suppressHydrationWarning onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nome completo</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required
                    className="w-full rounded-lg px-3 py-2.5 text-sm border" style={inputStyle} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                  className="w-full rounded-lg px-3 py-2.5 text-sm border" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Senha</label>
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full rounded-lg px-3 py-2.5 text-sm border" style={inputStyle} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 disabled:opacity-50 text-black font-bold rounded-lg transition-colors mt-2"
                style={{ background: 'var(--gold)' }}>
                {loading ? '⏳ Aguarde...' : tab === 'login' ? '🔑 Entrar' : '📝 Criar conta'}
              </button>
            </form>

            {tab === 'register' && !sucesso && (
              <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                Após o cadastro, aguarde a aprovação do administrador para acessar o sistema.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
