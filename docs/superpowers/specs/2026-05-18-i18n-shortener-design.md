# i18n PT/EN + Encurtador as Code

**Status:** approved, ready for implementation
**Date:** 2026-05-18
**Owner:** Gabriel Dantas
**Supersedes:** PR #7 (i18n minimal) + PR #8 (yaml redirects) — both abandonadas em
set/2025, conteúdo do branch antigo invalidado pelo rebrand Operator + upgrade
Next 13. Esse spec re-implementa as ideias sobre o stack atual.

## Goals

1. **i18n PT/EN com path-based routing**: `/about` (PT default) e `/en/about`
   coexistem, indexáveis separadamente pelo Google, com switcher de idioma no
   header. Conteúdo 100% bilingue.
2. **Encurtador as code** em `/go/<slug>` — atalhos versionados em
   `data/shortcuts.yaml`, redirect SSG via meta-refresh (compatível com static
   export pra GitHub Pages).

## Non-goals

- Auto-detecção via `Accept-Language` no edge (exigiria migrar GitHub Pages →
  Vercel). Fica client-side via `navigator.language`.
- i18n na página `/go/*` — utilitária, PT only.
- Encurtador-as-service com analytics próprias. Se precisar de tracking, usa
  splitbee/axiom existentes via dimensão custom.
- Outros locales além de PT/EN. Estrutura aceita extensão futura mas escopo
  atual é só esses dois.

## Arquitetura

```
data/
└── shortcuts.yaml              ← slug → url mapping versionado

locales/
├── pt.json                     ← copy PT (default, source of truth)
└── en.json                     ← mirror EN

lib/
├── i18n.ts                     ← Provider + useT() + locale router
└── shortcuts.ts                ← YAML loader + validator

components/
├── Operator/
│   ├── LangSwitcher.tsx        ← chip `[ PT · en ]`, ativa amber
│   ├── Header.tsx              ← injeta LangSwitcher
│   ├── Footer.tsx              ← usa t() em copy estático
│   └── PreviewModal.tsx        ← usa t() em "conferir ↗"
└── pages/                       ← NOVO: 11 page components extraídos pra reuso
    ├── HomePage.tsx
    ├── AboutPage.tsx
    ├── DoctrinePage.tsx
    ├── TalksPage.tsx
    ├── PresentationsPage.tsx
    ├── ProjectsPage.tsx
    ├── TimelinePage.tsx
    ├── WritingPage.tsx
    ├── SidequestsPage.tsx
    ├── LinksPage.tsx
    └── StatusPage.tsx

pages/
├── index.tsx → <HomePage locale="pt" />
├── about.tsx → <AboutPage locale="pt" />
├── ... (11 rotas PT: home + about + doctrine + talks + presentations +
│        projects + timeline + writing + sidequests + links + status)
├── 404.tsx + error.tsx          ← PT only, sem mirror EN (trade-off aceito:
│                                  páginas raras, simplifica routing)
├── en/
│   ├── index.tsx → <HomePage locale="en" />
│   ├── about.tsx → <AboutPage locale="en" />
│   └── ... (11 mirrors finos)
├── go/
│   ├── [slug].tsx              ← SSG redirect
│   └── index.tsx               ← listagem dos slugs (Operator-styled)
├── _app.tsx                    ← I18nProvider + browser-lang detection
└── _document.tsx               ← <html lang> dinâmico

scripts/
└── i18n-check.ts               ← CI gate: chaves PT == EN, falha o build
                                  se algum locale ficou pra trás
```

### Single source of truth da locale

A **URL** é a fonte da verdade. `I18nProvider` deriva `locale` de
`router.asPath.startsWith('/en')`. `localStorage.lang` guarda apenas a
**preferência do usuário** pra detecção de primeira visita — nunca o estado
atual.

### Switcher UX

- **Posição**: header global e topbar bespoke da home, entre clock UTC e nav
  (mobile drawer mostra no topo).
- **Render**: `[ PT · en ]` — locale ativo em `OP.amber`, inativo em `OP.dim`.
- **Click**: calcula `mirrorPath` (`/about` → `/en/about` ou vice-versa) +
  `router.push(mirrorPath)` + `localStorage.setItem('lang', target)`.
- **Acessibilidade**: `aria-label="Switch language to English/Portuguese"`
  dinâmico.

### Detecção na primeira visita

```ts
// _app.tsx, useEffectOnce
if (typeof window === 'undefined') return;
const stored = localStorage.getItem('lang');
if (stored) return;  // preferência salva → não força

const browserPrefersEN = navigator.language?.toLowerCase().startsWith('en');
const onENPath = router.asPath.startsWith('/en');
if (browserPrefersEN && !onENPath) {
  router.replace('/en' + router.asPath);
}
```

