# Prompt Master Futsal — Documentação do Sistema

Gerador de prompts para artes de marketing esportivo. O sistema monta automaticamente prompts detalhados para ferramentas de IA gerarem imagens profissionais de atletas de futsal.

---

## Acesso e Autenticação

### Cadastro
- Usuário cria conta com e-mail e senha
- Após o cadastro, o status fica como **pendente** — o usuário não acessa o sistema
- Uma tela de espera informa que o acesso será liberado pelo administrador
- O registro cria automaticamente registros nas tabelas `user_status` e `user_roles`

### Login
- Autenticação via Supabase com e-mail e senha
- O sistema verifica o status do usuário após o login:
  - **pending** → redireciona para `/aguardando`
  - **rejected** → faz logout e redireciona para login com mensagem de acesso negado
  - **approved** → acessa o sistema normalmente

### Painel Administrativo (`/admin`)
Acessível apenas para usuários com role `admin`.

- **Listagem de usuários** com colunas: E-mail, Status, Perfil (role), Data de cadastro, Ações
- **Filtros por status**: Pendentes / Aprovados / Negados / Todos
- **Contadores** no topo: total de pendentes, aprovados e negados
- **Aprovar usuário**: libera acesso imediatamente
- **Negar usuário**: bloqueia o acesso com dupla confirmação via `window.confirm`
- **Alterar role**: dropdown para alternar entre `👤 Usuário` e `⭐ Admin`

---

## Formulário de Geração

### Imagens de Referência
Três uploads de imagem, comprimidos e armazenados no `localStorage` do navegador:
- **Foto do Atleta** (obrigatório) — comprimida para até 900px
- **Escudo do Clube** (obrigatório) — comprimido para até 500px
- **Escudo do Adversário** (opcional) — comprimido para até 500px

Avisos são inseridos automaticamente no prompt quando uma imagem obrigatória não foi enviada.

### Dados do Atleta
| Campo | Descrição |
|---|---|
| Nome | Nome completo do atleta |
| Clube | Nome do clube |
| Categoria | Sub-15, Sub-20, Adulto, etc. |
| Campeonato | Nome da competição |

### Uniforme
- Cor principal e cor secundária do uniforme

### Modo de Jogo
**Pré-jogo (Pregame)**
- Intensidades disponíveis:
  - 🎉 **Celebração** — alegria, conquista, festa, confetes
  - ⚔️ **Confronto** — energia máxima, arena de batalha, tensão épica
  - 🏛️ **Institucional** — elegante, profissional, identidade do clube

**Pós-jogo (Postgame)**
- Campos de placar (gols do time e do adversário)
- Intensidade selecionada **automaticamente** pelo resultado:
  - Gols nossos > adversário → 🏆 **Vitória** — explosão de alegria, conquista épica
  - Empate → 🤝 **Empate** — determinação, resiliência, cabeça erguida
  - Gols nossos < adversário → 💪 **Derrota** — garra, superação, foco na revanche

### Dados da Partida
- Adversário, data, horário e local

### Tipo de Arte
Cinco formatos com prompts e composições distintas:

| Tipo | Proporção | Característica |
|---|---|---|
| Instagram Story 9:16 | 9:16 (1080×1920px) | Arte vertical, atleta ocupa 70% |
| Feed Instagram 4:5 | 4:5 (1080×1350px) | Feed equilibrado, 3 zonas visuais |
| Banner horizontal | 16:9 | Composição em 3 zonas: clube / atleta / adversário |
| Card MVP | 4:5 | Destaque individual, aura dourada, sem adversário |
| Card Convocação | 9:16 | Tom militar esportivo, data em destaque, dois escudos |

### Ferramenta de IA
Cada ferramenta recebe instruções e sufixos específicos no prompt:
- **Midjourney** — adiciona parâmetros `--ar`, `--v 6`, `--style raw`, `--q 2`, `--no`
- **ChatGPT** — instrução para anexar fotos junto com o texto
- **Gemini** — instrução similar ao ChatGPT
- **Firefly** — especifica apenas a proporção

### Paleta de Cores (7 opções)
- Azul royal e dourado
- Preto e dourado premium
- Grafite e prata metálica
- Azul royal e branco
- Vermelho e preto
- Roxo neon premium
- Verde esmeralda e prata

### Ação do Atleta (7 opções)
Conduzindo a bola · Finalizando a gol · Driblando · Comemorando · Correndo em velocidade · Disputando posse · Protegendo a posse

### Ângulo de Câmera (7 opções)
Low angle dramático · Eye level esportivo · Dynamic side angle · Cinematic tracking shot · Dramatic close-up · Wide arena shot · Action shot cinematográfico

### Frase de Impacto
- 5 frases predefinidas selecionáveis
- Opção de IA criar frase inédita automaticamente (padrão)
- Campo de frase customizada livre

---

## Geração do Prompt

### Estrutura do Prompt (12 seções)
Todo prompt gerado é composto por seções na ordem:

