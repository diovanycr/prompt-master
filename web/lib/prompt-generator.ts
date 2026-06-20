import type {
  Idioma,
  Intensidade,
  TipoArte,
  Ferramenta,
  ModoJogo,
  FormData,
  SecaoContent,
} from '@/types'

export const SECOES_ORDER = [
  'identidade',
  'fidelidade',
  'conceito',
  'uniforme',
  'acao',
  'cenario',
  'paleta',
  'tipografia',
  'partida',
  'frase',
  'qualidade',
  'negativo',
] as const

export const SECOES_LABELS: Record<string, string> = {
  identidade: '🪪 Identidade Fixa',
  fidelidade: '👤 Fidelidade Facial',
  conceito: '🎬 Conceito Visual',
  uniforme: '👕 Uniforme',
  acao: '⚡ Ação & Câmera',
  cenario: '🏟️ Cenário & Iluminação',
  paleta: '🎨 Paleta de Cores',
  tipografia: '✍️ Tipografia & Textos',
  partida: '📅 Informações da Partida',
  frase: '💬 Frase de Impacto',
  qualidade: '🏆 Qualidade Final',
  negativo: '🚫 Evitar (Negative Prompt)',
}

export const intensidadeMap: Record<
  Intensidade,
  { desc: string; cenario: string; expressao: string; slogan: string }
> = {
  Celebracao: {
    desc: 'Arte de celebração: alegria, conquista, confetes, expressão de vitória e festa.',
    cenario: 'ambiente de celebração pós-vitória, festa, confetes, torcida em euforia',
    expressao: 'comemorando com alegria e euforia, grito de vitória, punho erguido',
    slogan: 'tom de conquista e celebração, frases de vitória e alegria',
  },
  Confronto: {
    desc: 'Arte épica de confronto: energia máxima, expressão determinada, arena de batalha.',
    cenario: 'arena de batalha, atmosfera de final, tensão máxima, luzes dramáticas de confronto',
    expressao: 'determinado, focado, olhar de guerreiro, confiança máxima antes do jogo',
    slogan: 'tom épico e de desafio, frases de garra e determinação',
  },
  Institucional: {
    desc: 'Arte institucional: elegante, profissional, representação oficial do clube.',
    cenario: 'ginásio profissional moderno, atmosfera clean e premium, identidade visual do clube',
    expressao: 'postura confiante e profissional, representando o clube com orgulho',
    slogan: 'tom institucional e de orgulho do clube, frases inspiradoras e elegantes',
  },
  PosVitoria: {
    desc: 'Arte de pós-jogo — VITÓRIA: explosão de alegria, conquista épica, celebração máxima.',
    cenario: 'vestiário em festa, confetes dourados, torcida em êxtase, luzes de celebração',
    expressao: 'grito de vitória, punho erguido, sorriso de campeão, emoção pura',
    slogan: 'tom de conquista e triunfo — "Vencemos!", frases épicas de vitória',
  },
  PosEmpate: {
    desc: 'Arte de pós-jogo — EMPATE: determinação, resiliência e cabeça erguida.',
    cenario: 'ginásio ao fim do jogo, clima de respeito mútuo, equipe unida',
    expressao: 'cabeça erguida, determinado, resiliente, olhar de quem segue em frente',
    slogan: 'tom de determinação e continuidade — "A luta continua", superação',
  },
  PosDerrota: {
    desc: 'Arte de pós-jogo — DERROTA: garra, superação e foco no próximo desafio.',
    cenario: 'ginásio silencioso, luzes frias, clima de reflexão e determinação para o futuro',
    expressao: 'olhar resoluto, determinação silenciosa, garra de quem já quer a revanche',
    slogan: 'tom de superação e revanche — "Voltaremos mais fortes", resiliência',
  },
}

