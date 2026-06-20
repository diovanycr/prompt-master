// ═══════════════════════════════════
// STATE
// ═══════════════════════════════════
let genCount = 0;
let intensidade = 'Confronto';
let fraseSelecionada = '🎲 IA cria frase inédita automaticamente';
let currentTab = 'secoes';
let promptAnterior = '';
let idioma = 'pt';
const generationStack = [];

function tx(pt, en){ return idioma === 'en' ? en : pt; }

function toggleIdioma(){
  idioma = idioma === 'pt' ? 'en' : 'pt';
  const btn = document.getElementById('langToggle');
  btn.textContent = idioma === 'en' ? '🇺🇸' : '🇧🇷';
  btn.title = idioma === 'en' ? 'Prompt em inglês — clique para português' : 'Prompt em português — clique para inglês';
  localStorage.setItem('prospere_idioma', idioma);
  mostrarToast(idioma === 'en' ? '🇺🇸 Prompt will be generated in English' : '🇧🇷 Prompt será gerado em português', 'success');
}

const intensidadeMap = {
  Celebracao: {
    desc:'Arte de celebração: alegria, conquista, confetes, expressão de vitória e festa.',
    cenario:'ambiente de celebração pós-vitória, festa, confetes, torcida em euforia',
    expressao:'comemorando com alegria e euforia, grito de vitória, punho erguido',
    slogan:'tom de conquista e celebração, frases de vitória e alegria'
  },
  Confronto: {
    desc:'Arte épica de confronto: energia máxima, expressão determinada, arena de batalha.',
    cenario:'arena de batalha, atmosfera de final, tensão máxima, luzes dramáticas de confronto',
    expressao:'determinado, focado, olhar de guerreiro, confiança máxima antes do jogo',
    slogan:'tom épico e de desafio, frases de garra e determinação'
  },
  Institucional: {
    desc:'Arte institucional: elegante, profissional, representação oficial do clube.',
    cenario:'ginásio profissional moderno, atmosfera clean e premium, identidade visual do clube',
    expressao:'postura confiante e profissional, representando o clube com orgulho',
    slogan:'tom institucional e de orgulho do clube, frases inspiradoras e elegantes'
  },
  // modos pós-jogo
  PosVitoria: {
    desc:'Arte de pós-jogo — VITÓRIA: explosão de alegria, conquista épica, celebração máxima.',
    cenario:'vestiário em festa, confetes dourados, torcida em êxtase, luzes de celebração',
    expressao:'grito de vitória, punho erguido, sorriso de campeão, emoção pura',
    slogan:'tom de conquista e triunfo — "Vencemos!", frases épicas de vitória'
  },
  PosEmpate: {
    desc:'Arte de pós-jogo — EMPATE: determinação, resiliência e cabeça erguida.',
    cenario:'ginásio ao fim do jogo, clima de respeito mútuo, equipe unida',
    expressao:'cabeça erguida, determinado, resiliente, olhar de quem segue em frente',
    slogan:'tom de determinação e continuidade — "A luta continua", superação'
  },
  PosDerrota: {
    desc:'Arte de pós-jogo — DERROTA: garra, superação e foco no próximo desafio.',
    cenario:'ginásio silencioso, luzes frias, clima de reflexão e determinação para o futuro',
    expressao:'olhar resoluto, determinação silenciosa, garra de quem já quer a revanche',
    slogan:'tom de superação e revanche — "Voltaremos mais fortes", resiliência'
  }
};

// SEÇÕES DO PROMPT (editáveis)
const SECOES = [
  { id:'identidade', title:'🪪 Identidade Fixa' },
  { id:'fidelidade', title:'👤 Fidelidade Facial' },
  { id:'conceito', title:'🎬 Conceito Visual' },
  { id:'uniforme', title:'👕 Uniforme' },
  { id:'acao', title:'⚡ Ação & Câmera' },
  { id:'cenario', title:'🏟️ Cenário & Iluminação' },
  { id:'paleta', title:'🎨 Paleta de Cores' },
  { id:'tipografia', title:'✍️ Tipografia & Textos' },
  { id:'partida', title:'📅 Informações da Partida' },
  { id:'frase', title:'💬 Frase de Impacto' },
  { id:'qualidade', title:'🏆 Qualidade Final' },
  { id:'negativo', title:'🚫 Evitar (Negative Prompt)' },
];

let secaoContent = {};

// ═══════════════════════════════════
// UPLOADS
// ═══════════════════════════════════
// guarda os arquivos originais enviados, para permitir download posterior
const uploadedFiles = {};

function setupUpload(inputId, prevId, txtId, boxId, obrigatorio){
  document.getElementById(inputId).addEventListener('change', e => {
    const f = e.target.files[0];
    if(!f) return;
    uploadedFiles[inputId] = f;
    const img = document.getElementById(prevId);
    img.src = URL.createObjectURL(f);
    img.style.display = 'block';
    document.getElementById(txtId).style.display = 'none';
    const box = document.getElementById(boxId);
    box.classList.add('has-img');
    if(obrigatorio) box.classList.remove('missing');
    checkWarnings();
    atualizarBotaoBaixarImgs();
  });
}
setupUpload('fotoAtleta','prev-atleta','txt-atleta','box-atleta',true);
setupUpload('logo1','prev-logo1','txt-logo1','box-logo1',true);
setupUpload('logo2','prev-logo2','txt-logo2','box-logo2',false);

function atualizarBotaoBaixarImgs(){
  const btn = document.getElementById('btnBaixarImgs');
  const temAlguma = Object.keys(uploadedFiles).length > 0;
  btn.style.display = temAlguma ? 'block' : 'none';
}

