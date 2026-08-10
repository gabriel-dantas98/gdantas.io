import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
	collectScanPayload,
	compareSupportedChecks,
	normalizeScanReport,
	renderScanMarkdown,
	writeScanArtifacts,
} from '../scripts/ai-readiness-scan';

const RECORDED_SCAN = {
	url: 'https://gdantas.com.br',
	scannedAt: '2026-08-10T14:16:27.359Z',
	level: 1,
	levelName: 'Basic Web Presence',
	checks: {
		discoverability: {
			robotsTxt: {
				status: 'pass',
				message: 'robots.txt exists with valid format',
				evidence: [
					{
						action: 'fetch',
						label: 'GET /robots.txt',
						request: { url: 'https://gdantas.com.br/robots.txt', method: 'GET' },
						response: {
							status: 200,
							statusText: 'OK',
							headers: { 'content-type': 'text/plain; charset=utf-8' },
							bodyPreview: 'User-agent: *\nAllow: /\n',
						},
						finding: { outcome: 'positive', summary: 'Received valid robots.txt' },
					},
				],
				durationMs: 0,
			},
			sitemap: {
				status: 'pass',
				message: 'sitemap.xml exists with valid structure',
				details: {
					url: 'https://gdantas.com.br/sitemap.xml',
					fromRobotsTxt: true,
					format: 'xml',
				},
				evidence: [
					{
						action: 'fetch',
						label: 'GET /sitemap.xml',
						response: { status: 200, statusText: 'OK' },
						finding: { outcome: 'positive', summary: 'Found valid XML sitemap' },
					},
				],
				durationMs: 146,
			},
			linkHeaders: {
				status: 'fail',
				message: 'No Link headers found on homepage',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'No Link headers found' },
					},
				],
				durationMs: 416,
			},
			dnsAid: {
				status: 'fail',
				message: 'DNS for AI Discovery (DNS-AID) well-known entrypoint records not found',
				details: {
					domainsChecked: ['gdantas.com.br'],
					queriesAttempted: ['SVCB _index._agents.gdantas.com.br'],
					dnssecValidated: false,
					serviceRecordCount: 0,
					aliasRecordCount: 0,
					txtIndexEntryCount: 0,
					txtIndexEntries: [],
					records: [],
				},
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'No DNS-AID records found' },
					},
				],
				durationMs: 14,
			},
		},
		contentAccessibility: {
			markdownNegotiation: {
				status: 'fail',
				message: 'Site does not support Markdown for Agents',
				details: { contentType: 'text/html; charset=utf-8' },
				evidence: [
					{
						action: 'fetch',
						label: 'GET homepage (Accept: text/markdown)',
						request: {
							url: 'https://gdantas.com.br',
							method: 'GET',
							headers: { accept: 'text/markdown' },
						},
						response: { status: 200, statusText: 'OK' },
						finding: { outcome: 'negative', summary: 'HTML returned' },
					},
				],
				durationMs: 1223,
			},
		},
		botAccessControl: {
			robotsTxtAiRules: {
				status: 'pass',
				message:
					'No AI-specific bot rules; wildcard rules apply to all crawlers including AI bots',
				details: { checkedBots: ['gptbot', 'chatgpt-user', 'google-extended'] },
				evidence: [
					{
						action: 'parse',
						label: 'Scan for AI bot User-agent directives',
						finding: { outcome: 'positive', summary: 'No AI bot user agents found' },
					},
				],
				durationMs: 0,
			},
			contentSignals: {
				status: 'fail',
				message: 'No Content Signals found in robots.txt',
				evidence: [
					{
						action: 'parse',
						label: 'Parse Content-Signal directives',
						finding: { outcome: 'negative', summary: 'No directives found' },
					},
				],
				durationMs: 0,
			},
			webBotAuth: {
				status: 'neutral',
				message: 'Web Bot Auth directory not found (informational only)',
				evidence: [
					{
						action: 'fetch',
						label: 'GET /.well-known/http-message-signatures-directory',
						response: { status: 404, statusText: 'Not Found' },
						finding: { outcome: 'negative', summary: 'Directory not found' },
					},
				],
				durationMs: 169,
			},
		},
		discovery: {
			apiCatalog: {
				status: 'fail',
				message: 'API Catalog not found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 297,
			},
			oauthDiscovery: {
				status: 'fail',
				message: 'No OAuth/OIDC discovery metadata found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 152,
			},
			oauthProtectedResource: {
				status: 'fail',
				message: 'No OAuth Protected Resource Metadata found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 152,
			},
			authMd: {
				status: 'fail',
				message: 'auth.md not found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 171,
			},
			mcpServerCard: {
				status: 'fail',
				message: 'MCP Server Card not found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 297,
			},
			a2aAgentCard: {
				status: 'fail',
				message: 'A2A Agent Card not found',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not found' },
					},
				],
				durationMs: 282,
			},
			agentSkills: {
				status: 'fail',
				message: 'Agent Skills index not found',
				evidence: [
					{
						action: 'fetch',
						label: 'GET /.well-known/agent-skills/index.json',
						response: { status: 404, statusText: 'Not Found' },
						finding: { outcome: 'negative', summary: 'Index not found' },
					},
				],
				durationMs: 547,
			},
			webMcp: {
				status: 'fail',
				message: 'No WebMCP tools detected on page load',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'No tools found' },
					},
				],
				durationMs: 5733,
			},
		},
		commerce: {
			x402: {
				status: 'neutral',
				message: 'x402 payment protocol not detected (not a commerce site)',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not detected' },
					},
				],
				durationMs: 918,
			},
			mpp: {
				status: 'neutral',
				message: 'MPP payment discovery not detected (not a commerce site)',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not detected' },
					},
				],
				durationMs: 421,
			},
			ucp: {
				status: 'neutral',
				message: 'UCP profile not found (not a commerce site)',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not detected' },
					},
				],
				durationMs: 408,
			},
			acp: {
				status: 'neutral',
				message: 'ACP discovery document not found (not a commerce site)',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not detected' },
					},
				],
				durationMs: 429,
			},
			ap2: {
				status: 'neutral',
				message: 'AP2 not detected (no A2A Agent Card) (not a commerce site)',
				evidence: [
					{
						action: 'conclude',
						label: 'Conclusion',
						finding: { outcome: 'negative', summary: 'Not detected' },
					},
				],
			},
		},
	},
	nextLevel: {
		target: 2,
		name: 'Bot-Aware',
		requirements: [
			{
				check: 'contentSignals',
				description:
					'Declare AI content usage preferences with Content Signals in robots.txt',
				shortPrompt: 'Add Content-Signal directives to robots.txt.',
				specUrls: ['https://contentsignals.org/'],
				prompt: 'Add Content-Signal directives to robots.txt.',
				skillUrl:
					'https://isitagentready.com/.well-known/agent-skills/content-signals/SKILL.md',
			},
		],
	},
	isCommerce: false,
	commerceSignals: [],
};

