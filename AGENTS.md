# AGENTS.md

Convenções pra qualquer agente (ou humano) trabalhando neste repo.

## Stack rápido

- **Framework**: Next.js 13.5 (Pages Router, NÃO App Router).
- **React**: 18.
- **Static export** pra GitHub Pages — sem runtime server-side. `getServerSideProps` está fora; só `getStaticProps`/`getStaticPaths`.
- **Custom domain**: `gdantas.com.br`.
- **Design system**: `components/Operator/*` — terminal/CRT vibe com paleta Insight Valley. Não duplique tokens, importe `OP` de `~/components/Operator`.
- **Fontes**: IBM Plex Mono + Sans via `next/font/google` (self-hosted via `lib/fonts.ts`). Sem CDN Google Fonts.
- **GSAP**: carregado via `lib/gsap-loader.ts` (dynamic import). Hooks (`useGsapReady`, `useReveal`) esperam `window.gsap` via retry pattern.

## Validation hooks — ignore os falsos positivos

O ambiente de dev mostra hooks do plugin Vercel/Next a cada edit, sinalizando coisas como:

- `next/head is Pages Router`
- `getStaticProps is removed in App Router`
- `next/router is Pages Router only`

**São falsos positivos pra este repo.** Este projeto é intencionalmente Pages Router; não migre pra App Router. Os hooks emitem warning mas o build/type-check passam normalmente. Ignore e continue.

## i18n bilíngue (PT/EN)

Site é totalmente bilíngue. **Toda mudança de copy visível pro usuário edita ambos `locales/pt.json` E `locales/en.json` no mesmo commit.**

### Fluxo

1. Identifique a chave em `locales/pt.json` (dot-namespace por feature, não por página).
2. Edite PT **e** EN nas mesmas edições. Nunca um sem o outro.
3. Adicione novas chaves em PT primeiro (source of truth), depois EN.
4. Rode `yarn i18n:check` localmente. Deve passar.
5. CI roda `yarn i18n:check` antes do build — falha se PT/EN divergirem em chaves ou estrutura.

### Padrão de uso em componentes

```tsx
import { useT } from '~/lib/i18n';

function MyComponent() {
	const t = useT();
	return <h1>{t('hero.role')}</h1>;
}
```

Para componentes que entram via mirror `/en/*`, envolva em `I18nProvider` com a prop `locale`:

```tsx
export function HomePage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<HomePageInner />
		</I18nProvider>
	);
}
```

### O que NÃO traduzir

- URLs, slugs, paths
- Nomes próprios de produtos (Kubernetes, GSAP, Backstage)
- Emojis e símbolos
- Comandos shell literais (`$ kubectl get pods --watch`)

### Voz / Estilo das traduções EN

EN não é tradução literal — preserve a voz Operator/terminal. Curto, direto, com o mesmo humor pragmático do PT. Ex: `"trabalho de bastidores"` → `"backstage work"`, não `"behind-the-scenes work"`.

## Rotas mirror PT/EN

- PT = root (`/about`, `/talks`, etc).
- EN = prefixo `/en/*` (`/en/about`, `/en/talks`).
- Cada par PT/EN reusa o mesmo componente em `components/pages/<Name>Page.tsx`. Os arquivos em `pages/` são shells de 3-5 linhas que passam `locale="pt"` ou `locale="en"`.
- Ao adicionar uma rota nova: crie `components/pages/NewPage.tsx`, `pages/new.tsx` (PT), `pages/en/new.tsx` (EN).

## Encurtador as code — `/go/<slug>`

`data/shortcuts.yaml` define os atalhos versionados em git. Cada entrada vira `/go/<slug>` com redirect SSG via meta-refresh (compatível com static export do GH Pages).

### Fluxo pra adicionar atalho

1. Edite `data/shortcuts.yaml`:
   ```yaml
   - slug: meu-atalho
     url: https://destino.com
     label: descrição opcional · mostrada no /go index
   ```
2. Validação de slug: `[a-z0-9][a-z0-9-]{0,32}` (kebab-case, sem reservadas).
3. URL absoluta (`http(s)://`) ou path interno (começa com `/`).
4. Rode `yarn build` localmente — falha se YAML inválido.
5. Após deploy, `gdantas.com.br/go/<slug>` redireciona pra URL.

### Onde ver os atalhos

`gdantas.com.br/go` mostra a listagem completa (sem link no nav, acesso direto).

