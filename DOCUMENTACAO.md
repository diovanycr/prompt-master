# Prompt Master Futsal — Documentação Completa

> Versão V1 · Gerador de prompts para marketing esportivo de futsal
> Arquivo de distribuição: `dist/prompt-master-futsal.html` (142 KB, offline-first)

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Como Usar](#2-como-usar)
3. [Interface — Sidebar (painel esquerdo)](#3-interface--sidebar-painel-esquerdo)
4. [Interface — Área de Output (painel direito)](#4-interface--área-de-output-painel-direito)
5. [Barra de Ações](#5-barra-de-ações)
6. [Atalhos de Teclado](#6-atalhos-de-teclado)
7. [Seções do Prompt](#7-seções-do-prompt)
8. [Modos de Geração](#8-modos-de-geração)
9. [Tipos de Arte e Ferramentas](#9-tipos-de-arte-e-ferramentas)
10. [Histórico de Prompts](#10-histórico-de-prompts)
11. [Histórico de Partidas](#11-histórico-de-partidas)
12. [Templates](#12-templates)
13. [Perfis de Atleta](#13-perfis-de-atleta)
14. [Ferramentas de Exportação](#14-ferramentas-de-exportação)
15. [Backup e Restauração](#15-backup-e-restauração)
16. [Dashboard de Estatísticas](#16-dashboard-de-estatísticas)
17. [Recursos de Acessibilidade e UX](#17-recursos-de-acessibilidade-e-ux)
18. [PWA e Funcionamento Offline](#18-pwa-e-funcionamento-offline)
19. [Dados Salvos (localStorage)](#19-dados-salvos-localstorage)
20. [Arquitetura Técnica](#20-arquitetura-técnica)

---

## 1. Visão Geral

O **Prompt Master Futsal** é uma aplicação web que gera prompts detalhados e profissionais para criação de artes de marketing esportivo usando ferramentas de IA (Midjourney, ChatGPT, Gemini, e outras).

**Para quem é:** Clubes de futsal, assessorias esportivas, criadores de conteúdo e marketeiros que precisam criar artes para redes sociais com frequência.

**Como funciona:** O usuário preenche os dados do atleta, do jogo e escolhe o estilo visual desejado. O sistema monta um prompt longo, estruturado e otimizado para IA, que pode ser copiado e colado diretamente na ferramenta geradora de imagens.

**Destaques:**
- Funciona 100% offline após o primeiro acesso (PWA)
- Arquivo único `.html` — sem instalação, sem servidor
- Todo o histórico fica salvo no navegador (localStorage)
- Prompts bilíngues: Português 🇧🇷 ou Inglês 🇺🇸
- Onboarding automático para novos usuários

---

## 2. Como Usar

### Primeiro acesso
1. Abrir `prompt-master-futsal.html` no navegador
2. Um modal de boas-vindas aparece — preencher nome do atleta, clube e cores do uniforme
3. Clicar em **🚀 Começar a gerar prompts**

### Fluxo básico de uso
1. **Enviar imagens** — Foto do atleta e escudo do clube (obrigatórios)
2. **Preencher dados da partida** — Adversário, data, horário, local
3. **Escolher intensidade** — Celebração / Confronto / Institucional
4. **Escolher tipo de arte** — Story, Feed, Banner, MVP, Convocação
5. **Escolher ferramenta** — Genérico, Midjourney, ChatGPT ou Gemini
6. **Clicar em ⚡ Gerar** ou pressionar `Ctrl+Enter`
7. **Copiar o prompt** e colar na ferramenta de IA junto com a foto do atleta

---

## 3. Interface — Sidebar (painel esquerdo)

### 3.1 Imagens de Referência

| Campo | Obrigatório | Descrição |
|---|---|---|
| 📸 Foto do Atleta | Sim | Foto de rosto/corpo do atleta para geração fiel |
| 🛡️ Escudo do Clube | Sim | Escudo oficial do clube |
| 🛡️ Escudo Adversário | Não | Escudo do adversário (para prompts de confronto) |

- Clicar na caixa para abrir o seletor de arquivo
- Itens marcados com `!` indicam que a imagem ainda não foi enviada
- Após enviar pelo menos uma imagem, o botão **📥 Baixar imagens** aparece para recuperar os arquivos enviados

### 3.2 Atleta & Clube

Campos do perfil do atleta e do clube. Todos são usados diretamente no prompt gerado.

| Campo | Placeholder | Descrição |
|---|---|---|
| Nome do atleta | Ex: João Silva | Nome completo do atleta |
| Categoria | Ex: Sub-12 | Categoria etária ou divisão |
| Clube | Ex: Sorocaba Futsal | Nome oficial do clube |
| Campeonato | Ex: Campeonato Paulista A2 2026 | Nome do campeonato atual |
| Cor uniforme (principal) | Ex: azul royal | Cor predominante do uniforme |
| Cor uniforme (detalhe) | Ex: branco | Cor de detalhe ou número |

**Perfis salvos:** dropdown no topo da seção permite salvar e carregar configurações completas do atleta. Útil quando a ferramenta é usada por mais de um atleta ou clube.

### 3.3 Partida

| Campo | Descrição |
|---|---|
| Modo Pré-jogo / Pós-jogo | Alterna entre arte de antecipação (pré-jogo) e arte de resultado (pós-jogo) |
| Placar final | Visível só no modo Pós-jogo — gols do time e do adversário |
| Adversário | Nome do time adversário (com autocomplete de times brasileiros) |
| Data | Data da partida no formato dd/mm/aaaa |
| Horário | Horário da partida |
| Local | Nome do ginásio ou arena |
| 🔔 Agendar lembrete | Agenda uma notificação no navegador 2 horas antes do jogo |

### 3.4 Nível de Intensidade (Pré-jogo)

Define o tom emocional da arte. Ativo apenas no modo Pré-jogo — no modo Pós-jogo a intensidade é definida automaticamente pelo resultado.

| Intensidade | Descrição |
|---|---|
| 🎉 Celebração | Alegria, conquista, confetes, euforia — para títulos ou marcos |
| 🔥 Confronto | Energia máxima, expressão de guerreiro, arena de batalha — padrão |
| 🏆 Institucional | Elegante e profissional — para apresentações oficiais do clube |

### 3.5 Formato & Visual

**Tipo de arte:**

| Tipo | Proporção | Uso |
|---|---|---|
| Story 9:16 | 9:16 | Instagram Stories, WhatsApp Status |
| Feed 4:5 | 4:5 | Feed do Instagram |
| Banner horizontal | 16:9 | Banners, YouTube, Facebook Cover |
| Card MVP | 4:5 | Destaque individual do atleta |
| Card Convocação | 9:16 | Anúncio de escalação |

**Ferramenta de destino:** Adapta o sufixo técnico do prompt para a ferramenta escolhida.

| Ferramenta | Sufixo gerado |
|---|---|
| 🌐 Genérico | Proporção de imagem: X:Y |
| 🎨 Midjourney | `--ar X:Y --v 6 --style raw --q 2` |
| 💬 ChatGPT | Instrução para anexar foto e proporção |
| ✨ Gemini | Instrução para anexar foto e proporção |

**Paleta de cores:**

| Opção | Cores |
|---|---|
| 🎲 IA Escolhe | A IA decide a paleta mais impactante |
| Azul & Ouro | Azul royal e dourado |
| Preto & Ouro | Preto e dourado premium |
| Grafite Prata | Grafite e prata metálica |
| Azul Branco | Azul royal e branco |
| Vermelho Preto | Vermelho e preto |

### 3.6 Ação & Câmera

**Ação do atleta:**

| Ação | Descrição |
|---|---|
| 🎲 IA Escolhe | IA decide a ação mais impactante |
| Conduzindo | Conduzindo a bola com maestria |
| Finalizando | Finalizando a gol com potência |
| Driblando | Driblando o adversário |
| Comemorando | Comemorando gol com euforia |
| Correndo | Correndo em velocidade máxima |

**Ângulo de câmera:**

| Ângulo | Efeito visual |
|---|---|
| 🎲 IA Varia | IA varia o ângulo automaticamente |
| Low Angle | Ângulo de baixo — engrandece o atleta |
| Eye Level | Ângulo natural e esportivo |
| Side Angle | Ângulo lateral dinâmico |
| Tracking | Câmera em movimento acompanhando |
| Close-up | Foco dramático no rosto/expressão |

### 3.7 Frase de Impacto

Frase que aparecerá na arte gerada. Opções:

- **🎲 IA cria frase inédita** — padrão; a IA inventa a frase
- **Frases predefinidas** — 5 opções clicáveis
- **Frases customizadas** — digitadas e salvas pelo usuário com o botão ➕; ficam salvas permanentemente e podem ser reutilizadas em gerações futuras

### 3.8 Histórico de Partidas

Lista das últimas 30 partidas salvas. Cada item mostra:
- Nome do adversário
- Badge com placar (se pós-jogo)
- Countdown colorido de dias até a partida:
  - 🔴 Hoje! | 🟡 Amanhã | 🟡 Até 7 dias | 🟢 Mais de 7 dias
- Botão ✕ para deletar

Clicar em uma partida recarrega os campos Adversário, Data, Hora e Local.

### 3.9 Templates de Prompt

Salva e recupera prompts completos (todas as seções) com um nome personalizado.

- Digitar um nome no campo e clicar em **💾 Salvar** para salvar o prompt atual como template
- Clicar no nome do template para carregá-lo
- Botão ✕ para deletar

Limite: 30 templates salvos.

### 3.10 Ferramentas

| Botão | Função |
|---|---|
| ⬇️ Exportar config (.json) | Salva configurações atuais dos campos em arquivo JSON |
| ⬆️ Importar config (.json) | Carrega configurações de um arquivo JSON exportado anteriormente |
| 🔗 Compartilhar via link | Gera um link com o prompt codificado em Base64 na URL para compartilhar |
| 💿 Backup completo (.json) | Exporta TODOS os dados salvos (partidas, prompts, perfis, templates, etc.) |
| 📀 Restaurar backup (.json) | Importa um backup completo, restaurando todos os dados |
| 💬 Compartilhar no WhatsApp | Abre o WhatsApp Web com o prompt atual (primeiros 3.000 caracteres) |

---

## 4. Interface — Área de Output (painel direito)

### Abas de visualização

| Aba | Conteúdo |
|---|---|
| 📋 Seções | Prompt dividido em seções expansíveis e editáveis individualmente |
| 👁️ Preview | Visualização formatada com hierarquia visual de cada seção |
| 💻 Completo | Textarea com o prompt completo, pronto para copiar |
| 🗂️ Histórico | Lista de prompts salvos com busca, filtros e galeria de resultados |

### Toolbar de output

- **Rótulo da aba** — indica qual aba está ativa
- **Contador de caracteres** — total de chars do prompt atual
- **Estimativa de tokens** — `chars ÷ 4,5` (calibrado para texto em português)
- **Atalhos rápidos** — lembretes visuais de `Ctrl+↵`, `Ctrl+⇧+↵`, `Ctrl+C`, `Ctrl+S`
- **⤢ Fullscreen** — expande a área de output, recolhendo a sidebar

### Aba Seções (📋)

Cada seção do prompt é um card expansível. Ao clicar no cabeçalho, a seção abre e exibe um textarea editável. Edições manuais marcam a seção com um ponto dourado (indicador visual de modificação manual). Todas as edições são sincronizadas em tempo real na aba Completo.

### Aba Histórico (🗂️)

Ver seção [10 — Histórico de Prompts](#10-histórico-de-prompts).

---

## 5. Barra de Ações

Localizada na parte inferior da área de output.

| Botão | Atalho | Função |
|---|---|---|
| ⚡ Gerar | `Ctrl+Enter` | Gera o prompt com base nas configurações atuais |
| ↩️ Desfazer | `Ctrl+Z` | Volta para a geração anterior (pilha de 15 estados) |
| 🎲 Variação | `Ctrl+Shift+Enter` | Gera uma variação aleatória sorteando paleta, ação, ângulo, cenário, layout, iluminação e tipografia |
| 🔒 Travas | — | Abre painel para travar categorias específicas que não devem variar nas variações aleatórias |
| 📋 Copiar | `Ctrl+C` | Copia o prompt completo para a área de transferência |
| 💾 Salvar | `Ctrl+S` | Salva a partida e o prompt no histórico |
| ⇄ Comparar | — | Abre modal comparando a geração atual com a anterior lado a lado |
| ⊞ A/B | — | Gera duas variações simultâneas para comparar em modal lado a lado |
| 🧹 Limpar | — | Limpa todos os campos de texto (mantém imagens) |
| 📄 PDF | — | Exporta o prompt atual como PDF |
| 📦 Kit | — | Exporta um ZIP com o prompt em `.txt`, as imagens enviadas e um HTML de preview |
| 📦 Semana | — | Gera 5 variações aleatórias automaticamente e exporta como ZIP com 5 arquivos `.txt` |

### Painel de Travas (🔒)

Categorias travadas mantêm o último valor sorteado e não são ressorteadas na próxima **Variação**. As seguintes categorias podem ser travadas individualmente:

- 🎨 Paleta de cores
- ⚡ Ação do atleta
- 📷 Ângulo de câmera
- 🏟️ Cenário
- 📐 Layout/Composição
- 💡 Iluminação
- ✍️ Tipografia

> ⚠️ Identidade do atleta, fidelidade facial, escudos e uniforme **nunca variam** — são sempre preservados.

---

## 6. Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl + Enter` | Gerar prompt |
| `Ctrl + Shift + Enter` | Gerar variação aleatória |
| `Ctrl + C` | Copiar prompt completo |
| `Ctrl + S` | Salvar partida e prompt |
| `Ctrl + Z` | Desfazer última geração |
| `Ctrl + L` | Alternar idioma PT/EN |

> Os atalhos só funcionam quando o foco não está dentro de um campo de texto (input/textarea).

---

## 7. Seções do Prompt

O prompt gerado é composto por 12 seções estruturadas:

| # | Seção | Conteúdo |
|---|---|---|
| 1 | 🪪 Identidade Fixa | Nome, clube, campeonato, categoria, placar (pós-jogo), instrução de destaque do nome |
| 2 | 👤 Fidelidade Facial | Instrução para reproduzir com máxima fidelidade o rosto do atleta a partir da foto enviada |
| 3 | 🎬 Conceito Visual | Tom da arte (Confronto / Celebração / Institucional / Pós-jogo) + informações da partida |
| 4 | 👕 Uniforme | Descrição do uniforme com cores, instrução de uso do escudo como referência |
| 5 | ⚡ Ação & Câmera | Ação do atleta + ângulo de câmera + variações extras (cenário, layout, iluminação, tipografia) |
| 6 | 🏟️ Cenário & Iluminação | Ambiente, cenário específico do modo de intensidade, iluminação cinematográfica |
| 7 | 🎨 Paleta de Cores | Paleta escolhida com instrução de aplicação |
| 8 | ✍️ Tipografia & Textos | Estilo tipográfico, hierarquia de texto, instrução de destaque do nome |
| 9 | 📅 Informações da Partida | Adversário, data, hora, local — contexto narrativo da arte |
| 10 | 💬 Frase de Impacto | Frase motivacional a ser incluída na arte |
| 11 | 🏆 Qualidade Final | Instrução de qualidade técnica: resolução, render cinematográfico, detalhes hiper-realistas |
| 12 | 🚫 Evitar (Negative Prompt) | Lista do que a IA deve evitar: distorções, texto errado, múltiplos atletas, etc. |

Todas as seções são editáveis individualmente na aba **📋 Seções**.

---

## 8. Modos de Geração

### 8.1 Pré-jogo (padrão)
Arte de antecipação — gerada antes da partida. A intensidade é definida pelo usuário (Celebração / Confronto / Institucional).

### 8.2 Pós-jogo
Arte de resultado — gerada após a partida. O usuário informa o placar e a intensidade é **calculada automaticamente**:

| Resultado | Intensidade aplicada | Tom |
|---|---|---|
| Mais gols que o adversário | PosVitoria | Explosão de alegria, conquista épica, confetes dourados |
| Mesmos gols | PosEmpate | Determinação, resiliência, cabeça erguida |
| Menos gols | PosDerrota | Garra, superação, foco no próximo desafio |

### 8.3 Variação Aleatória (🎲)
Sorteia aleatoriamente: paleta de cores, ação do atleta, ângulo de câmera, cenário, layout de composição, estilo de iluminação e estilo tipográfico. Categorias travadas no painel de Travas são mantidas do último sorteio.

### 8.4 A/B
Gera duas variações simultâneas e as exibe em um modal lado a lado para comparação. Permite escolher qual das duas usar.

### 8.5 Geração em Lote (📦 Semana)
Gera automaticamente 5 variações aleatórias e exporta todas em um arquivo `.zip` com um arquivo `.txt` por variação. Ideal para planejar a semana de conteúdo de uma vez.

### 8.6 Desfazer (↩️)
Mantém uma pilha de até 15 gerações anteriores. Cada clique em Desfazer (ou `Ctrl+Z`) volta um estado na pilha, restaurando as seções da geração anterior.

---

## 9. Tipos de Arte e Ferramentas

### Tipos de arte e proporções

| Tipo | Proporção | Plataforma ideal |
|---|---|---|
| Instagram Story 9:16 | 9:16 | Instagram Stories, WhatsApp Status, Reels |
| Feed Instagram 4:5 | 4:5 | Feed do Instagram, Facebook |
| Banner horizontal | 16:9 | YouTube, Twitter/X, Facebook Cover |
| Card MVP | 4:5 | Destaque individual, post de jogador |
| Card Convocação | 9:16 | Anúncio de time, escalação |

### Adaptação por ferramenta

O prompt inclui instruções técnicas adaptadas à ferramenta selecionada:

- **Midjourney:** Adiciona parâmetros `--ar`, `--v 6`, `--style raw`, `--q 2` ao final
- **ChatGPT / Gemini:** Adiciona instrução em texto para anexar a foto e informar a proporção
- **Genérico:** Apenas indica a proporção — funciona para qualquer ferramenta não listada

---

## 10. Histórico de Prompts

Acessado pela aba **🗂️ Histórico**. Armazena até 20 prompts salvos.

### Filtros disponíveis

| Filtro | Como usar |
|---|---|
| Texto livre | Digitar na caixa de busca — filtra por adversário ou data |
| `#bom` | Mostrar só prompts marcados como resultado bom |
| `#ruim` | Mostrar só prompts com resultado ruim |
| `#usado` | Mostrar só prompts marcados como usados |
| `#fav` | Mostrar só prompts favoritos |
| ⭐ Só favoritos | Botão de filtro rápido — alterna entre todos e só favoritos |
| 👍 / ✅ | Botões de atalho para filtrar por tag específica |

### Ações por prompt

| Ação | Como fazer |
|---|---|
| Carregar | Clicar no card — restaura as seções e campos da partida |
| Favoritar ⭐ | Clicar na estrela no canto superior direito do card |
| Tags de qualidade | Botões `✅` `👍` `👎` no card — marcam o prompt como Usado, Bom ou Ruim |
| Adicionar foto resultado | Botão 📸 — salva uma foto da arte final gerada vinculada ao prompt |
| Ver foto resultado | Clicar na miniatura — abre a imagem em tamanho maior |
| Remover foto | Botão 🗑️ abaixo da miniatura |
| Limpar tudo | Botão 🗑️ no cabeçalho da aba |

### Ordenação
Prompts favoritos aparecem sempre no topo. Dentro de cada grupo, ordenação é do mais recente para o mais antigo.

---

## 11. Histórico de Partidas

Armazena até 30 partidas. Visível na sidebar, seção **Histórico de Partidas**.

**O que é salvo por partida:**
- Adversário
- Data, hora e local
- Placar (se modo pós-jogo)
- Timestamp (para identificação)

**Badge de countdown:**
- 🔴 Hoje!
- 🟡 Amanhã
- 🟡 2–7 dias
- 🟢 Mais de 7 dias
- *(sem badge para partidas passadas)*

**Badge no header:** O próximo jogo futuro cadastrado aparece automaticamente no header do aplicativo com o countdown e o nome do adversário.

---

## 12. Templates

Templates salvam o estado completo de todas as 12 seções do prompt com um nome personalizado.

**Diferença entre Salvar partida e Salvar template:**
- **Salvar partida (💾):** salva no histórico vinculado ao adversário e à data — para registro e recuperação de contexto
- **Salvar template:** salva o *conteúdo do prompt* com um nome livre — para reutilizar estruturas de texto que funcionaram bem

Exemplos de uso de templates:
- "Arte confronto noturno" — estrutura de cenário que ficou ótima
- "Card MVP sub-12" — layout específico que o clube sempre usa
- "Convocação semifinal" — tom de texto para jogos decisivos

Limite: 30 templates. Templates fazem parte do backup completo.

---

## 13. Perfis de Atleta

Salva os dados de um atleta (nome, categoria, clube, campeonato, cores do uniforme) com um nome para recuperação futura.

**Uso típico:**
- Clube que gera artes para múltiplos atletas — salva um perfil por atleta e alterna conforme necessário
- Mudança de campeonato — salva perfil base e atualiza só o campeonato

Limite: 20 perfis salvos.

---

## 14. Ferramentas de Exportação

### 📄 Exportar PDF
Gera um PDF com o prompt completo formatado, pronto para impressão ou envio.

### 📦 Exportar Kit (ZIP)
Exporta um arquivo `.zip` contendo:
- `prompt.txt` — o prompt completo em texto
- `foto-atleta.*` — a foto do atleta enviada (se disponível)
- `escudo-clube.*` — o escudo do clube (se disponível)
- `escudo-adversario.*` — o escudo do adversário (se disponível)
- `preview.html` — um HTML de preview do prompt formatado

### 📦 Gerar Semana (ZIP)
Gera 5 variações aleatórias do prompt e exporta como `.zip` com um arquivo por variação:
- `prompt-lote-1-[adversário].txt`
- `prompt-lote-2-[adversário].txt`
- ...até 5

### 🔗 Compartilhar via Link
Codifica o prompt completo em Base64 e gera uma URL. A URL pode ser aberta em outro navegador e o prompt é carregado automaticamente. Funciona apenas para prompts curtos (limite de ~8.000 caracteres na URL).

### 💬 Compartilhar no WhatsApp
Abre o WhatsApp Web com os primeiros 3.000 caracteres do prompt pré-preenchidos na caixa de mensagem.

### ⬇️ Exportar config (.json)
Salva apenas os campos do formulário atual (atleta, clube, campeonato, etc.) em JSON. Útil para não precisar preencher tudo novamente em outro computador.

### ⬆️ Importar config (.json)
Restaura os campos de um arquivo de config exportado.

---

## 15. Backup e Restauração

### 💿 Backup completo
Exporta **todos os dados** em um único arquivo JSON:

| Dados incluídos |
|---|
| Histórico de partidas |
| Histórico de prompts |
| Prompts favoritos |
| Tags dos prompts |
| Fotos de resultado |
| Perfis de atleta |
| Templates de prompt |
| Banco de frases customizadas |
| Lista de adversários frequentes |
| Rascunho atual |
| Preferência de tema (claro/escuro) |

### 📀 Restaurar backup
Importa um arquivo de backup completo e sobrescreve os dados locais. Os dados são restaurados imediatamente.

> **Dica:** Faça backup antes de limpar o cache do navegador ou trocar de computador.

---

## 16. Dashboard de Estatísticas

Acessado pelo botão **📊** no header. Exibe:

| Estatística | Descrição |
|---|
| Total de gerações | Número de prompts gerados na sessão atual |
| Partidas salvas | Total de partidas no histórico |
| Prompts salvos | Total de prompts no histórico |
| Favoritos | Total de prompts marcados como favorito |
| Fotos de resultado | Total de fotos de resultado salvas |
| Uso por intensidade | Quantas vezes cada intensidade (Confronto, Celebração, Institucional) foi usada |
| Paletas mais usadas | Ranking de paletas de cores com contagem de uso |
| Adversários mais frequentes | Times que aparecem mais no histórico de partidas |

---

## 17. Recursos de Acessibilidade e UX

### Dark Mode
Botão 🌙 no header alterna entre tema claro e escuro. A preferência é salva e restaurada automaticamente nas próximas sessões.

### Idioma do Prompt (PT/EN)
Botão 🇧🇷/🇺🇸 no header ou `Ctrl+L` alterna o idioma de geração dos prompts entre Português e Inglês. Útil para ferramentas como Midjourney que respondem melhor a prompts em inglês.

### Fullscreen
Botão ⤢ expande a área de output, recolhendo a sidebar para zero largura. Ideal para editar o prompt em tela cheia.

### Banner de Aviso
Aparece automaticamente se imagens obrigatórias (foto do atleta ou escudo do clube) não foram enviadas.

### Próximo Jogo no Header
Badge automático no header mostra o próximo jogo futuro cadastrado com countdown colorido. Atualiza sempre que partidas são salvas ou deletadas.

### Toast de Feedback
Mensagens flutuantes aparecem no canto inferior da tela confirmando cada ação (gerar, salvar, copiar, exportar, etc.). Tipos: `success` (verde) e `warn` (laranja).

### Auto-save de rascunho
O rascunho atual das seções é salvo automaticamente no localStorage enquanto o usuário edita. Restaurado automaticamente ao reabrir o aplicativo.

### Onboarding de primeira vez
Na primeira abertura, um modal solicita os dados básicos (atleta, clube, cores). Só aparece uma vez — nas sessões seguintes, os dados já estão salvos.

### 🔔 Lembrete pré-jogo
O usuário pode agendar uma notificação do navegador que dispara automaticamente 2 horas antes do horário da partida cadastrada. Requer permissão de notificação do navegador.

### Comparação de gerações (⇄)
Modal de duas colunas mostrando a geração anterior e a atual lado a lado. Permite voltar para a anterior com um clique.

---

## 18. PWA e Funcionamento Offline

O aplicativo é um **Progressive Web App (PWA)**:

- **Instalável** — em dispositivos móveis e desktop, pode ser instalado como app nativo via "Adicionar à tela inicial"
- **Offline-first** — após o primeiro acesso, todos os arquivos são cacheados pelo Service Worker e o app funciona sem internet
- **Cache automático** — `index.html`, `style.css`, `app.js` e `manifest.json` são cacheados na instalação

> A versão standalone (`dist/prompt-master-futsal.html`) não inclui o Service Worker — funciona como arquivo local offline sem necessidade de cache.

---

## 19. Dados Salvos (localStorage)

Todos os dados são salvos no navegador via `localStorage`. Nenhum dado é enviado para servidores externos.

| Chave | Tipo | Conteúdo | Limite |
|---|---|---|---|
| `prospere_partidas` | Array | Histórico de partidas (adv, data, hora, local, placar, ts) | 30 itens |
| `prospere_prompts` | Array | Histórico de prompts (adv, data, prompt, secoes, ts, gen) | 20 itens |
| `prospere_favs` | Array | Timestamps dos prompts favoritos | Sem limite |
| `prospere_tags` | Objeto | `{ts: ['bom'/'ruim'/'usado']}` — tags por prompt | Sem limite |
| `prospere_resultados` | Objeto | `{ts: 'base64...'}` — fotos em Base64 comprimidas | Por espaço disponível |
| `prospere_profiles` | Array | Perfis de atleta salvos | 20 itens |
| `prospere_templates` | Array | Templates de prompt salvos | 30 itens |
| `prospere_frases` | Array | Banco de frases customizadas | Sem limite |
| `prospere_advs` | Array | Lista de adversários frequentes | Sem limite |
| `prospere_draft` | String/Objeto | Rascunho atual das seções | — |
| `prospere_theme` | String | `'dark'` ou ausente | — |
| `prospere_idioma` | String | `'pt'` ou `'en'` | — |
| `pm_setup` | String | `'1'` após onboarding completado | — |

> Fotos de resultado são comprimidas automaticamente para 600px / 75% JPEG antes de salvar, para economizar espaço no localStorage.

---

## 20. Arquitetura Técnica

### Stack
- **HTML5** — estrutura (`src/index.html`)
- **CSS3** com variáveis CSS (`src/style.css`)
- **JavaScript Vanilla** — sem frameworks, sem dependências (`src/app.js`)
- **localStorage** — persistência de dados
- **Service Worker** — cache offline (`src/sw.js`)
- **Web Manifest** — instalação como PWA (`src/manifest.json`)

### Estrutura de arquivos

```
prompt-master/
├── src/
│   ├── index.html       — HTML estrutural (366 linhas)
│   ├── app.js           — Toda a lógica da aplicação (~1.800 linhas)
│   ├── style.css        — Estilos (~290 linhas)
│   ├── manifest.json    — Manifesto PWA
│   └── sw.js            — Service Worker cache-first
├── dist/
│   └── prompt-master-futsal.html  — Build single-file (142 KB)
├── build.sh             — Script de build (Python inline)
├── CLAUDE.md            — Contexto para o Claude Code
└── DOCUMENTACAO.md      — Este arquivo
```

### Build
```bash
bash build.sh
```
O script Python inlina `style.css` e `app.js` dentro do `index.html`, remove as tags PWA (manifest + SW) e grava em `dist/prompt-master-futsal.html`.

### Funções principais do app.js

| Função | Descrição |
|---|---|
| `gerar(aleatorio)` | Função central — lê todos os campos e monta as 12 seções do prompt |
| `buildFullPrompt()` | Concatena `secaoContent` em texto único |
| `buildSections(data)` | Renderiza os cards de seções na aba Seções |
| `syncRaw()` | Sincroniza textarea completo e contadores |
| `tx(pt, en)` | Retorna texto em PT ou EN conforme `idioma` |
| `v(id)` | `document.getElementById(id).value.trim()` |
| `esc(str)` | Escaping XSS para uso em innerHTML |
| `mostrarToast(msg, tipo)` | Exibe toast de feedback |
| `renderHistory()` | Renderiza lista de partidas na sidebar |
| `renderPromptHistory()` | Renderiza histórico de prompts na aba |
| `renderTemplateList()` | Renderiza lista de templates |
| `renderProfileSelector()` | Popula o dropdown de perfis |
| `gerarLote(n)` | Gera N variações e exporta como ZIP |
| `buildZip(files)` | Monta arquivo ZIP em puro JS (sem lib) |
| `comprimirImagem(file, maxPx)` | Comprime imagem via Canvas API |
| `undoGeneration()` | Restaura estado anterior da pilha `generationStack` |
| `atualizarProximoJogo()` | Atualiza badge de próximo jogo no header |
| `verificarOnboarding()` | Exibe modal de boas-vindas na primeira visita |
| `exportarBackup()` | Exporta todos os dados em JSON |
| `importarBackup(event)` | Importa backup JSON |

### Fontes externas
Apenas as fontes Google são carregadas de CDN:
- `Bebas Neue` — títulos e destaques
- `Rajdhani` — interface e labels
- `JetBrains Mono` — contadores e dados técnicos

---

*Documentação gerada em junho/2026 · Prompt Master Futsal V1*