function baixarImagens(){
  const labels = { fotoAtleta: 'foto-atleta', logo1: 'escudo-prospere', logo2: 'escudo-adversario' };
  const nomes = Object.keys(uploadedFiles);
  if(!nomes.length){ mostrarToast('⚠️ Nenhuma imagem enviada ainda','warn'); return; }

  const advSlug = (v('adv') || 'partida').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  nomes.forEach((key, i) => {
    const file = uploadedFiles[key];
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const label = labels[key] || key;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label}-${advSlug}.${ext}`;
    document.body.appendChild(a);
    // pequeno delay entre cliques para evitar que o navegador bloqueie downloads múltiplos simultâneos
    setTimeout(() => {
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, i * 300);
  });

  mostrarToast(`📥 Baixando ${nomes.length} imagem(ns)...`, 'success');
}

function checkWarnings(){
  const missing = [];
  if(!document.getElementById('box-atleta').classList.contains('has-img')) missing.push('foto do atleta');
  if(!document.getElementById('box-logo1').classList.contains('has-img')) missing.push('escudo Prospere');
  const banner = document.getElementById('warnBanner');
  if(missing.length){
    document.getElementById('warnMsg').textContent = '⚠️ Pendente: ' + missing.join(', ');
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
}
checkWarnings();

// ═══════════════════════════════════
// TOGGLES
// ═══════════════════════════════════
document.querySelectorAll('.toggle-group').forEach(g => {
  g.querySelectorAll('.toggle').forEach(b => {
    b.addEventListener('click', () => {
      g.querySelectorAll('.toggle').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
});

function getToggle(groupId){
  const a = document.querySelector(`#${groupId} .toggle.active`);
  return a ? a.dataset.val : '';
}
function setToggle(groupId, val){
  const g = document.getElementById(groupId);
  g.querySelectorAll('.toggle').forEach(b => {
    b.classList.toggle('active', b.dataset.val === val);
  });
}

// ═══════════════════════════════════
// INTENSIDADE
// ═══════════════════════════════════
function setIntensidade(btn){
  document.querySelectorAll('.int-btn').forEach(b => b.className = 'int-btn');
  const val = btn.dataset.val;
  btn.classList.add('active-' + val.toLowerCase());
  intensidade = val;
  document.getElementById('int-desc').textContent = intensidadeMap[val].desc;
}
// init
document.querySelectorAll('.int-btn').forEach(b => { if(b.dataset.val === 'Confronto') b.classList.add('active-confronto'); });

function setModoJogo(btn){
  document.querySelectorAll('#modoGroup .toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const isPosJogo = btn.dataset.val === 'postgame';
  const fields = document.getElementById('posJogoFields');
  if(fields) fields.style.display = isPosJogo ? 'block' : 'none';
}

// ═══════════════════════════════════
// FRASES
// ═══════════════════════════════════
function selecionarFrase(el){
  document.querySelectorAll('.frase-chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  fraseSelecionada = el.textContent;
  document.getElementById('fraseCustom').value = '';
}

// ═══════════════════════════════════
// BUILD SECTIONS
// ═══════════════════════════════════
function buildSections(data){
  secaoContent = data;
  const container = document.getElementById('tab-secoes');
  container.innerHTML = '';
  SECOES.forEach(s => {
    const div = document.createElement('div');
    div.className = 'psec';
    div.id = 'psec-' + s.id;
    div.innerHTML = `
      <div class="psec-header" onclick="toggleSec('${s.id}')">
        <span class="psec-title">${s.title}</span>
        <span class="psec-dot" title="Seção editada manualmente"></span>
        <span class="psec-chevron">▼</span>
      </div>
      <div class="psec-body">
        <textarea id="stxt-${s.id}" oninput="secaoContent['${s.id}']=this.value;syncRaw();marcarModificada('${s.id}')">${data[s.id]||''}</textarea>
      </div>`;
    container.appendChild(div);
  });
}

function marcarModificada(id){
  const el = document.getElementById('psec-' + id);
  if(el) el.classList.add('modified');
}

function toggleSec(id){
  const el = document.getElementById('psec-' + id);
  el.classList.toggle('open');
}

function syncRaw(){
  const full = buildFullPrompt();
  document.getElementById('rawOut').value = full;
  const chars = full.length;
  const tokens = Math.round(chars / 4.5);
  document.getElementById('charCount').textContent = chars + ' chars';
  const tc = document.getElementById('tokenCount');
  if(tc) tc.textContent = '~' + tokens + ' tokens';
  if(currentTab === 'preview') renderPreview();
}

function buildFullPrompt(){
  return SECOES.map(s => secaoContent[s.id] || '').filter(Boolean).join('\n\n');
}

// ═══════════════════════════════════
// GERAR
// ═══════════════════════════════════
const PALETAS = ['azul royal e dourado','preto e dourado premium','grafite e prata metálica','azul royal e branco','vermelho e preto','roxo neon premium','verde esmeralda e prata'];
const ACOES = ['conduzindo a bola com maestria','finalizando a gol com potência','driblando o adversário','comemorando gol com euforia','correndo em velocidade máxima','disputando posse de bola','protegendo a posse com habilidade'];
const ANGULOS = ['low angle dramático','eye level esportivo','dynamic side angle','cinematic tracking shot','dramatic close-up no atleta','wide arena shot','action shot cinematográfico'];

// Bancos extras de variação — tudo aqui pode mudar livremente entre gerações.
// NUNCA usar estes bancos para alterar identidade do atleta, escudos ou uniforme.
const CENARIOS = [
  'ginásio profissional lotado, torcida em festa',
  'arena moderna com telão de LED ao fundo',
  'quadra de clássico estadual, clima de decisão',
  'túnel de entrada do ginásio, luz dramática vazando',
  'noite de campeonato, holofotes principais acesos',
  'vestiário épico antes da entrada em quadra',
  'gramado/quadra com fumaça cênica leve e atmosfera de filme',
  'arena com confetes e luzes de celebração'
];
const LAYOUTS = [
  'composição assimétrica, atleta deslocado para a esquerda com espaço negativo à direita',
  'composição centralizada, atleta exatamente no eixo central da arte',
  'composição diagonal, linhas de força guiando o olhar de baixo para cima',
  'composição em camadas, atleta em primeiro plano e elementos gráficos em profundidade',
  'composição com moldura interna (frame dentro da arte) destacando o atleta',
  'composição estilo pôster de cinema, atleta ocupando 2/3 da arte',
  'composição com grid moderno e blocos de cor geométricos'
];
const ESTILOS_ILUMINACAO = [
  'iluminação cinematográfica com contraste alto e sombras marcadas',
  'iluminação dourada de golden hour, tom quente e nostálgico',
  'iluminação neon vibrante, contornos coloridos no atleta',
  'iluminação de estúdio premium, luz suave e uniforme',
  'iluminação dramática com rim light forte contornando o atleta',
  'iluminação volumétrica com feixes de luz atravessando a cena',
  'iluminação de transmissão esportiva ao vivo (broadcast lighting)'
];
const ESTILOS_TIPOGRAFIA = [
  'tipografia bold condensada, estilo jersey esportivo',
  'tipografia serifada premium, estilo editorial de revista esportiva',
  'tipografia futurista geométrica, estilo e-sports',
  'tipografia manuscrita energética combinada com bloco bold',
  'tipografia minimalista clean, hierarquia visual forte',
  'tipografia metálica 3D com efeito de profundidade',
  'tipografia estêncil militar, estilo convocação de elite'
];

// guarda o último valor sorteado de cada categoria, para nunca repetir 2x consecutivas
const ultimoSorteio = { paleta:null, acao:null, angulo:null, cenario:null, layout:null, iluminacao:null, tipografia:null };

// categorias "travadas" pelo usuário — não são re-sorteadas em 🎲 Variação enquanto travadas
const categoriasTravadas = { paleta:false, acao:false, angulo:false, cenario:false, layout:false, iluminacao:false, tipografia:false };

// sorteia um valor de um banco, evitando repetir o último sorteado (se o banco tiver mais de 1 opção)
function sortearSemRepetir(banco, chave){
  if(banco.length <= 1) return banco[0];
  let escolha;
  do { escolha = banco[Math.floor(Math.random()*banco.length)]; }
  while(escolha === ultimoSorteio[chave]);
  ultimoSorteio[chave] = escolha;
  return escolha;
}

function toggleTravamento(chave, btn){
  categoriasTravadas[chave] = !categoriasTravadas[chave];
  btn.classList.toggle('locked', categoriasTravadas[chave]);
  btn.textContent = categoriasTravadas[chave] ? '🔒' : '🔓';
  btn.title = categoriasTravadas[chave] ? 'Travado — não será sorteado na Variação' : 'Destravado — será sorteado na Variação';
}
function toggleLockPanel(){
  document.getElementById('lockPanel').classList.toggle('open');
}
document.addEventListener('click', e => {
  const panel = document.getElementById('lockPanel');
  if(!panel) return;
  const trigger = e.target.closest('[onclick*="toggleLockPanel"]');
  if(!panel.contains(e.target) && !trigger) panel.classList.remove('open');
});

function gerar(aleatorio){
  // salva estado atual na pilha de desfazer antes de sobrescrever
  if(Object.keys(secaoContent).length){
    generationStack.push(JSON.parse(JSON.stringify(secaoContent)));
    if(generationStack.length > 15) generationStack.shift();
  }

  if(!aleatorio){
    const problemas = validarCampos();
    if(problemas.length) mostrarToast('⚠️ Faltando: ' + problemas.join(', '), 'warn');
  }

  const nome = v('nome') || 'Kaio Genaro';
  const clube = v('clube') || 'Prospere Hortolândia Futsal';
  const categoria = v('categoria') || 'Sub-8';
  const campeonato = v('campeonato') || 'Campeonato Paulista A1 de Futsal 2026';
  const adv = v('adv') || '[ADVERSÁRIO]';
  registrarAdversario(v('adv'));
  const data = v('data') || '[DATA]';
  const hora = v('hora') || '[HORÁRIO]';
  const local = v('local') || '[LOCAL]';
  const u1 = v('uniforme1');
  const u2 = v('uniforme2');
  const uniformeDesc = (u1||u2) ? `${u1||''}${u2?' e '+u2:''}` : tx('conforme uniforme oficial do clube','as per the official club uniform');

  // modo pós-jogo
  const modoEl = document.getElementById('modoGroup');
  const modoAtivo = modoEl ? (modoEl.querySelector('.toggle.active')?.dataset.val || 'pregame') : 'pregame';
  const isPosJogo = modoAtivo === 'postgame';
  const golsNos = parseInt(v('golsNos') || '0') || 0;
  const golsAdv = parseInt(v('golsAdv') || '0') || 0;
  const placar = isPosJogo ? `${golsNos} × ${golsAdv}` : null;
  const resultado = isPosJogo
    ? (golsNos > golsAdv ? 'vitoria' : golsNos < golsAdv ? 'derrota' : 'empate')
    : null;

  const tipo = getToggle('tipoGroup');
  const ferramenta = getToggle('ferramentaGroup');
  const fraseCustom = v('fraseCustom');
  const frase = fraseCustom || (fraseSelecionada.startsWith('🎲')
    ? tx('IA cria frase inédita e inspiradora, nunca antes usada','AI creates a unique and inspiring phrase, never used before')
    : fraseSelecionada);

  // Aspect ratio por tipo de arte, em formato neutro (usado para adaptar à sintaxe de cada ferramenta)
  const aspectRatioMap = {
    'Instagram Story 9:16': '9:16',
    'Feed Instagram 4:5': '4:5',
    'Banner horizontal': '16:9',
    'Card MVP': '4:5',
    'Card Convocação': '9:16'
  };
  const ar = aspectRatioMap[tipo] || '9:16';

  // Sufixo técnico que cada ferramenta espera, ao final do prompt completo
  function sufixoFerramenta(){
    if(ferramenta === 'Midjourney') return `\n\n--ar ${ar} --v 6 --style raw --q 2`;
    if(ferramenta === 'ChatGPT') return `\n\n[Anexe a foto do atleta e os escudos junto com este texto. Proporção de imagem: ${ar}.]`;
    if(ferramenta === 'Gemini') return `\n\n[Anexe a foto do atleta e os escudos junto com este texto. Gere em proporção ${ar}.]`;
    return `\n\nProporção de imagem: ${ar}.`;
  }

  let paleta = (aleatorio && !categoriasTravadas.paleta) ? sortearSemRepetir(PALETAS,'paleta') : getToggle('paletaGroup');
  let acao = (aleatorio && !categoriasTravadas.acao) ? sortearSemRepetir(ACOES,'acao') : getToggle('acaoGroup');
  let angulo = (aleatorio && !categoriasTravadas.angulo) ? sortearSemRepetir(ANGULOS,'angulo') : getToggle('anguloGroup');

  // Variação extra (só no modo 🎲 Variação): cenário, layout, iluminação e tipografia.
  // Identidade do atleta, escudos e uniforme NUNCA entram nesta sorteação.
  // Categorias travadas pelo usuário mantêm o último valor sorteado em vez de re-sortear.
  const cenarioVar = aleatorio ? (categoriasTravadas.cenario ? ultimoSorteio.cenario : sortearSemRepetir(CENARIOS,'cenario')) : null;
  const layoutVar = aleatorio ? (categoriasTravadas.layout ? ultimoSorteio.layout : sortearSemRepetir(LAYOUTS,'layout')) : null;
  const iluminacaoVar = aleatorio ? (categoriasTravadas.iluminacao ? ultimoSorteio.iluminacao : sortearSemRepetir(ESTILOS_ILUMINACAO,'iluminacao')) : null;
  const tipografiaVar = aleatorio ? (categoriasTravadas.tipografia ? ultimoSorteio.tipografia : sortearSemRepetir(ESTILOS_TIPOGRAFIA,'tipografia')) : null;

  if(aleatorio){
    // Atualiza visualmente os toggles com os valores sorteados
    setToggle('paletaGroup', paleta);
    setToggle('acaoGroup', acao);
    setToggle('anguloGroup', angulo);
  }

  // intensidade efetiva: pós-jogo sobrepõe a intensidade manual
  const intensidadeEfetiva = isPosJogo
    ? (resultado === 'vitoria' ? 'PosVitoria' : resultado === 'derrota' ? 'PosDerrota' : 'PosEmpate')
    : intensidade;
  const int = intensidadeMap[intensidadeEfetiva];
  genCount++;
  document.getElementById('genNum').textContent = genCount;

  const hasFoto = document.getElementById('box-atleta').classList.contains('has-img');
  const hasLogo1 = document.getElementById('box-logo1').classList.contains('has-img');
  const hasLogo2 = document.getElementById('box-logo2').classList.contains('has-img');

  const fotoWarn = !hasFoto ? `\n${tx('⚠️ ATENÇÃO: FOTO DO ATLETA NÃO ENVIADA','⚠️ WARNING: ATHLETE PHOTO NOT UPLOADED')}\n` : '';
  const logo1Warn = !hasLogo1 ? `\n${tx('⚠️ ATENÇÃO: ESCUDO PROSPERE NÃO ENVIADO','⚠️ WARNING: PROSPERE BADGE NOT UPLOADED')}\n` : '';
  const logo2Warn = !hasLogo2 ? `\n${tx('⚠️ ATENÇÃO: ESCUDO DO ADVERSÁRIO NÃO ENVIADO — integre o escudo de ','⚠️ WARNING: OPPONENT BADGE NOT UPLOADED — add the badge of ')}${adv.toUpperCase()}${tx(' quando disponível','')} \n` : '';

  const placarBloco = isPosJogo && placar
    ? `\n${tx('RESULTADO FINAL','FINAL SCORE')}: ${clube.toUpperCase()} ${placar} ${adv.toUpperCase()}\n${tx('Resultado','Result')}: ${resultado === 'vitoria' ? tx('VITÓRIA 🏆','VICTORY 🏆') : resultado === 'derrota' ? tx('DERROTA — resiliência e superação','DEFEAT — resilience and growth') : tx('EMPATE — cabeça erguida','DRAW — heads up')}\n`
    : '';

  // ── BLOCOS BASE ──────────────────────────────────────────────────────
  const base_identidade = `${tx('IDENTIDADE FIXA','FIXED IDENTITY')}\n${'─'.repeat(40)}\n\n${tx('Atleta','Athlete')}: ${nome.toUpperCase()}\n${tx('Clube','Club')}: ${clube.toUpperCase()}\n${tx('Campeonato','Championship')}: ${campeonato.toUpperCase()}\n${tx('Categoria','Category')}: ${categoria.toUpperCase()}${placarBloco}\n\n${tx(`O nome ${nome.toUpperCase()} deve ser um dos elementos MAIS DESTACADOS da arte.\nUsar fonte gigante, metal dourado premium, gold chrome, reflexos metálicos, visual luxuoso.`,`The name ${nome.toUpperCase()} must be one of the MOST HIGHLIGHTED elements of the art.\nUse giant display font, premium gold metal, gold chrome, metallic reflections, luxurious visual.`)}`;

  const base_fidelidade = `${tx('FIDELIDADE FACIAL MÁXIMA (OBRIGATÓRIO)','MAXIMUM FACIAL FIDELITY (MANDATORY)')}${fotoWarn}\n${'─'.repeat(40)}\n\n${tx('UTILIZAR A FOTO ENVIADA COMO REFERÊNCIA PRINCIPAL DO ATLETA.\nPreservar identidade facial com máxima fidelidade possível.','USE THE UPLOADED PHOTO AS THE MAIN REFERENCE FOR THE ATHLETE.\nPreserve facial identity with maximum possible fidelity.')}\n\n${tx('MANTER EXATAMENTE:','KEEP EXACTLY:')}\n${tx('• formato do rosto • cabelo e linha do cabelo\n• sobrancelhas • olhos • nariz e boca • sorriso\n• tom de pele • idade aparente\n• proporções e características físicas reais • expressão natural','• face shape • hair and hairline\n• eyebrows • eyes • nose and mouth • smile\n• skin tone • apparent age\n• real physical proportions and features • natural expression')}\n\n${tx('NÃO:','DO NOT:')}\n${tx('• estilizar • cartoonizar • transformar em personagem digital\n• criar rosto genérico • aplicar filtros artificiais\n\nO atleta final deve ser imediatamente reconhecível como a criança da foto enviada.','• stylize • cartoonize • transform into a digital character\n• create a generic face • apply artificial filters\n\nThe final athlete must be immediately recognizable as the child from the uploaded photo.')}`;

  const base_uniforme = `${tx('UNIFORME DO ATLETA','ATHLETE UNIFORM')}${logo1Warn}\n${'─'.repeat(40)}\n\n${tx('Vestir o atleta com o uniforme oficial:','Dress the athlete in the official uniform:')} ${uniformeDesc}.\n${hasLogo1 ? tx('Usar o escudo enviado como referência para a identidade visual do uniforme.','Use the uploaded badge as reference for the uniform visual identity.') : tx('ATENÇÃO: escudo Prospere não enviado — usar identidade visual baseada nas cores informadas.','WARNING: Prospere badge not uploaded — use visual identity based on the informed colors.')}\n${tx('Manter uniformidade com a identidade visual do','Maintain consistency with the visual identity of')} ${clube}.`;

  const base_paleta = `${tx('PALETA DE CORES','COLOR PALETTE')}\n${'─'.repeat(40)}\n\n${tx('Paleta escolhida','Chosen palette')}: ${paleta}\n\n${tx('Opções aceitas:\n• azul e dourado • azul e prata • preto e dourado\n• grafite e prata • vermelho e preto • azul royal e branco\n• roxo neon • verde esmeralda premium\n• combinações cinematográficas exclusivas','Accepted options:\n• blue and gold • blue and silver • black and gold\n• graphite and silver • red and black • royal blue and white\n• neon purple • premium emerald green\n• exclusive cinematic combinations')}`;

  const base_frase = `${tx('FRASE DE IMPACTO','IMPACT PHRASE')}\n${'─'.repeat(40)}\n\n"${frase}"\n\n${tx('Sempre criar frase inédita. Nunca repetir frases anteriores.\nRelacionada a: sonho • talento • futuro • determinação • evolução • paixão pelo futsal','Always create a unique phrase. Never repeat previous phrases.\nRelated to: dream • talent • future • determination • evolution • passion for futsal')}`;

  const cenarioEfetivo = aleatorio ? `${int.cenario}. ${cenarioVar}` : int.cenario;
  const iluminacaoEfetiva = aleatorio ? iluminacaoVar : null;
  const layoutEfetivo = aleatorio ? layoutVar : null;
  const tipografiaEfetiva = aleatorio ? tipografiaVar : null;

  const blocoVariacaoExtra = aleatorio ? `\n\n${tx('VARIAÇÃO DE COMPOSIÇÃO','COMPOSITION VARIATION')} (${tx('GERAÇÃO','GENERATION')} #${genCount}):\n• ${tx('Layout','Layout')}: ${layoutEfetivo}\n${iluminacaoEfetiva ? `• ${tx('Iluminação','Lighting')}: ${iluminacaoEfetiva}\n` : ''}${tipografiaEfetiva ? `• ${tx('Estilo de tipografia','Typography style')}: ${tipografiaEfetiva}\n` : ''}\n${tx('IMPORTANTE: variar livremente composição, layout, iluminação e tipografia.\nNÃO alterar identidade do atleta, rosto, escudos ou uniforme — esses permanecem fixos.','IMPORTANT: freely vary composition, layout, lighting and typography.\nDO NOT change athlete identity, face, badges or uniform — these remain fixed.')}` : '';

  const itensEvitar = tx(
    ['rosto distorcido ou deformado','estilização tipo desenho/cartoon do atleta','rosto genérico que não corresponda à foto enviada','mãos ou dedos malformados','texto ilegível, embaralhado ou com erros de ortografia','marcas, logos ou patrocinadores de terceiros não solicitados','membros extras ou anatomia incorreta','baixa resolução, blur excessivo, ruído digital','watermark ou assinatura visível','proporções de corpo infantil incorretas para a idade informada'],
    ['distorted or deformed face','cartoon/drawing stylization of the athlete','generic face that does not match the uploaded photo','malformed hands or fingers','illegible, scrambled text or spelling errors','third-party brands, logos or sponsors not requested','extra limbs or incorrect anatomy','low resolution, excessive blur, digital noise','visible watermark or signature','incorrect child body proportions for the stated age']
  );
  const base_negativo = ferramenta === 'Midjourney'
    ? `${tx('EVITAR (NEGATIVE PROMPT)','AVOID (NEGATIVE PROMPT)')}\n${'─'.repeat(40)}\n\n${tx('Usar como parâmetro --no no Midjourney:','Use as --no parameter in Midjourney:')}\n--no ${itensEvitar.join(', ')}\n\n${tx('Reforço textual: a arte NÃO deve conter nenhum dos itens acima.','Text reinforcement: the art must NOT contain any of the items above.')}`
    : `${tx('EVITAR (NEGATIVE PROMPT)','AVOID (NEGATIVE PROMPT)')}\n${'─'.repeat(40)}\n\n${tx('A arte NÃO deve conter:','The art must NOT contain:')}\n${itensEvitar.map(i => '• ' + i).join('\n')}\n\n${tx('Priorize sempre a fidelidade facial real do atleta sobre qualquer estilização.','Always prioritize real facial fidelity of the athlete over any stylization.')}`;

  // ── TEMPLATES POR TIPO ─────────────────────────────────────────────
  let secs = {};

  if(tipo === 'Card MVP'){
    // Card MVP: foco no atleta individual, destaque máximo no nome, sem info de partida
    secs = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: CARD MVP\nEste é um card de destaque individual — o atleta é o único protagonista.\nSem adversário. Sem placar. Apenas o craque em evidência máxima.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — CARD MVP\n${'─'.repeat(40)}\n\nCard de premiação do Melhor em Campo. Arte de reconhecimento individual.\nVisual de troféu vivo — o atleta É o prêmio.\n\n${int.desc}\n\nReferências visuais:\n• Ballon d'Or official card • FIFA TOTY • UEFA POTY\n• Cards premium de coleção de atletas\n• Panini Prizm Prizmatic — cartão holográfico de craque\n\nEfeitos especiais:\n• Aura dourada ao redor do atleta\n• Estrelas ou partículas de luz\n• Background de gradiente premium (não arena)\n• Brilho e reflexo metálico no nome\n• Selo "MVP" ou "Melhor em Campo" em destaque\n\nVARIAÇÃO OBRIGATÓRIA — GERAÇÃO #${genCount}:\nComposição diferente a cada geração. Nunca repetir layout.${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — CARD MVP\n${'─'.repeat(40)}\n\nPOSE: pose de craque — confiante, altivo, celebrando ou olhando para câmera\nÂNGULO: ${angulo}\n\nExpressão: sorriso de vitória ou olhar determinado de campeão\nO atleta ocupa 70-80% do card — close cinematográfico.\nFundo desfocado com efeito bokeh premium.\nSem outros jogadores em cena.`,
      cenario: `CENÁRIO & ILUMINAÇÃO — CARD MVP\n${'─'.repeat(40)}\n\nBackground: gradiente premium ou ginásio desfocado ao fundo\nNão mostrar arena cheia — foco total no atleta\n\nILUMINAÇÃO:\nStudio lighting premium. Rim light dourado.\nHigh key lighting. Aura luminosa.\nGold particle effects. Lens flare sutil.${iluminacaoEfetiva ? '\nEstilo desta geração: ' + iluminacaoEfetiva + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — CARD MVP\n${'─'.repeat(40)}\n\nSELO MVP (destaque máximo):\n"MVP" ou "⭐ MELHOR EM CAMPO"\n→ Fonte display enorme. Dourado metálico. Centro superior do card.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Fonte gigante. Gold chrome. Reflexos. Elemento central do card.\n\nCLUBE & CATEGORIA:\n${clube.toUpperCase()} · ${categoria.toUpperCase()}\n→ Subtítulo elegante abaixo do nome.\n\nCAMPEONATO:\n${campeonato.toUpperCase()}\n→ Rodapé premium discreto.${tipografiaEfetiva ? '\n\nEstilo tipográfico desta geração: ' + tipografiaEfetiva + '.' : ''}`,
      partida: `DADOS DO CARD MVP\n${'─'.repeat(40)}\n\n📅 ${data}\n🏆 ${campeonato.toUpperCase()}\n\nNão exibir adversário nem horário neste tipo de arte.\nFoco exclusivo na premiação individual.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — CARD MVP\n${'─'.repeat(40)}\n\nUltra realistic. Hyper realistic. Photorealistic.\n8K resolution. Premium collector card aesthetic.\nHolographic card effect. Gold foil typography.\nAward-winning sports card design.\nMaximum facial fidelity.\nLuxury sports memorabilia aesthetic.\n\nFORMATO: ${tipo} · Proporção quadrada ou 3:4${sufixoFerramenta()}`,
      negativo: base_negativo,
    };

  } else if(tipo === 'Card Convocação'){
    // Convocação: foco na chamada para a partida, tom de convocação militar/épico
    secs = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: CARD DE CONVOCAÇÃO\nArte de chamada oficial para a batalha.\nTom: convocação épica, chamada para a guerra no campo.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nArte de convocação oficial. Tom militar esportivo. Chamada para a batalha.\n${int.desc}\n\nVisual semelhante a:\n• Convocações oficiais de seleções nacionais\n• Chamadas épicas da UEFA Champions League\n• Posters "We Are Coming" de clubes profissionais\n• Announcements de lineup da NBA\n\nElementos obrigatórios:\n• Texto "CONVOCADO" ou "É HORA DA BATALHA" em destaque\n• Escudos dos dois clubes lado a lado${logo2Warn}\n• Atmosfera de guerra esportiva — tensão máxima\n• Data e hora da partida em destaque visual\n\nVARIAÇÃO OBRIGATÓRIA — GERAÇÃO #${genCount}:\nLayout diferente a cada geração. Nunca repetir.${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nPOSE: atleta olhando para câmera com determinação — pose de guerreiro convocado\nÂNGULO: ${angulo}\n\nExpressão: ${int.expressao}\nPostura: ereta, confiante, pronto para a batalha\nO atleta pode aparecer saindo das sombras ou com luz de fundo dramática.`,
      cenario: `CENÁRIO — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nAmbiente: ${cenarioEfetivo}\nTensão de pré-jogo. Corredor do ginásio. Vestiário épico. Tunelo de entrada.\n\nEfeitos:\n• Fumaça dramática\n• Luz de holofote no atleta\n• Sombras contrastadas\n• Partículas de energia\n\nILUMINAÇÃO:\nDramatic backlight. Hard light. Chiaroscuro esportivo.\nVolumetric light beam. Arena spotlight.${iluminacaoEfetiva ? '\nEstilo desta geração: ' + iluminacaoEfetiva + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nCABEÇALHO (destaque épico):\n"CONVOCADO" ou "É HORA" ou "CHAMADO PARA A BATALHA"\n→ Fonte bold display. Caixa alta. Impacto máximo.\n\nCONFRONTO:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n→ Fonte metálica grande. Escudos dos clubes ao lado.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Gold chrome. Reflexos metálicos.\n\nDATA & HORA:\n📅 ${data} · 🕒 ${hora}\n→ Destaque visual. Badge esportivo.\n\nLOCAL:\n📍 ${local}\n→ Rodapé clean.${tipografiaEfetiva ? '\n\nEstilo tipográfico desta geração: ' + tipografiaEfetiva + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nEste é o elemento CENTRAL desta arte:\n\n📅 DATA: ${data}\n🕒 HORÁRIO: ${hora}\n📍 LOCAL: ${local}\n\nVS: ${clube.toUpperCase()} × ${adv.toUpperCase()}\n\nDestaque máximo nas informações da partida.\nLayout de fixture card profissional.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — CONVOCAÇÃO\n${'─'.repeat(40)}\n\nUltra realistic. Hyper realistic. Cinematic.\n8K resolution. Official club announcement aesthetic.\nEpic sports poster. Championship announcement.\nMaximum facial fidelity. Dynamic composition.\nProfessional sports marketing.\n\nFORMATO: ${tipo} · Story 9:16 ou Feed 4:5${sufixoFerramenta()}`,
      negativo: base_negativo,
    };

  } else if(tipo === 'Banner horizontal'){
    // Banner: paisagem, dois clubes, foco no confronto
    secs = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: BANNER HORIZONTAL\nComposição em formato wide/landscape.\nEspaço para os dois clubes e o atleta ao centro.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — BANNER HORIZONTAL\n${'─'.repeat(40)}\n\nBanner de divulgação do confronto. Formato landscape/wide.\n${int.desc}\n\nComposição em três zonas:\n• ESQUERDA: identidade do ${clube.toUpperCase()} (escudo, cores)\n• CENTRO: atleta ${nome.toUpperCase()} em destaque máximo\n• DIREITA: identidade do ${adv.toUpperCase()} (escudo, cores adversário)\n\nVisual semelhante a:\n• Banners de confronto da ESPN / Sportv\n• Arte de matchup da NBA / UEFA\n• Headers de campeonato profissional\n\nVARIAÇÃO OBRIGATÓRIA — GERAÇÃO #${genCount}:\nComposição e layout diferentes a cada geração.${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `POSE DO ATLETA — BANNER\n${'─'.repeat(40)}\n\nPOSE: ação dinâmica ou pose de confronto — atleta ao centro do banner\nÂNGULO: eye level ou low angle dramático\n\nExpressão: ${int.expressao}\nO atleta é o elemento central entre os dois escudos.\nComposição simétrica com o atleta dominando o centro.`,
      cenario: `CENÁRIO — BANNER HORIZONTAL\n${'─'.repeat(40)}\n\nAmbiente: ${cenarioEfetivo}\nFundo adequado para formato wide — arena panorâmica, gramado desfocado\n\nDivisão visual:\n• Metade esquerda nas cores do ${clube}\n• Metade direita nas cores do ${adv}\n• Atleta no centro sobrepondo os dois lados\n\nILUMINAÇÃO:\nCinematic wide lighting. Dual rim light (cada cor de um clube).\nHigh contrast. Panoramic sports photography.${iluminacaoEfetiva ? '\nEstilo desta geração: ' + iluminacaoEfetiva + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — BANNER\n${'─'.repeat(40)}\n\nCONFRONTO (elemento central superior):\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n→ Grande. Metálico. Centralizado.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Abaixo do confronto. Gold chrome.\n\nDATA & LOCAL:\n📅 ${data} · 🕒 ${hora} · 📍 ${local}\n→ Rodapé centralizado.\n\nCAMPEONATO:\n${campeonato.toUpperCase()}\n→ Header superior discreto.\n\nFORMATO TEXTO: horizontal, alinhado ao centro da composição.${tipografiaEfetiva ? '\n\nEstilo tipográfico desta geração: ' + tipografiaEfetiva + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — BANNER\n${'─'.repeat(40)}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}\n\nExibir de forma clean no rodapé do banner.\nLayout de schedule card profissional — matchup fixture style.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — BANNER\n${'─'.repeat(40)}\n\nUltra realistic. Hyper realistic. Widescreen cinematic.\n8K resolution. Sports broadcast banner quality.\nProfessional matchup graphic. TV overlay aesthetic.\nMaximum facial fidelity.\n\nFORMATO: ${tipo} · Proporção 16:9 ou 3:1${sufixoFerramenta()}`,
      negativo: base_negativo,
    };

  } else if(tipo === 'Feed Instagram 4:5'){
    // Feed: quadrado/portrait, composição equilibrada, texto visível
    secs = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: FEED INSTAGRAM 4:5\nComposição vertical equilibrada para feed do Instagram.\nVisualização em grade — harmonia com outros posts.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — FEED 4:5\n${'─'.repeat(40)}\n\nPost para feed do Instagram. Proporção 4:5 (portrait).\n${int.desc}\n\nCaracterísticas do formato:\n• Composição equilibrada — nem muito vertical como Story\n• Texto legível em tamanho de feed\n• Impacto visual imediato — 1,5 segundos para chamar atenção\n• Thumb que convida ao clique\n\nVisual semelhante a:\n• Posts oficiais de clubes da Premier League / La Liga\n• Feed do Palmeiras, Flamengo, Manchester City\n• Marketing de atletas profissionais no Instagram\n\nVARIAÇÃO OBRIGATÓRIA — GERAÇÃO #${genCount}:\nLayout diferente a cada geração.${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `AÇÃO DO ATLETA — FEED\n${'─'.repeat(40)}\n\nAÇÃO: ${acao}\nÂNGULO: ${angulo}\n\nExpressão: ${int.expressao}\nAtleta ocupa 60-70% da composição.\nEspaço no topo para título/campeonato.\nEspaço no rodapé para informações da partida.`,
      cenario: `CENÁRIO — FEED\n${'─'.repeat(40)}\n\nAmbiente: ${cenarioEfetivo}\nFundo que não compete com o atleta.\n\nILUMINAÇÃO:\nCinematic lighting. Professional sports photography.\nVolumetric light. HDR. Rim light premium.${iluminacaoEfetiva ? '\nEstilo desta geração: ' + iluminacaoEfetiva + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA — FEED 4:5\n${'─'.repeat(40)}\n\nZONA SUPERIOR:\n${campeonato.toUpperCase()}\n→ Título clean. Legível em tamanho de feed.\n\nZONA CENTRAL (sobre o atleta):\n${nome.toUpperCase()}\n→ Gold chrome. Impacto visual. Tamanho médio-grande.\n\nZONA INFERIOR:\n${clube.toUpperCase()} × ${adv.toUpperCase()}\n📅 ${data} · 🕒 ${hora}\n→ Informações da partida. Fonte menor mas legível.\n\nEquilíbrio: título + atleta + info partida em harmonia visual.${tipografiaEfetiva ? '\n\nEstilo tipográfico desta geração: ' + tipografiaEfetiva + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA — FEED\n${'─'.repeat(40)}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}\n\nExibir no rodapé do post — zona inferior reservada.\nBadge esportivo clean. Legível em visualização de feed.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — FEED 4:5\n${'─'.repeat(40)}\n\nUltra realistic. Hyper realistic. Photorealistic.\n8K resolution. Instagram feed optimized.\nProfessional sports post. High engagement visual.\nMaximum facial fidelity. Clean composition.\n\nFORMATO: ${tipo} · Proporção 4:5 (1080×1350px)${sufixoFerramenta()}`,
      negativo: base_negativo,
    };

  } else {
    // Story 9:16 (padrão) — formato original mantido
    secs = {
      identidade: base_identidade + `\n\nTIPO DE ARTE: INSTAGRAM STORY 9:16\nFormato vertical full-screen. Composição de cima a baixo.\nImpacto total em tela de smartphone.`,
      fidelidade: base_fidelidade,
      conceito: `CONCEITO VISUAL — STORY 9:16 — MODO: ${intensidade.toUpperCase()}\n${'─'.repeat(40)}\n\n${int.desc}\n\nCriar pôster esportivo premium. Ultra-realista. Cinematográfico. Moderno. Impactante.\nFormato Story: composição vertical, aproveitamento total da altura.\n\nVisual semelhante a:\n• Stories oficiais de clubes profissionais\n• Campanhas da Nike / Adidas para Instagram Stories\n• Marketing de atletas para mobile-first\n\nA arte deve parecer produzida por uma agência esportiva internacional.\n\nVARIAÇÃO OBRIGATÓRIA — GERAÇÃO #${genCount}:\nLayout diferente • Composição diferente • Posição diferente do atleta\nPROIBIDO repetir composições anteriores. Cada geração deve ser uma campanha inédita.${blocoVariacaoExtra}`,
      uniforme: base_uniforme,
      acao: `AÇÃO DO ATLETA & ÂNGULO DE CÂMERA\n${'─'.repeat(40)}\n\nAÇÃO: ${acao}\nÂNGULO: ${angulo}\n\nExpressão do atleta: ${int.expressao}\n\nO atleta deve ocupar grande parte da composição vertical.\nMovimento natural. Fotografia esportiva profissional.\nConfiança. Energia. Personalidade.\n\nAproveitamento da altura do Story:\n• Cabeça do atleta na zona superior\n• Corpo em ação no centro\n• Rodapé para informações`,
      cenario: `CENÁRIO & ILUMINAÇÃO — STORY\n${'─'.repeat(40)}\n\nAmbiente: ${cenarioEfetivo}\n\nAdicionar:\n• torcida desfocada • refletores modernos • fumaça esportiva sutil\n• banners • luzes volumétricas • partículas de energia\n• profundidade cinematográfica\n\nILUMINAÇÃO:\nCinematic lighting. Volumetric lighting. HDR. Global illumination.\nHigh contrast. Premium sports lighting. Rim light. Atmospheric light.${iluminacaoEfetiva ? '\nEstilo desta geração: ' + iluminacaoEfetiva + '.' : ''}`,
      paleta: base_paleta,
      tipografia: `TIPOGRAFIA & TEXTOS — STORY\n${'─'.repeat(40)}\n\nTipografia esportiva premium. Moderna. Elegante. Impactante.\n${int.slogan}\n\nTÍTULO PRINCIPAL:\n${campeonato.toUpperCase()}\n→ Grande destaque visual. Zona superior do Story.\n\nNOME DO ATLETA:\n${nome.toUpperCase()}\n→ Fonte gigante. Metal dourado premium. Gold chrome. Reflexos metálicos.\n\nCATEGORIA:\nCATEGORIA ${categoria.toUpperCase()}\n→ Selo esportivo moderno.\n\nRODAPÉ:\n${clube.toUpperCase()} × ${adv.toUpperCase()}${logo2Warn}\n→ Tipografia metálica premium. Zona inferior do Story.${tipografiaEfetiva ? '\n\nEstilo tipográfico desta geração: ' + tipografiaEfetiva + '.' : ''}`,
      partida: `INFORMAÇÕES DA PARTIDA\n${'─'.repeat(40)}\n\n📅 ${data}\n🕒 ${hora}\n📍 ${local}\n\nCard esportivo premium no rodapé do Story.\nLayout diferente a cada geração.`,
      frase: base_frase,
      qualidade: `QUALIDADE FINAL — STORY 9:16\n${'─'.repeat(40)}\n\nUltra realistic. Hyper realistic. Photorealistic.\n8K resolution. Award-winning sports photography.\nPremium sports poster. Elite athlete campaign.\nMobile-first vertical composition. Instagram Story optimized.\nMaximum facial fidelity. High-end graphic design.\nDynamic composition. Unique layout every generation.\nBrazilian professional futsal campaign.\nDepth of field. HDR. Volumetric lighting.\nGold chrome typography.\n\nFORMATO: ${tipo} · Proporção 9:16 (1080×1920px)${sufixoFerramenta()}`,
      negativo: base_negativo,
    };
  }

  // salva prompt anterior para comparação
  const promptAtual = buildFullPrompt();
  if(promptAtual.trim()) promptAnterior = promptAtual;

  buildSections(secs);
  const full = buildFullPrompt();
  document.getElementById('rawOut').value = full;
  const chars = full.length;
  const tokens = Math.round(chars / 4.5);
  document.getElementById('charCount').textContent = chars + ' chars';
  const tc = document.getElementById('tokenCount');
  if(tc) tc.textContent = '~' + tokens + ' tokens';
  if(currentTab === 'preview') renderPreview();

  checkWarnings();
  mostrarToast(aleatorio ? '🎲 Variação aleatória gerada!' : '⚡ Prompt gerado com sucesso!', 'success');
}

