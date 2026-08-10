# Talk Pages SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar uma página estática, indexável e compartilhável para cada talk em PT e EN.

**Architecture:** `data/presentations.json` permanece como fonte única. Uma camada server-only valida os slugs e normaliza apresentações; shells dinâmicos do Pages Router geram `/talks/[slug]` e `/en/talks/[slug]`, enquanto um componente compartilhado renderiza conteúdo, metadata, JSON-LD e analytics.

**Tech Stack:** Next.js 13.5 Pages Router, React 18, TypeScript, next-seo, next-mdx-remote, PostHog, Playwright, static export.

## Global Constraints

- Manter Next.js Pages Router e compatibilidade com static export para GitHub Pages.
- Não usar `getServerSideProps`.
- Toda copy nova deve existir em `locales/pt.json` e `locales/en.json`.
- Preservar nomes de eventos PostHog existentes; propriedades novas usam snake_case e não contêm PII.
- Reutilizar tokens `OP` de `~/components/Operator`.
- Antes de concluir, rodar `yarn type-check && yarn i18n:check && yarn build` e validar o export.

---

### Task 1: Especificar rotas e SEO em testes end-to-end

**Files:**
- Modify: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: servidor estático configurado em `playwright.config.ts`.
- Produces: regressões executáveis para `/talks/idp-hub-mcps`, `/en/talks/idp-hub-mcps`, navegação do card e metadata.

- [ ] **Step 1: Escrever testes que expressem o comportamento ausente**

Adicionar casos que:

```ts
const TALK_SLUG = 'idp-hub-mcps';

test('página individual PT expõe conteúdo e SEO próprios', async ({ page }) => {
	await page.goto(`/talks/${TALK_SLUG}`);
	await expect(page.getByRole('heading', { name: /Transformando seu Developer Portal/i })).toBeVisible();
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://gdantas.com.br/talks/${TALK_SLUG}`,
	);
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
	await expect(page.locator('script[type="application/ld+json"]')).toContainText(
		'PresentationDigitalDocument',
	);
});

test('página individual EN tem canonical e alternates próprios', async ({ page }) => {
	await page.goto(`/en/talks/${TALK_SLUG}`);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://gdantas.com.br/en/talks/${TALK_SLUG}`,
	);
	await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute(
		'href',
		`https://gdantas.com.br/talks/${TALK_SLUG}`,
	);
});

test('card da listagem navega para a página individual', async ({ page }) => {
	await page.goto('/talks');
	await page.locator(`a[href="/talks/${TALK_SLUG}"]`).click();
	await expect(page).toHaveURL(new RegExp(`/talks/${TALK_SLUG}$`));
});
```

- [ ] **Step 2: Rodar os testes e confirmar RED**

Run: `yarn build && yarn playwright test e2e/smoke.spec.ts --project=chromium --grep "página individual|card da listagem"`

Expected: FAIL porque as rotas individuais e os links ainda não existem.

- [ ] **Step 3: Commit do teste vermelho junto da implementação do Task 2**

Não criar commit isolado quebrado; manter o teste unstaged até a rota mínima ficar verde.

---

### Task 2: Criar camada estática validada e rotas bilíngues

**Files:**
- Modify: `lib/presentations-static-props.ts`
- Create: `lib/talk-static-props.ts`
- Create: `pages/talks/[slug].tsx`
- Create: `pages/en/talks/[slug].tsx`
- Test: `e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `loadPresentations(): Promise<PresentationItem[]>`.
- Produces: `getTalkStaticPaths: GetStaticPaths<{ slug: string }>`.
- Produces: `getTalkStaticProps: GetStaticProps<TalkPageProps, { slug: string }>`.
- Consumes: `PresentationItem` e `data/presentations.json`.

- [ ] **Step 1: Extrair o carregamento reutilizável de apresentações**

Em `lib/presentations-static-props.ts`, mover o corpo atual para:

```ts
export async function loadPresentations(): Promise<PresentationItem[]> {
	// valida todos os slugs antes de normalizar previews
	// mantém a serialização MDX e as inferências existentes
}

export const getStaticProps: GetStaticProps<PresentationsProps> = async () => ({
	props: { presentations: await loadPresentations() },
});
```

Validar que cada item possui slug não vazio e que `new Set(slugs).size === slugs.length`; lançar erro contendo o slug duplicado ou o título sem slug.

- [ ] **Step 2: Criar os helpers da rota individual**

Em `lib/talk-static-props.ts`:

```ts
export interface TalkPageProps {
	presentation: PresentationItem;
}

export const getTalkStaticPaths: GetStaticPaths<{ slug: string }> = async () => ({
	paths: (await loadPresentations()).map((item) => ({ params: { slug: item.slug! } })),
	fallback: false,
});

export const getTalkStaticProps: GetStaticProps<TalkPageProps, { slug: string }> = async ({ params }) => {
	const presentation = (await loadPresentations()).find((item) => item.slug === params?.slug);
	return presentation ? { props: { presentation } } : { notFound: true };
};
```

- [ ] **Step 3: Criar shells PT e EN**

Os dois shells exportam `getStaticPaths` e `getTalkStaticProps as getStaticProps`, e renderizam `TalkPage` com `locale="pt"` ou `locale="en"`.

- [ ] **Step 4: Rodar type-check para validar as interfaces**

Run: `yarn type-check`

Expected: PASS sem erros TypeScript.

---

### Task 3: Renderizar página, SEO, navegação e analytics

