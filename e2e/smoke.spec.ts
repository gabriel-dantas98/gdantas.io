import { test, expect, type Page } from '@playwright/test';

// Bloqueia PostHog em todos os testes — site dispara captura e em CI isso
// gera ruído + latência. Não afeta funcionalidade visível.
test.beforeEach(async ({ page }) => {
	await page.route('**/posthog.com/**', (route) => route.abort());
	await page.route('**/i.posthog.com/**', (route) => route.abort());
	await page.route('**/us.i.posthog.com/**', (route) => route.abort());
});

interface RouteCase {
	path: string;
	expect: RegExp;
}

const PT_ROUTES: RouteCase[] = [
	{ path: '/', expect: /platform engineer/i },
	{ path: '/about', expect: /(cat ~\/\.about|quem é o operador)/i },
	{ path: '/timeline', expect: /timeline|career|trajetória/i },
	{ path: '/doctrine', expect: /(doctrine|manifesto)/i },
	{ path: '/talks', expect: /ls ~\/talks/i },
	{ path: '/presentations', expect: /presentations|talks/i },
	{ path: '/presentation', expect: /introduce-gabriel/i },
	{ path: '/projects', expect: /projects/i },
	{ path: '/sidequests', expect: /sidequests/i },
	{ path: '/writing', expect: /writing/i },
	{ path: '/links', expect: /links/i },
	{ path: '/status', expect: /status/i },
];

const EN_ROUTES: RouteCase[] = PT_ROUTES.map((r) => ({
	path: r.path === '/' ? '/en' : `/en${r.path}`,
	expect: r.expect,
}));

test.describe('smoke · PT routes', () => {
	for (const r of PT_ROUTES) {
		test(`GET ${r.path} renderiza`, async ({ page }) => {
			const res = await page.goto(r.path);
			expect(res?.ok(), `${r.path} retornou status ${res?.status()}`).toBeTruthy();
			await expect(page.locator('body')).toContainText(r.expect);
		});
	}
});

test.describe('smoke · EN routes', () => {
	for (const r of EN_ROUTES) {
		test(`GET ${r.path} renderiza`, async ({ page }) => {
			const res = await page.goto(r.path);
			expect(res?.ok(), `${r.path} retornou status ${res?.status()}`).toBeTruthy();
		});
	}
});

test.describe('golden flows · home', () => {
	test('LangSwitcher na home troca de PT pra EN', async ({ page }) => {
		await page.goto('/');
		// Após o click, o botão vira disabled (estado ativo da nova lingua) e
		// o auto-retry do Playwright falha. Promise.all garante que a espera
		// pela navegação corre em paralelo com o click.
		// force:true ignora stability/disabled após click — o lib troca o
		// button pra disabled imediatamente quando muda de locale.
		await Promise.all([
			page.waitForURL(/\/en\/?$/),
			page
				.getByRole('button', { name: /Switch to English/i })
				.first()
				.click({ force: true, noWaitAfter: true }),
		]);
	});

	test('CTAs do ping --help apontam todos pro LinkedIn', async ({ page }) => {
		await page.goto('/');
		const ctaSection = page.locator('text=ping --help').first().locator('..').locator('..');
		const hrefs = await page.locator('a[href*="linkedin.com/in/gabrieldantasg"]').evaluateAll(
			(els) => els.map((el) => (el as HTMLAnchorElement).href),
		);
		expect(hrefs.length).toBeGreaterThanOrEqual(3);
		void ctaSection;
	});

	test('card de talk leva pra /presentations#<slug>', async ({ page }) => {
		await page.goto('/');
		// `.click()` aguarda o elemento ficar estável após hydration — evita
		// "Element is not attached to the DOM" quando o card re-monta.
		await page.locator('a[href="/presentations#backstage-tf"]').first().click();
		await expect(page).toHaveURL(/\/presentations#backstage-tf/);
		await expect(page.locator('#backstage-tf')).toBeVisible();
	});
});

test.describe('golden flows · navegação', () => {
	const SLUGS_HOME = [
		'idp-portals',
		'flaky-to-confident',
		'cursor-mcp-db',
		'incident-mcps',
		'rag-idp',
		'qa-idp',
		'backstage-tf',
		'idp-backstage',
	];

	test('todos os slugs do home existem como id em /presentations', async ({ page }) => {
		await page.goto('/presentations');
		for (const slug of SLUGS_HOME) {
			await expect(page.locator(`#${slug}`), `slug #${slug} ausente`).toHaveCount(1);
		}
	});

	test('Header em /about tem link de volta pra home', async ({ page }) => {
		await page.goto('/about');
		const homeLink = page.locator('header a[href="/"]').first();
		await expect(homeLink).toBeVisible();
	});

	test('drawer mobile inclui home', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'mobile only');
		await page.goto('/about');
		await page.getByLabel(/abrir menu|open menu/i).click();
		await expect(page.getByRole('dialog').getByRole('link', { name: /home/i })).toBeVisible();
	});
});