export const PALETAS = [
  'azul royal e dourado',
  'preto e dourado premium',
  'grafite e prata metálica',
  'azul royal e branco',
  'vermelho e preto',
  'roxo neon premium',
  'verde esmeralda e prata',
]
export const ACOES = [
  'conduzindo a bola com maestria',
  'finalizando a gol com potência',
  'driblando o adversário',
  'comemorando gol com euforia',
  'correndo em velocidade máxima',
  'disputando posse de bola',
  'protegendo a posse com habilidade',
]
export const ANGULOS = [
  'low angle dramático',
  'eye level esportivo',
  'dynamic side angle',
  'cinematic tracking shot',
  'dramatic close-up no atleta',
  'wide arena shot',
  'action shot cinematográfico',
]
export const CENARIOS = [
  'ginásio profissional lotado, torcida em festa',
  'arena moderna com telão de LED ao fundo',
  'quadra de clássico estadual, clima de decisão',
  'túnel de entrada do ginásio, luz dramática vazando',
  'noite de campeonato, holofotes principais acesos',
  'vestiário épico antes da entrada em quadra',
  'quadra com fumaça cênica leve e atmosfera de filme',
  'arena com confetes e luzes de celebração',
]
export const LAYOUTS = [
  'composição assimétrica, atleta deslocado para a esquerda com espaço negativo à direita',
  'composição centralizada, atleta exatamente no eixo central da arte',
  'composição diagonal, linhas de força guiando o olhar de baixo para cima',
  'composição em camadas, atleta em primeiro plano e elementos gráficos em profundidade',
  'composição com moldura interna destacando o atleta',
  'composição estilo pôster de cinema, atleta ocupando 2/3 da arte',
  'composição com grid moderno e blocos de cor geométricos',
]
export const ESTILOS_ILUMINACAO = [
  'iluminação cinematográfica com contraste alto e sombras marcadas',
  'iluminação dourada de golden hour, tom quente e nostálgico',
  'iluminação neon vibrante, contornos coloridos no atleta',
  'iluminação de estúdio premium, luz suave e uniforme',
  'iluminação dramática com rim light forte contornando o atleta',
  'iluminação volumétrica com feixes de luz atravessando a cena',
  'iluminação de transmissão esportiva ao vivo (broadcast lighting)',
]
export const ESTILOS_TIPOGRAFIA = [
  'tipografia bold condensada, estilo jersey esportivo',
  'tipografia serifada premium, estilo editorial de revista esportiva',
  'tipografia futurista geométrica, estilo e-sports',
  'tipografia manuscrita energética combinada com bloco bold',
  'tipografia minimalista clean, hierarquia visual forte',
  'tipografia metálica 3D com efeito de profundidade',
  'tipografia estêncil militar, estilo convocação de elite',
]

function pickRandom<T>(arr: T[], last: T | null): T {
  if (arr.length <= 1) return arr[0]
  let pick: T
  do { pick = arr[Math.floor(Math.random() * arr.length)] }
  while (pick === last)
  return pick
}

export interface GenerateOptions {
  form: FormData
  intensidade: Intensidade
  modo: ModoJogo
  tipo: TipoArte
  ferramenta: Ferramenta
  idioma: Idioma
  frase: string
  paleta: string
  acao: string
  angulo: string
  aleatorio: boolean
  hasFoto: boolean
  hasLogo1: boolean
  hasLogo2: boolean
  genCount: number
  lastSorteio?: {
    paleta: string | null
    acao: string | null
    angulo: string | null
    cenario: string | null
    layout: string | null
    iluminacao: string | null
    tipografia: string | null
  }
  categoriasTravadas?: Record<string, boolean>
}

export interface GenerateResult {
  secoes: SecaoContent
  paleta: string
  acao: string
  angulo: string
  cenarioVar: string | null
  layoutVar: string | null
  iluminacaoVar: string | null
  tipografiaVar: string | null
}

