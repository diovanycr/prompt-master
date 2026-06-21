'use client'

import { useState, useRef } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { SECOES_ORDER, SECOES_LABELS } from '@/lib/prompt-generator'
import { compressImage } from '@/lib/compress-image'
import ExportModal from '@/components/modals/ExportModal'
import LoteModal from '@/components/modals/LoteModal'
import StatsModal from '@/components/modals/StatsModal'
import type { TagKey } from '@/types'
import { useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'

type Tab = 'secoes' | 'preview' | 'raw' | 'historico'

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
  const [agrupar, setAgrupar] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { toast } = useToast()

  const {
    fullPrompt, secaoContent, genCount, updateSecao,
    gerar, desfazer, historico, favs, toggleFav,
    tags, toggleTag, loadHistoricoEntry,
    generationStack, idioma, setIdioma,
    hasFoto, hasLogo1,
    fullscreen, setFullscreen,
    form, sortearSecao, duplicarHistorico,
  } = usePromptStore()

  // Carrega prompt compartilhado via ?p= na URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const p = params.get('p')
    if (!p) return
    try {
      const bytes = Uint8Array.from(atob(p), c => c.charCodeAt(0))
      const decoded = new TextDecoder().decode(bytes)
      usePromptStore.setState({ secaoContent: { conceito: decoded }, fullPrompt: decoded })
      setTab('raw')
      window.history.replaceState({}, '', window.location.pathname)
    } catch { /* link inválido */ }
  }, [])

  const chars = fullPrompt.length
  const tokens = Math.round(chars / 4.5)

  async function copiar() {
    if (!fullPrompt) return
    await navigator.clipboard.writeText(fullPrompt)
    toast('Prompt copiado!', 'success')
  }

  async function aprimorarComIA() {
    if (!fullPrompt || aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })
      const data = await res.json()
      if (!res.ok || !data.text) {
        toast(data.error || 'Erro ao aprimorar com IA', 'error'); return
      }
      usePromptStore.setState({ fullPrompt: data.text, secaoContent: { conceito: data.text } })
      toast('Prompt aprimorado com IA!', 'success')
    } catch {
      toast('Erro de conexão com a IA', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  function compartilharLink() {
    if (!fullPrompt) return
    try {
      const bytes = new TextEncoder().encode(fullPrompt)
      const b64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
      const url = `${location.origin}${location.pathname}?p=${b64}`
      if (url.length > 8000) { alert('Prompt muito longo para link — use Copiar ou Exportar PDF'); return }
      navigator.clipboard.writeText(url)
      toast('Link copiado!', 'success')
    } catch { /* ignore */ }
  }

  // #tag search support
  const q = busca.trim().toLowerCase()
  const isTagSearch = q.startsWith('#')
  const tagFilter = isTagSearch ? q.slice(1) : null

  const historicoFiltrado = historico.filter(h => {
    if (filtroFav && !favs.includes(h.ts)) return false
    if (filtroTipo && h.tipo !== filtroTipo) return false
    if (isTagSearch && tagFilter) {
      if (tagFilter === 'fav') return favs.includes(h.ts)
      return (tags[h.ts] || []).includes(tagFilter)
    }
    if (q) {
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

      {/* Warn banner: imagens pendentes */}
      {(!hasFoto || !hasLogo1) && (
        <div className="flex-none flex items-center gap-2 px-4 py-2 text-[11px] font-medium border-b"
          style={{
            background: 'color-mix(in srgb, var(--gold) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--gold) 25%, transparent)',
            color: 'var(--gold)',
          }}>
          <span>⚠️</span>
          <span>Pendente: {[!hasFoto && 'foto do atleta', !hasLogo1 && 'escudo do clube'].filter(Boolean).join(', ')}</span>
        </div>
      )}

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
          <button onClick={() => setFullscreen(!fullscreen)} title="Tela cheia — ocultar sidebar"
            className={btn} style={fullscreen ? { ...surfaceStyle, borderColor: 'var(--gold)', color: 'var(--gold)' } : surfaceStyle}>
            {fullscreen ? '⤡' : '⤢'}
          </button>
        </div>
        {/* Row 2: output actions */}
        {fullPrompt && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={copiar} className={btn} style={surfaceStyle} title="Ctrl+C">
              📋 Copiar
            </button>
            <button onClick={() => setShowExport(true)} className={btn} style={surfaceStyle}>
              📤 Exportar
            </button>
            <button onClick={compartilharLink} className={btn} style={surfaceStyle} title="Copia link com o prompt codificado">
              🔗 Link
            </button>
            <button onClick={aprimorarComIA} disabled={aiLoading} className={`${btn} disabled:opacity-50`} style={surfaceStyle} title="Aprimorar prompt com Claude AI">
              {aiLoading ? '⏳' : '🤖'} IA
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
      <div className="flex-none flex border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {(['secoes', 'preview', 'raw', 'historico'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-none px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap"
            style={{
              borderColor: tab === t ? 'var(--gold)' : 'transparent',
              color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
            }}>
            {t === 'secoes' ? '✏️ Seções'
              : t === 'preview' ? '👁️ Preview'
              : t === 'raw' ? '📄 Completo'
              : `📚 Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Seções editáveis */}
        {tab === 'secoes' && (
          <div className="p-4 space-y-3">
            {!Object.keys(secaoContent).length ? <EmptyState /> : (
              SECOES_ORDER.map(key => {
                const content = secaoContent[key as keyof typeof secaoContent]
                if (!content) return null
                return (
                  <SecaoCard key={key} title={SECOES_LABELS[key]} value={content}
                    onChange={v => updateSecao(key, v)}
                    onCopy={() => { navigator.clipboard.writeText(content); toast('Seção copiada!', 'success') }}
                    onSortear={() => { sortearSecao(key); toast('Seção sorteada!', 'success') }}
                  />
                )
              })
            )}
          </div>
        )}

        {/* Preview (read-only formatted cards) */}
        {tab === 'preview' && (
          <div className="p-4 space-y-3">
            {!Object.keys(secaoContent).length ? <EmptyState /> : (
              SECOES_ORDER.map(key => {
                const content = secaoContent[key as keyof typeof secaoContent]
                if (!content) return null
                return (
                  <div key={key} className="rounded-xl overflow-hidden border"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between px-3 py-2 border-b"
                      style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {SECOES_LABELS[key]}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{content.length} chars</span>
                    </div>
                    <pre className="px-4 py-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words"
                      style={{ color: 'var(--text)' }}>
                      {content}
                    </pre>
                  </div>
                )
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
                placeholder="Buscar texto ou #bom #ruim #usado #fav..."
                className="w-full rounded-lg px-3 py-2 text-xs border"
                style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-1.5 flex-wrap pb-1">
                <Pill active={!filtroFav && !filtroTipo && !busca} onClick={() => { setFiltroFav(false); setFiltroTipo(''); setBusca('') }}>
                  Todos ({historico.length})
                </Pill>
                <Pill active={filtroFav} onClick={() => { setFiltroFav(v => !v); setFiltroTipo(''); setBusca('') }}>
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
                    onClick={() => { setFiltroTipo(t => t === tipo ? '' : tipo); setFiltroFav(false); setBusca('') }}>
                    {label}
                  </Pill>
                ))}
                <Pill active={agrupar} onClick={() => setAgrupar(v => !v)}>
                  👤 Agrupar
                </Pill>
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
              ) : agrupar ? (
                // Agrupado por atleta
                (() => {
                  const groups: Record<string, typeof historicoFiltrado> = {}
                  for (const h of historicoFiltrado) {
                    const key = h.nome || '(sem atleta)'
                    if (!groups[key]) groups[key] = []
                    groups[key].push(h)
                  }
                  return Object.entries(groups).map(([nome, items]) => (
                    <div key={nome}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>👤 {nome}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({items.length})</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      </div>
                      <div className="space-y-2 mb-4">
                        {items.map(h => <HistoricoCard key={h.ts} h={h} tags={tags} favs={favs} toggleFav={toggleFav} toggleTag={toggleTag} loadHistoricoEntry={loadHistoricoEntry} setTab={setTab} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} duplicar={() => { duplicarHistorico(h.ts); toast('Prompt duplicado!', 'success') }} onCopy={() => { navigator.clipboard.writeText(h.text); toast('Copiado!', 'success') }} />)}
                      </div>
                    </div>
                  ))
                })()
              ) : (
                historicoFiltrado.map(h => (
                  <HistoricoCard key={h.ts} h={h} tags={tags} favs={favs} toggleFav={toggleFav} toggleTag={toggleTag} loadHistoricoEntry={loadHistoricoEntry} setTab={setTab} refreshKey={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} duplicar={() => { duplicarHistorico(h.ts); toast('Prompt duplicado!', 'success') }} onCopy={() => { navigator.clipboard.writeText(h.text); toast('Copiado!', 'success') }} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HistoricoCard({ h, tags, favs, toggleFav, toggleTag, loadHistoricoEntry, setTab, refreshKey, onRefresh, duplicar, onCopy }: {
  h: { ts: number; text: string; tipo: string; intensidade: string; nome: string; clube: string; adv: string; ferramenta?: string; idioma?: string }
  tags: Record<number, string[]>; favs: number[]
  toggleFav: (ts: number) => void
  toggleTag: (ts: number, key: TagKey) => void
  loadHistoricoEntry: (ts: number) => void
  setTab: (t: 'secoes' | 'preview' | 'raw' | 'historico') => void
  refreshKey: number; onRefresh: () => void
  duplicar: () => void
  onCopy: () => void
}) {
  const entryTags = tags[h.ts] || []
  return (
    <div className="rounded-xl p-3 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1.5 text-[10px] mb-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span>{new Date(h.ts).toLocaleString('pt-BR')}</span>
            <span>·</span><span>{h.tipo}</span>
            {h.nome && <><span>·</span><span>{h.nome}</span></>}
            {h.ferramenta && <><span>·</span><span>{h.ferramenta}</span></>}
            {h.idioma === 'en' && <span className="text-blue-400">🇺🇸</span>}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {h.text.slice(0, 130)}...
          </p>
        </div>
        <ResultPhoto ts={h.ts} refreshKey={refreshKey} onRefresh={onRefresh} />
      </div>

      {/* Actions row */}
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <button onClick={() => toggleFav(h.ts)}
          className="p-1.5 rounded-lg text-sm transition-colors"
          style={{ color: favs.includes(h.ts) ? '#facc15' : 'var(--text-muted)' }}
          title="Favorito">
          {favs.includes(h.ts) ? '⭐' : '☆'}
        </button>
        <TagBtn active={entryTags.includes('bom')} onClick={() => toggleTag(h.ts, 'bom')} title="Resultado bom">👍</TagBtn>
        <TagBtn active={entryTags.includes('ruim')} onClick={() => toggleTag(h.ts, 'ruim')} title="Resultado ruim">👎</TagBtn>
        <TagBtn active={entryTags.includes('usado')} onClick={() => toggleTag(h.ts, 'usado')} title="Já usado">✅</TagBtn>
        <button onClick={onCopy}
          className="p-1.5 rounded-lg text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Copiar prompt">
          📋
        </button>
        <button onClick={duplicar}
          className="p-1.5 rounded-lg text-xs transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Duplicar entrada">
          📑
        </button>
        <button
          onClick={() => { loadHistoricoEntry(h.ts); setTab('secoes') }}
          className="ml-auto px-2.5 py-1 rounded-lg text-[10px] border font-medium transition-colors"
          style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
          title="Carregar este prompt nas seções editáveis">
          Carregar
        </button>
      </div>
    </div>
  )
}

function TagBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded-lg text-sm transition-all"
      style={{ opacity: active ? 1 : 0.35, transform: active ? 'scale(1.1)' : 'scale(1)' }}>
      {children}
    </button>
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

  function ampliar() {
    if (!b64) return
    const w = window.open('', '_blank')!
    w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${b64}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`)
    w.document.close()
  }

  if (b64) {
    return (
      <div className="relative group flex-none">
        <img src={b64} alt="Resultado" onClick={ampliar}
          className="w-14 h-14 object-cover rounded-lg border cursor-pointer"
          style={{ borderColor: 'var(--border)' }}
          title="Clique para ampliar" />
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

function SecaoCard({ title, value, onChange, onCopy, onSortear }: {
  title: string; value: string; onChange: (v: string) => void
  onCopy: () => void; onSortear: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center">
        <button onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center justify-between px-3 py-2.5 transition-colors hover:opacity-80">
          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{title}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
        </button>
        <button onClick={onCopy} title="Copiar seção"
          className="px-2 py-2.5 text-xs transition-colors hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}>
          📋
        </button>
        <button onClick={onSortear} title="Sortear variação desta seção"
          className="px-2 py-2.5 text-xs transition-colors hover:opacity-70 pr-3"
          style={{ color: 'var(--text-muted)' }}>
          🎲
        </button>
      </div>
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
        Ctrl+Enter · Ctrl+Shift+Enter aleatório · Ctrl+C copiar · Ctrl+S salvar partida
      </p>
    </div>
  )
}
