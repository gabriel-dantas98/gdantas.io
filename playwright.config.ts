import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT) || 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	timeout: 30_000,
	expect: { timeout: 7_500 },
	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		actionTimeout: 7_500,
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				launchOptions: {
					// Algumas libs (pdf/youtube/spotify embed) referenciam
					// SharedArrayBuffer sem checar typeof. Chromium bloqueia SAB
					// sem COOP/COEP cross-origin-isolation. Habilita pra teste.
					args: ['--enable-features=SharedArrayBuffer'],
				},
			},
		},
		{
			name: 'mobile-chromium',
			use: {
				...devices['Pixel 7'],
				launchOptions: { args: ['--enable-features=SharedArrayBuffer'] },
			},
		},
	],
	webServer: {
		command: `yarn serve out -l ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
		stdout: 'ignore',
		stderr: 'pipe',
	},
});
