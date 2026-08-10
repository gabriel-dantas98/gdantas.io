/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

const SCANNER_ENDPOINT = 'https://isitagentready.com/api/scan';
const DEFAULT_TARGET = 'https://gdantas.com.br';
const DEFAULT_OUTPUT_DIR = path.join('artifacts', 'agent-readiness');

const SUPPORTED_CHECKS = new Set([
	'discoverability.robotsTxt',
	'discoverability.sitemap',
	'botAccessControl.robotsTxtAiRules',
	'botAccessControl.contentSignals',
	'discovery.agentSkills',
]);

const ACCEPTED_GAPS = new Set([
	'discoverability.linkHeaders',
	'discoverability.dnsAid',
	'contentAccessibility.markdownNegotiation',
]);

const NOT_APPLICABLE_CHECKS = new Set([
	'botAccessControl.webBotAuth',
	'discovery.apiCatalog',
	'discovery.oauthDiscovery',
	'discovery.oauthProtectedResource',
	'discovery.authMd',
	'discovery.mcpServerCard',
	'discovery.a2aAgentCard',
	'discovery.webMcp',
	'commerce.x402',
	'commerce.mpp',
	'commerce.ucp',
	'commerce.acp',
	'commerce.ap2',
]);

export type ScanCheckPolicy = 'supported' | 'accepted-gap' | 'not-applicable' | 'advisory';

export interface NormalizedScanCheck {
	id: string;
	status: string;
	message: string;
	policy: ScanCheckPolicy;
}

export interface NormalizedScanReport {
	url: string | null;
	scannedAt: string | null;
	level: number | null;
	levelName: string | null;
	checks: NormalizedScanCheck[];
	warnings: string[];
}

export interface SupportedCheckRegression {
	id: string;
	baselineStatus: string;
	currentStatus: string;
	message: string;
}