function cloneRecordedScan(): typeof RECORDED_SCAN {
	return JSON.parse(JSON.stringify(RECORDED_SCAN));
}

test('normalizes the public scan level and every nested check', () => {
	const report = normalizeScanReport(RECORDED_SCAN);

	assert.equal(report.url, 'https://gdantas.com.br');
	assert.equal(report.scannedAt, '2026-08-10T14:16:27.359Z');
	assert.equal(report.level, 1);
	assert.equal(report.levelName, 'Basic Web Presence');
	assert.equal(report.checks.length, 21);
	assert.deepEqual(
		report.checks.find((check) => check.id === 'discoverability.robotsTxt'),
		{
			id: 'discoverability.robotsTxt',
			status: 'pass',
			message: 'robots.txt exists with valid format',
			policy: 'supported',
		},
	);
	assert.deepEqual(
		report.checks.find((check) => check.id === 'botAccessControl.robotsTxtAiRules'),
		{
			id: 'botAccessControl.robotsTxtAiRules',
			status: 'fail',
			message:
				'No AI-specific bot rules; wildcard rules apply to all crawlers including AI bots',
			policy: 'supported',
		},
	);
	assert.equal(
		report.checks.find((check) => check.id === 'discoverability.linkHeaders')?.policy,
		'accepted-gap',
	);
	assert.equal(
		report.checks.find((check) => check.id === 'discovery.mcpServerCard')?.policy,
		'not-applicable',
	);
	assert.deepEqual(report.warnings, []);
});

test('reports only supported checks that regress from pass', () => {
	const baselinePayload = cloneRecordedScan();
	baselinePayload.checks.botAccessControl.robotsTxtAiRules.message =
		'Explicit AI-specific bot rules found';
	baselinePayload.checks.botAccessControl.contentSignals.status = 'pass';
	baselinePayload.checks.botAccessControl.contentSignals.message = 'Content Signals found';
	baselinePayload.checks.discovery.agentSkills.status = 'pass';
	baselinePayload.checks.discovery.agentSkills.message = 'Agent Skills index found';
	baselinePayload.checks.discoverability.linkHeaders.status = 'pass';

	const currentPayload = cloneRecordedScan();
	currentPayload.checks.botAccessControl.robotsTxtAiRules.message =
		'Explicit AI-specific bot rules found';
	currentPayload.checks.discovery.agentSkills.status = 'pass';
	currentPayload.checks.discovery.agentSkills.message = 'Agent Skills index found';

	const regressions = compareSupportedChecks(
		normalizeScanReport(currentPayload),
		normalizeScanReport(baselinePayload),
	);

	assert.deepEqual(regressions, [
		{
			id: 'botAccessControl.contentSignals',
			baselineStatus: 'pass',
			currentStatus: 'fail',
			message: 'No Content Signals found in robots.txt',
		},
	]);
});