export function gerarSecoes(opts: GenerateOptions): GenerateResult {
  const {
    form, intensidade, modo, tipo, ferramenta, idioma, frase,
    aleatorio, hasFoto, hasLogo1, hasLogo2, genCount,
    lastSorteio = { paleta: null, acao: null, angulo: null, cenario: null, layout: null, iluminacao: null, tipografia: null },
    categoriasTravadas = {},
  } = opts

  const tx = (pt: string, en: string) => idioma === 'en' ? en : pt
  const sep = '─'.repeat(40)

  const { nome, clube, categoria, campeonato, adv, data, hora, local, uniforme1, uniforme2, golsNos, golsAdv } = form
  const uniformeDesc = (uniforme1 || uniforme2)
    ? `${uniforme1}${uniforme2 ? ' e ' + uniforme2 : ''}`
    : tx('conforme uniforme oficial do clube', 'as per the official club uniform')

  const isPosJogo = modo === 'postgame'
  const placar = isPosJogo ? `${golsNos} × ${golsAdv}` : null
  const resultado = isPosJogo
    ? (golsNos > golsAdv ? 'vitoria' : golsNos < golsAdv ? 'derrota' : 'empate')
    : null

  const ar =
    tipo === 'Instagram Story 9:16' || tipo === 'Card Convocação' ? '9:16'
    : tipo === 'Feed Instagram 4:5' || tipo === 'Card MVP' ? '4:5'
    : '16:9'

  function sufixoFerramenta() {
    if (ferramenta === 'Midjourney') return `\n\n--ar ${ar} --v 6 --style raw --q 2`
    if (ferramenta === 'ChatGPT') return `\n\n[Anexe a foto do atleta e os escudos junto com este texto. Proporção de imagem: ${ar}.]`
    if (ferramenta === 'Gemini') return `\n\n[Anexe a foto do atleta e os escudos junto com este texto. Gere em proporção ${ar}.]`
    return `\n\nProporção de imagem: ${ar}.`
  }

  let paleta = opts.paleta
  let acao = opts.acao
  let angulo = opts.angulo

  let cenarioVar: string | null = null
  let layoutVar: string | null = null
  let iluminacaoVar: string | null = null
  let tipografiaVar: string | null = null

  if (aleatorio) {
    if (!categoriasTravadas['paleta']) paleta = pickRandom(PALETAS, lastSorteio.paleta)
    if (!categoriasTravadas['acao']) acao = pickRandom(ACOES, lastSorteio.acao)
    if (!categoriasTravadas['angulo']) angulo = pickRandom(ANGULOS, lastSorteio.angulo)
    cenarioVar = categoriasTravadas['cenario'] ? lastSorteio.cenario : pickRandom(CENARIOS, lastSorteio.cenario)
    layoutVar = categoriasTravadas['layout'] ? lastSorteio.layout : pickRandom(LAYOUTS, lastSorteio.layout)
    iluminacaoVar = categoriasTravadas['iluminacao'] ? lastSorteio.iluminacao : pickRandom(ESTILOS_ILUMINACAO, lastSorteio.iluminacao)
    tipografiaVar = categoriasTravadas['tipografia'] ? lastSorteio.tipografia : pickRandom(ESTILOS_TIPOGRAFIA, lastSorteio.tipografia)
  }

  const intensidadeEfetiva: Intensidade = isPosJogo
    ? (resultado === 'vitoria' ? 'PosVitoria' : resultado === 'derrota' ? 'PosDerrota' : 'PosEmpate')
    : intensidade
  const int = intensidadeMap[intensidadeEfetiva]

  const fotoWarn = !hasFoto ? `\n${tx('⚠️ ATENÇÃO: FOTO DO ATLETA NÃO ENVIADA', '⚠️ WARNING: ATHLETE PHOTO NOT UPLOADED')}\n` : ''
  const logo1Warn = !hasLogo1 ? `\n${tx('⚠️ ATENÇÃO: ESCUDO DO CLUBE NÃO ENVIADO', '⚠️ WARNING: CLUB BADGE NOT UPLOADED')}\n` : ''
  const logo2Warn = !hasLogo2 ? `\n${tx('⚠️ ATENÇÃO: ESCUDO DO ADVERSÁRIO NÃO ENVIADO', '⚠️ WARNING: OPPONENT BADGE NOT UPLOADED')}\n` : ''

  const placarBloco = isPosJogo && placar
    ? `\n${tx('RESULTADO FINAL', 'FINAL SCORE')}: ${clube.toUpperCase()} ${placar} ${adv.toUpperCase()}\n${tx('Resultado', 'Result')}: ${resultado === 'vitoria' ? tx('VITÓRIA 🏆', 'VICTORY 🏆') : resultado === 'derrota' ? tx('DERROTA — resiliência e superação', 'DEFEAT — resilience and growth') : tx('EMPATE — cabeça erguida', 'DRAW — heads up')}\n`
    : ''

  const cenarioEfetivo = aleatorio ? `${int.cenario}. ${cenarioVar}` : int.cenario
  const blocoVariacaoExtra = aleatorio
    ? `\n\n${tx('VARIAÇÃO DE COMPOSIÇÃO', 'COMPOSITION VARIATION')} (${tx('GERAÇÃO', 'GENERATION')} #${genCount}):\n• ${tx('Layout', 'Layout')}: ${layoutVar}\n${iluminacaoVar ? `• ${tx('Iluminação', 'Lighting')}: ${iluminacaoVar}\n` : ''}${tipografiaVar ? `• ${tx('Estilo de tipografia', 'Typography style')}: ${tipografiaVar}\n` : ''}\n${tx('IMPORTANTE: variar livremente composição, layout, iluminação e tipografia.\nNÃO alterar identidade do atleta, rosto, escudos ou uniforme — esses permanecem fixos.', 'IMPORTANT: freely vary composition, layout, lighting and typography.\nDO NOT change athlete identity, face, badges or uniform — these remain fixed.')}`
    : ''

  const base_identidade = `${tx('IDENTIDADE FIXA', 'FIXED IDENTITY')}\n${sep}\n\n${tx('Atleta', 'Athlete')}: ${nome.toUpperCase()}\n${tx('Clube', 'Club')}: ${clube.toUpperCase()}\n${tx('Campeonato', 'Championship')}: ${campeonato.toUpperCase()}\n${tx('Categoria', 'Category')}: ${categoria.toUpperCase()}${placarBloco}\n\n${tx(`O nome ${nome.toUpperCase()} deve ser um dos elementos MAIS DESTACADOS da arte.\nUsar fonte gigante, metal dourado premium, gold chrome, reflexos metálicos, visual luxuoso.`, `The name ${nome.toUpperCase()} must be one of the MOST HIGHLIGHTED elements of the art.\nUse giant display font, premium gold metal, gold chrome, metallic reflections, luxurious visual.`)}`

  const base_fidelidade = `${tx('FIDELIDADE FACIAL MÁXIMA (OBRIGATÓRIO)', 'MAXIMUM FACIAL FIDELITY (MANDATORY)')}${fotoWarn}\n${sep}\n\n${tx('UTILIZAR A FOTO ENVIADA COMO REFERÊNCIA PRINCIPAL DO ATLETA.\nPreservar identidade facial com máxima fidelidade possível.', 'USE THE UPLOADED PHOTO AS THE MAIN REFERENCE FOR THE ATHLETE.\nPreserve facial identity with maximum possible fidelity.')}\n\n${tx('MANTER EXATAMENTE:', 'KEEP EXACTLY:')}\n${tx('• formato do rosto • cabelo e linha do cabelo\n• sobrancelhas • olhos • nariz e boca • sorriso\n• tom de pele • idade aparente\n• proporções e características físicas reais • expressão natural', '• face shape • hair and hairline\n• eyebrows • eyes • nose and mouth • smile\n• skin tone • apparent age\n• real physical proportions and features • natural expression')}\n\n${tx('NÃO:', 'DO NOT:')}\n${tx('• estilizar • cartoonizar • transformar em personagem digital\n• criar rosto genérico • aplicar filtros artificiais\n\nO atleta final deve ser imediatamente reconhecível como a pessoa da foto enviada.', '• stylize • cartoonize • transform into a digital character\n• create a generic face • apply artificial filters\n\nThe final athlete must be immediately recognizable as the person from the uploaded photo.')}`

  const base_uniforme = `${tx('UNIFORME DO ATLETA', 'ATHLETE UNIFORM')}${logo1Warn}\n${sep}\n\n${tx('Vestir o atleta com o uniforme oficial:', 'Dress the athlete in the official uniform:')} ${uniformeDesc}.\n${hasLogo1 ? tx('Usar o escudo enviado como referência para a identidade visual do uniforme.', 'Use the uploaded badge as reference for the uniform visual identity.') : tx('ATENÇÃO: escudo do clube não enviado — usar identidade visual baseada nas cores informadas.', 'WARNING: club badge not uploaded — use visual identity based on the informed colors.')}\n${tx('Manter uniformidade com a identidade visual do', 'Maintain consistency with the visual identity of')} ${clube}.`

  const base_paleta = `${tx('PALETA DE CORES', 'COLOR PALETTE')}\n${sep}\n\n${tx('Paleta escolhida', 'Chosen palette')}: ${paleta}`

  const base_frase = `${tx('FRASE DE IMPACTO', 'IMPACT PHRASE')}\n${sep}\n\n"${frase}"\n\n${tx('Sempre criar frase inédita. Nunca repetir frases anteriores.\nRelacionada a: sonho • talento • futuro • determinação • evolução • paixão pelo futsal', 'Always create a unique phrase. Never repeat previous phrases.\nRelated to: dream • talent • future • determination • evolution • passion for futsal')}`

  const itensEvitar = idioma === 'en'
    ? ['distorted or deformed face', 'cartoon/drawing stylization', 'generic face that does not match the photo', 'malformed hands or fingers', 'illegible text or spelling errors', 'third-party brands or logos not requested', 'extra limbs or incorrect anatomy', 'low resolution, excessive blur, digital noise', 'visible watermark or signature']
    : ['rosto distorcido ou deformado', 'estilização tipo desenho/cartoon', 'rosto genérico que não corresponda à foto', 'mãos ou dedos malformados', 'texto ilegível ou com erros', 'marcas ou logos de terceiros não solicitados', 'membros extras ou anatomia incorreta', 'baixa resolução, blur excessivo, ruído digital', 'watermark ou assinatura visível']

  const base_negativo = ferramenta === 'Midjourney'
    ? `${tx('EVITAR (NEGATIVE PROMPT)', 'AVOID (NEGATIVE PROMPT)')}\n${sep}\n\n${tx('Usar como parâmetro --no no Midjourney:', 'Use as --no parameter in Midjourney:')}\n--no ${itensEvitar.join(', ')}`
    : `${tx('EVITAR (NEGATIVE PROMPT)', 'AVOID (NEGATIVE PROMPT)')}\n${sep}\n\n${tx('A arte NÃO deve conter:', 'The art must NOT contain:')}\n${itensEvitar.map((i: string) => '• ' + i).join('\n')}`

  let secoes: SecaoContent = {}

  if (tipo === 'Card MVP') {
    secoes = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: CARD MVP\nCard de destaque individual — o atleta é o único protagonista.\nSem adversário. Sem placar. Apenas o craque em evidência máxima.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — CARD MVP\n${sep}\n\nCard de premiação do Melhor em Campo.\n\n${int.desc}\n\nReferências visuais:\n• Ballon d'Or • FIFA TOTY • UEFA POTY • Cards premium de coleção\n\nEfeitos especiais:\n• Aura dourada ao redor do atleta\n• Background de gradiente premium\n• Brilho e reflexo metálico no nome\n• Selo "MVP" ou "Melhor em Campo" em destaque\n\nVARIAÇÃO — GERAÇÃO #${genCount}:${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — CARD MVP\n${sep}\n\nPOSE: confiante, altivo, celebrando ou olhando para câmera\nÂNGULO: ${angulo}\n\nExpressão: sorriso de vitória ou olhar determinado de campeão\nAtleta ocupa 70-80% do card. Fundo desfocado com efeito bokeh premium.`,
      cenario: `CENÁRIO & ILUMINAÇÃO — CARD MVP\n${sep}\n\nBackground: gradiente premium ou ginásio desfocado ao fundo\n\nILUMINAÇÃO:\nStudio lighting premium. Rim light dourado. High key lighting. Aura luminosa.${iluminacaoVar ? '\nEstilo desta geração: ' + iluminacaoVar + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — CARD MVP\n${sep}\n\nSELO MVP:\n"MVP" ou "⭐ MELHOR EM CAMPO"\n→ Fonte display enorme. Dourado metálico.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Fonte gigante. Gold chrome. Reflexos.\n\nCLUBE & CATEGORIA:\n${clube.toUpperCase()} · ${categoria.toUpperCase()}${tipografiaVar ? '\n\nEstilo tipográfico desta geração: ' + tipografiaVar + '.' : ''}`,
      partida: `DADOS DO CARD MVP\n${sep}\n\n📅 ${data}\n🏆 ${campeonato.toUpperCase()}\n\nNão exibir adversário nem horário. Foco exclusivo na premiação individual.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — CARD MVP\n${sep}\n\nUltra realistic. Hyper realistic. 8K resolution.\nPremium collector card aesthetic. Gold foil typography.\nMaximum facial fidelity.\n\nFORMATO: ${tipo} · Proporção 4:5${sufixoFerramenta()}`,
      negativo: base_negativo,
    }

  } else if (tipo === 'Card Convocação') {
    secoes = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: CARD DE CONVOCAÇÃO\nTom: convocação épica, chamada para a guerra no campo.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — CONVOCAÇÃO\n${sep}\n\nArte de convocação oficial. Tom militar esportivo.\n${int.desc}\n\nElementos obrigatórios:\n• "CONVOCADO" ou "É HORA DA BATALHA" em destaque\n• Escudos dos dois clubes lado a lado${logo2Warn}\n• Atmosfera de guerra esportiva\n• Data e hora da partida em destaque visual\n\nVARIAÇÃO — GERAÇÃO #${genCount}:${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — CONVOCAÇÃO\n${sep}\n\nPOSE: olhando para câmera com determinação — pose de guerreiro convocado\nÂNGULO: ${angulo}\n\nExpressão: ${int.expressao}`,
      cenario: `CENÁRIO — CONVOCAÇÃO\n${sep}\n\nAmbiente: ${cenarioEfetivo}\n\nEfeitos: fumaça dramática, luz de holofote, sombras contrastadas\n\nILUMINAÇÃO:\nDramatic backlight. Hard light. Volumetric light beam.${iluminacaoVar ? '\nEstilo desta geração: ' + iluminacaoVar + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — CONVOCAÇÃO\n${sep}\n\nCABEÇALHO:\n"CONVOCADO" ou "É HORA"\n→ Fonte bold display. Caixa alta.\n\nCONFRONTO:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n→ Fonte metálica grande.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Gold chrome.\n\nDATA & HORA:\n📅 ${data} · 🕒 ${hora}\n→ Badge esportivo.${tipografiaVar ? '\n\nEstilo tipográfico: ' + tipografiaVar + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — CONVOCAÇÃO\n${sep}\n\n📅 DATA: ${data}\n🕒 HORÁRIO: ${hora}\n📍 LOCAL: ${local}\n\nVS: ${clube.toUpperCase()} × ${adv.toUpperCase()}\n\nDestaque máximo nas informações da partida.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — CONVOCAÇÃO\n${sep}\n\nUltra realistic. Hyper realistic. Cinematic. 8K resolution.\nEpic sports poster. Maximum facial fidelity.\n\nFORMATO: ${tipo} · Story 9:16${sufixoFerramenta()}`,
      negativo: base_negativo,
    }

  } else if (tipo === 'Banner horizontal') {
    secoes = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: BANNER HORIZONTAL\nComposição em formato wide/landscape.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — BANNER HORIZONTAL\n${sep}\n\nBanner de divulgação do confronto. Formato landscape/wide.\n${int.desc}\n\nComposição em três zonas:\n• ESQUERDA: identidade do ${clube.toUpperCase()}\n• CENTRO: atleta ${nome.toUpperCase()} em destaque\n• DIREITA: identidade do ${adv.toUpperCase()}\n\nVARIAÇÃO — GERAÇÃO #${genCount}:${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — BANNER\n${sep}\n\nPOSE: ação dinâmica ou pose de confronto — atleta ao centro do banner\nÂNGULO: eye level ou low angle dramático\n\nExpressão: ${int.expressao}`,
      cenario: `CENÁRIO — BANNER HORIZONTAL\n${sep}\n\nAmbiente: ${cenarioEfetivo}\nFundo adequado para formato wide\n\nDivisão: metade esquerda nas cores do ${clube}, direita nas cores do ${adv}\n\nILUMINAÇÃO:\nCinematic wide lighting. Dual rim light.${iluminacaoVar ? '\nEstilo desta geração: ' + iluminacaoVar + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — BANNER\n${sep}\n\nCONFRONTO:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n→ Grande. Metálico. Centralizado.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Gold chrome.\n\nDATA & LOCAL:\n📅 ${data} · 🕒 ${hora} · 📍 ${local}${tipografiaVar ? '\n\nEstilo tipográfico: ' + tipografiaVar + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — BANNER\n${sep}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — BANNER\n${sep}\n\nUltra realistic. Widescreen cinematic. 8K resolution.\nSports broadcast banner quality.\n\nFORMATO: ${tipo} · Proporção 16:9${sufixoFerramenta()}`,
      negativo: base_negativo,
    }

  } else if (tipo === 'Feed Instagram 4:5') {
    secoes = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: FEED INSTAGRAM 4:5\nComposição vertical equilibrada para feed do Instagram.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — FEED 4:5\n${sep}\n\nPost para feed do Instagram. Proporção 4:5.\n${int.desc}\n\nImpacto visual imediato — 1,5 segundos para chamar atenção.\n\nVARIAÇÃO — GERAÇÃO #${genCount}:${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `AÇÃO DO ATLETA — FEED\n${sep}\n\nAÇÃO: ${acao}\nÂNGULO: ${angulo}\n\nExpressão: ${int.expressao}\nAtleta ocupa 60-70% da composição.`,
      cenario: `CENÁRIO — FEED\n${sep}\n\nAmbiente: ${cenarioEfetivo}\n\nILUMINAÇÃO:\nCinematic lighting. Professional sports photography.${iluminacaoVar ? '\nEstilo desta geração: ' + iluminacaoVar + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — FEED 4:5\n${sep}\n\nZONA SUPERIOR:\n${campeonato.toUpperCase()}\n\nZONA CENTRAL:\n${nome.toUpperCase()}\n→ Gold chrome.\n\nZONA INFERIOR:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n📅 ${data} · 🕒 ${hora}${tipografiaVar ? '\n\nEstilo tipográfico: ' + tipografiaVar + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — FEED\n${sep}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — FEED 4:5\n${sep}\n\nUltra realistic. 8K resolution. Instagram feed optimized.\nMaximum facial fidelity.\n\nFORMATO: ${tipo} · Proporção 4:5 (1080×1350px)${sufixoFerramenta()}`,
      negativo: base_negativo,
    }

  } else {
    // Story 9:16
    secoes = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: INSTAGRAM STORY 9:16\nArte vertical para Instagram Stories.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — STORY 9:16\n${sep}\n\n${int.desc}\n\nArte vertical de alto impacto. Proporção 9:16.\nAtleta como protagonista absoluto.\n\nVARIAÇÃO — GERAÇÃO #${genCount}:${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `AÇÃO DO ATLETA — STORY\n${sep}\n\nAÇÃO: ${acao}\nÂNGULO: ${angulo}\n\nExpressão: ${int.expressao}\nAtleta ocupa 70% da arte.`,
      cenario: `CENÁRIO & ILUMINAÇÃO — STORY\n${sep}\n\nAmbiente: ${cenarioEfetivo}\n\nILUMINAÇÃO:\nCinematic. High contrast. Rim light premium.\nVolumetric light.${iluminacaoVar ? '\nEstilo desta geração: ' + iluminacaoVar + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — STORY 9:16\n${sep}\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Fonte gigante. Gold chrome. Topo da arte.\n\nCONFRONTO:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n→ Centralizado.\n\nDATA & LOCAL:\n📅 ${data} · 🕒 ${hora}\n📍 ${local}\n→ Rodapé premium.${tipografiaVar ? '\n\nEstilo tipográfico: ' + tipografiaVar + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — STORY\n${sep}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}\n\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n${campeonato.toUpperCase()}`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — STORY\n${sep}\n\nUltra realistic. Hyper realistic. Photorealistic.\n8K resolution. Maximum detail. HDR.\nMaximum facial fidelity.\n\nFORMATO: ${tipo} · Proporção 9:16 (1080×1920px)${sufixoFerramenta()}`,
      negativo: base_negativo,
    }
  }

  return { secoes, paleta, acao, angulo, cenarioVar, layoutVar, iluminacaoVar, tipografiaVar }
}

export function buildFullPrompt(secoes: SecaoContent): string {
  return SECOES_ORDER.map(k => secoes[k as keyof SecaoContent] || '').filter(Boolean).join('\n\n')
}