function gerarAleatorio(){
  gerar(true);
}

// ═══════════════════════════════════
// TABS
// ═══════════════════════════════════
function switchTab(tab, btn){
  currentTab = tab;
  document.querySelectorAll('.otab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.getElementById('tab-secoes').style.display  = tab==='secoes'  ? 'block' : 'none';
  document.getElementById('tab-preview').style.display = tab==='preview' ? 'block' : 'none';
  document.getElementById('rawOut').style.display      = tab==='raw'     ? 'flex'  : 'none';
  document.getElementById('tab-phistory').style.display= tab==='phistory'? 'block' : 'none';

  const labels = {
    secoes:   'Seções do prompt — clique para expandir e editar',
    preview:  'Preview por seção — visão formatada do prompt',
    raw:      'Prompt completo — pronto para copiar',
    phistory: 'Histórico de prompts salvos'
  };
  document.getElementById('toolbarLabel').textContent = labels[tab] || '';

  if(tab==='phistory') renderPromptHistory();
  if(tab==='preview')  renderPreview();
}

// init tab display
document.getElementById('tab-secoes').style.display  = 'block';
document.getElementById('tab-preview').style.display = 'none';
document.getElementById('rawOut').style.display      = 'none';
document.getElementById('tab-phistory').style.display= 'none';

// ═══════════════════════════════════
// COPIAR
// ═══════════════════════════════════
function copiar(){
  const val = buildFullPrompt();
  if(!val.trim()){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  const temFoto = document.getElementById('box-atleta').classList.contains('has-img');
  const msgCopiado = temFoto
    ? '📋 Copiado! Lembre-se de anexar a foto do atleta junto.'
    : '📋 Copiado! ⚠️ Você ainda não enviou a foto do atleta.';
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(val)
      .then(() => mostrarToast(msgCopiado, temFoto ? 'success' : 'warn'))
      .catch(() => copiarFallback(val, msgCopiado, temFoto));
  } else {
    copiarFallback(val, msgCopiado, temFoto);
  }
}
function copiarFallback(val, msgCopiado, temFoto){
  const ta = document.createElement('textarea');
  ta.value = val;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); mostrarToast(msgCopiado || '📋 Copiado!', temFoto===false ? 'warn' : 'success'); }
  catch(e){ mostrarToast('⚠️ Não foi possível copiar','warn'); }
  document.body.removeChild(ta);
}

