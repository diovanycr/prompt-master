'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { usePromptStore } from '@/store/promptStore'
import { useAuthStore } from '@/store/authStore'

type SyncStatus = 'idle' | 'saving' | 'loading' | 'ok' | 'err'
type NotifPerm = 'default' | 'granted' | 'denied'

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const { fullPrompt, historico } = usePromptStore()
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncMsg, setSyncMsg] = useState('')
  const [notifPerm, setNotifPerm] = useState<NotifPerm>('default')

  useEffect(() => {
    if ('Notification' in window) setNotifPerm(Notification.permission as NotifPerm)
  }, [])

  async function copiar() {
    await navigator.clipboard.writeText(fullPrompt)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function downloadTxt() {
    const blob = new Blob([fullPrompt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `prompt-${new Date().toISOString().slice(0, 10)}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  function downloadHistorico() {
    const json = JSON.stringify(historico, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `historico-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function shareWhatsApp() {
    const text = fullPrompt.length > 4000 ? fullPrompt.slice(0, 3900) + '\n\n[...prompt truncado]' : fullPrompt
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function ativarNotificacoes() {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    setNotifPerm(perm as NotifPerm)
    if (perm === 'granted') {
      new Notification('⚽ Prompt Master Futsal', {
        body: 'Notificações ativadas! Você receberá lembretes antes dos jogos.',
        icon: '/icon-192.png',
      })
    }
  }

  async function syncUp() {
    if (!user) return
    setSyncStatus('saving'); setSyncMsg('')
    try {
      const store = usePromptStore.getState()
      const data = {
        form: store.form, idioma: store.idioma, intensidade: store.intensidade,
        modo: store.modo, tipo: store.tipo, ferramenta: store.ferramenta,
        paleta: store.paleta, acao: store.acao, angulo: store.angulo,
        historico: store.historico, favs: store.favs, tags: store.tags,
        partidas: store.partidas, profiles: store.profiles,
        templates: store.templates, frasesSalvas: store.frasesSalvas,
        adversarios: store.adversarios, genCount: store.genCount,
      }
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      if (!res.ok) throw new Error()
      setSyncStatus('ok'); setSyncMsg('Dados salvos na nuvem!')
    } catch {
      setSyncStatus('err'); setSyncMsg('Erro ao salvar. Verifique se a tabela user_data existe no Supabase.')
    }
  }

  async function syncDown() {
    if (!user) return
    setSyncStatus('loading'); setSyncMsg('')
    try {
      const res = await fetch('/api/sync')
      if (!res.ok) throw new Error()
      const json = await res.json()
      if (!json.data) { setSyncStatus('err'); setSyncMsg('Nenhum dado encontrado na nuvem.'); return }
      const d = json.data
      const s = usePromptStore.getState()
      usePromptStore.setState({
        form: d.form ?? s.form, idioma: d.idioma ?? s.idioma,
        intensidade: d.intensidade ?? s.intensidade, modo: d.modo ?? s.modo,
        tipo: d.tipo ?? s.tipo, ferramenta: d.ferramenta ?? s.ferramenta,
        paleta: d.paleta ?? s.paleta, acao: d.acao ?? s.acao, angulo: d.angulo ?? s.angulo,
        historico: d.historico ?? s.historico, favs: d.favs ?? s.favs,
        tags: d.tags ?? s.tags, partidas: d.partidas ?? s.partidas,
        profiles: d.profiles ?? s.profiles, templates: d.templates ?? s.templates,
        frasesSalvas: d.frasesSalvas ?? s.frasesSalvas,
        adversarios: d.adversarios ?? s.adversarios, genCount: d.genCount ?? s.genCount,
      })
      setSyncStatus('ok')
      setSyncMsg(`Carregado! Sinc: ${new Date(json.updated_at).toLocaleString('pt-BR')}`)
    } catch {
      setSyncStatus('err'); setSyncMsg('Erro ao carregar. Verifique se a tabela user_data existe no Supabase.')
    }
  }

  const isBusy = syncStatus === 'saving' || syncStatus === 'loading'
  const surfaceStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal title="📤 Exportar & Sincronizar" onClose={onClose}>

      {/* Exportar prompt */}
      <Section title="Exportar prompt">
        {!fullPrompt ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gere um prompt primeiro para exportar.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <ExportBtn icon={copied ? '✅' : '📋'} label={copied ? 'Copiado!' : 'Copiar'} onClick={copiar} />
            <ExportBtn icon="📄" label="Baixar .txt" onClick={downloadTxt} />
            <ExportBtn icon="💬" label="WhatsApp" onClick={shareWhatsApp} />
          </div>
        )}
      </Section>

      <Divider />

      {/* Histórico */}
      <Section title="Exportar histórico">
        <div className="flex items-center justify-between">
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {historico.length} prompt{historico.length !== 1 ? 's' : ''} salvos
          </p>
          <button onClick={downloadHistorico} disabled={historico.length === 0}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
            style={surfaceStyle}>
            ⬇️ Baixar histórico (.json)
          </button>
        </div>
      </Section>

      <Divider />

      {/* Sincronização */}
      <Section title="Sincronização na nuvem">
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
          Salva partidas, perfis, histórico, templates e configurações no Supabase.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={syncUp} disabled={isBusy}
            className="py-2.5 rounded-xl text-sm border transition-colors disabled:opacity-40"
            style={surfaceStyle}>
            {syncStatus === 'saving' ? '⏳ Salvando...' : '☁️ Salvar na nuvem'}
          </button>
          <button onClick={syncDown} disabled={isBusy}
            className="py-2.5 rounded-xl text-sm border transition-colors disabled:opacity-40"
            style={surfaceStyle}>
            {syncStatus === 'loading' ? '⏳ Carregando...' : '⬇️ Carregar da nuvem'}
          </button>
        </div>
        {syncMsg && (
          <p className={`text-xs mt-2 text-center ${syncStatus === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {syncStatus === 'ok' ? '✅ ' : '❌ '}{syncMsg}
          </p>
        )}
      </Section>

      <Divider />

      {/* Notificações */}
      <Section title="Notificações de jogos">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {notifPerm === 'granted'
              ? '✅ Ativas — você será notificado no dia do jogo e na véspera.'
              : notifPerm === 'denied'
                ? '❌ Bloqueadas no navegador. Permita nas configurações do browser.'
                : 'Receba alertas automáticos antes de cada partida cadastrada.'}
          </p>
          {notifPerm !== 'granted' && notifPerm !== 'denied' && (
            <button onClick={ativarNotificacoes}
              className="flex-none text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={{ background: 'var(--gold)', borderColor: 'var(--gold)', color: '#000', fontWeight: 600 }}>
              🔔 Ativar
            </button>
          )}
        </div>
      </Section>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="border-t my-4" style={{ borderColor: 'var(--border)' }} />
}

function ExportBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-colors"
      style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
