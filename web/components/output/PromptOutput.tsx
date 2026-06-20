'use client'

import { useState } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { SECOES_ORDER, SECOES_LABELS } from '@/lib/prompt-generator'

type Tab = 'secoes' | 'raw' | 'historico'

export default function PromptOutput() {
  const [tab, setTab] = useState<Tab>('secoes')
  const { fullPrompt, secaoContent, genCount, updateSecao, gerar, desfazer, historico, favs, toggleFav, generationStack, idioma, setIdioma } = usePromptStore()

  const chars = fullPrompt.length
  const tokens = Math.round(chars / 4.5)

  async function copiar() {
    if (!fullPrompt) return
    await navigator.clipboard.writeText(fullPrompt)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Actions bar */}
      <div className="flex-none p-4 border-b border-[#2a2a3e]">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => gerar(false)}
            className="flex-1 min-w-[120px] py-2.5 bg-[#f0b429] hover:bg-[#c8860a] text-black font-bold rounded-xl text-sm transition-colors"
          >
            ✨ Gerar Prompt
          </button>
          <button
            onClick={() => gerar(true)}
            className="px-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#f0b429] text-[#f0b429] rounded-xl text-sm transition-colors"
            title="Variação aleatória"
          >
            🎲
          </button>
          <button
            onClick={desfazer}
            disabled={generationStack.length === 0}
            className="px-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#888898] text-[#888898] rounded-xl text-sm transition-colors disabled:opacity-30"
            title="Desfazer"
          >
            ↩
          </button>
          <button
            onClick={() => setIdioma(idioma === 'pt' ? 'en' : 'pt')}
            className="px-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#888898] text-[#888898] rounded-xl text-sm transition-colors"
            title="Alternar idioma"
          >
            {idioma === 'pt' ? '🇧🇷' : '🇺🇸'}
          </button>
          {fullPrompt && (
            <button
              onClick={copiar}
              className="px-4 py-2.5 bg-[#1e1e2e] border border-[#2a2a3e] hover:border-[#f0b429] text-[#e8e8f0] rounded-xl text-sm transition-colors"
            >
              📋 Copiar
            </button>
          )}
        </div>

        {fullPrompt && (
          <div className="flex gap-3 mt-2 text-[10px] text-[#888898]">
            <span>#{genCount}</span>
            <span>{chars} chars</span>
            <span>~{tokens} tokens</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-none flex border-b border-[#2a2a3e]">
        {(['secoes', 'raw', 'historico'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#f0b429] text-[#f0b429]' : 'border-transparent text-[#888898] hover:text-[#e8e8f0]'
            }`}
          >
            {t === 'secoes' ? `✏️ Seções` : t === 'raw' ? '📄 Prompt Completo' : `📚 Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === 'secoes' && (
          <div className="p-4 space-y-3">
            {!Object.keys(secaoContent).length ? (
              <EmptyState />
            ) : (
              SECOES_ORDER.map(key => {
                const content = secaoContent[key as keyof typeof secaoContent]
                if (!content) return null
                return (
                  <SecaoCard
                    key={key}
                    title={SECOES_LABELS[key]}
                    value={content}
                    onChange={v => updateSecao(key, v)}
                  />
                )
              })
            )}
          </div>
        )}

        {tab === 'raw' && (
          <div className="p-4">
            {!fullPrompt ? (
              <EmptyState />
            ) : (
              <textarea
                value={fullPrompt}
                readOnly
                className="w-full h-full min-h-[400px] bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl p-4 text-xs text-[#e8e8f0] font-mono resize-none leading-relaxed"
              />
            )}
          </div>
        )}

        {tab === 'historico' && (
          <div className="p-4 space-y-3">
            {historico.length === 0 ? (
              <EmptyState msg="Nenhum prompt gerado ainda" />
            ) : (
              historico.map(h => (
                <div key={h.ts} className="bg-[#14141e] border border-[#2a2a3e] rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-2 text-[10px] text-[#888898] mb-1">
                        <span>{new Date(h.ts).toLocaleString('pt-BR')}</span>
                        <span>·</span>
                        <span>{h.tipo}</span>
                        {h.nome && <><span>·</span><span>{h.nome}</span></>}
                      </div>
                      <p className="text-xs text-[#888898] truncate">{h.text.slice(0, 120)}...</p>
                    </div>
                    <div className="flex gap-1.5 flex-none">
                      <button
                        onClick={() => toggleFav(h.ts)}
                        className={`p-1.5 rounded-lg text-sm transition-colors ${favs.includes(h.ts) ? 'text-yellow-400' : 'text-[#888898] hover:text-yellow-400'}`}
                      >
                        {favs.includes(h.ts) ? '⭐' : '☆'}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(h.text)}
                        className="p-1.5 rounded-lg text-xs text-[#888898] hover:text-[#e8e8f0] transition-colors"
                      >
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
    <div className="bg-[#14141e] border border-[#2a2a3e] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1e1e2e] transition-colors"
      >
        <span className="text-xs font-medium text-[#e8e8f0]">{title}</span>
        <span className="text-[#888898] text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-[#2a2a3e]">
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={6}
            className="w-full bg-transparent px-3 py-2.5 text-xs text-[#e8e8f0] font-mono resize-y leading-relaxed"
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
      <p className="text-[#888898] text-sm">{msg}</p>
    </div>
  )
}
