'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePromptStore } from '@/store/promptStore'
import { useToast } from '@/components/ui/Toast'
import type { PromptHistorico } from '@/types'

interface Props {
  entries: PromptHistorico[]
  onClose: () => void
}

export default function ApresentacaoModal({ entries, onClose }: Props) {
  const [idx, setIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [interval, setIntervalSec] = useState(8)
  const { favs, toggleFav } = usePromptStore()
  const { toast } = useToast()

  const total = entries.length
  const current = entries[idx]

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  // keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
      else if (e.key === ' ') { e.preventDefault(); setAutoPlay(v => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  // auto-play
  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(next, interval * 1000)
    return () => clearInterval(id)
  }, [autoPlay, interval, next])

  if (!current) {
    return (
      <div className="fixed inset-0 z-[9000] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-2xl mb-2">📚</p>
          <p>Nenhuma entrada no histórico.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>Fechar</button>
        </div>
      </div>
    )
  }

  const isFav = favs.includes(current.ts)

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col" style={{ background: 'rgba(0,0,0,0.97)' }}>

      {/* Top bar */}
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: 'var(--gold)' }}>🎬 Apresentação</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{idx + 1} / {total}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-play interval */}
          <select
            value={interval}
            onChange={e => setIntervalSec(Number(e.target.value))}
            className="text-xs rounded px-2 py-1 border"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <option value={4}>4s</option>
            <option value={8}>8s</option>
            <option value={15}>15s</option>
            <option value={30}>30s</option>
          </select>

          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlay(v => !v)}
            className="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors"
            style={{
              background: autoPlay ? 'var(--gold)' : 'var(--surface2)',
              borderColor: autoPlay ? 'var(--gold)' : 'var(--border)',
              color: autoPlay ? '#000' : 'var(--text)',
            }}>
            {autoPlay ? '⏸ Pausar' : '▶ Auto'}
          </button>

          <button onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            ✕ Fechar
          </button>
        </div>
      </div>

      {/* Slide metadata */}
      <div className="flex-none flex items-center gap-3 px-6 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-2 text-[11px] flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span>{new Date(current.ts).toLocaleString('pt-BR')}</span>
          <span>·</span><span>{current.tipo}</span>
          {current.nome && <><span>·</span><span className="font-semibold" style={{ color: 'var(--gold)' }}>{current.nome}</span></>}
          {current.adv && <><span>·</span><span>vs {current.adv}</span></>}
          {current.ferramenta && <><span>·</span><span>{current.ferramenta}</span></>}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => toggleFav(current.ts)}
            className="text-sm transition-colors"
            style={{ color: isFav ? '#facc15' : 'var(--text-muted)' }}
            title="Favorito">
            {isFav ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(current.text); toast('Copiado!', 'success') }}
            className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            title="Copiar prompt">
            📋 Copiar
          </button>
        </div>
      </div>

      {/* Prompt text */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words max-w-4xl mx-auto"
          style={{ color: 'var(--text)' }}>
          {current.text}
        </pre>
      </div>

      {/* Progress bar */}
      <div className="flex-none h-0.5" style={{ background: 'var(--border)' }}>
        <div
          className="h-full transition-none"
          style={{ width: `${((idx + 1) / total) * 100}%`, background: 'var(--gold)' }}
        />
      </div>

      {/* Bottom nav */}
      <div className="flex-none flex items-center justify-center gap-6 py-4">
        <button onClick={prev}
          className="w-12 h-12 rounded-full border flex items-center justify-center text-xl transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          ←
        </button>

        {/* Dot indicators (max 15) */}
        {total <= 15 && (
          <div className="flex gap-1.5">
            {entries.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 8,
                  height: 8,
                  background: i === idx ? 'var(--gold)' : 'var(--border)',
                }}
              />
            ))}
          </div>
        )}

        {total > 15 && (
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {idx + 1} / {total}
          </span>
        )}

        <button onClick={next}
          className="w-12 h-12 rounded-full border flex items-center justify-center text-xl transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
          →
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="flex-none text-center pb-3">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          ← → navegar · Espaço auto-play · Esc fechar
        </span>
      </div>
    </div>
  )
}