test('suppresses accepted GitHub Pages gaps and inapplicable capability checks', () => {
	const baselinePayload = cloneRecordedScan();
	baselinePayload.checks.discoverability.linkHeaders.status = 'pass';
	baselinePayload.checks.discoverability.dnsAid.status = 'pass';
	baselinePayload.checks.contentAccessibility.markdownNegotiation.status = 'pass';
	baselinePayload.checks.discovery.mcpServerCard.status = 'pass';
	baselinePayload.checks.commerce.x402.status = 'pass';

	assert.deepEqual(
		compareSupportedChecks(
			normalizeScanReport(RECORDED_SCAN),
			normalizeScanReport(baselinePayload),
		),
		[],
	);
});

test('classifies a future custom response-header check as an accepted hosting gap', () => {
	const payload = cloneRecordedScan() as typeof RECORDED_SCAN & {
		hosting?: unknown;
	};
	payload.checks = {
		...payload.checks,
		hosting: {
			customResponseHeaders: {
				status: 'fail',
				message: 'Custom response headers unavailable',
				evidence: [],
				durationMs: 1,
			},
		},
	} as typeof payload.checks;

	assert.equal(
		normalizeScanReport(payload).checks.find(
			(check) => check.id === 'hosting.customResponseHeaders',
		)?.policy,
		'accepted-gap',
	);
});

test('turns an API error payload into an explicit warning report', () => {
	const report = normalizeScanReport({
		url: 'https://gdantas.com.br',
		error: 'Scanner service unavailable',
	});

	assert.equal(report.url, 'https://gdantas.com.br');
	assert.equal(report.level, null);
	assert.equal(report.levelName, null);
	assert.deepEqual(report.checks, []);
	assert.deepEqual(report.warnings, ['Scanner service unavailable']);
	assert.match(renderScanMarkdown(report), /Warning: Scanner service unavailable/);
});

test('ignores additive unknown response fields without throwing', () => {
	const payload = cloneRecordedScan() as typeof RECORDED_SCAN & {
		experiment?: unknown;
	};
	payload.experiment = {
		version: 2,
		telemetry: { traceId: 'public-trace', samples: [1, 2, 3] },
	};
	(payload.checks.discoverability.robotsTxt as Record<string, unknown>).newEvidenceFormat = {
		value: true,
	};

	assert.doesNotThrow(() => normalizeScanReport(payload));
	assert.equal(normalizeScanReport(payload).checks.length, 21);
});

test('warns when malformed categories and checks are discarded from a partial response', () => {
	const report = normalizeScanReport({
		url: 'https://gdantas.com.br',
		scannedAt: '2026-08-10T14:16:27.359Z',
		level: 1,
		levelName: 'Basic Web Presence',
		checks: {
			discoverability: {
				robotsTxt: { status: 'pass', message: 'robots.txt found' },
				sitemap: { status: 'pass' },
			},
			discovery: ['not', 'a', 'category'],
		},
	});

	assert.deepEqual(report.checks.map((check) => check.id), ['discoverability.robotsTxt']);
	assert.deepEqual(report.warnings, [
		'Scanner response discarded malformed check discoverability.sitemap',
		'Scanner response discarded malformed category discovery',
	]);
});

test('warns when a scanner response contains no valid checks', () => {
	const report = normalizeScanReport({
		url: 'https://gdantas.com.br',
		scannedAt: '2026-08-10T14:16:27.359Z',
		level: 1,
		levelName: 'Basic Web Presence',
		checks: { discoverability: { sitemap: null } },
	});

	assert.deepEqual(report.checks, []);
	assert.deepEqual(report.warnings, [
		'Scanner response discarded malformed check discoverability.sitemap',
		'Scanner response contained no valid checks',
	]);
});

test('rejects credential-bearing target URLs before calling the public scanner', async () => {
	let requests = 0;
	const secret = 'do-not-send-this-password';
	const payload = await collectScanPayload(
		`https://scanner-user:${secret}@private.example/path`,
		'2026-08-10T14:16:27.359Z',
		async () => {
			requests += 1;
			throw new Error('request must not run');
		},
	);

	assert.equal(requests, 0);
	assert.doesNotMatch(JSON.stringify(payload), /scanner-user|do-not-send-this-password/);
	assert.match(JSON.stringify(payload), /target URL must not contain credentials/);
});

test('writes artifacts inside the output directory when scanner scannedAt attempts traversal', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-readiness-scan-'));
	const outputDir = path.join(root, 'reports');
	const outsidePath = path.join(root, 'outside.json');
	const requestedAt = '2026-08-10T14:16:27.359Z';

	try {
		const written = writeScanArtifacts(
			{
				url: 'https://gdantas.com.br',
				scannedAt: '../../outside',
				level: 1,
				levelName: 'Basic Web Presence',
				checks: {},
			},
			outputDir,
			requestedAt,
		);

		assert.deepEqual(
			written.map((file) => path.relative(outputDir, file)),
			[
				'ai-readiness-2026-08-10T14-16-27-359Z.json',
				'ai-readiness-2026-08-10T14-16-27-359Z.md',
			],
		);
		assert.ok(written.every((file) => file.startsWith(`${outputDir}${path.sep}`)));
		assert.equal(fs.existsSync(outsidePath), false);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
