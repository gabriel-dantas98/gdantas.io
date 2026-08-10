import { test, expect, type Page } from '@playwright/test';
import presentations from '../data/presentations.json';

const TALK_COUNT = presentations.length;

// Bloqueia PostHog em todos os testes — site dispara captura e em CI isso
// gera ruído + latência. Não afeta funcionalidade visível.
test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => window.localStorage.setItem('lang', 'pt'));
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
			const res = await page.goto(r.path, { waitUntil: 'domcontentloaded' });
			expect(res?.ok(), `${r.path} retornou status ${res?.status()}`).toBeTruthy();
			await expect(page.locator('body')).toContainText(r.expect);
		});
	}
});

test.describe('smoke · EN routes', () => {
	for (const r of EN_ROUTES) {
		test(`GET ${r.path} renderiza`, async ({ page }) => {
			const res = await page.goto(r.path, { waitUntil: 'domcontentloaded' });
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
		const hrefs = await page
			.locator('a[href*="linkedin.com/in/gabrieldantasg"]')
			.evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));
		expect(hrefs.length).toBeGreaterThanOrEqual(3);
		void ctaSection;
	});

	test('card mais recente leva para a página individual da talk', async ({ page }) => {
		await page.goto('/');
		// `.click()` aguarda o elemento ficar estável após hydration — evita
		// "Element is not attached to the DOM" quando o card re-monta.
		await page.locator('a[href="/talks/idp-hub-mcps"]').first().click();
		await expect(page).toHaveURL(/\/talks\/idp-hub-mcps$/);
	});

	test('homepage serve uma imagem social fallback válida', async ({ page }) => {
		await page.goto('/');
		const socialImage = '/og/default.png';
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`https://gdantas.com.br${socialImage}`,
		);
		const response = await page.request.get(socialImage);
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('image/png');
	});

	test('home EN mantém cards e listagem no mirror /en', async ({ page }) => {
		await page.goto('/en');
		await expect(page.locator('main a[href^="/en/talks/"]')).toHaveCount(TALK_COUNT);
		await expect(page.locator('main a[href="/en/talks"]')).toBeVisible();
	});
});

test.describe('golden flows · navegação', () => {
	test('home e /talks expõem exatamente as mesmas páginas individuais', async ({ page }) => {
		await page.goto('/');
		const homeTalks = await page
			.locator('main a[href^="/talks/"]')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')).sort());

		await page.goto('/talks');
		const talksIndex = await page
			.locator('main a[href^="/talks/"]')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')).sort());

		expect(homeTalks).toEqual(talksIndex);
		expect(homeTalks).toHaveLength(TALK_COUNT);
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

test.describe('golden flows · páginas individuais de talks', () => {
	const TALK_SLUG = 'idp-hub-mcps';

	test('página individual PT expõe conteúdo e SEO próprios', async ({ page }) => {
		await page.goto(`/talks/${TALK_SLUG}`);
		await expect(
			page.getByRole('heading', { name: /Transformando seu Developer Portal/i }),
		).toBeVisible();
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`https://gdantas.com.br/talks/${TALK_SLUG}`,
		);
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
			'content',
			'article',
		);
		const socialImage = `/og/talks/${TALK_SLUG}.png`;
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`https://gdantas.com.br${socialImage}`,
		);
		const imageResponse = await page.request.get(socialImage);
		expect(imageResponse.status()).toBe(200);
		expect(imageResponse.headers()['content-type']).toContain('image/png');
		expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain(
			'PresentationDigitalDocument',
		);
	});

	test('página individual EN tem canonical e alternates próprios', async ({ page }) => {
		const response = await page.goto(`/en/talks/${TALK_SLUG}`);
		expect(response?.ok()).toBeTruthy();
		await expect(
			page.getByRole('heading', { name: /Turning your Developer Portal/i }),
		).toBeVisible();
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`https://gdantas.com.br/en/talks/${TALK_SLUG}`,
		);
		await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute(
			'href',
			`https://gdantas.com.br/talks/${TALK_SLUG}`,
		);
		const socialImage = `/og/talks/${TALK_SLUG}-en.png`;
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			`https://gdantas.com.br${socialImage}`,
		);
		expect((await page.request.get(socialImage)).status()).toBe(200);
	});

	test('card da listagem navega para a página individual', async ({ page }) => {
		await page.goto('/talks');
		await waitForHydration(page);
		await page.locator(`a[href="/talks/${TALK_SLUG}"]`).click({ force: true });
		await expect(page).toHaveURL(new RegExp(`/talks/${TALK_SLUG}$`));
	});
});

test.describe('golden flows · /go shortener', () => {
	test('/go indexa atalhos com listagem', async ({ page }) => {
		const res = await page.goto('/go');
		expect(res?.ok()).toBeTruthy();
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