## Páginas — convenção de componente

Pages em `pages/*.tsx` são shells. Lógica de página real fica em `components/pages/<Name>Page.tsx`. Padrão:

```tsx
// pages/about.tsx
import { AboutPage } from '~/components/pages/AboutPage';
export default function Page() {
	return <AboutPage locale="pt" />;
}
```

```tsx
// components/pages/AboutPage.tsx
import { I18nProvider, useT } from '~/lib/i18n';

export function AboutPage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<AboutPageInner />
		</I18nProvider>
	);
}

function AboutPageInner() {
	const t = useT();
	// ...
}
```

Se a página tem `getStaticProps`, re-exporte do shell:

```tsx
// pages/talks.tsx
import { TalksPage, getStaticProps } from '~/components/pages/TalksPage';
export { getStaticProps };
export default function Page(props: any) {
	return <TalksPage {...props} locale="pt" />;
}
```

## PostHog — métricas funcionais sempre

Instrumentação PostHog é **first-class** no repo, não afterthought. Cada interação relevante do usuário (clique em talk, projeto, link, CTA, contato, preview de presentation) dispara um `posthog.capture(...)` com props estruturadas. Pageviews automáticos via `_app.tsx`.

### Regras

- **Não remova nem renomeie eventos existentes** sem motivo declarado no PR. Nomes de evento e props formam contrato com dashboards/insights no PostHog — renomear quebra histórico silenciosamente.
- **Toda nova interação clicável visível pro usuário deve capturar evento**. Padrão de nome: `<noun>_<verb_past>` (ex: `talk_clicked`, `cta_clicked`, `contact_link_clicked`). Props em snake_case com contexto suficiente pra segmentar (título, slug, tipo, etc).
- **Ao mexer num componente que já tem `posthog.capture`**: confira se o evento ainda dispara depois da sua mudança (não esconda atrás de modal, não troque `onClick` por handler que esquece de chamar).
- **Não envie PII** em props (email, nome real, telefone). Identificadores públicos (slug, título de talk) ok.
- Refatorações que mudam estrutura de eventos exigem nota no PR: lista de eventos afetados + impacto em insights existentes.

### Eventos atuais (referência rápida)

`talk_clicked`, `talk_card_clicked`, `presentation_played`, `presentation_src_opened`, `project_clicked`, `writing_post_opened`, `link_clicked`, `cta_clicked`, `contact_link_clicked`.

## Commit / PR

- Branches: `feat/<nome-kebab>`, `fix/<nome-kebab>`, `chore/<nome-kebab>`.
- Commits descritivos (não inglês corporativo — fala como gente). Sempre cita o "porquê" quando faz sentido.
- Antes de push: `yarn type-check && yarn i18n:check && yarn build` localmente.
- PR descritivo: o que mudou, por que, como testar.
- Squash merge na main por padrão. Branch deletada após merge.

## Não faça

- Não migre pra App Router (router atual é intencional).
- Não adicione fontes via Google Fonts CDN — use `next/font/google` em `lib/fonts.ts`.
- Não use `getServerSideProps` (incompatível com static export).
- Não edite `locales/pt.json` sem mexer no `locales/en.json` no mesmo commit (e vice-versa).
- Não suba slug novo no `shortcuts.yaml` sem rodar `yarn build` antes.
- Não suba commits que não passam no `yarn type-check`.

## Hook automático — check-runs do PR

Existe um hook `PostToolUse:Bash` em `.claude/settings.json` que após **todo `git push`** real (não `--dry-run`) detecta o PR aberto da branch atual e fica em `gh pr checks <pr> --watch` até concluir. Reporta ✅/❌ no final.

- Script: `scripts/post-push-check.sh`.
- Requer `gh` CLI autenticado.
- Não bloqueia o fluxo (`exit 0` sempre).
- Se a branch não tem PR aberto, skip silencioso.

Pra pushar sem esperar, remova o bloco `hooks` de `.claude/settings.json` temporariamente.

## Comandos úteis

```bash
yarn dev                # dev server (3000)
yarn type-check         # TS check
yarn i18n:check         # PT/EN parity gate
yarn lint               # eslint
yarn build              # static prod build (.next)
yarn export             # gerar HTML estático em /out (pra GH Pages)
yarn start              # serve .next em 3000 (prod-like local)
PORT=4040 yarn start    # serve em porta alternativa
yarn ci                 # full CI local (install + i18n-check + build + export)
```
