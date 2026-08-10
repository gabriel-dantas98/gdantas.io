import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import React, { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { AppProps } from 'next/app';

import { buildAiReferralEvent, classifyAiReferral, inferContentType } from '../lib/ai-referrals';

test('classifyAiReferral recognizes AI referrer hostnames at hostname boundaries', () => {
	assert.equal(classifyAiReferral('https://chatgpt.com/share/abc'), 'chatgpt');
	assert.equal(classifyAiReferral('https://chat.openai.com/c/example'), 'openai');
	assert.equal(classifyAiReferral('https://www.perplexity.ai/search?q=platform'), 'perplexity');
	assert.equal(classifyAiReferral('https://claude.ai/new'), 'claude');
	assert.equal(classifyAiReferral('https://copilot.microsoft.com/chats'), 'copilot');
	assert.equal(classifyAiReferral('https://gemini.google.com/app'), 'gemini');
	assert.equal(classifyAiReferral('https://bard.google.com/chat'), 'gemini');
	assert.equal(classifyAiReferral('https://chat.mistral.ai/chat'), 'mistral');
});

test('classifyAiReferral rejects internal, ordinary, invalid, and lookalike URLs', () => {
	assert.equal(classifyAiReferral('https://gdantas.com.br/about'), null);
	assert.equal(classifyAiReferral('https://www.google.com/search?q=gdantas'), null);
	assert.equal(classifyAiReferral('not a URL'), null);
	assert.equal(classifyAiReferral('https://notchatgpt.com/share'), null);
	assert.equal(classifyAiReferral('https://example.com/?source=claude.ai'), null);
});

test('inferContentType classifies locale-prefixed and root content paths', () => {
	assert.equal(inferContentType('/'), 'home');
	assert.equal(inferContentType('/en'), 'home');
	assert.equal(inferContentType('/about'), 'about');
	assert.equal(inferContentType('/en/talks/incident-agents'), 'talks');
	assert.equal(inferContentType('/writing/hello-world'), 'writing');
	assert.equal(inferContentType('/en/projects/portfolio'), 'projects');
	assert.equal(inferContentType('/doctrine'), 'other');
});

test('buildAiReferralEvent emits a privacy-safe landing event for an AI referral', () => {
	const event = buildAiReferralEvent({
		referrer: 'https://www.perplexity.ai/search?q=Gabriel+Dantas#answer',
		path: '/en/talks/?utm_source=perplexity#top',
	});

	assert.deepEqual(event, {
		ai_source: 'perplexity',
		landing_path: '/en/talks',
		locale: 'en',
		content_type: 'talks',
	});
	assert.deepEqual(Object.keys(event || {}).sort(), [
		'ai_source',
		'content_type',
		'landing_path',
		'locale',
	]);
});

test('buildAiReferralEvent ignores empty, internal, and non-AI referrers', () => {
	assert.equal(buildAiReferralEvent({ referrer: '', path: '/about' }), null);
	assert.equal(
		buildAiReferralEvent({ referrer: 'https://gdantas.com.br/en', path: '/about' }),
		null,
	);
	assert.equal(
		buildAiReferralEvent({ referrer: 'https://www.google.com', path: '/about' }),
		null,
	);
});

test('StrictMode remount captures the AI referral only once per document', async () => {
	const require = createRequire(import.meta.url);
	const originalCssLoader = require.extensions['.css'];
	require.extensions['.css'] = () => undefined;
	const { JSDOM } = require('jsdom');
	const dom = new JSDOM('<div id="root"></div>', {
		url: 'https://gdantas.com.br/en/talks?utm_source=ignored',
		referrer: 'https://www.perplexity.ai/search?q=private-query',
	});
	const globals = [
		'window',
		'document',
		'navigator',
		'localStorage',
		'location',
		'self',
		'React',
		'HTMLElement',
		'Node',
	].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
	const actEnvironment = Object.getOwnPropertyDescriptor(globalThis, 'IS_REACT_ACT_ENVIRONMENT');

	Object.defineProperties(globalThis, {
		window: { configurable: true, value: dom.window },
		document: { configurable: true, value: dom.window.document },
		navigator: { configurable: true, value: dom.window.navigator },
		localStorage: { configurable: true, value: dom.window.localStorage },
		location: { configurable: true, value: dom.window.location },
		self: { configurable: true, value: dom.window },
		React: { configurable: true, value: React },
		HTMLElement: { configurable: true, value: dom.window.HTMLElement },
		Node: { configurable: true, value: dom.window.Node },
		IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
	});
	dom.window.localStorage.setItem('lang', 'en');
	Object.defineProperty(dom.window, 'matchMedia', {
		configurable: true,
		value: () => ({
			addEventListener() {},
			addListener() {},
			matches: false,
			removeEventListener() {},
			removeListener() {},
		}),
	});

	const posthog = require('posthog-js').default;
	const NodeModule = require('node:module');
	const originalResolveFilename = NodeModule._resolveFilename;
	NodeModule._resolveFilename = (request: string, ...args: unknown[]) =>
		request === 'windi.css'
			? require.resolve('inter-ui/inter.css')
			: originalResolveFilename.call(NodeModule, request, ...args);
	const googleFontsPath = require.resolve('next/font/google');
	const originalGoogleFonts = require.cache[googleFontsPath];
	require.cache[googleFontsPath] = {
		exports: {
			IBM_Plex_Mono: () => ({ variable: '--font-mono' }),
			IBM_Plex_Sans: () => ({ variable: '--font-sans' }),
		},
	} as NodeModule;
	const gsapLoaderPath = require.resolve('../lib/gsap-loader');
	const fontsPath = require.resolve('../lib/fonts');
	const appPath = require.resolve('../pages/_app');
	const originalGsapLoader = require.cache[gsapLoaderPath];
	require.cache[gsapLoaderPath] = {
		exports: { ensureGsap: () => undefined },
	} as NodeModule;
	const originalInit = posthog.init;
	const originalCapture = posthog.capture;
	const calls: string[] = [];
	const captures: Array<{ event: string; properties: unknown }> = [];
	posthog.init = () => {
		calls.push('init');
		return posthog;
	};
	posthog.capture = (event: string, properties: unknown) => {
		calls.push(event);
		captures.push({ event, properties });
	};

	try {
		const { RouterContext } = require('next/dist/shared/lib/router-context.shared-runtime');
		const { default: App } = await import('../pages/_app');
		const events = { off() {}, on() {}, emit() {} };
		const router = {
			asPath: '/en/talks?utm_source=ignored',
			basePath: '',
			beforePopState() {},
			events,
			isFallback: false,
			isLocaleDomain: false,
			isPreview: false,
			isReady: true,
			pathname: '/en/talks',
			prefetch: async () => undefined,
			push: async () => true,
			query: {},
			reload() {},
			replace: async () => true,
			route: '/en/talks',
		};
		const root = createRoot(dom.window.document.getElementById('root')!);

		await act(async () => {
			root.render(
				React.createElement(
					StrictMode,
					null,
					React.createElement(
						RouterContext.Provider,
						{ value: router },
						React.createElement(App, {
							Component: () => null,
							pageProps: {},
							router: router as unknown as AppProps['router'],
						}),
					),
				),
			);
		});
		await act(async () => root.unmount());

		assert.deepEqual(calls, ['init', 'ai_referral_landed', 'init']);
		assert.deepEqual(captures, [
			{
				event: 'ai_referral_landed',
				properties: {
					ai_source: 'perplexity',
					content_type: 'talks',
					landing_path: '/en/talks',
					locale: 'en',
				},
			},
		]);
	} finally {
		NodeModule._resolveFilename = originalResolveFilename;
		if (originalCssLoader) require.extensions['.css'] = originalCssLoader;
		else delete require.extensions['.css'];
		if (originalGoogleFonts) require.cache[googleFontsPath] = originalGoogleFonts;
		else delete require.cache[googleFontsPath];
		if (originalGsapLoader) require.cache[gsapLoaderPath] = originalGsapLoader;
		else delete require.cache[gsapLoaderPath];
		delete require.cache[fontsPath];
		delete require.cache[appPath];
		posthog.init = originalInit;
		posthog.capture = originalCapture;
		dom.window.close();
		for (const [name, descriptor] of globals) {
			if (descriptor) Object.defineProperty(globalThis, name, descriptor);
			else Reflect.deleteProperty(globalThis, name);
		}
		if (actEnvironment)
			Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', actEnvironment);
		else Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
	}
});