Trade-off aceito: pode haver um flash visível de PT antes do redirect
client-side. Aceitável dado que a maioria do tráfego é PT-BR.

### SEO

Cada página emite via NextSeo:

```tsx
languageAlternates={[
  { hrefLang: 'pt', href: `https://gdantas.com.br${path}` },
  { hrefLang: 'en', href: `https://gdantas.com.br/en${path}` },
  { hrefLang: 'x-default', href: `https://gdantas.com.br${path}` },
]}
```

`<html lang="pt">` ou `<html lang="en">` setado em `_document.tsx` via
`getInitialProps` lendo `ctx.locale` (manualmente, já que estamos com static
export sem i18n routing built-in).

### Convenção de manutenção

**Toda mudança de copy edita ambos `locales/pt.json` E `locales/en.json` no
mesmo commit.** O `scripts/i18n-check.ts` rodando em CI quebra o build se
chaves divergirem. Bloco explícito vai pra `AGENTS.md`:

```md
## i18n

The site is bilingual (PT/EN). When changing user-facing copy:

1. Find the key in `locales/pt.json`.
2. Change PT and EN in the same edit. Never ship one without the other.
3. New keys: add to PT first, then EN. Run `yarn i18n:check` locally.
4. CI runs `yarn i18n:check` and fails if keys diverge.

This rule applies to every agent/human contributor.
```

### Encurtador

**`data/shortcuts.yaml`**:

```yaml
links:
  - slug: gh
    url: https://github.com/gabriel-dantas98
    label: github
  - slug: li
    url: https://www.linkedin.com/in/gabrieldantasg/
    label: linkedin
  - slug: medium
    url: https://medium.com/@_gdantas
    label: medium
  - slug: cal
    url: https://cal.com/gdantas/30min
    label: cal · 30min
  - slug: deployou
    url: https://www.reserva.ink/deployou
    label: DeployOu storefront
  - slug: 3dantas
    url: https://www.3dantas.com.br
    label: 3Dantas site
  # ...adicionar conforme necessário
```

**`lib/shortcuts.ts`**:

```ts
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export interface Shortcut { slug: string; url: string; label?: string; }

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const RESERVED = new Set(['index', 'new', 'edit', '_next']);

export function loadShortcuts(): Shortcut[] {
  const file = path.join(process.cwd(), 'data/shortcuts.yaml');
  const parsed = yaml.load(fs.readFileSync(file, 'utf8')) as { links: Shortcut[] };
  const seen = new Set<string>();
  for (const s of parsed.links) {
    if (!SLUG_RE.test(s.slug)) throw new Error(`Invalid slug: ${s.slug}`);
    if (RESERVED.has(s.slug)) throw new Error(`Reserved slug: ${s.slug}`);
    if (seen.has(s.slug)) throw new Error(`Duplicate slug: ${s.slug}`);
    if (!/^(https?:\/\/|\/)/.test(s.url)) throw new Error(`Invalid url for ${s.slug}: ${s.url}`);
    seen.add(s.slug);
  }
  return parsed.links;
}
```

**`pages/go/[slug].tsx`**:

```tsx
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: loadShortcuts().map((s) => ({ params: { slug: s.slug } })),
  fallback: false,  // 404 pra slug fora do yaml
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const shortcut = loadShortcuts().find((s) => s.slug === params!.slug);
  return { props: { url: shortcut!.url } };
};

export default function GoRedirect({ url }: { url: string }) {
  return (
    <>
      <Head>
        <title>↗ {url}</title>
        <meta httpEquiv="refresh" content={`0; url=${url}`} />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <a href={url}>Redirecting…</a>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(url)});`,
        }}
      />
    </>
  );
}
```

**`pages/go/index.tsx`** — Operator-styled, lista `slug · label · url` em
tabela colapsando pra cards em mobile (mesmo pattern de `/writing`).

### Falhas conhecidas

- **Flash de redirect** em `/go/<slug>`: a página renderiza brevemente antes
  do JS substituir a URL. Mitigado por `<meta refresh>` que dispara imediato,
  mas em conexões lentas pode aparecer "Redirecting…". Aceitável pra
  encurtador pessoal.
- **GitHub Pages não respeita `next.config.js` redirects**: usamos
  meta-refresh client-side. Se algum dia mover pra Vercel, podemos trocar pra
  redirects nativos (301) num PR de follow-up.
