'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'register'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      })
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold text-[#f0b429]">Prompt Master Futsal</h1>
          <p className="text-[#888898] text-sm mt-1">Gerador de artes para marketing esportivo</p>
        </div>

        {/* Card */}
        <div className="bg-[#14141e] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a3e]">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setErro(''); setSucesso('') }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-[#f0b429] border-b-2 border-[#f0b429]'
                    : 'text-[#888898] hover:text-[#e8e8f0]'
                }`}
              >
                {t === 'login' ? '🔑 Entrar' : '📝 Criar conta'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {erro && (
              <div className="mb-4 px-4 py-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm">
                {erro}
              </div>
            )}
            {sucesso && (
              <div className="mb-4 px-4 py-3 bg-green-950/60 border border-green-800 rounded-lg text-green-300 text-sm">
                {sucesso}
              </div>
            )}

            <form suppressHydrationWarning onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-[#888898] mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555568]"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-[#888898] mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555568]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#888898] mb-1">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#1e1e2e] border border-[#2a2a3e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder-[#555568]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#f0b429] hover:bg-[#c8860a] disabled:opacity-50 text-black font-bold rounded-lg transition-colors mt-2"
              >
                {loading ? '⏳ Aguarde...' : tab === 'login' ? '🔑 Entrar' : '📝 Criar conta'}
              </button>
            </form>

            {tab === 'register' && !sucesso && (
              <p className="text-xs text-[#888898] text-center mt-4">
                Após o cadastro, aguarde a aprovação do administrador para acessar o sistema.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
