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

  async function setStatus(userId: string, status: 'approved' | 'rejected') {
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

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#f0b429]">⚙️ Painel Administrativo</h1>
            <p className="text-[#888898] text-sm mt-1">Gerenciar acessos e permissões de usuários</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#f0b429] text-sm rounded-lg transition-colors"
          >
            ← Voltar ao app
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Pendentes', count: counts.pending, color: 'yellow', key: 'pending' },
            { label: 'Aprovados', count: counts.approved, color: 'green', key: 'approved' },
            { label: 'Negados', count: counts.rejected, color: 'red', key: 'rejected' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key as typeof filter)}
              className={`p-4 rounded-xl border text-left transition-all ${
                filter === s.key ? 'border-[#f0b429] bg-[#f0b429]/5' : 'bg-[#14141e] border-[#2a2a3e] hover:border-[#3a3a5e]'
              }`}
            >
              <div className={`text-2xl font-bold ${
                s.color === 'yellow' ? 'text-yellow-400' :
                s.color === 'green' ? 'text-green-400' : 'text-red-400'
              }`}>{s.count}</div>
              <div className="text-xs text-[#888898] mt-1">{s.label}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilter('all')}
          className={`mb-4 text-xs px-3 py-1 rounded-full border transition-colors ${
            filter === 'all' ? 'border-[#f0b429] text-[#f0b429]' : 'border-[#2a2a3e] text-[#888898]'
          }`}
        >
          Ver todos ({users.length})
        </button>

        {/* Table */}
        <div className="bg-[#14141e] border border-[#2a2a3e] rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-[#888898]">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#888898]">Nenhum usuário encontrado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3e]">
                  <th className="text-left py-3 px-4 text-xs text-[#888898] font-medium">E-mail</th>
                  <th className="text-left py-3 px-4 text-xs text-[#888898] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-[#888898] font-medium">Perfil</th>
                  <th className="text-left py-3 px-4 text-xs text-[#888898] font-medium">Cadastro</th>
                  <th className="py-3 px-4 text-xs text-[#888898] font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id} className="border-b border-[#1e1e2e] hover:bg-[#1e1e2e]/50 transition-colors">
                    <td className="py-3 px-4 text-[#e8e8f0]">{u.email}</td>
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
                        className={`text-xs px-2 py-1 rounded-lg border bg-[#1e1e2e] transition-colors cursor-pointer ${
                          u.role === 'admin'
                            ? 'border-[#f0b429]/50 text-[#f0b429]'
                            : 'border-[#2a2a3e] text-[#888898]'
                        }`}
                      >
                        <option value="user">👤 Usuário</option>
                        <option value="admin">⭐ Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[#888898] text-xs">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {u.status !== 'approved' && (
                          <button
                            onClick={() => setStatus(u.user_id, 'approved')}
                            className="px-3 py-1 bg-green-900/50 hover:bg-green-800 text-green-300 rounded-lg text-xs transition-colors"
                          >
                            ✅ Aprovar
                          </button>
                        )}
                        {u.status !== 'rejected' && (
                          <button
                            onClick={() => setStatus(u.user_id, 'rejected')}
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