// ═══════════════════════════════════
// SALVAR PARTIDA
// ═══════════════════════════════════
function salvarPartida(){
  const adv = v('adv');
  if(!adv){ mostrarToast('⚠️ Preencha o adversário!','warn'); return; }
  const modoEl = document.getElementById('modoGroup');
  const modoAtivo = modoEl ? (modoEl.querySelector('.toggle.active')?.dataset.val || 'pregame') : 'pregame';
  const golsNos = v('golsNos'); const golsAdv = v('golsAdv');
  const placar = (modoAtivo === 'postgame' && golsNos !== '' && golsAdv !== '') ? `${golsNos}×${golsAdv}` : null;
  let h = JSON.parse(localStorage.getItem('prospere_partidas') || '[]');
  h.unshift({ adv, data:v('data'), hora:v('hora'), local:v('local'), placar, ts:Date.now() });
  if(h.length>30) h=h.slice(0,30);
  localStorage.setItem('prospere_partidas', JSON.stringify(h));

  // salvar prompt tb
  const prompt = buildFullPrompt();
  if(prompt.trim()){
    let ph = JSON.parse(localStorage.getItem('prospere_prompts') || '[]');
    ph.unshift({ adv, data:v('data'), prompt, secoes:{...secaoContent}, ts:Date.now(), gen:genCount });
    if(ph.length>20) ph=ph.slice(0,20);
    localStorage.setItem('prospere_prompts', JSON.stringify(ph));
  }

  renderHistory();
  if(currentTab==='phistory') renderPromptHistory();
  mostrarToast('💾 Partida e prompt salvos!','success');
}

