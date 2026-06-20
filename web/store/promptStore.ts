import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Idioma, Intensidade, TipoArte, Ferramenta, ModoJogo,
  FormData, SecaoContent, PromptHistorico, Partida, AtletaProfile, PromptTemplate,
} from '@/types'
import { gerarSecoes, buildFullPrompt, PALETAS, ACOES, ANGULOS } from '@/lib/prompt-generator'

interface SorteioState {
  paleta: string | null
  acao: string | null
  angulo: string | null
  cenario: string | null
  layout: string | null
  iluminacao: string | null
  tipografia: string | null
}

interface PromptState {
  // form
  form: FormData
  setForm: (f: Partial<FormData>) => void

  // generation options
  idioma: Idioma
  intensidade: Intensidade
  modo: ModoJogo
  tipo: TipoArte
  ferramenta: Ferramenta
  fraseSelecionada: string
  paleta: string
  acao: string
  angulo: string
  categoriasTravadas: Record<string, boolean>
  lastSorteio: SorteioState

  setIdioma: (v: Idioma) => void
  setIntensidade: (v: Intensidade) => void
  setModo: (v: ModoJogo) => void
  setTipo: (v: TipoArte) => void
  setFerramenta: (v: Ferramenta) => void
  setFraseSelecionada: (v: string) => void
  setPaleta: (v: string) => void
  setAcao: (v: string) => void
  setAngulo: (v: string) => void
  toggleTravamento: (key: string) => void

  // generated content
  secaoContent: SecaoContent
  genCount: number
  fullPrompt: string
  generationStack: SecaoContent[]

  // images
  hasFoto: boolean
  hasLogo1: boolean
  hasLogo2: boolean
  setHasFoto: (v: boolean) => void
  setHasLogo1: (v: boolean) => void
  setHasLogo2: (v: boolean) => void

  // main actions
  gerar: (aleatorio?: boolean) => void
  desfazer: () => void
  updateSecao: (key: string, value: string) => void

  // historico
  historico: PromptHistorico[]
  addHistorico: (p: PromptHistorico) => void
  favs: number[]
  toggleFav: (ts: number) => void
  tags: Record<number, string[]>
  setTags: (ts: number, t: string[]) => void

  // partidas
  partidas: Partida[]
  addPartida: (p: Partida) => void
  removePartida: (id: string) => void

  // profiles
  profiles: AtletaProfile[]
  addProfile: (p: AtletaProfile) => void
  removeProfile: (id: string) => void
  loadProfile: (id: string) => void

  // templates
  templates: PromptTemplate[]
  addTemplate: (t: PromptTemplate) => void
  removeTemplate: (id: string) => void
  loadTemplate: (id: string) => void

  // custom phrases
  fraseCustom: string
  setFraseCustom: (v: string) => void
  frasesSalvas: string[]
  addFraseSalva: (f: string) => void
  removeFraseSalva: (f: string) => void

  // adversários
  adversarios: string[]
  addAdversario: (a: string) => void
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      form: {
        nome: '',
        clube: '',
        categoria: '',
        campeonato: '',
        adv: '',
        data: '',
        hora: '',
        local: '',
        uniforme1: '',
        uniforme2: '',
        golsNos: 0,
        golsAdv: 0,
      },
      setForm: (f) => set(s => ({ form: { ...s.form, ...f } })),

      idioma: 'pt',
      intensidade: 'Confronto',
      modo: 'pregame',
      tipo: 'Instagram Story 9:16',
      ferramenta: 'Midjourney',
      fraseSelecionada: '🎲 IA cria frase inédita automaticamente',
      paleta: PALETAS[1],
      acao: ACOES[0],
      angulo: ANGULOS[0],
      categoriasTravadas: {},
      lastSorteio: { paleta: null, acao: null, angulo: null, cenario: null, layout: null, iluminacao: null, tipografia: null },

      setIdioma: (v) => set({ idioma: v }),
      setIntensidade: (v) => set({ intensidade: v }),
      setModo: (v) => set({ modo: v }),
      setTipo: (v) => set({ tipo: v }),
      setFerramenta: (v) => set({ ferramenta: v }),
      setFraseSelecionada: (v) => set({ fraseSelecionada: v }),
      setPaleta: (v) => set({ paleta: v }),
      setAcao: (v) => set({ acao: v }),
      setAngulo: (v) => set({ angulo: v }),
      toggleTravamento: (key) => set(s => ({
        categoriasTravadas: { ...s.categoriasTravadas, [key]: !s.categoriasTravadas[key] }
      })),

      secaoContent: {},
      genCount: 0,
      fullPrompt: '',
      generationStack: [],

      hasFoto: false,
      hasLogo1: false,
      hasLogo2: false,
      setHasFoto: (v) => set({ hasFoto: v }),
      setHasLogo1: (v) => set({ hasLogo1: v }),
      setHasLogo2: (v) => set({ hasLogo2: v }),

