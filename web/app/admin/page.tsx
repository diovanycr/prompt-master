'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AdminUser, UserRole } from '@/types'
import { useRouter } from 'next/navigation'

interface AdminUserWithRole extends AdminUser {
  role?: UserRole
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const router = useRouter()
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data: statusData } = await supabase
      .from('user_status')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role')

    const rolesMap: Record<string, UserRole> = {}
    rolesData?.forEach(r => { rolesMap[r.user_id] = r.role })

    setUsers((statusData ?? []).map(u => ({ ...u, role: rolesMap[u.user_id] })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setStatus(userId: string, status: 'approved' | 'rejected', email: string) {
    if (status === 'rejected') {
      const ok = window.confirm(`Tem certeza que deseja NEGAR o acesso de:\n${email}\n\nO usuário será bloqueado imediatamente.`)
      if (!ok) return
    }
    await supabase.from('user_status').update({ status, updated_at: new Date().toISOString() }).eq('user_id', userId)
    setUsers(u => u.map(x => x.user_id === userId ? { ...x, status } : x))
  }

  async function setRole(userId: string, role: UserRole) {
    await supabase.from('user_roles').update({ role }).eq('user_id', userId)
    setUsers(u => u.map(x => x.user_id === userId ? { ...x, role } : x))
  }

  const filtered = users.filter(u => filter === 'all' ? true : u.status === filter)
  const counts = {
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  }

  const surfaceStyle = { background: 'var(--surface)', borderColor: 'var(--border)' }
  const surface2Style = { background: 'var(--surface2)', borderColor: 'var(--border)' }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>⚙️ Painel Administrativo</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gerenciar acessos e permissões de usuários</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-lg transition-colors text-sm border"
            style={surface2Style}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            ← Voltar ao app
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Pendentes', count: counts.pending, textClass: 'text-yellow-400', key: 'pending' },
            { label: 'Aprovados', count: counts.approved, textClass: 'text-green-400', key: 'approved' },
            { label: 'Negados', count: counts.rejected, textClass: 'text-red-400', key: 'rejected' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key as typeof filter)}
              className="p-4 rounded-xl border text-left transition-all"
              style={{
                background: filter === s.key ? 'color-mix(in srgb, var(--gold) 5%, var(--surface))' : 'var(--surface)',
                borderColor: filter === s.key ? 'var(--gold)' : 'var(--border)',
              }}
            >
              <div className={`text-2xl font-bold ${s.textClass}`}>{s.count}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilter('all')}
          className="mb-4 text-xs px-3 py-1 rounded-full border transition-colors"
          style={{
            borderColor: filter === 'all' ? 'var(--gold)' : 'var(--border)',
            color: filter === 'all' ? 'var(--gold)' : 'var(--text-muted)',
          }}
        >
          Ver todos ({users.length})
        </button>

        {/* Table */}
        <div className="rounded-xl overflow-hidden border" style={surfaceStyle}>
          {loading ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Nenhum usuário encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {['E-mail', 'Status', 'Perfil', 'Cadastro', 'Ações'].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-xs font-medium ${i === 4 ? 'text-right' : 'text-left'}`}
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id} className="border-b transition-colors"
                    style={{ borderColor: 'var(--surface2)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-3 px-4" style={{ color: 'var(--text)' }}>{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'approved' ? 'bg-green-950 text-green-400' :
                        u.status === 'rejected' ? 'bg-red-950 text-red-400' :
                        'bg-yellow-950 text-yellow-400'
                      }`}>
                        {u.status === 'approved' ? '✅ Aprovado' : u.status === 'rejected' ? '❌ Negado' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role ?? 'user'}
                        onChange={e => setRole(u.user_id, e.target.value as UserRole)}
                        className="text-xs px-2 py-1 rounded-lg border cursor-pointer"
                        style={{
                          background: 'var(--surface2)',
                          borderColor: u.role === 'admin' ? 'color-mix(in srgb, var(--gold) 50%, transparent)' : 'var(--border)',
                          color: u.role === 'admin' ? 'var(--gold)' : 'var(--text-muted)',
                        }}
                      >
                        <option value="user">👤 Usuário</option>
                        <option value="admin">⭐ Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {u.status !== 'approved' && (
                          <button
                            onClick={() => setStatus(u.user_id, 'approved', u.email)}
                            className="px-3 py-1 bg-green-900/50 hover:bg-green-800 text-green-300 rounded-lg text-xs transition-colors"
                          >
                            ✅ Aprovar
                          </button>
                        )}
                        {u.status !== 'rejected' && (
                          <button
                            onClick={() => setStatus(u.user_id, 'rejected', u.email)}
                            className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-300 rounded-lg text-xs transition-colors"
                          >
                            ❌ Negar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