test.describe('golden flows · /go shortener', () => {
	test('/go indexa atalhos com listagem', async ({ page }) => {
		const res = await page.goto('/go');
		expect(res?.ok()).toBeTruthy();
	});
});

interface SemanticRouteCase {
	path: string;
	lang: 'pt' | 'en';
	title: string;
	description: string;
	canonical: string;
	alternates: Record<'pt-BR' | 'en' | 'x-default', string>;
}

const SITE_URL = 'https://gdantas.com.br';

const SEMANTIC_ROUTES: SemanticRouteCase[] = [
	{
		path: '/',
		lang: 'pt',
		title: 'gdantas — platform engineer · devex',
		description:
			'Gabriel Dantas — platform engineering e developer experience. Internal Developer Portals, Backstage, Kubernetes, AI ops, observabilidade e RAG sobre infra.',
		canonical: SITE_URL,
		alternates: { 'pt-BR': SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
	},
	{
		path: '/en',
		lang: 'en',
		title: 'gdantas — platform engineer · devex',
		description:
			'Gabriel Dantas — platform engineering and developer experience. Internal Developer Portals, Backstage, Kubernetes, AI ops, observability and RAG over infrastructure.',
		canonical: `${SITE_URL}/en`,
		alternates: { 'pt-BR': SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
	},
	...[
		{
			path: '/about',
			title: 'gdantas ─ cat ~/.about',
			ptDescription: 'Quem é o operador. SRE, plataforma, Backstage, AI ops.',
			enDescription: 'Meet the operator: SRE, platform engineering, Backstage and AI ops.',
		},
		{
			path: '/timeline',
			title: 'gdantas ─ git log --career',
			ptDescription: 'Commits da carreira — empresas, papéis e marcos.',
			enDescription: 'Career commits — companies, roles and milestones.',
		},
		{
			path: '/doctrine',
			title: 'gdantas ─ cat ~/.doctrine',
			ptDescription: 'Princípios e papéis de operação. So others may live.',
			enDescription: 'Principles and operating roles. So others may live.',
		},
		{
			path: '/talks',
			title: 'gdantas ─ ls ~/talks',
			ptDescription: 'Talks, podcasts e slides — engenharia de plataforma, Backstage, AI ops.',
			enDescription: 'Talks, podcasts and slides — platform engineering, Backstage and AI ops.',
		},
		{
			path: '/presentations',
			title: 'gdantas ─ presentations',
			ptDescription: 'Apresentações com preview embeddado — slides, vídeos, podcasts.',
			enDescription: 'Presentations with embedded previews — slides, videos and podcasts.',
		},
		{
			path: '/presentation',
			ptTitle: '$ ./introduce-gabriel — apresentação',
			enTitle: '$ ./introduce-gabriel — presentation',
			ptDescription:
				'Uma apresentação animada de quem é Gabriel Dantas, em sequência de cenas estilo pipeline.',
			enDescription:
				'An animated presentation of who Gabriel Dantas is, as a sequence of pipeline-style scenes.',
		},
		{
			path: '/projects',
			title: 'gdantas ─ kubectl get projects',
			ptDescription: 'Repositórios e experimentos públicos — plataforma, AI ops, side-projects.',
			enDescription:
				'Public repositories and experiments — platform engineering, AI ops and side projects.',
		},
		{
			path: '/sidequests',
			title: 'gdantas ─ ls ~/.sidequests',
			ptDescription:
				'Projetos paralelos e hobbies do Gabriel — impressão 3D (3Dantas), trabalho voluntário (Novarum) e loja de camisetas tech (DeployOu).',
			enDescription:
				"Gabriel's side projects and hobbies — 3D printing (3Dantas), volunteer work (Novarum) and a tech t-shirt shop (DeployOu).",
		},
		{
			path: '/writing',
			title: 'gdantas ─ tail -f ~/.writing',
			ptDescription:
				'Notas e posts publicados no medium/@_gdantas. AI ops, plataforma, observabilidade.',
			enDescription:
				'Notes and posts published at medium/@_gdantas. AI ops, platform engineering and observability.',
		},
		{
			path: '/links',
			title: 'gdantas ─ ls ~/.links',
			ptDescription: 'Linktree: talks, GitHub, LinkedIn, Medium, projetos do Gabriel Dantas.',
			enDescription: 'Linktree: talks, GitHub, LinkedIn, Medium and Gabriel Dantas projects.',
		},
		{
			path: '/status',
			title: 'gdantas ─ systemctl status',
			ptDescription: 'Status do operador — Lanyard / Discord presence.',
			enDescription: 'Operator status — Lanyard / Discord presence.',
		},
	].flatMap((route) => {
		const ptCanonical = `${SITE_URL}${route.path}`;
		const enCanonical = `${SITE_URL}/en${route.path}`;
		const alternates = {
			'pt-BR': ptCanonical,
			en: enCanonical,
			'x-default': ptCanonical,
		};
		return [
			{
				path: route.path,
				lang: 'pt' as const,
				title: route.ptTitle || route.title || '',
				description: route.ptDescription,
				canonical: ptCanonical,
				alternates,
			},
			{
				path: `/en${route.path}`,
				lang: 'en' as const,
				title: route.enTitle || route.title || '',
				description: route.enDescription,
				canonical: enCanonical,
				alternates,
			},
		];
	}),
];

test.describe('semantic contract · indexable routes', () => {
	for (const route of SEMANTIC_ROUTES) {
		test(`${route.path} exposes one localized semantic identity`, async ({ page }) => {
			await page.addInitScript((lang) => window.localStorage.setItem('lang', lang), route.lang);
			const requestPath = `${route.path}?utm_source=semantic-contract#metadata`;
			await page.goto(requestPath);

			await expect(page.locator('html')).toHaveAttribute('lang', route.lang);
			await expect(page.locator('h1')).toHaveCount(1);
			await expect(page.locator('h1')).toBeVisible();
			await expect(page).toHaveTitle(route.title);
			await expect(page.locator('meta[name="description"]')).toHaveAttribute(
				'content',
				route.description,
			);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
				'href',
				route.canonical,
			);

			for (const [hrefLang, href] of Object.entries(route.alternates)) {
				await expect(page.locator(`link[rel="alternate"][hreflang="${hrefLang}"]`))
					.toHaveCount(1);
				await expect(page.locator(`link[rel="alternate"][hreflang="${hrefLang}"]`))
					.toHaveAttribute('href', href);
			}
		});
	}
});

type CollectionFidelity =
	| { kind: 'talk-fragments' }
	| { kind: 'article-destinations' }
	| { kind: 'link-destinations'; selector: string };

const STRUCTURED_DATA_ROUTES: Array<{
	path: string;
	types: string[];
	fidelity?: CollectionFidelity;
}> = [
	{ path: '/', types: ['Person', 'WebSite'] },
	{ path: '/en', types: ['Person', 'WebSite'] },
	{ path: '/about', types: ['ProfilePage'] },
	{ path: '/en/about', types: ['ProfilePage'] },
	{ path: '/talks', types: ['CollectionPage'], fidelity: { kind: 'talk-fragments' } },
	{ path: '/en/talks', types: ['CollectionPage'], fidelity: { kind: 'talk-fragments' } },
	{
		path: '/presentations',
		types: ['CollectionPage'],
		fidelity: { kind: 'article-destinations' },
	},
	{
		path: '/en/presentations',
		types: ['CollectionPage'],
		fidelity: { kind: 'article-destinations' },
	},
	{
		path: '/projects',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-pod' },
	},
	{
		path: '/en/projects',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-pod' },
	},
	{
		path: '/writing',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-writing-row' },
	},
	{
		path: '/en/writing',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-writing-row' },
	},
	{
		path: '/links',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-link-tile' },
	},
	{
		path: '/en/links',
		types: ['CollectionPage'],
		fidelity: { kind: 'link-destinations', selector: '.op-link-tile' },
	},
];

async function renderedCollectionUrls(
	page: Page,
	path: string,
	fidelity: CollectionFidelity,
): Promise<string[]> {
	if (fidelity.kind === 'link-destinations') {
		const hrefs = await page.locator(fidelity.selector).evaluateAll((elements) =>
			elements.map((element) => element.getAttribute('href')).filter(Boolean) as string[],
		);
		return hrefs.map((href) => new URL(href, SITE_URL).href);
	}

	if (fidelity.kind === 'article-destinations') {
		const destinations = await page.locator('article[id]').evaluateAll((articles) =>
			articles.map((article) => ({
				href: article.querySelector('header a[href]')?.getAttribute('href') || null,
				id: article.id,
			})),
		);
		return destinations.map(({ href, id }) =>
			href ? new URL(href, SITE_URL).href : `${SITE_URL}${path}#${id}`,
		);
	}

	const presentationsPath = path.startsWith('/en/') ? '/en/presentations' : '/presentations';
	await page.goto(presentationsPath);
	const ids = await page.locator('article[id]').evaluateAll((articles) =>
		articles.map((article) => article.id),
	);
	return ids.map((id) => `${SITE_URL}${presentationsPath}#${id}`);
}

test.describe('semantic contract · structured data', () => {
	for (const route of STRUCTURED_DATA_ROUTES) {
		test(`${route.path} emits valid factual JSON-LD`, async ({ page }) => {
			const lang = route.path === '/en' || route.path.startsWith('/en/') ? 'en' : 'pt';
			await page.addInitScript((locale) => window.localStorage.setItem('lang', locale), lang);
			await page.goto(route.path);
			const rawSchemas = await page
				.locator('script[type="application/ld+json"]')
				.allTextContents();
			const schemas = rawSchemas.map((raw) => JSON.parse(raw));
			expect(schemas.map((schema) => schema['@type'])).toEqual(route.types);

			for (const schema of schemas.filter((item) => item['@type'] === 'CollectionPage')) {
				expect(schema.mainEntity?.['@type']).toBe('ItemList');
				expect(Array.isArray(schema.mainEntity?.itemListElement)).toBeTruthy();
				const itemUrls = schema.mainEntity.itemListElement.map((item: any) => item.url);
				for (const item of schema.mainEntity.itemListElement) {
					expect(item.name).toEqual(expect.any(String));
					expect(item.url).toEqual(expect.any(String));
				}
				if (route.fidelity) {
					const renderedUrls = await renderedCollectionUrls(page, route.path, route.fidelity);
					expect(itemUrls).toEqual(renderedUrls);
					expect(new Set(itemUrls).size).toBe(itemUrls.length);
				}
			}
		});
	}
});

test.describe('semantic contract · non-indexable utilities', () => {
	test('/go is noindex and advertises no nonexistent locale mirror', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('lang', 'pt'));
		await page.goto('/go');

		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
		await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
	});
});

async function waitForHydration(page: Page) {
	await page.waitForLoadState('domcontentloaded');
	await page.waitForFunction(() => document.readyState === 'complete');
}

test.describe('no-console-errors', () => {
	test('home não joga erros no console', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});
		await page.goto('/');
		await waitForHydration(page);
		// Filtra ruído de extensão / favicon
		const fatal = errors.filter(
			(e) => !/favicon|posthog|extension/i.test(e) && !/Failed to load resource/.test(e),
		);
		expect(fatal, fatal.join('\n')).toEqual([]);
	});
});