function record(value: unknown): Record<string, unknown> | null {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

function policyFor(id: string): ScanCheckPolicy {
	if (SUPPORTED_CHECKS.has(id)) return 'supported';
	if (ACCEPTED_GAPS.has(id) || /(^|\.)customResponseHeaders$/.test(id)) return 'accepted-gap';
	if (NOT_APPLICABLE_CHECKS.has(id)) return 'not-applicable';
	return 'advisory';
}

function errorMessage(payload: Record<string, unknown>): string | null {
	if (typeof payload.error === 'string') return payload.error;
	const error = record(payload.error);
	return error && typeof error.message === 'string' ? error.message : null;
}

export function normalizeScanReport(payload: unknown): NormalizedScanReport {
	const candidate = record(payload);
	if (!candidate) {
		return {
			url: null,
			scannedAt: null,
			level: null,
			levelName: null,
			checks: [],
			warnings: ['Scanner response was not a JSON object'],
		};
	}

	const url = typeof candidate.url === 'string' ? candidate.url : null;
	const scannedAt = typeof candidate.scannedAt === 'string' ? candidate.scannedAt : null;
	const serviceError = errorMessage(candidate);
	if (serviceError) {
		return {
			url,
			scannedAt,
			level: null,
			levelName: null,
			checks: [],
			warnings: [serviceError],
		};
	}

	const warnings: string[] = [];
	const level = typeof candidate.level === 'number' ? candidate.level : null;
	const levelName = typeof candidate.levelName === 'string' ? candidate.levelName : null;
	if (!url) warnings.push('Scanner response omitted url');
	if (!scannedAt) warnings.push('Scanner response omitted scannedAt');
	if (level === null) warnings.push('Scanner response omitted numeric level');
	if (!levelName) warnings.push('Scanner response omitted levelName');

	const checks: NormalizedScanCheck[] = [];
	const categories = record(candidate.checks);
	if (!categories) {
		warnings.push('Scanner response omitted nested checks');
	} else {
		for (const [categoryName, categoryValue] of Object.entries(categories)) {
			const category = record(categoryValue);
			if (!category) continue;

			for (const [checkName, checkValue] of Object.entries(category)) {
				const check = record(checkValue);
				if (
					!check ||
					typeof check.status !== 'string' ||
					typeof check.message !== 'string'
				) {
					continue;
				}

				const id = `${categoryName}.${checkName}`;
				const status =
					id === 'botAccessControl.robotsTxtAiRules' &&
					/no ai-specific bot rules/i.test(check.message)
						? 'fail'
						: check.status;
				checks.push({ id, status, message: check.message, policy: policyFor(id) });
			}
		}
	}

	return { url, scannedAt, level, levelName, checks, warnings };
}

function statusRank(status: string): number {
	if (status === 'pass') return 2;
	if (status === 'neutral') return 1;
	return 0;
}

export function compareSupportedChecks(
	current: NormalizedScanReport,
	baseline: NormalizedScanReport,
): SupportedCheckRegression[] {
	const currentById = new Map(current.checks.map((check) => [check.id, check]));
	const baselineById = new Map(baseline.checks.map((check) => [check.id, check]));
	const regressions: SupportedCheckRegression[] = [];

	for (const id of Array.from(SUPPORTED_CHECKS)) {
		const previous = baselineById.get(id);
		if (!previous) continue;

		const next = currentById.get(id);
		const currentStatus = next?.status || 'missing';
		if (statusRank(currentStatus) >= statusRank(previous.status)) continue;

		regressions.push({
			id,
			baselineStatus: previous.status,
			currentStatus,
			message: next?.message || 'Supported check missing from scanner response',
		});
	}

	return regressions;
}

function markdownTable(checks: NormalizedScanCheck[]): string[] {
	if (checks.length === 0) return ['_No checks reported._'];
	return [
		'| Check | Status | Message |',
		'| --- | --- | --- |',
		...checks.map(
			(check) =>
				`| \`${check.id}\` | ${check.status.toUpperCase()} | ${check.message.replace(
					/\|/g,
					'\\|',
				)} |`,
		),
	];
}

export function renderScanMarkdown(report: NormalizedScanReport): string {
	const lines = [
		'# Advisory AI readiness scan',
		'',
		`- Target: ${report.url || 'unknown'}`,
		`- Scanned at: ${report.scannedAt || 'unknown'}`,
		`- Scanner level: ${report.level === null ? 'unavailable' : report.level}${
			report.levelName ? ` (${report.levelName})` : ''
		}`,
		'- Authority: advisory live observation; `yarn ai:check` remains the deterministic gate.',
		'',
	];

	for (const warning of report.warnings) lines.push(`> Warning: ${warning}`, '');

	const sections: Array<[string, ScanCheckPolicy]> = [
		['Supported static checks', 'supported'],
		['Accepted GitHub Pages gaps', 'accepted-gap'],
		['Capabilities not applicable to this static site', 'not-applicable'],
		['Other advisory checks', 'advisory'],
	];
	for (const [title, policy] of sections) {
		lines.push(
			`## ${title}`,
			'',
			...markdownTable(report.checks.filter((check) => check.policy === policy)),
			'',
		);
	}

	return `${lines.join('\n').trimEnd()}\n`;
}

function artifactTimestamp(value: string): string {
	return value.replace(/[:.]/g, '-');
}

function warningPayload(
	target: string,
	scannedAt: string,
	message: string,
): Record<string, unknown> {
	return { url: target, scannedAt, error: message };
}

async function requestScan(target: string, scannedAt: string): Promise<unknown> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 30_000);

	try {
		const response = await fetch(SCANNER_ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ url: target }),
			signal: controller.signal,
		});
		const body = await response.text();
		let payload: unknown;
		try {
			payload = JSON.parse(body);
		} catch {
			return warningPayload(
				target,
				scannedAt,
				`Scanner returned non-JSON HTTP ${response.status}`,
			);
		}

		if (!response.ok) {
			const detail =
				errorMessage(record(payload) || {}) || response.statusText || 'service error';
			return warningPayload(
				target,
				scannedAt,
				`Scanner returned HTTP ${response.status}: ${detail}`,
			);
		}
		return payload;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return warningPayload(target, scannedAt, `Scanner request failed: ${message}`);
	} finally {
		clearTimeout(timeout);
	}
}

async function main(): Promise<void> {
	const target = process.argv[2] || DEFAULT_TARGET;
	const outputDir = path.resolve(process.argv[3] || DEFAULT_OUTPUT_DIR);
	const requestedAt = new Date().toISOString();
	let payload: unknown;

	try {
		const targetUrl = new URL(target);
		if (!['http:', 'https:'].includes(targetUrl.protocol)) {
			throw new Error('target must use http or https');
		}
		payload = await requestScan(targetUrl.href, requestedAt);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		payload = warningPayload(target, requestedAt, `Scanner request skipped: ${message}`);
	}

	const report = normalizeScanReport(payload);
	const timestamp = artifactTimestamp(report.scannedAt || requestedAt);
	const basename = `ai-readiness-${timestamp}`;
	fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(
		path.join(outputDir, `${basename}.json`),
		`${JSON.stringify(payload, null, 2)}\n`,
	);
	fs.writeFileSync(path.join(outputDir, `${basename}.md`), renderScanMarkdown(report));

	console.log(`[ai:scan] wrote ${path.relative(process.cwd(), outputDir)}/${basename}.{json,md}`);
	for (const warning of report.warnings) console.warn(`[ai:scan] WARNING ${warning}`);
}

if (require.main === module) {
	main().catch((error) => {
		console.warn(`[ai:scan] WARNING Could not write advisory report: ${String(error)}`);
	});
}
