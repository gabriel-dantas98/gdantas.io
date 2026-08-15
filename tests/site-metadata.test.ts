import assert from 'node:assert/strict';
import test from 'node:test';

import { SITE_URL, alternateUrls, canonicalUrl } from '../lib/site-metadata';

test('canonicalUrl emits the canonical root URL', () => {
	assert.equal(SITE_URL, 'https://gdantas.com.br');
	assert.equal(canonicalUrl('/'), 'https://gdantas.com.br');
});

test('canonicalUrl removes query strings and fragments', () => {
	assert.equal(canonicalUrl('/about?utm_source=x#bio'), 'https://gdantas.com.br/about');
});

test('canonicalUrl preserves the English mirror and removes trailing slashes', () => {
	assert.equal(canonicalUrl('/en/about/'), 'https://gdantas.com.br/en/about');
});

test('canonicalUrl rejects absolute URLs', () => {
	assert.throws(() => canonicalUrl('https://other.example/about'), /relative path/i);
});

test('alternateUrls always pair a route with its PT and EN mirrors', () => {
	assert.deepEqual(alternateUrls('/about?utm_source=x#bio'), [
		{ hrefLang: 'pt-BR', href: 'https://gdantas.com.br/about' },
		{ hrefLang: 'en', href: 'https://gdantas.com.br/en/about' },
		{ hrefLang: 'x-default', href: 'https://gdantas.com.br/about' },
	]);
});

test('alternateUrls treats an English route as the same route pair', () => {
	assert.deepEqual(alternateUrls('/en/about/'), [
		{ hrefLang: 'pt-BR', href: 'https://gdantas.com.br/about' },
		{ hrefLang: 'en', href: 'https://gdantas.com.br/en/about' },
		{ hrefLang: 'x-default', href: 'https://gdantas.com.br/about' },
	]);
});
