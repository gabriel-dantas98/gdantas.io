import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { auditExport } from '../scripts/ai-readiness-check';

const VALID_FIXTURE = path.join(process.cwd(), 'tests', 'fixtures', 'ai-readiness', 'valid');
const TEMPORARY_FIXTURES: string[] = [];

function copyFixture(): string {
	const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-readiness-'));
	fs.cpSync(VALID_FIXTURE, outDir, { recursive: true });
	TEMPORARY_FIXTURES.push(outDir);
	return outDir;
}

process.once('exit', () => {
	for (const outDir of TEMPORARY_FIXTURES) fs.rmSync(outDir, { recursive: true, force: true });
});

function replace(outDir: string, relativePath: string, from: string | RegExp, to: string): void {
	const filePath = path.join(outDir, relativePath);
	const before = fs.readFileSync(filePath, 'utf8');
	const after = before.replace(from, to);
	assert.notEqual(after, before, `mutation did not change ${relativePath}`);
	fs.writeFileSync(filePath, after);
}

function assertOnlyFailure(outDir: string, expectedId: string, evidence: RegExp): void {
	const result = auditExport(outDir);
	const failures = result.checks.filter((check) => check.status === 'fail');

	assert.equal(result.ok, false);
	assert.deepEqual(
		failures.map((check) => check.id),
		[expectedId],
		failures.flatMap((check) => check.evidence).join('\n'),
	);
	assert.match(failures[0].evidence.join('\n'), evidence);
}

test('a complete static export fixture passes every readiness check', () => {
	const result = auditExport(VALID_FIXTURE);

	assert.equal(result.ok, true, result.checks.flatMap((check) => check.evidence).join('\n'));
	assert.ok(result.checks.length >= 10);
	assert.ok(result.checks.every((check) => check.status === 'pass'));
});

test('fails a sitemap route with zero h1 elements', () => {
	const outDir = copyFixture();
	replace(outDir, 'index.html', '<h1>Gabriel Dantas</h1>', '<p>Gabriel Dantas</p>');
	assertOnlyFailure(outDir, 'html:h1', /https:\/\/gdantas\.com\.br.*found 0/i);
});

test('fails a sitemap route with two h1 elements', () => {
	const outDir = copyFixture();
	replace(outDir, 'index.html', '</body>', '<h1>Duplicate</h1></body>');
	assertOnlyFailure(outDir, 'html:h1', /https:\/\/gdantas\.com\.br.*found 2/i);
});

test('fails a route whose html lang disagrees with its canonical locale', () => {
	const outDir = copyFixture();
	replace(outDir, 'en/about.html', '<html lang="en">', '<html lang="pt">');
	assertOnlyFailure(outDir, 'html:lang', /\/en\/about.*expected en.*found pt/i);
});

test('fails a route with a missing title', () => {
	const outDir = copyFixture();
	replace(outDir, 'about.html', '<title>gdantas ─ cat ~/.about</title>', '');
	assertOnlyFailure(outDir, 'html:metadata', /\/about.*title.*missing/i);
});

test('fails a route with a missing description', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'about.html',
		'<meta name="description" content="Quem é o operador. SRE, plataforma, Backstage, AI ops.">',
		'',
	);
	assertOnlyFailure(outDir, 'html:metadata', /\/about.*description.*missing/i);
});

test('fails Portuguese title metadata copied from the English mirror', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'presentation.html',
		'<title>$ ./introduce-gabriel — apresentação</title>',
		'<title>$ ./introduce-gabriel — presentation</title>',
	);
	assertOnlyFailure(outDir, 'html:metadata', /\/presentation.*title.*Portuguese/i);
});

test('fails Portuguese description metadata copied from the English mirror', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'talks.html',
		'Talks, podcasts e slides — engenharia de plataforma, Backstage, AI ops.',
		'Talks, podcasts and slides — platform engineering, Backstage and AI ops.',
	);
	assertOnlyFailure(outDir, 'html:metadata', /\/talks.*description.*Portuguese/i);
});

