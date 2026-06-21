'use client'

import { usePromptStore } from '@/store/promptStore'
import type { Intensidade, TipoArte, Ferramenta, ModoJogo } from '@/types'
import { intensidadeMap, PALETAS, ACOES, ANGULOS } from '@/lib/prompt-generator'
import ImageUpload from './ImageUpload'

const TIPOS: TipoArte[] = ['Instagram Story 9:16', 'Feed Instagram 4:5', 'Banner horizontal', 'Card MVP', 'Card Convocação']
const FERRAMENTAS: Ferramenta[] = ['Midjourney', 'ChatGPT', 'Gemini', 'Firefly']
const INTENSIDADES_PREGAME: Intensidade[] = ['Celebracao', 'Confronto', 'Institucional']
const INTENSIDADES_POSTGAME: Intensidade[] = ['PosVitoria', 'PosEmpate', 'PosDerrota']

const INTENSIDADE_LABELS: Record<Intensidade, string> = {
  Celebracao: '🎉 Celebração', Confronto: '⚔️ Confronto', Institucional: '🏛️ Institucional',
  PosVitoria: '🏆 Vitória', PosEmpate: '🤝 Empate', PosDerrota: '💪 Derrota',
}

const FRASES_PRESET = [
  '🎲 IA cria frase inédita automaticamente',
  '⚽ A quadra é o meu palco, a bola minha voz.',
  '🔥 Nascido para esse esporte.',
  '💫 Cada treino escreve minha história.',
  '⭐ O futuro é agora.',
  '🏆 Fome de vitória. Sede de glória.',
]