function diasRestantes(dataStr){
  if(!dataStr) return null;
  const parts = dataStr.split('/');
  if(parts.length < 3) return null;
  const gameDate = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
  const hoje = new Date(); hoje.setHours(0,0,0,0); gameDate.setHours(0,0,0,0);
  const diff = Math.round((gameDate - hoje) / 86400000);
  if(diff < 0) return null;
  if(diff === 0) return '<span style="color:var(--red);font-weight:700">🔴 Hoje!</span>';
  if(diff === 1) return '<span style="color:var(--orange);font-weight:700">🟡 Amanhã!</span>';
  if(diff <= 7) return `<span style="color:var(--orange);font-weight:700">🟡 ${diff}d</span>`;
  return `<span style="color:var(--green);font-weight:700">🟢 ${diff}d</span>`;
}

function renderHistory(){
  const h = JSON.parse(localStorage.getItem('prospere_partidas') || '[]');
  const el = document.getElementById('historyList');
  if(!h.length){ el.innerHTML='<p style="font-size:12px;color:var(--muted)">Nenhuma partida salva ainda.</p>'; return; }
  el.innerHTML = h.map(item => {
    const countdown = diasRestantes(item.data);
    const placarBadge = item.placar ? `<span style="font-size:10px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace">${esc(item.placar)}</span>` : '';
    return `<div class="history-item">
      <span onclick="carregarPartida(${item.ts})" style="flex:1;cursor:pointer">⚽ ${esc(item.adv)} ${placarBadge}</span>
      <span style="font-size:10px;color:var(--muted)">${countdown ? countdown + ' · ' : ''}${esc(item.data||'')}</span>
      <button class="del" onclick="deletarPartida(${item.ts})">✕</button>
    </div>`;
  }).join('');
}

function carregarPartida(ts){
  const h = JSON.parse(localStorage.getItem('prospere_partidas') || '[]');
  const item = h.find(x => x.ts === ts); if(!item) return;
  document.getElementById('adv').value = item.adv||'';
  document.getElementById('data').value = item.data||'';
  document.getElementById('hora').value = item.hora||'';
  document.getElementById('local').value = item.local||'';
  mostrarToast('📂 Partida carregada!','success');
}

function deletarPartida(ts){
  let h = JSON.parse(localStorage.getItem('prospere_partidas') || '[]');
  h = h.filter(x => x.ts !== ts);
  localStorage.setItem('prospere_partidas', JSON.stringify(h));
  renderHistory();
}

// ═══════════════════════════════════
// HISTORICO DE PROMPTS
// ═══════════════════════════════════
let phSearchQuery = '';

function renderPromptHistory(){
  const ph = JSON.parse(localStorage.getItem('prospere_prompts') || '[]');
  const favs = JSON.parse(localStorage.getItem('prospere_favs') || '[]');
  const tags = JSON.parse(localStorage.getItem('prospere_tags') || '{}');
  const resultados = JSON.parse(localStorage.getItem('prospere_resultados') || '{}');
  const container = document.getElementById('tab-phistory');

  if(!ph.length){
    container.innerHTML = '<div class="ph-empty" id="phEmpty">Nenhum prompt salvo ainda.<br>Clique em 💾 Salvar após gerar.</div>';
    return;
  }

  const q = phSearchQuery.toLowerCase().trim();
  const filtrado = q
    ? ph.filter(p => (p.adv||'').toLowerCase().includes(q) || (p.data||'').includes(q))
    : ph;

  // favoritos primeiro
  const sorted = [...filtrado].sort((a,b) => {
    const fa = favs.includes(a.ts), fb = favs.includes(b.ts);
    if(fa && !fb) return -1; if(!fa && fb) return 1; return b.ts - a.ts;
  });

  const TAG_DEFS = {
    usado: { icon:'✅', label:'Usado' },
    bom:   { icon:'👍', label:'Resultado bom' },
    ruim:  { icon:'👎', label:'Resultado ruim' }
  };

  const items = sorted.map(item => {
    const preview = esc(item.prompt.substring(0,80).replace(/\n/g,' '));
    const date = new Date(item.ts).toLocaleDateString('pt-BR');
    const isFav = favs.includes(item.ts);
    const favBadge = isFav ? '<span class="ph-fav-badge">⭐ Favorito</span>' : '';
    const itemTags = tags[item.ts] || [];
    const imgB64 = resultados[item.ts];

    const tagButtons = Object.keys(TAG_DEFS).map(key => {
      const ativo = itemTags.includes(key);
      return `<button class="ph-tag-btn ${ativo?'active tag-'+key:''}" onclick="event.stopPropagation();toggleTag(${item.ts},'${key}')" title="${TAG_DEFS[key].label}">${TAG_DEFS[key].icon}</button>`;
    }).join('');

    const resultBlock = imgB64
      ? `<div class="ph-result"><img class="ph-result-img" src="${imgB64}" onclick="event.stopPropagation();verResultado('${item.ts}')" title="Clique para ampliar"><button class="ph-result-btn" onclick="event.stopPropagation();removerResultado(${item.ts})">🗑️ Remover foto</button></div>`
      : `<div class="ph-result"><button class="ph-result-btn" onclick="event.stopPropagation();document.getElementById('resultInput-${item.ts}').click()">📸 Adicionar resultado</button><input type="file" id="resultInput-${item.ts}" accept="image/*" style="display:none" onchange="uploadResultado(event,${item.ts})"></div>`;

    return `<div class="phist-item" onclick="carregarPrompt(${item.ts})">
      <button class="phist-fav ${isFav?'fav':''}" onclick="event.stopPropagation();toggleFav(${item.ts})" title="${isFav?'Remover favorito':'Adicionar favorito'}">${isFav?'⭐':'☆'}</button>
      <div class="ph-header">
        <span class="ph-title">⚽ ${esc(item.adv||'Sem adversário')}${favBadge}</span>
        <span class="ph-meta">${esc(item.data||'')} · ${date} · Geração #${item.gen||'?'}</span>
      </div>
      <div class="ph-preview">${preview}...</div>
      <div class="ph-tags">${tagButtons}</div>
      ${resultBlock}
    </div>`;
  }).join('');

  const emptyMsg = q && !sorted.length ? `<div class="ph-empty">Nenhum resultado para "<strong>${esc(q)}</strong>"</div>` : '';

  container.innerHTML = `
    <input class="ph-search" placeholder="🔍 Buscar por adversário ou data..." value="${esc(phSearchQuery)}" oninput="phSearchQuery=this.value;renderPromptHistory()">
    <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:11px;color:var(--muted);font-weight:700">${filtrado.length}/${ph.length} prompts · ${favs.length} favoritos</span>
      <button class="btn btn-sec" style="padding:5px 10px;font-size:10px" onclick="limparPrompts()">🗑️ Limpar tudo</button>
    </div>${emptyMsg}${items}`;
}

// ─── Galeria de resultados ───
async function uploadResultado(event, ts){
  const file = event.target.files[0]; if(!file) return;
  const b64 = await comprimirImagem(file, 600);
  try {
    const resultados = JSON.parse(localStorage.getItem('prospere_resultados') || '{}');
    resultados[ts] = b64;
    localStorage.setItem('prospere_resultados', JSON.stringify(resultados));
    renderPromptHistory();
    mostrarToast('📸 Foto do resultado salva!','success');
  } catch(e){
    mostrarToast('⚠️ Imagem muito grande para salvar','warn');
  }
}

function removerResultado(ts){
  const resultados = JSON.parse(localStorage.getItem('prospere_resultados') || '{}');
  delete resultados[ts];
  localStorage.setItem('prospere_resultados', JSON.stringify(resultados));
  renderPromptHistory();
}

