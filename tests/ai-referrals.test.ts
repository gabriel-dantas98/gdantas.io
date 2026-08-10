import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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

test('the app captures the privacy-safe event once in its initial-load effect', () => {
	const appSource = readFileSync(new URL('../pages/_app.tsx', import.meta.url), 'utf8');
	const posthogInit = appSource.indexOf('posthog.init(');
	const referralBuilder = appSource.indexOf('buildAiReferralEvent({');
	const referralCapture = appSource.indexOf("posthog.capture('ai_referral_landed', aiReferral)");

	assert.equal(appSource.match(/useEffectOnce\(\(\) => \{/g)?.length, 1);
	assert.ok(posthogInit > -1);
	assert.ok(referralBuilder > posthogInit);
	assert.ok(referralCapture > referralBuilder);
	assert.equal(appSource.match(/posthog\.capture\('ai_referral_landed'/g)?.length, 1);
});
