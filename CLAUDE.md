# Prompt Master Prospere V6

Gerador de prompts para artes de marketing do futsal — focado no atleta **Kaio Genaro** do **Prospere Hortolândia Futsal**.

## Estrutura

```
src/
  index.html   — HTML sem inline CSS/JS (366 linhas)
  app.js       — Toda a lógica (~1741 linhas)
  style.css    — Estilos (~276 linhas)
  manifest.json — PWA manifest
  sw.js        — Service Worker (cache-first)
dist/
  prompt-master-v6.html — Build single-file gerado por build.sh (não editar)
build.sh       — Inlina CSS+JS no HTML e grava em dist/
```

## Comandos

```bash
# Rodar em desenvolvimento (Live Server aponta para src/)
python3 -m http.server 5501 --directory src

# Gerar o arquivo de distribuição standalone
bash build.sh
```

O `build.sh` usa Python para substituir `<link href="style.css">` e `<script src="app.js">` pelo conteúdo inlinado, e remove as tags de PWA (manifest + SW) que não funcionam em arquivo standalone.

## Arquitetura

- **Vanilla JS puro** — sem frameworks, sem bundler, sem npm.
- **localStorage** para toda persistência: partidas, prompts, perfis, templates, favoritos, tags, resultados (fotos).
- **PWA** com Service Worker e cache-first — funciona offline.
- **Build pipeline**: `src/` é o ambiente de desenvolvimento; `dist/prompt-master-v6.html` é o artefato de distribuição single-file.

## Convenções importantes

- `v(id)` — helper para `document.getElementById(id).value.trim()`
- `esc(str)` — escaping XSS para interpolação em innerHTML
- `tx(pt, en)` — retorna `en` se `idioma === 'en'`, senão `pt` (suporte bilíngue PT/EN)
- `buildFullPrompt()` — monta o prompt completo a partir de `secaoContent`
- `buildSections(data)` — renderiza as seções na aba Seções e atualiza `secaoContent`
- `syncRaw()` — sincroniza `rawOut` textarea e contadores de chars/tokens
- `mostrarToast(msg, tipo)` — toast de feedback (`'success'` | `'warn'` | `''`)

## Chaves do localStorage

| Chave | Conteúdo |
|---|---|
| `prospere_partidas` | Array de partidas salvas |
| `prospere_prompts` | Array de prompts salvos (histórico) |
| `prospere_favs` | Array de timestamps de prompts favoritos |
| `prospere_tags` | Objeto `{ts: [tags]}` — tags por prompt |
| `prospere_resultados` | Objeto `{ts: base64}` — fotos de resultado |
| `prospere_profiles` | Array de perfis de atleta |
| `prospere_templates` | Array de templates de prompt |
| `prospere_frases` | Array de frases customizadas |
| `prospere_advs` | Array de adversários frequentes |
| `prospere_draft` | Rascunho atual (auto-save) |
| `prospere_theme` | `'dark'` ou ausente |
| `prospere_idioma` | `'pt'` ou `'en'` |

## Funcionalidades implementadas

- Geração de prompt com seções editáveis (Identidade, Cenário, Técnica, Tipografia, etc.)
- Modos: **Pré-jogo** (Celebração / Confronto / Institucional) e **Pós-jogo** (Vitória / Empate / Derrota)
- Idioma do prompt: 🇧🇷 PT / 🇺🇸 EN via `Ctrl+L`
- Variação aleatória com categorias travávéis (`Ctrl+Shift+Enter`)
- A/B: duas variações lado a lado
- Geração em lote (5 variações → ZIP)
- Undo de geração (`Ctrl+Z`, pilha de 15)
- Templates: salvar/carregar/deletar conjuntos de seções
- Histórico de partidas com placar e countdown de dias
- Próximo jogo no header (badge automático)
- Histórico de prompts com busca, favoritos (`⭐`), tags (`#bom #ruim #usado #fav`), galeria de fotos de resultado
- Perfis de atleta (salvar/carregar campos do formulário)
- Exportar PDF, ZIP (kit de artes), backup completo
- Compartilhar via link (Base64 na URL) e WhatsApp
- Agendamento de lembrete pré-jogo (Notification API)
- Dashboard de estatísticas de uso
- PWA + offline + dark mode + fullscreen

## O que NÃO fazer

- **Não editar** `dist/prompt-master-v6.html` diretamente — sempre editar `src/` e rodar `bash build.sh`.
- **Não adicionar** dependências externas (npm, CDN de JS) — o projeto é offline-first e deve funcionar sem internet exceto as fontes Google (apenas estético).
- **Não usar** `unescape`/`escape` (deprecated) — usar `TextEncoder`/`TextDecoder` para encoding Base64 Unicode.
- Sempre rodar `bash build.sh` após alterações em `src/` para manter `dist/` atualizado.