**Files:**
- Create: `components/Operator/PresentationPreview.tsx`
- Modify: `components/Operator/index.tsx`
- Modify: `components/pages/PresentationsPage.tsx`
- Create: `components/pages/TalkPage.tsx`
- Modify: `components/pages/TalksPage.tsx`
- Modify: `components/Operator/Layout.tsx`
- Modify: `locales/pt.json`
- Modify: `locales/en.json`
- Test: `e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `PresentationPreview({ presentation }: { presentation: PresentationItem })`.
- Extends: `OperatorPageProps` com `openGraphType?: 'website' | 'article'` e `jsonLd?: Record<string, unknown>`.
- Consumes: `TalkPageProps`, `I18nProvider`, `useT`, `posthog.capture`.

- [ ] **Step 1: Extrair o renderer de preview existente**

Mover `TalkPreview` de `PresentationsPage.tsx` para `components/Operator/PresentationPreview.tsx`, renomeá-lo para `PresentationPreview`, exportá-lo no barrel e reutilizá-lo na página de apresentações sem mudar comportamento.

- [ ] **Step 2: Permitir SEO específico no layout**

Adicionar `openGraphType` e `jsonLd` a `OperatorPage`. Passar `openGraphType ?? 'website'` ao `NextSeo` e, quando `jsonLd` existir, renderizar:

```tsx
<Head>
	<script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
	/>
</Head>
```

- [ ] **Step 3: Adicionar copies bilíngues**

Adicionar as mesmas chaves estruturais sob `talks.detail`:

```json
// pt.json
{
	"back": "← todas as talks",
	"open": "abrir conteúdo ↗",
	"source": "./src ↗",
	"previewUnavailable": "preview indisponível"
}
```

```json
// en.json
{
	"back": "← all talks",
	"open": "open content ↗",
	"source": "./src ↗",
	"previewUnavailable": "preview unavailable"
}
```

- [ ] **Step 4: Implementar `TalkPage`**

Renderizar `OperatorPage` com:

- title `${presentation.title} ─ gdantas`;
- description `presentation.description`;
- `openGraphType="article"`;
- JSON-LD `PresentationDigitalDocument` com `name`, `description`, `datePublished`, `contentUrl` e URL canônica;
- breadcrumb para `/talks`;
- tipo, data, local, título, descrição, CTAs e `PresentationPreview`;
- eventos `presentation_played` e `presentation_src_opened` com `title`, `talk_slug` e `preview_type`.

- [ ] **Step 5: Transformar cards em links individuais**

Incluir `slug` em `RawPresentation` e `TalkItem`, trocar o `<button>` por `<Link href={withLocale(`/talks/${tk.slug}`, locale)}>` e preservar `talk_clicked` com `talk_title`, `talk_type` e `talk_slug`.

- [ ] **Step 6: Rodar i18n e testes focados para confirmar GREEN**

Run: `yarn i18n:check`

Expected: PASS com estruturas PT/EN idênticas.

Run: `yarn build && yarn playwright test e2e/smoke.spec.ts --project=chromium --grep "página individual|card da listagem"`

Expected: todos os novos testes PASS.

- [ ] **Step 7: Commit funcional**

```bash
git add e2e/smoke.spec.ts lib/presentations-static-props.ts lib/talk-static-props.ts pages/talks/[slug].tsx pages/en/talks/[slug].tsx components/Operator/PresentationPreview.tsx components/Operator/index.tsx components/Operator/Layout.tsx components/pages/PresentationsPage.tsx components/pages/TalkPage.tsx components/pages/TalksPage.tsx locales/pt.json locales/en.json
git commit -m "feat(talks): cria páginas próprias para compartilhar cada talk"
```

---

### Task 4: Verificação completa e evidências visuais

**Files:**
- Create: `output/playwright/talk-idp-hub-mcps-desktop.png`
- Create: `output/playwright/talk-idp-hub-mcps-mobile.png`
- Verify: `out/talks/idp-hub-mcps/index.html`
- Verify: `out/en/talks/idp-hub-mcps/index.html`

**Interfaces:**
- Consumes: export estático gerado e Playwright CLI.
- Produces: evidências reproduzíveis da URL direta, layout responsivo e metadata no HTML.

- [ ] **Step 1: Rodar os gates completos**

Run: `yarn type-check && yarn i18n:check && yarn build && yarn export`

Expected: exit 0 em todos os comandos, com as duas rotas dinâmicas presentes no relatório do Next.js.

- [ ] **Step 2: Rodar a suíte end-to-end**

Run: `yarn e2e`

Expected: todos os projetos Chromium desktop e mobile PASS.

- [ ] **Step 3: Verificar metadata no HTML exportado**

Run: `rg -n "canonical|og:type|PresentationDigitalDocument|hreflang" out/talks/idp-hub-mcps/index.html out/en/talks/idp-hub-mcps/index.html`

Expected: canonical específico, `og:type=article`, JSON-LD e alternates PT/EN nos dois arquivos.

- [ ] **Step 4: Capturar screenshot desktop com Playwright CLI**

Confirmar `npx`, iniciar `yarn serve out -l 4173`, abrir `http://127.0.0.1:4173/talks/idp-hub-mcps`, obter snapshot e salvar screenshot full-page em `output/playwright/talk-idp-hub-mcps-desktop.png`.

- [ ] **Step 5: Capturar screenshot mobile**

Reabrir a mesma URL com viewport equivalente a Pixel 7 e salvar screenshot full-page em `output/playwright/talk-idp-hub-mcps-mobile.png`.

- [ ] **Step 6: Revisar diff e artefatos**

Run: `git diff --check && git status --short`

Expected: nenhum erro de whitespace; screenshots aparecem apenas em `output/playwright/` e mudanças de código estão limitadas ao escopo aprovado.
