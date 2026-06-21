'use client'

import { useState } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { SECOES_ORDER, SECOES_LABELS } from '@/lib/prompt-generator'

type Tab = 'secoes' | 'raw' | 'historico'

const btn = 'px-4 py-2.5 rounded-xl text-sm transition-colors border'

export default function PromptOutput() {
  const [tab, setTab] = useState<Tab>('secoes')
  const { fullPrompt, secaoContent, genCount, updateSecao, gerar, desfazer, historico, favs, toggleFav, generationStack, idioma, setIdioma } = usePromptStore()

  const chars = fullPrompt.length
  const tokens = Math.round(chars / 4.5)

  async function copiar() {
    if (!fullPrompt) return
    await navigator.clipboard.writeText(fullPrompt)
  }

  const surfaceStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Actions bar */}
      <div className="flex-none p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => gerar(false)}
            className="flex-1 min-w-[120px] py-2.5 text-black font-bold rounded-xl text-sm transition-colors"
            style={{ background: 'var(--gold)' }}>
            ✨ Gerar Prompt
          </button>
          <button onClick={() => gerar(true)} title="Variação aleatória"
            className={btn} style={{ ...surfaceStyle, color: 'var(--gold)' }}>
            🎲
          </button>
          <button onClick={desfazer} disabled={generationStack.length === 0} title="Desfazer"
            className={`${btn} disabled:opacity-30`} style={surfaceStyle}>
            ↩
          </button>
          <button onClick={() => setIdioma(idioma === 'pt' ? 'en' : 'pt')} title="Alternar idioma"
            className={btn} style={surfaceStyle}>
            {idioma === 'pt' ? '🇧🇷' : '🇺🇸'}
          </button>
          {fullPrompt && (
            <button onClick={copiar} className={btn} style={{ ...surfaceStyle, color: 'var(--text)' }}>
              📋 Copiar
            </button>
          )}
        </div>
        {fullPrompt && (
          <div className="flex gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>#{genCount}</span>
            <span>{chars} chars</span>
            <span>~{tokens} tokens</span>
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
            {t === 'secoes' ? '✏️ Seções' : t === 'raw' ? '📄 Prompt Completo' : `📚 Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
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

        {tab === 'raw' && (
          <div className="p-4 h-full">
            {!fullPrompt ? <EmptyState /> : (
              <textarea value={fullPrompt} readOnly
                className="w-full min-h-[400px] rounded-xl p-4 text-xs font-mono resize-none leading-relaxed border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            )}
          </div>
        )}

        {tab === 'historico' && (
          <div className="p-4 space-y-3">
            {historico.length === 0 ? <EmptyState msg="Nenhum prompt gerado ainda" /> : (
              historico.map(h => (
                <div key={h.ts} className="rounded-xl p-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                        <span>{new Date(h.ts).toLocaleString('pt-BR')}</span>
                        <span>·</span><span>{h.tipo}</span>
                        {h.nome && <><span>·</span><span>{h.nome}</span></>}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{h.text.slice(0, 120)}...</p>
                    </div>
                    <div className="flex gap-1.5 flex-none">
                      <button onClick={() => toggleFav(h.ts)}
                        className={`p-1.5 rounded-lg text-sm transition-colors ${favs.includes(h.ts) ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                        style={{ color: favs.includes(h.ts) ? undefined : 'var(--text-muted)' }}>
                        {favs.includes(h.ts) ? '⭐' : '☆'}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(h.text)}
                        className="p-1.5 rounded-lg text-xs transition-colors hover:text-[var(--text)]"
                        style={{ color: 'var(--text-muted)' }}>
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
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
            style={{ background: 'transparent', color: 'var(--text)' }}
          />
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
    </div>
  )
}