1. **🪪 Identidade Fixa** — nome do atleta em destaque dourado, clube, campeonato, categoria, placar (pós-jogo)
2. **👤 Fidelidade Facial** — instruções detalhadas para preservar identidade facial com máxima fidelidade
3. **🎬 Conceito Visual** — tom geral da arte, referências visuais, efeitos especiais por tipo
4. **👕 Uniforme** — cores, escudo de referência, identidade visual do clube
5. **⚡ Ação & Câmera** — ação do atleta e ângulo de câmera
6. **🏟️ Cenário & Iluminação** — ambiente e estilo de iluminação
7. **🎨 Paleta de Cores** — paleta selecionada
8. **✍️ Tipografia & Textos** — hierarquia tipográfica com zonas definidas (nome, confronto, data)
9. **📅 Informações da Partida** — data, horário, local, confronto
10. **💬 Frase de Impacto** — frase selecionada ou instrução para IA criar
11. **🏆 Qualidade Final** — especificações técnicas, resolução 8K, formato e sufixo da ferramenta
12. **🚫 Evitar (Negative Prompt)** — lista de itens proibidos (rosto distorcido, cartoon, anatomia errada, etc.)

### Variação Aleatória (modo 🎲)
Quando ativado, o gerador sorteia aleatoriamente (sem repetir o valor anterior):
- Paleta · Ação · Ângulo de câmera · Cenário · Layout de composição · Estilo de iluminação · Estilo tipográfico

**Travamento de categorias**: cada categoria pode ser individualmente travada para não ser sorteada, mantendo o valor atual fixo enquanto as demais variam.

**Pools de variação aleatória:**
- 7 cenários de arena
- 7 layouts de composição
- 7 estilos de iluminação
- 7 estilos tipográficos

### Idioma do Prompt
- 🇧🇷 Português (padrão)
- 🇺🇸 English — todas as seções geradas em inglês

### Undo
- Pilha de até 15 gerações anteriores
- Botão ↩ desfaz para o estado anterior

---

## Seções Editáveis

Após gerado, cada uma das 12 seções pode ser editada individualmente diretamente na interface. As edições atualizam o prompt completo em tempo real.

---

## Histórico de Prompts

- Armazena até 200 prompts gerados
- Cada entrada registra: texto completo, tipo de arte, intensidade, nome do atleta, clube, adversário e timestamp
- **Favoritar** (⭐) — marca prompts favoritos
- **Tags** — sistema de tags por prompt
- **Copiar** — copia o texto completo para a área de transferência
- Exibe prévia das primeiras 120 caracteres

---

## Partidas

- Cadastrar partidas com: adversário, data, horário, local, campeonato, placar, modo (pré/pós)
- **Próximo jogo** exibido automaticamente no header com countdown em dias
- Badge dinâmico: "JOGO HOJE!", "Amanhã", ou "Xd · vs Adversário"

---

## Perfis de Atleta

- Salvar conjunto de dados do atleta (nome, clube, categoria, campeonato, uniformes)
- Carregar perfil salvo para preencher o formulário automaticamente
- Deletar perfis salvos

---

## Templates de Prompt

- Salvar as 12 seções do prompt atual como template nomeado
- Carregar template para restaurar um conjunto de seções completo
- Deletar templates

---

## Frases Salvas

- Salvar frases de impacto customizadas para reutilização
- Biblioteca pessoal de frases além das opções predefinidas

---

## Adversários Frequentes

- Lista automática dos últimos 30 adversários utilizados
- Preenchida automaticamente a cada geração

---

## Interface

### Header
- Logo e nome do sistema
- Badge do próximo jogo (quando cadastrado)
- Botão ☀️/🌙 para alternar tema
- Botão ⚙️ Admin (visível apenas para admins)
- E-mail do usuário logado + botão Sair

### Layout
- **Sidebar esquerda** — formulário completo com todos os campos
- **Área principal direita** — saída do prompt com 3 abas:
  - **✏️ Seções** — visualização editável seção a seção
  - **📄 Prompt Completo** — textarea com o prompt inteiro para copiar
  - **📚 Histórico** — lista dos prompts anteriores

### Tema
- **Dark** (padrão) — fundo escuro, texto claro, dourado como cor de destaque
- **Light** — fundo claro, texto escuro, dourado ajustado para contraste
- Preferência salva no `localStorage` e aplicada imediatamente (sem flash ao carregar)

### Toasts
- Feedback visual de ações (sucesso, aviso, erro)
- Animação de entrada pelo canto inferior direito
- Desaparecem automaticamente após 3,5 segundos

---

## Persistência de Dados

Todos os dados são salvos automaticamente no `localStorage` do navegador (chave `pm-store`):

| Dado | Descrição |
|---|---|
| Formulário | Todos os campos preenchidos |
| Configurações | Idioma, intensidade, tipo, ferramenta, paleta, ação, ângulo |
| Histórico | Últimos 200 prompts gerados |
| Favoritos | Lista de timestamps favoritados |
| Tags | Tags por prompt |
| Partidas | Histórico de partidas |
| Perfis | Perfis de atleta salvos |
| Templates | Templates de prompt salvos |
| Frases | Frases customizadas salvas |
| Adversários | Últimos 30 adversários |
| Contador | Total de prompts gerados |
| Categorias travadas | Estado de travamento do modo aleatório |

Imagens (foto do atleta e escudos) são salvas separadamente em `localStorage` em formato base64 comprimido.
