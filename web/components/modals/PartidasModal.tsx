'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { usePromptStore } from '@/store/promptStore'
import type { ModoJogo, Partida } from '@/types'

async function agendarNotificacao(p: Partida) {
  if (!('Notification' in window)) return alert('Notificações não suportadas neste navegador.')
  let perm = Notification.permission
  if (perm === 'default') perm = await Notification.requestPermission()
  if (perm !== 'granted') return alert('Permissão de notificações negada. Ative nas configurações do browser.')

  if (p.hora) {
    // Agenda notificação 2h antes do horário do jogo (apenas nesta sessão)
    const [hh, mm] = p.hora.split(':').map(Number)
    const gameTime = new Date(p.data + 'T00:00:00')
    gameTime.setHours(hh || 0, mm || 0, 0, 0)
    const notifTime = new Date(gameTime.getTime() - 2 * 60 * 60 * 1000)
    const delay = notifTime.getTime() - Date.now()
    if (delay > 0) {
      const horas = Math.round(delay / 3600000)
      setTimeout(() => {
        new Notification('⚽ Jogo em 2 horas!', {
          body: `${p.adv} — ${p.hora}${p.local ? ` em ${p.local}` : ''}. Crie as artes agora!`,
          icon: '/icon-192.png',
        })
      }, delay)
      alert(`🔔 Lembrete agendado para ~${horas}h antes do jogo (válido nesta aba).`)
      return
    }
  }

  // Fallback: notificação imediata como prévia
  const data = new Date(p.data + 'T00:00:00')
  const diff = Math.round((data.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
  const when = diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : `em ${diff} dias`
  new Notification('⚽ Lembrete de Jogo!', {
    body: `Partida vs ${p.adv} é ${when}${p.hora ? ` às ${p.hora}` : ''}${p.local ? ` em ${p.local}` : ''}. Prepare as artes!`,
    icon: '/icon-192.png',
  })
}

type FormState = { adv: string; data: string; hora: string; local: string; campeonato: string; modo: ModoJogo; golsNos: number; golsAdv: number }
const emptyForm: FormState = { adv: '', data: '', hora: '', local: '', campeonato: '', modo: 'pregame', golsNos: 0, golsAdv: 0 }

export default function PartidasModal({ onClose }: { onClose: () => void }) {
  const { partidas, addPartida, removePartida, loadPartidaToForm, updatePartida } = usePromptStore()
  const [tab, setTab] = useState<'lista' | 'nova'>('lista')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.adv.trim() || !form.data) return
    if (editId) {
      updatePartida(editId, form)
      setEditId(null)
    } else {
      addPartida({ id: crypto.randomUUID(), ts: Date.now(), ...form })
    }
    setForm(emptyForm)
    setTab('lista')
  }

  function startEdit(p: Partida) {
    setForm({ adv: p.adv, data: p.data, hora: p.hora || '', local: p.local || '', campeonato: p.campeonato || '', modo: p.modo, golsNos: p.golsNos ?? 0, golsAdv: p.golsAdv ?? 0 })
    setEditId(p.id)
    setTab('nova')
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const sorted = [...partidas].sort((a, b) => {
    const da = new Date(a.data), db = new Date(b.data)
    const fa = da >= hoje, fb = db >= hoje
    if (fa && !fb) return -1
    if (!fa && fb) return 1
    return fa ? da.getTime() - db.getTime() : db.getTime() - da.getTime()
  })

  function diasLabel(data: string) {
    const d = new Date(data + 'T00:00:00')
    const diff = Math.round((d.getTime() - hoje.getTime()) / 86400000)
    if (diff === 0) return '🔥 Hoje!'
    if (diff === 1) return 'Amanhã'
    if (diff > 1) return `em ${diff}d`
    if (diff === -1) return 'Ontem'
    return `há ${Math.abs(diff)}d`
  }

  const inputStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal title="📅 Partidas" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        {(['lista', 'nova'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === 'lista') { setEditId(null); setForm(emptyForm) } }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              background: tab === t ? 'var(--gold)' : 'var(--surface2)',
              borderColor: tab === t ? 'var(--gold)' : 'var(--border)',
              color: tab === t ? '#000' : 'var(--text-muted)',
            }}>
            {t === 'lista' ? `📋 Lista (${partidas.length})` : editId ? '✏️ Editar partida' : '➕ Nova partida'}
          </button>
        ))}
      </div>

      {tab === 'lista' && (
        sorted.length === 0
          ? <p className="text-center text-sm py-10" style={{ color: 'var(--text-muted)' }}>Nenhuma partida cadastrada</p>
          : <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {sorted.map(p => {
                const isFuture = new Date(p.data + 'T00:00:00') >= hoje
                const resultado = p.modo === 'postgame' && p.golsNos != null
                  ? p.golsNos! > p.golsAdv! ? '🏆 Vitória' : p.golsNos! < p.golsAdv! ? '❌ Derrota' : '🤝 Empate'
                  : null
                return (
                  <div key={p.id} className="rounded-xl p-3 border"
                    style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                            vs {p.adv}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            isFuture ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-800 text-gray-400'
                          }`}>{diasLabel(p.data)}</span>
                          {resultado && <span className="text-[10px]">{resultado}</span>}
                        </div>
                        <div className="text-[10px] flex flex-wrap gap-x-2 gap-y-0.5" style={{ color: 'var(--text-muted)' }}>
                          <span>📅 {new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          {p.hora && <span>🕒 {p.hora}</span>}
                          {p.local && <span>📍 {p.local}</span>}
                          {p.campeonato && <span>🏆 {p.campeonato}</span>}
                          {p.modo === 'postgame' && p.golsNos != null && (
                            <span>Placar: {p.golsNos} × {p.golsAdv}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-none mt-0.5">
                        {isFuture && (
                          <button onClick={() => agendarNotificacao(p)}
                            title="Receber lembrete desta partida"
                            className="text-[10px] px-2 py-1 rounded-lg border transition-colors"
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            🔔
                          </button>
                        )}
                        <button onClick={() => startEdit(p)}
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                          title="Editar partida">
                          ✏️
                        </button>
                        <button onClick={() => { loadPartidaToForm(p.id); onClose() }}
                          className="text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-colors"
                          style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                          Usar
                        </button>
                        <button onClick={() => removePartida(p.id)}
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors text-red-400"
                          style={{ borderColor: '#7f1d1d' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
      )}

      {tab === 'nova' && (
        <form onSubmit={handleAdd} className="space-y-3">
          <F label="Adversário *">
            <input type="text" required placeholder="Ex: Santos FC"
              value={form.adv} onChange={e => setForm(f => ({ ...f, adv: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label="Data *">
              <input type="date" required
                value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
            </F>
            <F label="Horário">
              <input type="time"
                value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
            </F>
          </div>
          <F label="Local">
            <input type="text" placeholder="Ex: Ginásio Municipal"
              value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
          </F>
          <F label="Campeonato">
            <input type="text" placeholder="Ex: Liga Paulista 2026"
              value={form.campeonato} onChange={e => setForm(f => ({ ...f, campeonato: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
          </F>
          <F label="Modo">
            <div className="grid grid-cols-2 gap-2">
              {(['pregame', 'postgame'] as ModoJogo[]).map(m => (
                <button key={m} type="button" onClick={() => setForm(f => ({ ...f, modo: m }))}
                  className="py-2 rounded-lg text-xs border transition-colors"
                  style={{
                    borderColor: form.modo === m ? 'var(--gold)' : 'var(--border)',
                    color: form.modo === m ? 'var(--gold)' : 'var(--text-muted)',
                  }}>
                  {m === 'pregame' ? '⚡ Pré-jogo' : '🏁 Pós-jogo'}
                </button>
              ))}
            </div>
          </F>
          {form.modo === 'postgame' && (
            <div className="grid grid-cols-2 gap-2">
              <F label="Gols (Nós)">
                <input type="number" min={0}
                  value={form.golsNos} onChange={e => setForm(f => ({ ...f, golsNos: Number(e.target.value) }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
              </F>
              <F label="Gols (Adv.)">
                <input type="number" min={0}
                  value={form.golsAdv} onChange={e => setForm(f => ({ ...f, golsAdv: Number(e.target.value) }))}
                  className="w-full rounded-lg px-3 py-2 text-sm border" style={inputStyle} />
              </F>
            </div>
          )}
          <button type="submit"
            className="w-full py-2.5 text-black font-bold rounded-lg text-sm transition-colors mt-1"
            style={{ background: 'var(--gold)' }}>
            {editId ? '💾 Salvar alterações' : '➕ Adicionar Partida'}
          </button>
        </form>
      )}
    </Modal>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}
