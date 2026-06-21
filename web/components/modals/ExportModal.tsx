'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import { usePromptStore } from '@/store/promptStore'
import { useAuthStore } from '@/store/authStore'
import { buildZip, downloadBlob } from '@/lib/zip-builder'

type SyncStatus = 'idle' | 'saving' | 'loading' | 'ok' | 'err'
type NotifPerm = 'default' | 'granted' | 'denied'

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const { fullPrompt, historico, form, ferramenta, idioma, intensidade, tipo, modo, paleta, acao, angulo,
    partidas, profiles, templates, frasesSalvas, adversarios, genCount, favs, tags,
  } = usePromptStore()
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncMsg, setSyncMsg] = useState('')
  const [notifPerm, setNotifPerm] = useState<NotifPerm>('default')
  const importRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)
  const importHistRef = useRef<HTMLInputElement>(null)

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

  function exportarPDF() {
    if (!fullPrompt) return
    const w = window.open('', '_blank')!
    const title = `Prompt Master — ${form.adv || 'Arte'} — ${form.data || ''}`
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:monospace;background:#fff;color:#111;padding:40px;max-width:820px;margin:auto;font-size:13px;line-height:1.7}
pre{white-space:pre-wrap;word-break:break-word}h2{font-family:Arial;font-size:18px;margin-bottom:6px;color:#b8860b}
.meta{font-size:12px;color:#888;margin-bottom:24px}hr{border:none;border-top:1px solid #eee;margin:20px 0}
</style></head><body>
<h2>⚽ Prompt Master Futsal</h2>
<p class="meta">Atleta: ${form.nome || '-'} · Adversário: ${form.adv || '-'} · Data: ${form.data || '-'} · Geração #${genCount}</p>
<hr><pre>${fullPrompt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 300)
  }

  async function exportarKit() {
    const enc = new TextEncoder()
    const files: { name: string; data: Uint8Array }[] = []
    const slug = (form.adv || 'arte').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (fullPrompt) files.push({ name: `prompt-${slug}.txt`, data: enc.encode(fullPrompt) })

    // images stored as base64 in localStorage
    for (const [key, lsKey] of [['atleta', 'pm_img_atleta'], ['logo1', 'pm_img_logo1'], ['logo2', 'pm_img_logo2']] as const) {
      const b64 = localStorage.getItem(lsKey)
      if (!b64) continue
      const bin = atob(b64.replace(/^data:image\/\w+;base64,/, ''))
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      const label = key === 'atleta' ? 'foto-atleta' : key === 'logo1' ? 'escudo-clube' : 'escudo-adversario'
      files.push({ name: `${label}-${slug}.jpg`, data: arr })
    }

    if (!files.length) return
    const zip = buildZip(files)
    downloadBlob(zip, `kit-${slug}.zip`, 'application/zip')
  }

  function shareWhatsApp() {
    const text = fullPrompt.length > 4000 ? fullPrompt.slice(0, 3900) + '\n\n[...prompt truncado]' : fullPrompt
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function downloadHistorico() {
    const json = JSON.stringify(historico, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `historico-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function exportarConfig() {
    const config = {
      nome: form.nome, clube: form.clube, categoria: form.categoria,
      campeonato: form.campeonato, uniforme1: form.uniforme1, uniforme2: form.uniforme2,
      ferramenta, idioma, intensidade, tipo, modo, paleta, acao, angulo,
      exportadoEm: new Date().toISOString(), versao: 'web-v1',
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `config-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function importarConfig(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const c = JSON.parse(ev.target!.result as string)
        const s = usePromptStore.getState()
        if (c.nome !== undefined) s.setForm({ nome: c.nome })
        if (c.clube !== undefined) s.setForm({ clube: c.clube })
        if (c.categoria !== undefined) s.setForm({ categoria: c.categoria })
        if (c.campeonato !== undefined) s.setForm({ campeonato: c.campeonato })
        if (c.uniforme1 !== undefined) s.setForm({ uniforme1: c.uniforme1 })
        if (c.uniforme2 !== undefined) s.setForm({ uniforme2: c.uniforme2 })
        if (c.ferramenta) s.setFerramenta(c.ferramenta)
        if (c.idioma) s.setIdioma(c.idioma)
        if (c.intensidade) s.setIntensidade(c.intensidade)
        if (c.tipo) s.setTipo(c.tipo)
        if (c.modo) s.setModo(c.modo)
        if (c.paleta) s.setPaleta(c.paleta)
        if (c.acao) s.setAcao(c.acao)
        if (c.angulo) s.setAngulo(c.angulo)
      } catch { /* invalid file */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function exportarBackup() {
    const s = usePromptStore.getState()
    const backup = {
      _exportadoEm: new Date().toISOString(), _versao: 'web-v1',
      form: s.form, idioma: s.idioma, intensidade: s.intensidade, modo: s.modo,
      tipo: s.tipo, ferramenta: s.ferramenta, paleta: s.paleta, acao: s.acao, angulo: s.angulo,
      historico: s.historico, favs: s.favs, tags: s.tags,
      partidas: s.partidas, profiles: s.profiles, templates: s.templates,
      frasesSalvas: s.frasesSalvas, adversarios: s.adversarios, genCount: s.genCount,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `backup-pm-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  function importarHistorico(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target!.result as string)
        const arr = Array.isArray(imported) ? imported : imported.historico
        if (!Array.isArray(arr)) return
        const s = usePromptStore.getState()
        const merged = [...arr, ...s.historico]
          .filter((h, i, all) => all.findIndex(x => x.ts === h.ts) === i)
          .sort((a, b) => b.ts - a.ts)
          .slice(0, 200)
        usePromptStore.setState({ historico: merged })
      } catch { /* invalid */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function importarBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target!.result as string)
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
      } catch { /* invalid file */ }
    }
    reader.readAsText(file)
    e.target.value = ''
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
      const s = usePromptStore.getState()
      const data = {
        form: s.form, idioma: s.idioma, intensidade: s.intensidade, modo: s.modo,
        tipo: s.tipo, ferramenta: s.ferramenta, paleta: s.paleta, acao: s.acao, angulo: s.angulo,
        historico: s.historico, favs: s.favs, tags: s.tags, partidas: s.partidas,
        profiles: s.profiles, templates: s.templates, frasesSalvas: s.frasesSalvas,
        adversarios: s.adversarios, genCount: s.genCount,
      }
      const res = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) })
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
      const d = json.data; const s = usePromptStore.getState()
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
      setSyncStatus('err'); setSyncMsg('Erro ao carregar.')
    }
  }

  const isBusy = syncStatus === 'saving' || syncStatus === 'loading'
  const surfaceStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal title="📤 Exportar & Sincronizar" onClose={onClose}>

      <Section title="Exportar prompt">
        {!fullPrompt ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gere um prompt primeiro para exportar.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <ExportBtn icon={copied ? '✅' : '📋'} label={copied ? 'Copiado!' : 'Copiar'} onClick={copiar} />
            <ExportBtn icon="📄" label=".txt" onClick={downloadTxt} />
            <ExportBtn icon="🖨️" label="PDF" onClick={exportarPDF} />
            <ExportBtn icon="💬" label="WhatsApp" onClick={shareWhatsApp} />
          </div>
        )}
        {fullPrompt && (
          <button onClick={exportarKit}
            className="mt-2 w-full py-2 text-xs rounded-lg border transition-colors"
            style={surfaceStyle}>
            📦 Exportar Kit (.zip com prompt + imagens)
          </button>
        )}
      </Section>

      <Divider />

      <Section title="Config & Backup local">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={exportarConfig} className="py-2 text-xs rounded-lg border transition-colors" style={surfaceStyle}>
            ⬇️ Exportar config
          </button>
          <button onClick={() => importRef.current?.click()} className="py-2 text-xs rounded-lg border transition-colors" style={surfaceStyle}>
            ⬆️ Importar config
          </button>
          <button onClick={exportarBackup} className="py-2 text-xs rounded-lg border transition-colors" style={surfaceStyle}>
            💿 Backup completo
          </button>
          <button onClick={() => backupRef.current?.click()} className="py-2 text-xs rounded-lg border transition-colors" style={surfaceStyle}>
            📀 Restaurar backup
          </button>
        </div>
        <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importarConfig} />
        <input ref={backupRef} type="file" accept=".json" className="hidden" onChange={importarBackup} />
      </Section>

      <Divider />

      <Section title="Exportar histórico">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {historico.length} prompt{historico.length !== 1 ? 's' : ''} salvos
          </p>
          <div className="flex gap-2">
            <button onClick={downloadHistorico} disabled={historico.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
              style={surfaceStyle}>
              ⬇️ Baixar
            </button>
            <button onClick={() => importHistRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={surfaceStyle}>
              ⬆️ Importar
            </button>
          </div>
        </div>
        <input ref={importHistRef} type="file" accept=".json" className="hidden" onChange={importarHistorico} />
      </Section>

      <Divider />

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
