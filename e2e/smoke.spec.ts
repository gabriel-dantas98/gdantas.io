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