- **i18n não cobre `next-seo` description em metatag automática**: cada
  página passa explicitamente `description={t('seo.description')}`.

## Plano de implementação (ordem)

Cada etapa é independentemente testável + commit-able.

1. **Refactor: extrair pages → components/pages** (sem mudança de comportamento)
   - Mover lógica de cada `pages/X.tsx` pra `components/pages/X.tsx`.
   - `pages/X.tsx` vira shell que delega.
   - Validação: `yarn type-check && yarn build && yarn start` — visual idêntico ao current.

2. **Setup i18n infra (locale fixo PT)**
   - `lib/i18n.ts` (Provider + useT).
   - `locales/pt.json` + `locales/en.json` (esquema completo, EN pode espelhar PT por enquanto).
   - `pages/_app.tsx` envolvendo `<Component>` em `<I18nProvider>`.
   - Validação: nada muda visualmente.

3. **Migrar copy hardcoded → `t()` em todas as pages**
   - Substituir strings literais por `t('key')`.
   - PT vai sendo populada à medida que migra.
   - EN: traduzir cada chave (mantendo voz Operator/terminal, não tradução literal robotizada).
   - Validação: `yarn build` + spot check visual + `yarn i18n:check` passa.

4. **Mirror routes `/en/*`**
   - Criar `pages/en/*.tsx` finos, cada um passa `locale="en"` pro page component.
   - Page components aceitam prop `locale` que sobrescreve detecção via URL.
   - Validação: `gdantas.com.br/en/about` carrega versão EN.

5. **LangSwitcher + browser-lang detection**
   - `components/Operator/LangSwitcher.tsx`.
   - Plugar em Header + topbar home + MobileMenuDrawer.
   - `useEffectOnce` em `_app.tsx` pra detection.
   - Validação: navegar entre PT/EN clicando; primeira visita com `navigator.language=en` redireciona; preferência persiste em localStorage.

6. **SEO bilíngue**
   - `NextSeo` com `languageAlternates` em cada page component.
   - `<html lang>` dinâmico no `_document.tsx`.
   - Validação: view-source mostra os link rel=alternate corretos pra cada URL.

7. **`scripts/i18n-check.ts` + plug no CI**
   - Walk recursivo em pt.json + en.json, compara estruturas de chaves.
   - `scripts/ci.sh` chama antes do `yarn build`.
   - `package.json`: `"i18n:check": "ts-node scripts/i18n-check.ts"`.
   - Validação: introduzir chave só em PT, rodar script → falha esperada.

8. **Encurtador as code**
   - `lib/shortcuts.ts`.
   - `data/shortcuts.yaml` com slugs iniciais (gh, li, medium, cal, deployou, 3dantas).
   - `pages/go/[slug].tsx`.
   - `pages/go/index.tsx`.
   - Validação: `yarn build` gera todas as rotas `/go/*`; cada uma redireciona
     no browser; slug inválido = 404.

9. **`AGENTS.md` — convenção bilíngue**
   - Bloco i18n.
   - Bloco shortcuts (como adicionar novo).

10. **Testes locais antes do PR**
    - `yarn type-check`
    - `yarn lint`
    - `yarn i18n:check`
    - `yarn build` — confirma todas as rotas geradas: 11 PT + 11 EN + 404 + error + N shortcuts + 1 `/go` index.
    - `yarn start` (prod) — navegar manualmente cada par PT/EN, switcher, browser-lang detection, todos os atalhos `/go/<slug>`, `/go` index.
    - Chrome DevTools mobile — confirmar drawer ainda funciona + switcher visível.
    - Lighthouse spot-check: home PT, home EN, /go — meta ≥95 a11y/seo/bp.

11. **Commit + push + PR + auto-merge** — única PR carregando tudo.

## Conventions

- **Translations style**: copy EN não é tradução literal. Mantém voz Operator
  (curta, terminal-flavored). Ex: `"hero.tagline.pt": "/ platform engineer"`
  → `"hero.tagline.en": "/ platform engineer"` (mesma palavra). Mas
  `"hero.bio.pt": "6+ anos fazendo plataforma..."` → `"hero.bio.en": "6+ years
  building developer platforms..."`.
- **Chaves**: dot-namespace por feature, não por página. Ex: `nav.about`,
  `hero.bio`, `doctrine.manifesto[0]`, `talks.section`.
- **YAML shortcuts**: slug em kebab-case, lowercase. URL absoluta (http/https)
  ou path interno (começa com `/`).
- **Branch**: `feat/i18n-shortener`.
- **PR title**: `feat: i18n PT/EN + encurtador as code (/go/<slug>)`.