test('fails a canonical URL containing a query string and fragment', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'about.html',
		'https://gdantas.com.br/about">',
		'https://gdantas.com.br/about?ref=test#bio">',
	);
	assertOnlyFailure(outDir, 'html:canonical', /\/about.*query string or fragment/i);
});

test('fails asymmetric PT and EN language alternates', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'en/about.html',
		'<link rel="alternate" hreflang="pt-BR" href="https://gdantas.com.br/about">',
		'',
	);
	assertOnlyFailure(outDir, 'html:alternates', /\/en\/about.*pt-BR/i);
});

test('fails invalid JSON-LD on a required collection route', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'talks.html',
		'{"@context":"https://schema.org","@type":"CollectionPage","url":"https://gdantas.com.br/talks"}',
		'{not-json}',
	);
	assertOnlyFailure(outDir, 'html:json-ld', /\/talks.*invalid JSON/i);
});

test('fails missing JSON-LD on a required profile route', () => {
	const outDir = copyFixture();
	replace(outDir, 'about.html', /<script type="application\/ld\+json">.*?<\/script>/, '');
	assertOnlyFailure(outDir, 'html:json-ld', /\/about.*ProfilePage.*missing/i);
});

test('fails when a sitemap route is noindex', () => {
	const outDir = copyFixture();
	replace(outDir, 'talks.html', 'content="index,follow"', 'content="noindex,nofollow"');
	assertOnlyFailure(outDir, 'sitemap:indexability', /\/talks.*noindex/i);
});

test('fails synthetic sitemap changefreq and lastmod values', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'sitemap-0.xml',
		'<priority>0.7</priority>',
		'<changefreq>daily</changefreq><priority>0.7</priority><lastmod>2026-08-10T12:00:00.000Z</lastmod>',
	);
	assertOnlyFailure(outDir, 'sitemap:freshness', /changefreq.*lastmod/i);
});

test('fails when llms-full.txt is missing', () => {
	const outDir = copyFixture();
	fs.unlinkSync(path.join(outDir, 'llms-full.txt'));
	assertOnlyFailure(outDir, 'artifacts:llms', /llms-full\.txt.*missing/i);
});

test('fails an internal llms URL that has no exported target', () => {
	const outDir = copyFixture();
	replace(outDir, 'llms.txt', 'https://gdantas.com.br/about', 'https://gdantas.com.br/missing');
	assertOnlyFailure(outDir, 'artifacts:llms', /llms\.txt.*\/missing.*does not resolve/i);
});

test('fails robots.txt without the approved Content-Signal', () => {
	const outDir = copyFixture();
	replace(outDir, 'robots.txt', 'Content-Signal: ai-train=no, search=yes, ai-input=yes\n', '');
	assertOnlyFailure(outDir, 'artifacts:robots', /Content-Signal.*missing/i);
});

test('fails robots.txt without the canonical sitemap declaration', () => {
	const outDir = copyFixture();
	replace(outDir, 'robots.txt', 'Sitemap: https://gdantas.com.br/sitemap.xml\n', '');
	assertOnlyFailure(outDir, 'artifacts:robots', /Sitemap.*missing/i);
});

test('fails an Agent Skills index with an invalid discovery schema', () => {
	const outDir = copyFixture();
	replace(outDir, '.well-known/agent-skills/index.json', '/0.2.0/', '/0.1.0/');
	assertOnlyFailure(outDir, 'artifacts:agent-skills', /schema.*0\.2\.0/i);
});

test('fails an Agent Skills digest that does not match the published raw bytes', () => {
	const outDir = copyFixture();
	replace(
		outDir,
		'.well-known/agent-skills/exploring-gdantas/SKILL.md',
		'specific page',
		'canonical page',
	);
	assertOnlyFailure(outDir, 'artifacts:agent-skills', /digest.*does not match/i);
});
