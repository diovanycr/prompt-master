'use client'

import Modal from '@/components/ui/Modal'
import { usePromptStore } from '@/store/promptStore'

export default function StatsModal({ onClose }: { onClose: () => void }) {
  const { historico, favs, genCount, partidas } = usePromptStore()

  const now = Date.now()
  const semana = historico.filter(h => now - h.ts < 7 * 86400000).length
  const mes = historico.filter(h => now - h.ts < 30 * 86400000).length

  function top(values: (string | undefined)[], n = 5): [string, number][] {
    const count: Record<string, number> = {}
    values.forEach(v => { if (v) count[v] = (count[v] || 0) + 1 })
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, n)
  }

  const tipoStats = top(historico.map(h => h.tipo))
  const intStats = top(historico.map(h => h.intensidade))
  const ferrStats = top(historico.map(h => (h as any).ferramenta))
  const atletaStats = top(historico.map(h => h.nome))
  const advStats = top(historico.map(h => h.adv))

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const proximas = partidas.filter(p => p.data && new Date(p.data + 'T00:00:00') >= hoje).length

  return (
    <Modal title="📊 Estatísticas de Uso" onClose={onClose}>
      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { icon: '✨', value: genCount, label: 'Total gerados' },
          { icon: '📅', value: semana, label: 'Esta semana' },
          { icon: '📆', value: mes, label: 'Este mês' },
          { icon: '⭐', value: favs.length, label: 'Favoritos' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 border text-center"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="text-lg">{s.icon}</div>
            <div className="text-xl font-bold" style={{ color: 'var(--gold)' }}>{s.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {historico.length === 0 ? (
        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
          Nenhum prompt gerado ainda.
        </p>
      ) : (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {tipoStats.length > 0 && <Bars title="Por tipo de arte" items={tipoStats} />}
          {intStats.length > 0 && <Bars title="Por intensidade" items={intStats} />}
          {ferrStats.length > 0 && <Bars title="Por ferramenta" items={ferrStats} />}
          {atletaStats.length > 1 && <Bars title="Top atletas" items={atletaStats} />}
          {advStats.length > 0 && <Bars title="Top adversários" items={advStats} />}
        </div>
      )}

      <div className="mt-4 pt-3 border-t flex gap-4 text-[11px]"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>📅 {proximas} partida{proximas !== 1 ? 's' : ''} agendada{proximas !== 1 ? 's' : ''}</span>
        <span>📚 {historico.length} no histórico</span>
        <span>📝 {partidas.length} partida{partidas.length !== 1 ? 's' : ''} cadastrada{partidas.length !== 1 ? 's' : ''}</span>
      </div>
    </Modal>
  )
}

function Bars({ title, items }: { title: string; items: [string, number][] }) {
  const max = items[0]?.[1] ?? 1
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: 'var(--text-muted)' }}>{title}</p>
      <div className="space-y-2">
        {items.map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="truncate" style={{ color: 'var(--text)' }}>{label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{count}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
              <div className="h-full rounded-full transition-all" style={{ background: 'var(--gold)', width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
