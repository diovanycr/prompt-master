'use client'

import { useState, useRef } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { SECOES_ORDER, SECOES_LABELS } from '@/lib/prompt-generator'
import { compressImage } from '@/lib/compress-image'
import ExportModal from '@/components/modals/ExportModal'
import LoteModal from '@/components/modals/LoteModal'
import StatsModal from '@/components/modals/StatsModal'

type Tab = 'secoes' | 'raw' | 'historico'

const btn = 'px-3 py-2 rounded-xl text-sm transition-colors border'

export default function PromptOutput() {
  const [tab, setTab] = useState<Tab>('secoes')
  const [showExport, setShowExport] = useState(false)
  const [showAB, setShowAB] = useState(false)
  const [showLote, setShowLote] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroFav, setFiltroFav] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    fullPrompt, secaoContent, genCount, updateSecao,
    gerar, desfazer, historico, favs, toggleFav,
    generationStack, idioma, setIdioma,
  } = usePromptStore()

  const chars = fullPrompt.length
  const tokens = Math.round(chars / 4.5)

  async function copiar() {
    if (!fullPrompt) return
    await navigator.clipboard.writeText(fullPrompt)
  }

  const historicoFiltrado = historico.filter(h => {
    if (filtroFav && !favs.includes(h.ts)) return false
    if (filtroTipo && h.tipo !== filtroTipo) return false
    if (busca.trim()) {
      const q = busca.toLowerCase()
      return (
        h.nome?.toLowerCase().includes(q) ||
        h.clube?.toLowerCase().includes(q) ||
        h.adv?.toLowerCase().includes(q) ||
        h.text.toLowerCase().includes(q)
      )
    }
    return true
  })

  const surfaceStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Modals */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showAB && <LoteModal initialTab="ab" onClose={() => setShowAB(false)} />}
      {showLote && <LoteModal initialTab="lote" onClose={() => setShowLote(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}

      {/* Actions bar */}
      <div className="flex-none p-3 border-b space-y-2" style={{ borderColor: 'var(--border)' }}>
        {/* Row 1: generate actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => gerar(false)}
            className="flex-1 min-w-[110px] py-2.5 text-black font-bold rounded-xl text-sm transition-colors"
            style={{ background: 'var(--gold)' }}
            title="Ctrl+Enter">
            ✨ Gerar
          </button>
          <button onClick={() => gerar(true)} title="Ctrl+Shift+Enter — Variação aleatória"
            className={btn} style={{ ...surfaceStyle, color: 'var(--gold)' }}>
            🎲
          </button>
          <button onClick={desfazer} disabled={generationStack.length === 0} title="Ctrl+Z — Desfazer"
            className={`${btn} disabled:opacity-30`} style={surfaceStyle}>
            ↩
          </button>
          <button onClick={() => setIdioma(idioma === 'pt' ? 'en' : 'pt')} title="Ctrl+L — Alternar idioma"
            className={btn} style={surfaceStyle}>
            {idioma === 'pt' ? '🇧🇷' : '🇺🇸'}
          </button>
          <button onClick={() => setShowAB(true)} title="Modo A/B — gerar 2 variações lado a lado"
            className={btn} style={surfaceStyle}>
            ⚔️ A/B
          </button>
          <button onClick={() => setShowLote(true)} title="Gerar 5 variações de uma vez"
            className={btn} style={surfaceStyle}>
            🎲×5
          </button>
        </div>
        {/* Row 2: output actions */}
        {fullPrompt && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={copiar} className={btn} style={surfaceStyle}>
              📋 Copiar
            </button>
            <button onClick={() => setShowExport(true)} className={btn} style={surfaceStyle}>
              📤 Exportar
            </button>
            <button onClick={() => setShowStats(true)} className={btn} style={surfaceStyle}>
              📊 Stats
            </button>
            <div className="flex gap-3 items-center ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span>#{genCount}</span>
              <span>{chars} chars</span>
              <span>~{tokens} tokens</span>
            </div>
          </div>
        )}
        {!fullPrompt && (
          <div className="flex justify-end">
            <button onClick={() => setShowStats(true)} className={btn} style={surfaceStyle}>
              📊 Stats
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-none flex border-b" style={{ borderColor: 'var(--border)' }}>
        {(['secoes', 'raw', 'historico'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-xs font-medium border-b-2 transition-colors"
            style={{
              borderColor: tab === t ? 'var(--gold)' : 'transparent',
              color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
            }}>
            {t === 'secoes' ? '✏️ Seções' : t === 'raw' ? '📄 Completo' : `📚 Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Seções */}
        {tab === 'secoes' && (
          <div className="p-4 space-y-3">
            {!Object.keys(secaoContent).length ? <EmptyState /> : (
              SECOES_ORDER.map(key => {
                const content = secaoContent[key as keyof typeof secaoContent]
                if (!content) return null
                return <SecaoCard key={key} title={SECOES_LABELS[key]} value={content} onChange={v => updateSecao(key, v)} />
              })
            )}
          </div>
        )}

        {/* Raw */}
        {tab === 'raw' && (
          <div className="p-4">
            {!fullPrompt ? <EmptyState /> : (
              <textarea value={fullPrompt} readOnly
                className="w-full min-h-[400px] rounded-xl p-4 text-xs font-mono resize-none leading-relaxed border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            )}
          </div>
        )}

        {/* Histórico */}
        {tab === 'historico' && (
          <div className="flex flex-col h-full">
            {/* Search + filters */}
            <div className="px-4 pt-4 pb-2 space-y-2 flex-none border-b" style={{ borderColor: 'var(--border)' }}>
              <input
                type="search" value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por atleta, clube, adversário, texto..."
                className="w-full rounded-lg px-3 py-2 text-xs border"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-1.5 flex-wrap pb-1">
                <Pill active={!filtroFav && !filtroTipo} onClick={() => { setFiltroFav(false); setFiltroTipo('') }}>
                  Todos ({historico.length})
                </Pill>
                <Pill active={filtroFav} onClick={() => { setFiltroFav(v => !v); setFiltroTipo('') }}>
                  ⭐ Favoritos ({favs.length})
                </Pill>
                {[
                  ['Instagram Story 9:16', 'Story'],
                  ['Feed Instagram 4:5', 'Feed'],
                  ['Banner horizontal', 'Banner'],
                  ['Card MVP', 'MVP'],
                  ['Card Convocação', 'Conv.'],
                ].map(([tipo, label]) => (
                  <Pill key={tipo} active={filtroTipo === tipo}
                    onClick={() => { setFiltroTipo(t => t === tipo ? '' : tipo); setFiltroFav(false) }}>
                    {label}
                  </Pill>
                ))}
              </div>
              {(busca || filtroFav || filtroTipo) && (
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {historicoFiltrado.length} resultado{historicoFiltrado.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
              {historico.length === 0 ? (
                <EmptyState msg="Nenhum prompt gerado ainda" />
              ) : historicoFiltrado.length === 0 ? (
                <EmptyState msg="Nenhum resultado para essa busca" />
              ) : (
                historicoFiltrado.map(h => (
                  <div key={h.ts} className="rounded-xl p-3 border"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-1.5 text-[10px] mb-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                          <span>{new Date(h.ts).toLocaleString('pt-BR')}</span>
                          <span>·</span><span>{h.tipo}</span>
                          {h.nome && <><span>·</span><span>{h.nome}</span></>}
                          {h.ferramenta && <><span>·</span><span>{h.ferramenta}</span></>}
                          {h.idioma && h.idioma === 'en' && <span className="text-blue-400">🇺🇸</span>}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {h.text.slice(0, 130)}...
                        </p>
                      </div>
                      <ResultPhoto ts={h.ts} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => toggleFav(h.ts)}
                        className="p-1.5 rounded-lg text-sm transition-colors"
                        style={{ color: favs.includes(h.ts) ? '#facc15' : 'var(--text-muted)' }}>
                        {favs.includes(h.ts) ? '⭐' : '☆'}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(h.text)}
                        className="p-1.5 rounded-lg text-xs transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Copiar prompt">
                        📋
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultPhoto({ ts, refreshKey: _rk, onRefresh }: { ts: number; refreshKey: number; onRefresh: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const b64 = typeof localStorage !== 'undefined' ? localStorage.getItem(`pm_result_${ts}`) : null

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 400)
      localStorage.setItem(`pm_result_${ts}`, compressed)
      onRefresh()
    } catch { /* ignore */ }
  }

  if (b64) {
    return (
      <div className="relative group flex-none">
        <img src={b64} alt="Resultado" className="w-14 h-14 object-cover rounded-lg border"
          style={{ borderColor: 'var(--border)' }} />
        <button
          onClick={() => { localStorage.removeItem(`pm_result_${ts}`); onRefresh() }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex-none">
      <button onClick={() => inputRef.current?.click()}
        className="w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center text-base transition-colors hover:opacity-70"
        style={{ borderColor: 'var(--border)' }}
        title="Adicionar foto do resultado">
        📷
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[10px] border transition-colors"
      style={{
        background: active ? 'var(--gold)' : 'var(--surface2)',
        borderColor: active ? 'var(--gold)' : 'var(--border)',
        color: active ? '#000' : 'var(--text-muted)',
      }}>
      {children}
    </button>
  )
}

function SecaoCard({ title, value, onChange }: { title: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 transition-colors hover:opacity-80">
        <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{title}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <textarea value={value} onChange={e => onChange(e.target.value)} rows={6}
            className="w-full px-3 py-2.5 text-xs font-mono resize-y leading-relaxed"
            style={{ background: 'transparent', color: 'var(--text)' }} />
        </div>
      )}
    </div>
  )
}

function EmptyState({ msg = 'Preencha os dados e clique em Gerar Prompt' }: { msg?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">⚽</div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{msg}</p>
      <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
        Ctrl+Enter para gerar · Ctrl+Shift+Enter para variação aleatória
      </p>
    </div>
  )
}