export default function FormSection() {
  const {
    form, setForm,
    modo, setModo,
    tipo, setTipo,
    ferramenta, setFerramenta,
    intensidade, setIntensidade,
    paleta, setPaleta,
    acao, setAcao,
    angulo, setAngulo,
    fraseSelecionada, setFraseSelecionada,
    fraseCustom, setFraseCustom,
    idioma,
  } = usePromptStore()

  const intensidades = modo === 'postgame' ? INTENSIDADES_POSTGAME : INTENSIDADES_PREGAME

  return (
    <div className="space-y-4 pb-4">
      {/* Imagens */}
      <Bloco titulo="📸 Imagens de Referência">
        <div className="grid grid-cols-1 gap-3">
          <ImageUpload key="atleta" inputKey="atleta" label="Foto do Atleta *" obrigatorio />
          <div className="grid grid-cols-2 gap-3">
            <ImageUpload key="logo1" inputKey="logo1" label="Escudo do Clube *" obrigatorio />
            <ImageUpload key="logo2" inputKey="logo2" label="Escudo Adversário" />
          </div>
        </div>
      </Bloco>

      {/* Dados do atleta */}
      <Bloco titulo="🪪 Dados do Atleta">
        <div className="space-y-2.5">
          <Input label="Nome do atleta *" value={form.nome} onChange={v => setForm({ nome: v })} placeholder="Ex: João Silva" />
          <Input label="Clube *" value={form.clube} onChange={v => setForm({ clube: v })} placeholder="Ex: Prospere Futsal" />
          <Input label="Categoria" value={form.categoria} onChange={v => setForm({ categoria: v })} placeholder="Ex: Sub-15" />
          <Input label="Campeonato" value={form.campeonato} onChange={v => setForm({ campeonato: v })} placeholder="Ex: Liga Paulista 2026" />
        </div>
      </Bloco>

      {/* Uniformes */}
      <Bloco titulo="👕 Uniforme">
        <div className="grid grid-cols-2 gap-2.5">
          <Input label="Cor principal" value={form.uniforme1} onChange={v => setForm({ uniforme1: v })} placeholder="Ex: Azul e branco" />
          <Input label="Cor secundária" value={form.uniforme2} onChange={v => setForm({ uniforme2: v })} placeholder="Ex: Dourado" />
        </div>
      </Bloco>

      {/* Modo de jogo */}
      <Bloco titulo="🎮 Modo">
        <div className="grid grid-cols-2 gap-2">
          {(['pregame', 'postgame'] as ModoJogo[]).map(m => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                modo === m ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {m === 'pregame' ? '⚡ Pré-jogo' : '🏁 Pós-jogo'}
            </button>
          ))}
        </div>

        {/* Intensidade */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {intensidades.map(i => (
            <button
              key={i}
              onClick={() => setIntensidade(i)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                intensidade === i ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {INTENSIDADE_LABELS[i]}
            </button>
          ))}
        </div>
        {intensidade && (
          <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {intensidadeMap[intensidade]?.desc}
          </p>
        )}

        {/* Placar (pós-jogo) */}
        {modo === 'postgame' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input label="Gols (Nós)" type="number" value={String(form.golsNos)} onChange={v => setForm({ golsNos: Number(v) })} placeholder="0" />
            <Input label="Gols (Adv.)" type="number" value={String(form.golsAdv)} onChange={v => setForm({ golsAdv: Number(v) })} placeholder="0" />
          </div>
        )}
      </Bloco>

      {/* Partida */}
      <Bloco titulo="📅 Partida">
        <div className="space-y-2.5">
          <Input label="Adversário *" value={form.adv} onChange={v => setForm({ adv: v })} placeholder="Ex: Santos FC" />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Data" type="date" value={form.data} onChange={v => setForm({ data: v })} />
            <Input label="Horário" type="time" value={form.hora} onChange={v => setForm({ hora: v })} />
          </div>
          <Input label="Local" value={form.local} onChange={v => setForm({ local: v })} placeholder="Ex: Ginásio Municipal" />
        </div>
      </Bloco>

      {/* Tipo de arte */}
      <Bloco titulo="🖼️ Tipo de Arte">
        <div className="space-y-1">
          {TIPOS.map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                tipo === t ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent hover:border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Bloco>

      {/* Ferramenta */}
      <Bloco titulo="🤖 Ferramenta IA">
        <div className="grid grid-cols-2 gap-1.5">
          {FERRAMENTAS.map(f => (
            <button
              key={f}
              onClick={() => setFerramenta(f)}
              className={`py-2 rounded-lg text-sm border transition-all ${
                ferramenta === f ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Bloco>

      {/* Paleta */}
      <Bloco titulo="🎨 Paleta de Cores">
        <div className="space-y-1">
          {PALETAS.map(p => (
            <button key={p} onClick={() => setPaleta(p)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${
                paleta === p ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent hover:border-[var(--border)]'
              }`}
            >{p}</button>
          ))}
        </div>
      </Bloco>

      {/* Ação */}
      <Bloco titulo="⚡ Ação">
        <div className="space-y-1">
          {ACOES.map(a => (
            <button key={a} onClick={() => setAcao(a)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${
                acao === a ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent hover:border-[var(--border)]'
              }`}
            >{a}</button>
          ))}
        </div>
      </Bloco>

      {/* Ângulo */}
      <Bloco titulo="📷 Ângulo de Câmera">
        <div className="space-y-1">
          {ANGULOS.map(a => (
            <button key={a} onClick={() => setAngulo(a)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${
                angulo === a ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent hover:border-[var(--border)]'
              }`}
            >{a}</button>
          ))}
        </div>
      </Bloco>

      {/* Frase */}
      <Bloco titulo="💬 Frase de Impacto">
        <div className="space-y-1 mb-2">
          {FRASES_PRESET.map(f => (
            <button key={f} onClick={() => { setFraseSelecionada(f); setFraseCustom('') }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs border transition-all ${
                fraseSelecionada === f && !fraseCustom ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-transparent hover:border-[var(--border)]'
              }`}
            >{f}</button>
          ))}
        </div>
        <textarea
          value={fraseCustom}
          onChange={e => setFraseCustom(e.target.value)}
          placeholder="Ou escreva uma frase customizada..."
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-xs resize-none border transition-colors"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </Bloco>
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4 border transition-colors" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{titulo}</h3>
      {children}
    </div>
  )
}

function Input({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-sm border transition-colors"
        style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
    </div>
  )
}
