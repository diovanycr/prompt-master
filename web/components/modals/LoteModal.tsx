'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { usePromptStore } from '@/store/promptStore'
import { gerarSecoes, buildFullPrompt } from '@/lib/prompt-generator'

type LoteTab = 'ab' | 'lote'
interface Variacao { id: number; prompt: string }

function gerarN(n: number): Variacao[] {
  const s = usePromptStore.getState()
  const frase = s.fraseCustom || (s.fraseSelecionada.startsWith('🎲')
    ? (s.idioma === 'en' ? 'AI creates a unique inspiring phrase' : 'IA cria frase inédita e inspiradora, nunca antes usada')
    : s.fraseSelecionada)

  let lastSorteio = s.lastSorteio
  return Array.from({ length: n }, (_, i) => {
    const result = gerarSecoes({
      form: s.form, intensidade: s.intensidade, modo: s.modo,
      tipo: s.tipo, ferramenta: s.ferramenta, idioma: s.idioma,
      frase, paleta: s.paleta, acao: s.acao, angulo: s.angulo,
      aleatorio: true, hasFoto: s.hasFoto, hasLogo1: s.hasLogo1,
      hasLogo2: s.hasLogo2, genCount: s.genCount + i + 1,
      lastSorteio, categoriasTravadas: s.categoriasTravadas,
    })
    lastSorteio = {
      paleta: result.paleta, acao: result.acao, angulo: result.angulo,
      cenario: result.cenarioVar, layout: result.layoutVar,
      iluminacao: result.iluminacaoVar, tipografia: result.tipografiaVar,
    }
    return { id: i + 1, prompt: buildFullPrompt(result.secoes) }
  })
}

export default function LoteModal({ initialTab = 'ab', onClose }: { initialTab?: LoteTab; onClose: () => void }) {
  const [tab, setTab] = useState<LoteTab>(initialTab)
  const [variacoes, setVariacoes] = useState<Variacao[]>([])
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => { setVariacoes(gerarN(tab === 'ab' ? 2 : 5)) }, [tab])

  async function copiar(text: string, id: number) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function downloadTodos() {
    const sep = '═'.repeat(50)
    const text = variacoes.map((v, i) => `${sep}\nVARIAÇÃO ${i + 1}\n${sep}\n\n${v.prompt}`).join('\n\n\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `lote-${Date.now()}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const isAB = tab === 'ab'
  const surfaceStyle = { background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal title={isAB ? '⚔️ Modo A/B' : '🎲 Geração em Lote'} onClose={onClose} width="max-w-3xl">
      <div className="flex gap-2 flex-wrap mb-4">
        {(['ab', 'lote'] as LoteTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{
              background: tab === t ? 'var(--gold)' : 'var(--surface2)',
              borderColor: tab === t ? 'var(--gold)' : 'var(--border)',
              color: tab === t ? '#000' : 'var(--text-muted)',
            }}>
            {t === 'ab' ? '⚔️ A/B — 2 variações' : '🎲 Lote — 5 variações'}
          </button>
        ))}
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setVariacoes(gerarN(isAB ? 2 : 5))}
            className="px-3 py-1.5 rounded-lg text-xs border transition-colors" style={surfaceStyle}>
            🔄 Regenerar
          </button>
          {!isAB && (
            <button onClick={downloadTodos}
              className="px-3 py-1.5 rounded-lg text-xs border transition-colors" style={surfaceStyle}>
              📄 Baixar todos (.txt)
            </button>
          )}
        </div>
      </div>

      <div className={`${isAB ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col'} gap-3 max-h-[65vh] overflow-y-auto`}>
        {variacoes.map(v => (
          <div key={v.id} className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: 'var(--gold)' }}>
                {isAB ? (v.id === 1 ? '🅰 Versão A' : '🅱 Versão B') : `📝 Variação ${v.id}`}
              </span>
              <button onClick={() => copiar(v.prompt, v.id)}
                className="text-[11px] px-2.5 py-1 rounded-lg border transition-colors"
                style={{
                  borderColor: copied === v.id ? 'var(--gold)' : 'var(--border)',
                  color: copied === v.id ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                {copied === v.id ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {v.prompt.slice(0, isAB ? 500 : 250)}{v.prompt.length > (isAB ? 500 : 250) ? '...' : ''}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  )
}