      gerar: (aleatorio = false) => {
        const s = get()
        const stack = s.secaoContent && Object.keys(s.secaoContent).length
          ? [...s.generationStack.slice(-14), JSON.parse(JSON.stringify(s.secaoContent))]
          : s.generationStack

        const fraseCustom = s.fraseCustom
        const frase = fraseCustom || (s.fraseSelecionada.startsWith('🎲')
          ? (s.idioma === 'en' ? 'AI creates a unique and inspiring phrase, never used before' : 'IA cria frase inédita e inspiradora, nunca antes usada')
          : s.fraseSelecionada)

        const newCount = s.genCount + 1
        const result = gerarSecoes({
          form: s.form,
          intensidade: s.intensidade,
          modo: s.modo,
          tipo: s.tipo,
          ferramenta: s.ferramenta,
          idioma: s.idioma,
          frase,
          paleta: s.paleta,
          acao: s.acao,
          angulo: s.angulo,
          aleatorio,
          hasFoto: s.hasFoto,
          hasLogo1: s.hasLogo1,
          hasLogo2: s.hasLogo2,
          genCount: newCount,
          lastSorteio: s.lastSorteio,
          categoriasTravadas: s.categoriasTravadas,
        })

        const newSorteio = {
          paleta: result.cenarioVar ? s.lastSorteio.paleta : s.lastSorteio.paleta,
          acao: s.lastSorteio.acao,
          angulo: s.lastSorteio.angulo,
          cenario: result.cenarioVar ?? s.lastSorteio.cenario,
          layout: result.layoutVar ?? s.lastSorteio.layout,
          iluminacao: result.iluminacaoVar ?? s.lastSorteio.iluminacao,
          tipografia: result.tipografiaVar ?? s.lastSorteio.tipografia,
        }
        if (aleatorio) {
          newSorteio.paleta = result.paleta
          newSorteio.acao = result.acao
          newSorteio.angulo = result.angulo
        }

        const full = buildFullPrompt(result.secoes)

        // save to historico
        const entry: PromptHistorico = {
          ts: Date.now(),
          text: full,
          tipo: s.tipo,
          intensidade: s.intensidade,
          nome: s.form.nome,
          clube: s.form.clube,
          adv: s.form.adv,
        }

        set({
          secaoContent: result.secoes,
          genCount: newCount,
          fullPrompt: full,
          generationStack: stack,
          paleta: aleatorio ? result.paleta : s.paleta,
          acao: aleatorio ? result.acao : s.acao,
          angulo: aleatorio ? result.angulo : s.angulo,
          lastSorteio: newSorteio,
          historico: [entry, ...s.historico].slice(0, 200),
        })

        // register adversário
        if (s.form.adv) get().addAdversario(s.form.adv)
      },

      desfazer: () => {
        const s = get()
        if (!s.generationStack.length) return
        const prev = s.generationStack[s.generationStack.length - 1]
        set({
          secaoContent: prev,
          fullPrompt: buildFullPrompt(prev),
          generationStack: s.generationStack.slice(0, -1),
        })
      },

      updateSecao: (key, value) => set(s => {
        const secaoContent = { ...s.secaoContent, [key]: value }
        return { secaoContent, fullPrompt: buildFullPrompt(secaoContent) }
      }),

      historico: [],
      addHistorico: (p) => set(s => ({ historico: [p, ...s.historico].slice(0, 200) })),
      favs: [],
      toggleFav: (ts) => set(s => ({
        favs: s.favs.includes(ts) ? s.favs.filter(t => t !== ts) : [...s.favs, ts]
      })),
      tags: {},
      setTags: (ts, t) => set(s => ({ tags: { ...s.tags, [ts]: t } })),

      partidas: [],
      addPartida: (p) => set(s => ({ partidas: [p, ...s.partidas] })),
      removePartida: (id) => set(s => ({ partidas: s.partidas.filter(p => p.id !== id) })),

      profiles: [],
      addProfile: (p) => set(s => ({ profiles: [...s.profiles, p] })),
      removeProfile: (id) => set(s => ({ profiles: s.profiles.filter(p => p.id !== id) })),
      loadProfile: (id) => {
        const p = get().profiles.find(p => p.id === id)
        if (!p) return
        set(s => ({ form: { ...s.form, nome: p.nome, clube: p.clube, categoria: p.categoria, campeonato: p.campeonato, uniforme1: p.uniforme1, uniforme2: p.uniforme2 } }))
      },

      templates: [],
      addTemplate: (t) => set(s => ({ templates: [...s.templates, t] })),
      removeTemplate: (id) => set(s => ({ templates: s.templates.filter(t => t.id !== id) })),
      loadTemplate: (id) => {
        const t = get().templates.find(t => t.id === id)
        if (!t) return
        set({ secaoContent: t.secoes, fullPrompt: buildFullPrompt(t.secoes) })
      },

      fraseCustom: '',
      setFraseCustom: (v) => set({ fraseCustom: v }),
      frasesSalvas: [],
      addFraseSalva: (f) => set(s => ({ frasesSalvas: [...new Set([f, ...s.frasesSalvas])] })),
      removeFraseSalva: (f) => set(s => ({ frasesSalvas: s.frasesSalvas.filter(x => x !== f) })),

      adversarios: [],
      addAdversario: (a) => set(s => ({
        adversarios: [...new Set([a, ...s.adversarios])].slice(0, 30)
      })),
    }),
    {
      name: 'pm-store',
      partialize: (s) => ({
        form: s.form,
        idioma: s.idioma,
        intensidade: s.intensidade,
        tipo: s.tipo,
        ferramenta: s.ferramenta,
        paleta: s.paleta,
        acao: s.acao,
        angulo: s.angulo,
        historico: s.historico,
        favs: s.favs,
        tags: s.tags,
        partidas: s.partidas,
        profiles: s.profiles,
        templates: s.templates,
        frasesSalvas: s.frasesSalvas,
        adversarios: s.adversarios,
        genCount: s.genCount,
        categoriasTravadas: s.categoriasTravadas,
      }),
    }
  )
)
