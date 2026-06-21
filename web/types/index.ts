export type Idioma = 'pt' | 'en'

export type Intensidade =
  | 'Celebracao'
  | 'Confronto'
  | 'Institucional'
  | 'PosVitoria'
  | 'PosEmpate'
  | 'PosDerrota'

export type TipoArte =
  | 'Instagram Story 9:16'
  | 'Feed Instagram 4:5'
  | 'Banner horizontal'
  | 'Card MVP'
  | 'Card Convocação'

export type Ferramenta = 'Midjourney' | 'ChatGPT' | 'Gemini' | 'Firefly'

export type ModoJogo = 'pregame' | 'postgame'

export type UserStatus = 'pending' | 'approved' | 'rejected'

export type UserRole = 'user' | 'admin'

export interface FormData {
  nome: string
  clube: string
  categoria: string
  campeonato: string
  adv: string
  data: string
  hora: string
  local: string
  uniforme1: string
  uniforme2: string
  golsNos: number
  golsAdv: number
}

export interface SecaoContent {
  identidade?: string
  fidelidade?: string
  conceito?: string
  uniforme?: string
  acao?: string
  cenario?: string
  paleta?: string
  tipografia?: string
  partida?: string
  frase?: string
  qualidade?: string
  negativo?: string
}

export interface Partida {
  id: string
  ts: number
  adv: string
  data: string
  hora: string
  local: string
  campeonato: string
  golsNos?: number
  golsAdv?: number
  modo: ModoJogo
}

export interface PromptHistorico {
  ts: number
  text: string
  tipo: string
  intensidade: string
  nome: string
  clube: string
  adv: string
  ferramenta?: string
  idioma?: string
}

export interface AtletaProfile {
  id: string
  nome: string
  clube: string
  categoria: string
  campeonato: string
  uniforme1: string
  uniforme2: string
}

export interface PromptTemplate {
  id: string
  nome: string
  secoes: SecaoContent
}

export interface AdminUser {
  user_id: string
  email: string
  status: UserStatus
  created_at: string
  updated_at: string
}
