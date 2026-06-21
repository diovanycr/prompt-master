# Prompt Master Futsal

Gerador de prompts para artes de marketing do futsal — versão web em Next.js + Supabase.

## Stack

- **Next.js 16.2.9** com App Router e Turbopack
- **TypeScript** estrito
- **Tailwind CSS v4** via `@import "tailwindcss"` (sem `tailwind.config.js`)
- **Supabase** (`@supabase/ssr`) para auth com cookies
- **Zustand 5** com `persist` middleware para estado local
- **npm** — rodar sempre de dentro de `web/`

## Comandos

```bash
cd web
npm run dev      # desenvolvimento (Turbopack)
npm run build    # build de produção
```

## Estrutura

```
web/
  app/
    layout.tsx          — RootLayout: script de tema pre-hydration, globals.css
    globals.css         — CSS vars :root (dark padrão), Tailwind import
    page.tsx            — Home: ThemeProvider > AuthProvider > Header + AppShell
    login/page.tsx      — Login + cadastro (sem auth check)
    aguardando/page.tsx — Página de espera para usuários pending
    admin/page.tsx      — Painel admin: aprovar/negar/role
    api/register/route.ts — POST: cria user_status + user_roles via service role key
  components/
    layout/
      AuthProvider.tsx  — Checa status/role no Supabase, redireciona conforme status
      Header.tsx        — Barra topo: logo, próximo jogo, toggle de tema, admin, sair
      ThemeProvider.tsx — Contexto de tema: aplica CSS vars via setProperty() no DOM
      AppShell.tsx      — Sidebar (FormSection) + área principal (PromptOutput)
    sidebar/
      FormSection.tsx   — Formulário completo: atleta, partida, modo, arte, etc.
      ImageUpload.tsx   — Upload de foto do atleta e escudos
    output/
      PromptOutput.tsx  — Abas: Seções editáveis / Prompt completo / Histórico
    ui/
      Toast.tsx         — ToastProvider + useToast() hook
  lib/
    supabase/client.ts  — createClient() para uso client-side
    supabase/server.ts  — createServerClient() para uso server-side
    prompt-generator.ts — buildFullPrompt(), PALETAS, ACOES, ANGULOS, intensidadeMap
  store/
    authStore.ts        — Zustand: user, status, role, loading
    promptStore.ts      — Zustand persist: form, modo, intensidade, historico, etc.
  types/index.ts        — Tipos compartilhados: AdminUser, UserRole, etc.
  proxy.ts              — Middleware Next.js 16 (exporta `proxy`, não `middleware`)
  .env.local            — Chaves Supabase (não commitar)
```

## Convenções importantes

### Next.js 16 — diferenças críticas
- Middleware exporta `proxy` (não `middleware`): `export async function proxy(request)`
- `viewport` (themeColor etc.) é exportado separado de `metadata`
- `useSearchParams` requer `<Suspense>` wrapper na página pai

### Tema (light/dark)
- **Tailwind v4 remove** seletores `html[data-theme="light"]` do CSS (Lightning CSS dead-code elimination)
- Solução: `ThemeProvider` aplica variáveis via `document.documentElement.style.setProperty()` diretamente
- Mesmo mapa de valores duplicado no script inline de `layout.tsx` (pre-hydration, sem flash)
- Todos os componentes usam `style={{ background: 'var(--surface)', ... }}` — **nunca** classes Tailwind com hex hardcoded

### CSS vars disponíveis
| Variável | Uso |
|---|---|
| `--gold` | Cor dourada de destaque |
| `--bg` | Fundo da página |
| `--surface` | Cards/painéis |
| `--surface2` | Inputs/elementos aninhados |
| `--border` | Bordas |
| `--text` | Texto principal |
| `--text-muted` | Texto secundário |

### Autenticação
- `proxy.ts` só checa se há sessão (não status)
- `AuthProvider.tsx` (client) checa `user_status` e redireciona:
  - `pending` → `/aguardando`
  - `rejected` → signOut + `/login?erro=acesso_negado`
  - `approved` → permanece na página
- Registro chama `/api/register` (usa `SUPABASE_SERVICE_ROLE_KEY`) para inserir nas tabelas protegidas por RLS

### Supabase RLS
- `is_admin()` — função SECURITY DEFINER que quebra recursão circular nas políticas
- Políticas de `user_status` e `user_roles` usam `is_admin()` para evitar loop

## O que NÃO fazer

- **Não usar** classes Tailwind com hex hardcoded (`bg-[#14141e]`, etc.) — quebra o light mode
- **Não depender** de seletores CSS `html[data-theme]` — Tailwind v4 remove no build
- **Não rodar npm** fora do diretório `web/`
- **Não adicionar** `middleware.ts` — o arquivo correto é `proxy.ts`