function verResultado(ts){
  const resultados = JSON.parse(localStorage.getItem('prospere_resultados') || '{}');
  const src = resultados[ts]; if(!src) return;
  const w = window.open('','_blank');
  w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${src}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`);
  w.document.close();
}

function comprimirImagem(file, maxSize=600){
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxSize/img.width, maxSize/img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

function toggleTag(ts, tagKey){
  let tags = JSON.parse(localStorage.getItem('prospere_tags') || '{}');
  if(!tags[ts]) tags[ts] = [];
  // bom e ruim são mutuamente exclusivos; usado é independente
  if(tagKey === 'bom' || tagKey === 'ruim'){
    const oposto = tagKey === 'bom' ? 'ruim' : 'bom';
    tags[ts] = tags[ts].filter(t => t !== oposto);
  }
  if(tags[ts].includes(tagKey)) tags[ts] = tags[ts].filter(t => t !== tagKey);
  else tags[ts].push(tagKey);
  if(!tags[ts].length) delete tags[ts];
  localStorage.setItem('prospere_tags', JSON.stringify(tags));
  renderPromptHistory();
}

function toggleFav(ts){
  let favs = JSON.parse(localStorage.getItem('prospere_favs') || '[]');
  if(favs.includes(ts)){ favs = favs.filter(x => x !== ts); mostrarToast('☆ Removido dos favoritos',''); }
  else { favs.push(ts); mostrarToast('⭐ Adicionado aos favoritos!','success'); }
  localStorage.setItem('prospere_favs', JSON.stringify(favs));
  renderPromptHistory();
}

function carregarPrompt(ts){
  const ph = JSON.parse(localStorage.getItem('prospere_prompts') || '[]');
  const item = ph.find(x => x.ts === ts); if(!item) return;
  document.getElementById('adv').value = item.adv||'';
  document.getElementById('data').value = item.data||'';
  if(item.secoes){
    buildSections(item.secoes);
  } else {
    const fakeSecs = {};
    SECOES.forEach(s => { fakeSecs[s.id] = ''; });
    fakeSecs['conceito'] = item.prompt;
    buildSections(fakeSecs);
  }
  document.getElementById('rawOut').value = item.prompt;
  const chars = item.prompt.length;
  document.getElementById('charCount').textContent = chars + ' chars';
  const tc = document.getElementById('tokenCount');
  if(tc) tc.textContent = '~' + Math.round(chars/4.5) + ' tokens';
  mostrarToast('📂 Prompt carregado!','success');
  switchTab('secoes', document.querySelectorAll('.otab')[0]);
}

function limparPrompts(){
  if(confirm('Limpar todo o histórico de prompts?')){
    localStorage.removeItem('prospere_prompts');
    renderPromptHistory();
  }
}

// ═══════════════════════════════════
// PDF
// ═══════════════════════════════════
function exportarPDF(){
  const val = buildFullPrompt();
  if(!val.trim()){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  const w = window.open('','_blank');
  const title = `Prompt Master — ${v('adv')||'Arte'} — ${v('data')||''}`;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:monospace;background:#fff;color:#111;padding:40px;max-width:820px;margin:auto;font-size:13px;line-height:1.7}
pre{white-space:pre-wrap;word-break:break-word}
h2{font-family:Arial;font-size:18px;margin-bottom:6px;color:#1d6cff}
.meta{font-size:12px;color:#888;margin-bottom:24px}
hr{border:none;border-top:1px solid #eee;margin:20px 0}
</style></head><body>
<h2>⚽ Prompt Master Prospere V6</h2>
<p class="meta">Atleta: ${v('nome')} · Adversário: ${v('adv')||'-'} · Data: ${v('data')||'-'} · Geração #${genCount}</p>
<hr>
<pre>${val.replace(/</g,'&lt;')}</pre>
</body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),300);
}

// ═══════════════════════════════════
// UTILS
// ═══════════════════════════════════
function v(id){ const el = document.getElementById(id); return el ? el.value.trim() : ''; }

// Escapa HTML para prevenir XSS em template literals
function esc(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// AUTO-SAVE rascunho — salva os campos do formulário no localStorage em tempo real
const DRAFT_FIELDS = ['nome','categoria','clube','campeonato','uniforme1','uniforme2','adv','data','hora','local','fraseCustom'];
function saveDraft(){
  const draft = {};
  DRAFT_FIELDS.forEach(id => { const el = document.getElementById(id); if(el) draft[id] = el.value; });
  draft._intensidade = intensidade;
  draft._frase = fraseSelecionada;
  draft._paleta = getToggle('paletaGroup');
  draft._acao = getToggle('acaoGroup');
  draft._angulo = getToggle('anguloGroup');
  draft._tipo = getToggle('tipoGroup');
  localStorage.setItem('prospere_draft', JSON.stringify(draft));
}
function restoreDraft(){
  try {
    const raw = localStorage.getItem('prospere_draft'); if(!raw) return;
    const draft = JSON.parse(raw);
    DRAFT_FIELDS.forEach(id => { const el = document.getElementById(id); if(el && draft[id] !== undefined) el.value = draft[id]; });
    if(draft._intensidade){ const btn = document.querySelector(`.int-btn[data-val="${draft._intensidade}"]`); if(btn) setIntensidade(btn); }
    if(draft._frase){ fraseSelecionada = draft._frase; document.querySelectorAll('.frase-chip').forEach(c => { if(c.textContent === draft._frase){ c.classList.add('sel'); } else { c.classList.remove('sel'); } }); }
    if(draft._paleta) setToggle('paletaGroup', draft._paleta);
    if(draft._acao) setToggle('acaoGroup', draft._acao);
    if(draft._angulo) setToggle('anguloGroup', draft._angulo);
    if(draft._tipo) setToggle('tipoGroup', draft._tipo);
  } catch(e){ /* ignora erros de restore */ }
}
// debounce para não salvar a cada tecla
let draftTimer;
function debouncedSaveDraft(){ clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 800); }
DRAFT_FIELDS.forEach(id => { const el = document.getElementById(id); if(el) el.addEventListener('input', debouncedSaveDraft); });

// ═══════════════════════════════════
// PREVIEW TAB
// ═══════════════════════════════════
function renderPreview(){
  const container = document.getElementById('tab-preview');
  if(!Object.keys(secaoContent).length){ container.innerHTML='<div class="ph-empty">Gere um prompt primeiro.</div>'; return; }
  const cards = SECOES.map(s => {
    const content = secaoContent[s.id] || '';
    if(!content.trim()) return '';
    const isModified = document.getElementById('psec-'+s.id)?.classList.contains('modified');
    const badge = isModified ? '<span style="font-size:9px;background:var(--gold-light);color:var(--gold);border:1px solid var(--gold);border-radius:10px;padding:1px 6px;font-weight:700;margin-left:6px">✏️ Editada</span>' : '';
    return `<div class="preview-card">
      <div class="preview-card-header">
        <span class="preview-card-title">${s.title}${badge}</span>
        <span style="font-size:10px;color:var(--hint);margin-left:auto">${content.length} chars</span>
      </div>
      <div class="preview-card-body">${esc(content)}</div>
    </div>`;
  }).join('');
  container.innerHTML = cards || '<div class="ph-empty">Nenhum conteúdo para exibir.</div>';
}

// ═══════════════════════════════════
// DARK MODE
// ═══════════════════════════════════
function toggleDark(){
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  document.getElementById('darkToggle').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('prospere_theme', isDark ? 'light' : 'dark');
}
// restaura tema salvo
(function(){
  const t = localStorage.getItem('prospere_theme');
  if(t === 'dark'){ document.documentElement.setAttribute('data-theme','dark'); document.getElementById('darkToggle').textContent='☀️'; }
})();

// ═══════════════════════════════════
// COMPARAÇÃO DE GERAÇÕES
// ═══════════════════════════════════
function abrirComparacao(){
  const atual = buildFullPrompt();
  if(!atual.trim()){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  document.querySelector('#modalComparacao .modal-title').textContent = '⇄ Comparar Gerações';
  document.querySelectorAll('.modal-col-header')[0].textContent = 'Geração Anterior';
  document.querySelectorAll('.modal-col-header')[1].textContent = 'Geração Atual';
  document.getElementById('compareLeft').value  = promptAnterior || '(Nenhuma geração anterior nesta sessão)';
  document.getElementById('compareRight').value = atual;
  document.getElementById('modalComparacao').classList.add('open');
}

function gerarAB(){
  gerar(true);
  const varA = buildFullPrompt();
  gerar(true);
  const varB = buildFullPrompt();
  document.querySelector('#modalComparacao .modal-title').textContent = '⊞ Variações A/B';
  document.querySelectorAll('.modal-col-header')[0].textContent = 'Variação A';
  document.querySelectorAll('.modal-col-header')[1].textContent = 'Variação B';
  document.getElementById('compareLeft').value  = varA;
  document.getElementById('compareRight').value = varB;
  document.getElementById('modalComparacao').classList.add('open');
  mostrarToast('⊞ Duas variações geradas!','success');
}
function fecharComparacao(){
  document.getElementById('modalComparacao').classList.remove('open');
}
function usarAnterior(){
  if(!promptAnterior){ mostrarToast('⚠️ Nenhuma geração anterior disponível','warn'); return; }
  // restaura prompt anterior no rawOut e seções
  document.getElementById('rawOut').value = promptAnterior;
  const fakeSecs = {};
  SECOES.forEach(s => { fakeSecs[s.id] = ''; });
  fakeSecs['conceito'] = promptAnterior;
  buildSections(fakeSecs);
  fecharComparacao();
  mostrarToast('↩️ Geração anterior restaurada!','success');
}
// fechar modal ao clicar fora
document.getElementById('modalComparacao').addEventListener('click', e => {
  if(e.target === document.getElementById('modalComparacao')) fecharComparacao();
});

// ═══════════════════════════════════
// LIMPAR RASCUNHO
// ═══════════════════════════════════
function limparRascunho(){
  if(!confirm('Limpar todos os campos e o rascunho salvo?')) return;
  const DRAFT_FIELDS_LIST = ['nome','categoria','clube','campeonato','uniforme1','uniforme2','adv','data','hora','local','fraseCustom'];
  DRAFT_FIELDS_LIST.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  // restaura defaults
  document.getElementById('nome').value = 'Kaio Genaro';
  document.getElementById('categoria').value = 'Sub-8';
  document.getElementById('clube').value = 'Prospere Hortolândia Futsal';
  document.getElementById('campeonato').value = 'Campeonato Paulista A1 de Futsal 2026';
  localStorage.removeItem('prospere_draft');

  // restaura toggles para o padrão (🎲 IA escolhe / primeira opção)
  setToggle('paletaGroup', 'IA escolhe automaticamente a paleta mais impactante');
  setToggle('acaoGroup', 'IA escolhe automaticamente');
  setToggle('anguloGroup', 'IA varia automaticamente o ângulo');
  setToggle('tipoGroup', 'Instagram Story 9:16');

  // restaura intensidade padrão (Confronto)
  const btnConfronto = document.querySelector('.int-btn[data-val="Confronto"]');
  if(btnConfronto) setIntensidade(btnConfronto);

  // restaura frase padrão
  document.querySelectorAll('.frase-chip').forEach((c,i) => { c.classList.toggle('sel', i===0); });
  fraseSelecionada = '🎲 IA cria frase inédita automaticamente';

  mostrarToast('🧹 Rascunho limpo!','success');
}

// ═══════════════════════════════════
// ATALHOS DE TECLADO
// ═══════════════════════════════════
document.addEventListener('keydown', e => {
  const ctrl = e.ctrlKey || e.metaKey;
  if(!ctrl) return;
  // não interferir em inputs ou textareas — evita perder edições manuais em seções
  const tag = document.activeElement.tagName;
  const isEditable = tag === 'INPUT' || tag === 'TEXTAREA';
  if(e.key === 'Enter'){
    if(isEditable) return; // permite nova linha normal dentro de textareas
    e.preventDefault();
    if(e.shiftKey) gerarAleatorio();
    else gerar();
  }
  else if(e.key === 's'){ e.preventDefault(); salvarPartida(); }
  else if(e.key === 'c' && !isEditable){ e.preventDefault(); copiar(); }
  else if(e.key === 'z' && !isEditable){ e.preventDefault(); undoGeneration(); }
  else if(e.key === 'l' && !isEditable){ e.preventDefault(); toggleIdioma(); }
});

// ═══════════════════════════════════
// VALIDAÇÃO ANTES DE GERAR
// ═══════════════════════════════════
function validarCampos(){
  const problemas = [];
  if(!v('nome')) problemas.push('nome do atleta');
  if(!v('adv')) problemas.push('adversário');
  if(!v('data')) problemas.push('data da partida');
  if(!document.getElementById('box-atleta').classList.contains('has-img')) problemas.push('foto do atleta');
  return problemas;
}

// ═══════════════════════════════════
// AUTOCOMPLETE DE ADVERSÁRIO
// ═══════════════════════════════════
function registrarAdversario(nomeAdv){
  if(!nomeAdv || !nomeAdv.trim()) return;
  let lista = JSON.parse(localStorage.getItem('prospere_advs') || '[]');
  if(!lista.includes(nomeAdv)){
    lista.push(nomeAdv);
    if(lista.length > 50) lista = lista.slice(-50);
    localStorage.setItem('prospere_advs', JSON.stringify(lista));
    atualizarAdvList();
  }
}
const TIMES_PAULISTAS = [
  'Magnus Futsal','Sorocaba Futsal','ACBF','Cascavel Futsal','Joinville EC',
  'Carlos Barbosa','Blumenau Futsal','Corinthians Futsal','Pato Futsal',
  'Foz Cataratas','São Paulo FC Futsal','Santos Futsal','Taubaté Futsal',
  'Guarulhos Futsal','São José Futsal','Mogi das Cruzes Futsal',
  'Campinas Futsal','Ribeirão Preto Futsal','Bauru Futsal','Franca Futsal',
  'Araraquara Futsal','Marília Futsal','Presidente Prudente Futsal',
  'São Bernardo Futsal','Santo André Futsal','Osasco Futsal',
  'Indaiatuba Futsal','Jundiaí Futsal','Hortolândia Futsal'
];

function atualizarAdvList(){
  const lista = JSON.parse(localStorage.getItem('prospere_advs') || '[]');
  const todos = [...new Set([...TIMES_PAULISTAS, ...lista])].sort((a,b) => a.localeCompare(b,'pt'));
  const dl = document.getElementById('advList');
  dl.innerHTML = todos.map(a => `<option value="${esc(a)}">`).join('');
}

// ═══════════════════════════════════
// EXPORTAR / IMPORTAR CONFIGURAÇÃO
// ═══════════════════════════════════
function exportarConfig(){
  const config = {
    nome: v('nome'), categoria: v('categoria'), clube: v('clube'), campeonato: v('campeonato'),
    uniforme1: v('uniforme1'), uniforme2: v('uniforme2'),
    paleta: getToggle('paletaGroup'), tipo: getToggle('tipoGroup'),
    exportadoEm: new Date().toISOString(), versao: 'V6'
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prospere-config-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  mostrarToast('⬇️ Config exportada!','success');
}
function importarConfig(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const config = JSON.parse(e.target.result);
      if(config.nome) document.getElementById('nome').value = config.nome;
      if(config.categoria) document.getElementById('categoria').value = config.categoria;
      if(config.clube) document.getElementById('clube').value = config.clube;
      if(config.campeonato) document.getElementById('campeonato').value = config.campeonato;
      if(config.uniforme1) document.getElementById('uniforme1').value = config.uniforme1;
      if(config.uniforme2) document.getElementById('uniforme2').value = config.uniforme2;
      if(config.paleta) setToggle('paletaGroup', config.paleta);
      if(config.tipo) setToggle('tipoGroup', config.tipo);
      saveDraft();
      mostrarToast('⬆️ Config importada com sucesso!','success');
    } catch(err){
      mostrarToast('⚠️ Arquivo inválido — não foi possível importar','warn');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ═══════════════════════════════════
// DESFAZER GERAÇÃO
// ═══════════════════════════════════
function undoGeneration(){
  if(generationStack.length < 2){ mostrarToast('⚠️ Nada para desfazer','warn'); return; }
  generationStack.pop(); // descarta estado atual
  const prev = generationStack[generationStack.length - 1];
  buildSections(prev);
  syncRaw();
  mostrarToast('↩️ Geração desfeita (Ctrl+Z)','success');
}

// ═══════════════════════════════════
// TEMPLATES DE PROMPT
// ═══════════════════════════════════
function renderTemplateList(){
  const templates = JSON.parse(localStorage.getItem('prospere_templates') || '[]');
  const el = document.getElementById('templateList');
  if(!templates.length){ el.innerHTML='<p style="font-size:12px;color:var(--muted)">Nenhum template salvo.</p>'; return; }
  el.innerHTML = templates.map((t,i) => `
    <div class="history-item">
      <span onclick="carregarTemplate(${i})" style="flex:1;cursor:pointer" title="${esc(t.nome)}">📋 ${esc(t.nome)}</span>
      <button class="del" onclick="deletarTemplate(${i})">✕</button>
    </div>`).join('');
}

function salvarTemplate(){
  const nome = v('templateNome');
  if(!nome){ mostrarToast('⚠️ Digite um nome para o template','warn'); return; }
  if(!Object.keys(secaoContent).length){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  const templates = JSON.parse(localStorage.getItem('prospere_templates') || '[]');
  templates.unshift({ nome, secoes:{...secaoContent}, ts:Date.now() });
  if(templates.length > 30) templates.length = 30;
  localStorage.setItem('prospere_templates', JSON.stringify(templates));
  document.getElementById('templateNome').value = '';
  renderTemplateList();
  mostrarToast('💾 Template salvo!','success');
}

function carregarTemplate(i){
  const templates = JSON.parse(localStorage.getItem('prospere_templates') || '[]');
  const t = templates[i]; if(!t) return;
  buildSections(t.secoes);
  syncRaw();
  mostrarToast('📋 Template carregado!','success');
}

function deletarTemplate(i){
  let templates = JSON.parse(localStorage.getItem('prospere_templates') || '[]');
  templates.splice(i,1);
  localStorage.setItem('prospere_templates', JSON.stringify(templates));
  renderTemplateList();
  mostrarToast('🗑️ Template deletado','');
}

// ═══════════════════════════════════
// NOTIFICAÇÃO PRÉ-JOGO
// ═══════════════════════════════════
async function agendarNotificacao(){
  const data = v('data'); const hora = v('hora'); const adv = v('adv');
  if(!data || !hora){ mostrarToast('⚠️ Preencha data e horário da partida','warn'); return; }
  if(!('Notification' in window)){ mostrarToast('⚠️ Notificações não suportadas neste navegador','warn'); return; }
  const perm = await Notification.requestPermission();
  if(perm !== 'granted'){ mostrarToast('⚠️ Permissão de notificação negada','warn'); return; }
  const parts = data.split('/');
  if(parts.length < 3){ mostrarToast('⚠️ Data no formato dd/mm/aaaa','warn'); return; }
  const horaParts = hora.replace('h',':').replace('H',':').split(':');
  const gameTime = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]), parseInt(horaParts[0])||0, parseInt(horaParts[1])||0);
  const notifTime = new Date(gameTime.getTime() - 2*60*60*1000);
  const now = new Date();
  if(notifTime <= now){ mostrarToast('⚠️ Menos de 2h para o jogo — impossível agendar','warn'); return; }
  const delay = notifTime.getTime() - now.getTime();
  clearTimeout(window._notifTimer);
  window._notifTimer = setTimeout(() => {
    new Notification('⚽ Prompt Master Prospere', {
      body: `Jogo contra ${adv||'o adversário'} em 2 horas! Crie a arte agora.`,
      tag: 'pregame'
    });
  }, delay);
  const h = Math.round(delay/3600000);
  mostrarToast(`🔔 Lembrete agendado — ${h}h até a notificação!`, 'success');
}

// ═══════════════════════════════════
// COMPARTILHAR VIA WHATSAPP
// ═══════════════════════════════════
function compartilharWhatsApp(){
  const val = buildFullPrompt();
  if(!val.trim()){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  const texto = encodeURIComponent(val.substring(0, 3000));
  window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  mostrarToast('💬 Abrindo WhatsApp...','success');
}

// ═══════════════════════════════════
// BACKUP COMPLETO
// ═══════════════════════════════════
const BACKUP_KEYS = ['prospere_partidas','prospere_prompts','prospere_favs','prospere_tags',
  'prospere_advs','prospere_frases','prospere_profiles','prospere_draft',
  'prospere_theme','prospere_resultados','prospere_templates'];

function exportarBackup(){
  const backup = { _exportadoEm: new Date().toISOString(), _versao: 'V6' };
  BACKUP_KEYS.forEach(k => {
    const val = localStorage.getItem(k);
    if(val) try { backup[k] = JSON.parse(val); } catch(e){}
  });
  const blob = new Blob([JSON.stringify(backup, null, 2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `backup-prospere-${Date.now()}.json`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  mostrarToast('💿 Backup completo exportado!','success');
}

function importarBackup(event){
  const file = event.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const backup = JSON.parse(e.target.result);
      let count = 0;
      BACKUP_KEYS.forEach(k => {
        if(backup[k] !== undefined){ localStorage.setItem(k, JSON.stringify(backup[k])); count++; }
      });
      renderHistory(); atualizarAdvList(); renderFrasesCustom(); renderProfileSelector();
      restoreDraft();
      mostrarToast(`📀 Backup restaurado! (${count} conjuntos de dados)`,'success');
    } catch(err){
      mostrarToast('⚠️ Arquivo de backup inválido','warn');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ═══════════════════════════════════
// TELA CHEIA
// ═══════════════════════════════════
function toggleFullscreen(){
  const layout = document.querySelector('.layout');
  const btn = document.getElementById('btnFullscreen');
  const on = layout.classList.toggle('fullscreen');
  btn.textContent = on ? '⤡' : '⤢';
  btn.title = on ? 'Recolher sidebar' : 'Expandir área de edição';
  localStorage.setItem('prospere_fullscreen', on ? '1' : '');
}
(function(){
  if(localStorage.getItem('prospere_fullscreen')){
    document.addEventListener('DOMContentLoaded', () => {
      const layout = document.querySelector('.layout');
      const btn = document.getElementById('btnFullscreen');
      if(layout) layout.classList.add('fullscreen');
      if(btn){ btn.textContent='⤡'; btn.title='Recolher sidebar'; }
    }, {once:true});
  }
})();

// ═══════════════════════════════════
// COMPARTILHAR PROMPT VIA LINK
// ═══════════════════════════════════
function compartilharLink(){
  const full = buildFullPrompt();
  if(!full.trim()){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }
  try {
    const bytes = new TextEncoder().encode(full);
    const encoded = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
    const url = `${location.origin}${location.pathname}?p=${encoded}`;
    if(url.length > 8000){
      mostrarToast('⚠️ Prompt muito longo para link — use Copiar ou Exportar PDF','warn');
      return;
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url)
        .then(() => mostrarToast('🔗 Link copiado! Cole para compartilhar.','success'))
        .catch(() => mostrarToast('⚠️ Não foi possível copiar o link','warn'));
    }
  } catch(e){
    mostrarToast('⚠️ Erro ao gerar link de compartilhamento','warn');
  }
}
function carregarPromptDaURL(){
  const params = new URLSearchParams(location.search);
  const p = params.get('p');
  if(!p) return;
  try {
    const bytes = Uint8Array.from(atob(p), c => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    document.getElementById('rawOut').value = decoded;
    const fakeSecs = {};
    SECOES.forEach(s => { fakeSecs[s.id] = ''; });
    fakeSecs['conceito'] = decoded;
    buildSections(fakeSecs);
    switchTab('raw', document.querySelectorAll('.otab')[2]);
    mostrarToast('🔗 Prompt carregado do link compartilhado!','success');
  } catch(e){ /* link inválido, ignora silenciosamente */ }
}

// ═══════════════════════════════════
// BANCO DE FRASES CUSTOMIZADAS
// ═══════════════════════════════════
function adicionarFraseBanco(){
  const txt = v('fraseCustom');
  if(!txt){ mostrarToast('⚠️ Digite uma frase antes de salvar','warn'); return; }
  let banco = JSON.parse(localStorage.getItem('prospere_frases') || '[]');
  if(banco.includes(txt)){ mostrarToast('⚠️ Essa frase já está salva','warn'); return; }
  banco.push(txt);
  localStorage.setItem('prospere_frases', JSON.stringify(banco));
  renderFrasesCustom();
  mostrarToast('➕ Frase adicionada ao banco!','success');
}
function renderFrasesCustom(){
  const banco = JSON.parse(localStorage.getItem('prospere_frases') || '[]');
  const container = document.getElementById('frasesCustomList');
  container.innerHTML = banco.map((f, i) => `
    <div class="frase-chip" style="display:flex;justify-content:space-between;align-items:center;gap:6px" data-custom="1" data-idx="${i}">
      <span class="fc-txt" style="flex:1;cursor:pointer">${esc(f)}</span>
      <span class="fc-del" style="cursor:pointer;color:var(--muted);font-weight:900;padding:0 4px">✕</span>
    </div>`).join('');
  container.querySelectorAll('[data-custom]').forEach(el => {
    const i = parseInt(el.dataset.idx, 10);
    el.querySelector('.fc-txt').addEventListener('click', () => selecionarFraseCustom(banco[i], el));
    el.querySelector('.fc-del').addEventListener('click', () => removerFraseBanco(i));
  });
}
function selecionarFraseCustom(texto, el){
  document.querySelectorAll('.frase-chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  fraseSelecionada = texto;
  document.getElementById('fraseCustom').value = '';
}
function removerFraseBanco(i){
  let banco = JSON.parse(localStorage.getItem('prospere_frases') || '[]');
  banco.splice(i,1);
  localStorage.setItem('prospere_frases', JSON.stringify(banco));
  renderFrasesCustom();
}

// ═══════════════════════════════════
// PERFIS DE ATLETA
// ═══════════════════════════════════
function renderProfileSelector(){
  const profiles = JSON.parse(localStorage.getItem('prospere_profiles') || '[]');
  const sel = document.getElementById('profileSelect');
  if(!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">— Perfil salvo —</option>' +
    profiles.map(p => `<option value="${p.id}"${p.id===current?' selected':''}>${esc(p.label)}</option>`).join('');
}

function salvarPerfil(){
  const nome = v('nome');
  if(!nome){ mostrarToast('⚠️ Preencha o nome do atleta','warn'); return; }
  const profiles = JSON.parse(localStorage.getItem('prospere_profiles') || '[]');
  const id = Date.now().toString();
  const label = nome + (v('clube') ? ' · ' + v('clube') : '');
  profiles.unshift({ id, label,
    nome: v('nome'), categoria: v('categoria'), clube: v('clube'),
    campeonato: v('campeonato'), uniforme1: v('uniforme1'), uniforme2: v('uniforme2')
  });
  if(profiles.length > 20) profiles.length = 20;
  localStorage.setItem('prospere_profiles', JSON.stringify(profiles));
  renderProfileSelector();
  document.getElementById('profileSelect').value = id;
  mostrarToast('💾 Perfil salvo!','success');
}

function carregarPerfil(id){
  if(!id) return;
  const profiles = JSON.parse(localStorage.getItem('prospere_profiles') || '[]');
  const p = profiles.find(x => x.id === id);
  if(!p) return;
  if(p.nome)       document.getElementById('nome').value       = p.nome;
  if(p.categoria)  document.getElementById('categoria').value  = p.categoria;
  if(p.clube)      document.getElementById('clube').value      = p.clube;
  if(p.campeonato) document.getElementById('campeonato').value = p.campeonato;
  document.getElementById('uniforme1').value = p.uniforme1 || '';
  document.getElementById('uniforme2').value = p.uniforme2 || '';
  saveDraft();
  mostrarToast('📂 Perfil carregado!','success');
}

function deletarPerfil(){
  const sel = document.getElementById('profileSelect');
  const id = sel.value;
  if(!id){ mostrarToast('⚠️ Selecione um perfil para deletar','warn'); return; }
  if(!confirm('Deletar este perfil?')) return;
  let profiles = JSON.parse(localStorage.getItem('prospere_profiles') || '[]');
  profiles = profiles.filter(p => p.id !== id);
  localStorage.setItem('prospere_profiles', JSON.stringify(profiles));
  renderProfileSelector();
  mostrarToast('🗑️ Perfil deletado','');
}

// ═══════════════════════════════════
// ZIP / EXPORTAR KIT
// ═══════════════════════════════════
function crc32(data){
  if(!crc32._t){
    crc32._t = new Uint32Array(256);
    for(let i=0;i<256;i++){
      let c=i;
      for(let j=0;j<8;j++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
      crc32._t[i]=c;
    }
  }
  let crc=0xFFFFFFFF;
  for(let i=0;i<data.length;i++) crc=crc32._t[(crc^data[i])&0xFF]^(crc>>>8);
  return (crc^0xFFFFFFFF)>>>0;
}

function buildZip(files){
  const enc = new TextEncoder();
  let offset = 0;
  const locals = [];
  const centrals = [];

  for(const file of files){
    const name = enc.encode(file.name);
    const data = file.data;
    const crc = crc32(data);
    const sz = data.length;
    const local = new Uint8Array(30 + name.length + sz);
    const lv = new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true); lv.setUint16(4,20,true);
    lv.setUint16(6,0,true);          lv.setUint16(8,0,true);
    lv.setUint16(10,0,true);         lv.setUint16(12,0,true);
    lv.setUint32(14,crc,true);       lv.setUint32(18,sz,true);
    lv.setUint32(22,sz,true);        lv.setUint16(26,name.length,true);
    lv.setUint16(28,0,true);
    local.set(name,30); local.set(data,30+name.length);
    locals.push({bytes:local, nameBytes:name, crc, sz, offset});
    offset += local.length;
  }

  const cdStart = offset;
  for(const {nameBytes, crc, sz, offset:lo} of locals){
    const cd = new Uint8Array(46+nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true);
    cv.setUint16(6,20,true);         cv.setUint16(8,0,true);
    cv.setUint16(10,0,true);         cv.setUint16(12,0,true);
    cv.setUint16(14,0,true);         cv.setUint32(16,crc,true);
    cv.setUint32(20,sz,true);        cv.setUint32(24,sz,true);
    cv.setUint16(28,nameBytes.length,true); cv.setUint16(30,0,true);
    cv.setUint16(32,0,true);         cv.setUint16(34,0,true);
    cv.setUint16(36,0,true);         cv.setUint32(38,0,true);
    cv.setUint32(42,lo,true);        cd.set(nameBytes,46);
    centrals.push(cd); offset += cd.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(4,0,true);
  ev.setUint16(6,0,true);          ev.setUint16(8,files.length,true);
  ev.setUint16(10,files.length,true); ev.setUint32(12,offset-cdStart,true);
  ev.setUint32(16,cdStart,true);   ev.setUint16(20,0,true);

  const out = new Uint8Array(offset+22);
  let pos=0;
  for(const {bytes} of locals){ out.set(bytes,pos); pos+=bytes.length; }
  for(const cd of centrals){ out.set(cd,pos); pos+=cd.length; }
  out.set(eocd,pos);
  return out;
}

async function exportarKit(){
  const prompt = buildFullPrompt();
  const hasImages = Object.keys(uploadedFiles).length > 0;
  if(!prompt.trim() && !hasImages){ mostrarToast('⚠️ Gere um prompt primeiro!','warn'); return; }

  const advSlug = (v('adv')||'arte').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const files = [];

  if(prompt.trim())
    files.push({ name:`prompt-${advSlug}.txt`, data: new TextEncoder().encode(prompt) });

  const labels = { fotoAtleta:'foto-atleta', logo1:'escudo-prospere', logo2:'escudo-adversario' };
  await Promise.all(Object.entries(uploadedFiles).map(([key, file]) => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const ext = (file.name.split('.').pop()||'png').toLowerCase();
      files.push({ name:`${labels[key]||key}-${advSlug}.${ext}`, data: new Uint8Array(e.target.result) });
      resolve();
    };
    reader.readAsArrayBuffer(file);
  })));

  const zip = buildZip(files);
  const url = URL.createObjectURL(new Blob([zip],{type:'application/zip'}));
  const a = document.createElement('a');
  a.href=url; a.download=`kit-${advSlug}.zip`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  mostrarToast(`📦 Kit exportado! ${files.length} arquivo(s)`,'success');
}

// ═══════════════════════════════════
// DASHBOARD DE ESTATÍSTICAS
// ═══════════════════════════════════
function abrirDashboard(){
  const ph = JSON.parse(localStorage.getItem('prospere_prompts') || '[]');
  const favs = JSON.parse(localStorage.getItem('prospere_favs') || '[]');
  const tags = JSON.parse(localStorage.getItem('prospere_tags') || '{}');
  const resultados = JSON.parse(localStorage.getItem('prospere_resultados') || '{}');
  const partidas = JSON.parse(localStorage.getItem('prospere_partidas') || '[]');

  const totalPrompts = ph.length;
  const totalFavs = favs.length;
  const totalResultados = Object.keys(resultados).length;

  // taxa de aprovação
  const comBom = ph.filter(p => (tags[p.ts]||[]).includes('bom')).length;
  const comRuim = ph.filter(p => (tags[p.ts]||[]).includes('ruim')).length;
  const taxaAprov = totalPrompts ? Math.round((comBom / totalPrompts) * 100) : 0;

  // ranking de adversários
  const advCount = {};
  ph.forEach(p => { if(p.adv) advCount[p.adv] = (advCount[p.adv]||0)+1; });
  const advRanking = Object.entries(advCount).sort((a,b) => b[1]-a[1]).slice(0,5);

  // ranking de tipos de arte
  const tipoCount = {};
  ph.forEach(p => {
    const txt = (p.secoes && p.secoes.identidade) || '';
    const match = txt.match(/TIPO DE ARTE:\s*([^\n]+)/);
    tipoCount[match ? match[1].trim() : 'Story 9:16'] = (tipoCount[match?match[1].trim():'Story 9:16']||0)+1;
  });
  const tipoRanking = Object.entries(tipoCount).sort((a,b) => b[1]-a[1]);

  // ranking de paletas com taxa de resultado bom
  const paletaCount = {}, paletaBom = {};
  ph.forEach(p => {
    const txt = (p.secoes && p.secoes.paleta) || '';
    const match = txt.match(/Paleta escolhida:\s*([^\n]+)/);
    const paleta = match ? match[1].trim() : null;
    if(!paleta) return;
    paletaCount[paleta] = (paletaCount[paleta]||0)+1;
    if((tags[p.ts]||[]).includes('bom')) paletaBom[paleta] = (paletaBom[paleta]||0)+1;
  });
  const paletaRanking = Object.entries(paletaCount).sort((a,b) => b[1]-a[1]).slice(0,5);

  function bars(ranking, max, extra){
    if(!ranking.length) return '<p style="font-size:12px;color:var(--muted)">Nenhum dado ainda.</p>';
    return ranking.map(([nome,count]) => {
      const pct = Math.max(12,(count/max)*100);
      const suffix = extra ? extra(nome, count) : '';
      return `<div class="dash-bar-row">
        <span class="dash-bar-label" title="${esc(nome)}">${esc(nome)}</span>
        <div class="dash-bar-track"><div class="dash-bar-fill" style="width:${pct}%">${count}${suffix}</div></div>
      </div>`;
    }).join('');
  }

  const maxAdv  = advRanking.length  ? advRanking[0][1]  : 1;
  const maxTipo = tipoRanking.length ? tipoRanking[0][1] : 1;
  const maxPal  = paletaRanking.length ? paletaRanking[0][1] : 1;

  document.getElementById('dashboardContent').innerHTML = `
    <div class="dash-grid">
      <div class="dash-stat"><div class="dash-stat-num">${totalPrompts}</div><div class="dash-stat-label">Prompts salvos</div></div>
      <div class="dash-stat"><div class="dash-stat-num">${totalFavs}</div><div class="dash-stat-label">Favoritos</div></div>
      <div class="dash-stat"><div class="dash-stat-num">${taxaAprov}%</div><div class="dash-stat-label">Taxa de aprovação</div></div>
      <div class="dash-stat"><div class="dash-stat-num">${totalResultados}</div><div class="dash-stat-label">Fotos de resultado</div></div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:14px">
      👍 ${comBom} aprovados · 👎 ${comRuim} reprovados · ${genCount} gerações nesta sessão
    </div>
    <div class="dash-section-title">⚔️ Adversários mais enfrentados</div>
    ${bars(advRanking, maxAdv)}
    <div class="dash-section-title">🎨 Tipos de arte mais usados</div>
    ${bars(tipoRanking, maxTipo)}
    <div class="dash-section-title">🖌️ Paletas mais usadas</div>
    ${bars(paletaRanking, maxPal, (nome) => paletaBom[nome] ? ` · 👍${paletaBom[nome]}` : '')}
  `;
  document.getElementById('modalDashboard').classList.add('open');
}
function fecharDashboard(){
  document.getElementById('modalDashboard').classList.remove('open');
}
document.getElementById('modalDashboard').addEventListener('click', e => {
  if(e.target === document.getElementById('modalDashboard')) fecharDashboard();
});

function mostrarToast(msg, type=''){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  const duracao = msg.length > 40 ? 4000 : 2500;
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), duracao);
}

// ═══════════════════════════════════
// INIT
// ═══════════════════════════════════
(function(){
  const savedIdioma = localStorage.getItem('prospere_idioma');
  if(savedIdioma){ idioma = savedIdioma; }
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('langToggle');
    if(btn){ btn.textContent = idioma === 'en' ? '🇺🇸' : '🇧🇷'; btn.title = idioma === 'en' ? 'Prompt em inglês' : 'Prompt em português'; }
  }, {once:true});
})();
renderHistory();
atualizarAdvList();
renderFrasesCustom();
renderProfileSelector();
renderTemplateList();
restoreDraft();
carregarPromptDaURL();