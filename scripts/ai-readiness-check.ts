/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';

import en from '../locales/en.json';
import pt from '../locales/pt.json';
import { validateSkillIndex } from './agent-skill-index';

const SITE_URL = 'https://gdantas.com.br';
const CONTENT_SIGNAL_VALUE = 'ai-train=no, search=yes, ai-input=yes';
const CONTENT_SIGNAL = `Content-Signal: ${CONTENT_SIGNAL_VALUE}`;

const CHECK_IDS = [
	'sitemap:routes',
	'sitemap:indexability',
	'sitemap:freshness',
	'html:h1',
	'html:lang',
	'html:metadata',
	'html:canonical',
	'html:alternates',
	'html:json-ld',
	'artifacts:llms',
	'artifacts:robots',
	'artifacts:agent-skills',
] as const;

type CheckId = (typeof CHECK_IDS)[number];

export interface AuditCheck {
	id: string;
	status: 'pass' | 'fail';
	evidence: string[];
}

export interface AuditResult {
	ok: boolean;
	checks: AuditCheck[];
}

interface RouteDocument {
	url: URL;
	html: string;
}

interface SeoCopy {
	title: string;
	description: string;
}

interface SchemaNode {
	value: Record<string, unknown>;
	context: unknown;
}

interface RobotsDirective {
	name: string;
	value: string;
}

interface RobotsGroup {
	userAgents: string[];
	directives: RobotsDirective[];
}

interface ParsedRobots {
	groups: RobotsGroup[];
	directives: RobotsDirective[];
}

const SEO_COPY = {
	pt: pt.seo as Record<string, SeoCopy>,
	en: en.seo as Record<string, SeoCopy>,
};

function decodeEntities(value: string): string {
	return value
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;|&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function parseAttributes(source: string): Record<string, string> {
	const attributes: Record<string, string> = {};
	const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
	for (const match of Array.from(source.matchAll(pattern))) {
		attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? '');
	}
	return attributes;
}

function findTags(html: string, tagName: string): Record<string, string>[] {
	const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
	return Array.from(html.matchAll(pattern), (match) => parseAttributes(match[1]));
}

function canonicalForPath(pathname: string): string {
	return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname.replace(/\/$/, '')}`;
}

function routePair(pathname: string): { pt: string; en: string } {
	const ptPath = pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/)/, '');
	return {
		pt: canonicalForPath(ptPath),
		en: canonicalForPath(ptPath === '/' ? '/en' : `/en${ptPath}`),
	};
}

function localeForPath(pathname: string): 'pt' | 'en' {
	return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt';
}

function seoKeyForPath(pathname: string): string | undefined {
	const segments = pathname.split('/').filter(Boolean);
	if (segments[0] === 'en') segments.shift();
	if (segments.length === 0) return 'home';
	if (segments.length === 1) return segments[0];
	return undefined;
}

function safeExportPath(outDir: string, pathname: string): string | undefined {
	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return undefined;
	}
	const resolved = path.resolve(outDir, decoded.replace(/^\/+/, ''));
	const boundary = `${path.resolve(outDir)}${path.sep}`;
	if (resolved !== path.resolve(outDir) && !resolved.startsWith(boundary)) return undefined;
	return resolved;
}

function resolveHtml(outDir: string, pathname: string): string | undefined {
	if (pathname === '/') {
		const root = path.join(outDir, 'index.html');
		return fs.existsSync(root) ? root : undefined;
	}

	const base = safeExportPath(outDir, pathname.replace(/\/$/, ''));
	if (!base) return undefined;
	const candidates = [`${base}.html`, path.join(base, 'index.html')];
	return candidates.find(
		(candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
	);
}

function resolveArtifact(outDir: string, pathname: string): string | undefined {
	const exact = safeExportPath(outDir, pathname);
	if (exact && fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;
	return resolveHtml(outDir, pathname);
}

function readLocs(xml: string): string[] {
	return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) =>
		decodeEntities(match[1].trim()),
	);
}

function collectSitemap(
	outDir: string,
	fail: (id: CheckId, evidence: string) => void,
): { urls: URL[]; xmlFiles: { name: string; content: string }[] } {
	const queue = ['sitemap.xml'];
	const visited = new Set<string>();
	const urls: URL[] = [];
	const xmlFiles: { name: string; content: string }[] = [];

	while (queue.length > 0) {
		const name = queue.shift()!;
		if (visited.has(name)) continue;
		visited.add(name);
		const filePath = safeExportPath(outDir, `/${name}`);
		if (!filePath || !fs.existsSync(filePath)) {
			fail('sitemap:routes', `[${name}] sitemap file is missing`);
			continue;
		}

		const content = fs.readFileSync(filePath, 'utf8');
		xmlFiles.push({ name, content });
		const locs = readLocs(content);
		if (/<sitemapindex\b/i.test(content)) {
			for (const loc of locs) {
				try {
					const url = new URL(loc);
					if (url.origin !== SITE_URL || !url.pathname.endsWith('.xml')) {
						fail(
							'sitemap:routes',
							`[${name}] child sitemap URL is not local and canonical: ${loc}`,
						);
						continue;
					}
					queue.push(url.pathname.replace(/^\//, ''));
				} catch {
					fail('sitemap:routes', `[${name}] child sitemap URL is invalid: ${loc}`);
				}
			}
			continue;
		}

		if (!/<urlset\b/i.test(content)) {
			fail('sitemap:routes', `[${name}] sitemap is neither a sitemap index nor a URL set`);
			continue;
		}
		for (const loc of locs) {
			try {
				const url = new URL(loc);
				if (url.origin !== SITE_URL || url.search || url.hash) {
					fail('sitemap:routes', `[${name}] route URL is not canonical: ${loc}`);
					continue;
				}
				const canonicalLocation = canonicalForPath(url.pathname);
				if (loc !== canonicalLocation) {
					fail(
						'sitemap:routes',
						`[${loc}] sitemap canonical location must be ${canonicalLocation}`,
					);
				}
				urls.push(url);
			} catch {
				fail('sitemap:routes', `[${name}] route URL is invalid: ${loc}`);
			}
		}
	}

	if (urls.length === 0)
		fail('sitemap:routes', '[sitemap.xml] no indexable route URLs were found');
	return { urls, xmlFiles };
}

function schemaNodes(value: unknown, inheritedContext?: unknown): SchemaNode[] {
	if (Array.isArray(value)) {
		return value.flatMap((item) => schemaNodes(item, inheritedContext));
	}
	if (typeof value !== 'object' || value === null) return [];
	const object = value as Record<string, unknown>;
	const context = object['@context'] ?? inheritedContext;
	const ownNode = object['@type'] ? [{ value: object, context }] : [];
	return [...ownNode, ...schemaNodes(object['@graph'], context)];
}

function hasSchemaType(value: unknown, expectedType: string): boolean {
	return Array.isArray(value) ? value.includes(expectedType) : value === expectedType;
}

function hasSchemaOrgContext(context: unknown): boolean {
	return Array.isArray(context)
		? context.includes('https://schema.org')
		: context === 'https://schema.org';
}

function requiredSchemaTypes(pathname: string): string[] {
	const unprefixed = pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/)/, '');
	if (unprefixed === '/') return ['Person', 'WebSite'];
	if (unprefixed === '/about') return ['ProfilePage'];
	if (['/talks', '/presentations', '/projects', '/writing', '/links'].includes(unprefixed)) {
		return ['CollectionPage'];
	}
	if (/^\/talks\/[^/]+$/.test(unprefixed)) return ['PresentationDigitalDocument'];
	return [];
}

function validateRequiredSchema(node: SchemaNode, type: string, canonical: string): string[] {
	const errors: string[] = [];
	const schema = node.value;
	if (!hasSchemaOrgContext(node.context)) {
		errors.push(`${type} must declare @context https://schema.org`);
	}
	const expectedUrl = type === 'Person' || type === 'WebSite' ? SITE_URL : canonical;
	if (schema.url !== expectedUrl) {
		errors.push(`${type} must use the canonical url ${expectedUrl}`);
	}

	if (type === 'Person' && schema['@id'] !== `${SITE_URL}/#person`) {
		errors.push(`Person must use the stable ${SITE_URL}/#person identity`);
	}
	if (type === 'WebSite' && schema['@id'] !== `${SITE_URL}/#website`) {
		errors.push(`WebSite must use the stable ${SITE_URL}/#website identity`);
	}
	if (type === 'ProfilePage') {
		const mainEntity = schema.mainEntity;
		if (
			typeof mainEntity !== 'object' ||
			mainEntity === null ||
			(mainEntity as Record<string, unknown>)['@id'] !== `${SITE_URL}/#person`
		) {
			errors.push(`ProfilePage mainEntity must reference ${SITE_URL}/#person`);
		}
	}
	if (type === 'CollectionPage') {
		const mainEntity = schema.mainEntity;
		const itemList =
			typeof mainEntity === 'object' && mainEntity !== null
				? (mainEntity as Record<string, unknown>)
				: undefined;
		if (
			!itemList ||
			!hasSchemaType(itemList['@type'], 'ItemList') ||
			!Array.isArray(itemList.itemListElement)
		) {
			errors.push('CollectionPage mainEntity must be an ItemList with itemListElement');
		}
	}

	return errors;
}

function markdownTargets(content: string): string[] {
	return Array.from(content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g), (match) => match[1].trim());
}

function parseRobots(content: string): ParsedRobots {
	const groups: RobotsGroup[] = [];
	const directives: RobotsDirective[] = [];
	let currentGroup: RobotsGroup | undefined;
	let currentGroupHasRules = false;

	for (const rawLine of content.split(/\r?\n/)) {
		const line = rawLine.replace(/#.*$/, '').trim();
		if (!line) continue;
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const directive = {
			name: line.slice(0, separator).trim().toLowerCase(),
			value: line.slice(separator + 1).trim(),
		};
		directives.push(directive);

		if (directive.name === 'user-agent') {
			if (!currentGroup || currentGroupHasRules) {
				currentGroup = { userAgents: [], directives: [] };
				groups.push(currentGroup);
				currentGroupHasRules = false;
			}
			currentGroup.userAgents.push(directive.value.toLowerCase());
			continue;
		}

		if (currentGroup) {
			currentGroup.directives.push(directive);
			currentGroupHasRules = true;
		}
	}

	return { groups, directives };
}

function robotsGroupForAgent(robots: ParsedRobots, userAgent: string): RobotsGroup | undefined {
	const normalizedAgent = userAgent.toLowerCase();
	return robots.groups.find((group) => group.userAgents.includes(normalizedAgent));
}

function groupExplicitlyAllowsRoot(group: RobotsGroup): boolean {
	const rules = group.directives.filter(
		(directive) =>
			(directive.name === 'allow' || directive.name === 'disallow') &&
			directive.value.length > 0 &&
			'/'.startsWith(directive.value),
	);
	if (!rules.some((directive) => directive.name === 'allow' && directive.value === '/')) {
		return false;
	}
	const longest = Math.max(...rules.map((directive) => directive.value.length));
	return rules.some(
		(directive) => directive.value.length === longest && directive.name === 'allow',
	);
}

export function auditExport(outDir: string): AuditResult {
	const failures = new Map<CheckId, string[]>(CHECK_IDS.map((id) => [id, []]));
	const passEvidence = new Map<CheckId, string[]>();
	const fail = (id: CheckId, evidence: string) => failures.get(id)!.push(evidence);

	const sitemap = collectSitemap(outDir, fail);
	for (const { name, content } of sitemap.xmlFiles) {
		const freshnessFields = ['changefreq', 'lastmod'].filter((field) =>
			new RegExp(`<${field}\\b`, 'i').test(content),
		);
		if (freshnessFields.length > 0) {
			fail(
				'sitemap:freshness',
				`[${name}] synthetic freshness field(s) found: ${freshnessFields.join(', ')}`,
			);
		}
	}

	const uniqueUrls = Array.from(new Map(sitemap.urls.map((url) => [url.href, url])).values());
	if (uniqueUrls.length !== sitemap.urls.length) {
		fail('sitemap:routes', '[sitemap] duplicate route URLs were found');
	}
	const routeDocuments: RouteDocument[] = [];
	for (const url of uniqueUrls) {
		const filePath = resolveHtml(outDir, url.pathname);
		if (!filePath) {
			fail('sitemap:routes', `[${url.href}] does not resolve to exported HTML`);
			continue;
		}
		routeDocuments.push({ url, html: fs.readFileSync(filePath, 'utf8') });
	}

	const sitemapUrls = new Set(uniqueUrls.map((url) => canonicalForPath(url.pathname)));
	let validJsonLd = 0;
	for (const route of routeDocuments) {
		const routeLabel = route.url.href;
		const h1Count = (route.html.match(/<h1(?:\s|>)/gi) || []).length;
		if (h1Count !== 1)
			fail('html:h1', `[${routeLabel}] expected exactly one h1; found ${h1Count}`);

		const htmlTag = findTags(route.html, 'html')[0];
		const expectedLocale = localeForPath(route.url.pathname);
		const actualLocale = htmlTag?.lang;
		if (actualLocale !== expectedLocale) {
			fail(
				'html:lang',
				`[${routeLabel}] expected ${expectedLocale} from the route; found ${
					actualLocale || 'missing lang'
				}`,
			);
		}

		const titleMatch = route.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
		const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : undefined;
		const description = findTags(route.html, 'meta').find(
			(attributes) => attributes.name?.toLowerCase() === 'description',
		)?.content;
		if (!title) fail('html:metadata', `[${routeLabel}] title is missing`);
		if (!description) fail('html:metadata', `[${routeLabel}] description is missing`);
		const seoKey = seoKeyForPath(route.url.pathname);
		const expectedCopy = seoKey ? SEO_COPY[expectedLocale][seoKey] : undefined;
		const languageName = expectedLocale === 'pt' ? 'Portuguese' : 'English';
		if (expectedCopy && title && title !== expectedCopy.title) {
			fail(
				'html:metadata',
				`[${routeLabel}] title does not match ${languageName} metadata: expected "${expectedCopy.title}"; found "${title}"`,
			);
		}
		if (expectedCopy && description && description !== expectedCopy.description) {
			fail(
				'html:metadata',
				`[${routeLabel}] description does not match ${languageName} metadata: expected "${expectedCopy.description}"; found "${description}"`,
			);
		}

		const canonicalLinks = findTags(route.html, 'link').filter(
			(attributes) => attributes.rel?.toLowerCase() === 'canonical',
		);
		const canonical = canonicalLinks[0]?.href;
		if (canonicalLinks.length !== 1 || !canonical) {
			fail(
				'html:canonical',
				`[${routeLabel}] expected exactly one canonical link; found ${canonicalLinks.length}`,
			);
		} else {
			try {
				const canonicalUrl = new URL(canonical);
				if (canonicalUrl.search || canonicalUrl.hash) {
					fail(
						'html:canonical',
						`[${routeLabel}] canonical contains a query string or fragment: ${canonical}`,
					);
				}
				const expectedCanonical = canonicalForPath(route.url.pathname);
				if (canonical !== expectedCanonical) {
					fail(
						'html:canonical',
						`[${routeLabel}] canonical mismatch: expected ${expectedCanonical}; found ${canonical}`,
					);
				}
			} catch {
				fail('html:canonical', `[${routeLabel}] canonical URL is invalid: ${canonical}`);
			}
		}

		const pair = routePair(route.url.pathname);
		const expectedAlternates: Record<string, string> = {
			'pt-br': pair.pt,
			en: pair.en,
			'x-default': pair.pt,
		};
		const alternates = findTags(route.html, 'link').filter(
			(attributes) => attributes.rel?.toLowerCase() === 'alternate',
		);
		for (const [language, expectedHref] of Object.entries(expectedAlternates)) {
			const matches = alternates.filter(
				(attributes) => attributes.hreflang?.toLowerCase() === language,
			);
			if (matches.length !== 1 || matches[0].href !== expectedHref) {
				fail(
					'html:alternates',
					`[${routeLabel}] expected one ${
						language === 'pt-br' ? 'pt-BR' : language
					} alternate to ${expectedHref}; found ${
						matches.map((match) => match.href || 'missing href').join(', ') || 'none'
					}`,
				);
			}
		}
		const mirror = expectedLocale === 'en' ? pair.pt : pair.en;
		if (!sitemapUrls.has(mirror)) {
			fail(
				'html:alternates',
				`[${routeLabel}] alternate mirror is absent from the sitemap: ${mirror}`,
			);
		}

		const robots = findTags(route.html, 'meta').filter((attributes) =>
			['robots', 'googlebot'].includes(attributes.name?.toLowerCase()),
		);
		if (
			robots.some((attributes) =>
				/(?:^|[,\s])noindex(?:$|[,\s])/i.test(attributes.content || ''),
			)
		) {
			fail('sitemap:indexability', `[${routeLabel}] sitemap route declares noindex`);
		}

		const parsedSchemas: unknown[] = [];
		const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
		for (const match of Array.from(route.html.matchAll(scriptPattern))) {
			const attributes = parseAttributes(match[1]);
			if (attributes.type?.toLowerCase() !== 'application/ld+json') continue;
			try {
				const schema = JSON.parse(match[2]);
				if (typeof schema !== 'object' || schema === null) {
					fail('html:json-ld', `[${routeLabel}] JSON-LD must contain an object or array`);
					continue;
				}
				parsedSchemas.push(schema);
				validJsonLd += 1;
			} catch (error) {
				fail(
					'html:json-ld',
					`[${routeLabel}] invalid JSON-LD: ${
						error instanceof Error ? error.message : 'parse error'
					}`,
				);
			}
		}
		const nodes = parsedSchemas.flatMap((schema) => schemaNodes(schema));
		for (const requiredType of requiredSchemaTypes(route.url.pathname)) {
			const node = nodes.find((candidate) =>
				hasSchemaType(candidate.value['@type'], requiredType),
			);
			if (!node) {
				fail('html:json-ld', `[${routeLabel}] required ${requiredType} JSON-LD is missing`);
				continue;
			}
			for (const error of validateRequiredSchema(
				node,
				requiredType,
				canonicalForPath(route.url.pathname),
			)) {
				fail('html:json-ld', `[${routeLabel}] ${error}`);
			}
		}
	}

	for (const filename of ['llms.txt', 'llms-full.txt']) {
		const filePath = path.join(outDir, filename);
		if (!fs.existsSync(filePath)) {
			fail('artifacts:llms', `[${filename}] file is missing`);
			continue;
		}
		const content = fs.readFileSync(filePath, 'utf8');
		const targets = markdownTargets(content);
		if (targets.length === 0)
			fail('artifacts:llms', `[${filename}] contains no Markdown links`);
		for (const target of targets) {
			let url: URL;
			try {
				url = new URL(target);
			} catch {
				fail('artifacts:llms', `[${filename}] invalid absolute URL: ${target}`);
				continue;
			}
			if (!['http:', 'https:'].includes(url.protocol)) {
				fail('artifacts:llms', `[${filename}] unsupported URL protocol: ${target}`);
				continue;
			}
			if (url.origin === SITE_URL) {
				if (url.search || url.hash) {
					fail(
						'artifacts:llms',
						`[${filename}] internal URL is not canonical: ${target}`,
					);
				} else if (!resolveArtifact(outDir, url.pathname)) {
					fail(
						'artifacts:llms',
						`[${filename}] internal URL ${url.pathname} does not resolve in the export`,
					);
				}
			}
		}
	}

	const robotsPath = path.join(outDir, 'robots.txt');
	if (!fs.existsSync(robotsPath)) {
		fail('artifacts:robots', '[robots.txt] file is missing');
	} else {
		const robots = parseRobots(fs.readFileSync(robotsPath, 'utf8'));
		const wildcardGroup = robotsGroupForAgent(robots, '*');
		const hasApprovedSignal = wildcardGroup?.directives.some(
			(directive) =>
				directive.name === 'content-signal' && directive.value === CONTENT_SIGNAL_VALUE,
		);
		if (!hasApprovedSignal) {
			fail(
				'artifacts:robots',
				`[robots.txt] active wildcard Content-Signal is missing: ${CONTENT_SIGNAL}`,
			);
		}
		if (
			!robots.directives.some(
				(directive) =>
					directive.name === 'sitemap' && directive.value === `${SITE_URL}/sitemap.xml`,
			)
		) {
			fail('artifacts:robots', '[robots.txt] canonical Sitemap declaration is missing');
		}
		if (!wildcardGroup || !groupExplicitlyAllowsRoot(wildcardGroup)) {
			fail(
				'artifacts:robots',
				'[robots.txt] wildcard group root is blocked or not explicitly allowed',
			);
		}
		for (const agent of ['OAI-SearchBot', 'ChatGPT-User']) {
			const group = robotsGroupForAgent(robots, agent);
			if (!group) {
				fail(
					'artifacts:robots',
					`[robots.txt] explicit search/grounding agent is missing: ${agent}`,
				);
			} else if (!groupExplicitlyAllowsRoot(group)) {
				fail(
					'artifacts:robots',
					`[robots.txt] ${agent} group root is blocked or not explicitly allowed`,
				);
			}
		}
	}

	const skillIndexPath = path.join(outDir, '.well-known', 'agent-skills', 'index.json');
	if (!fs.existsSync(skillIndexPath)) {
		fail('artifacts:agent-skills', '[agent-skills/index.json] file is missing');
	} else {
		let index: unknown;
		try {
			index = JSON.parse(fs.readFileSync(skillIndexPath, 'utf8'));
		} catch (error) {
			fail(
				'artifacts:agent-skills',
				`[agent-skills/index.json] invalid JSON: ${
					error instanceof Error ? error.message : 'parse error'
				}`,
			);
		}
		const firstSkill =
			typeof index === 'object' &&
			index !== null &&
			Array.isArray((index as { skills?: unknown }).skills)
				? (index as { skills: unknown[] }).skills[0]
				: undefined;
		const skillUrl =
			typeof firstSkill === 'object' && firstSkill !== null
				? (firstSkill as { url?: unknown }).url
				: undefined;
		if (typeof skillUrl !== 'string' || !/^\/(?!\/)/.test(skillUrl)) {
			fail(
				'artifacts:agent-skills',
				'[agent-skills/index.json] skill URL is not path-absolute',
			);
		} else {
			const skillPath = safeExportPath(outDir, skillUrl);
			if (!skillPath || !fs.existsSync(skillPath)) {
				fail(
					'artifacts:agent-skills',
					`[agent-skills/index.json] skill artifact is missing: ${skillUrl}`,
				);
			} else {
				const skillBytes = fs.readFileSync(skillPath);
				for (const error of validateSkillIndex(index, skillBytes)) {
					fail('artifacts:agent-skills', `[agent-skills/index.json] ${error}`);
				}
				if (failures.get('artifacts:agent-skills')!.length === 0) {
					const digest = (firstSkill as { digest: string }).digest;
					passEvidence.set('artifacts:agent-skills', [
						`Agent Skills v0.2.0 index and ${digest} verified`,
					]);
				}
			}
		}
	}

	passEvidence.set('sitemap:routes', [
		`${routeDocuments.length} sitemap route(s) resolve to exported HTML`,
	]);
	passEvidence.set('sitemap:indexability', [
		`${routeDocuments.length} sitemap route(s) are indexable`,
	]);
	passEvidence.set('sitemap:freshness', [
		`${sitemap.xmlFiles.length} sitemap file(s) omit changefreq and lastmod`,
	]);
	passEvidence.set('html:h1', [
		`${routeDocuments.length} sitemap route(s) contain exactly one h1`,
	]);
	passEvidence.set('html:lang', [
		`${routeDocuments.length} sitemap route(s) match their PT/EN locale`,
	]);
	passEvidence.set('html:metadata', [
		`${routeDocuments.length} sitemap route(s) have localized title and description`,
	]);
	passEvidence.set('html:canonical', [
		`${routeDocuments.length} sitemap route(s) have canonical URLs without query or fragment`,
	]);
	passEvidence.set('html:alternates', [
		`${routeDocuments.length} sitemap route(s) have symmetric PT/EN alternates`,
	]);
	passEvidence.set('html:json-ld', [
		`${validJsonLd} valid JSON-LD document(s) checked on required route types`,
	]);
	passEvidence.set('artifacts:llms', [
		'llms.txt and llms-full.txt links resolve without network checks',
	]);
	passEvidence.set('artifacts:robots', [
		'robots.txt declares sitemap, Content-Signal, and explicit crawler access',
	]);

	const checks = CHECK_IDS.map((id): AuditCheck => {
		const evidence = failures.get(id)!;
		return evidence.length > 0
			? { id, status: 'fail', evidence }
			: { id, status: 'pass', evidence: passEvidence.get(id) || ['check passed'] };
	});
	return { ok: checks.every((check) => check.status === 'pass'), checks };
}

function main(): void {
	const outDir = path.resolve(process.argv[2] || path.join(process.cwd(), 'out'));
	const result = auditExport(outDir);

	for (const check of result.checks) {
		console.log(`[ai:check] ${check.status.toUpperCase()} ${check.id}`);
		for (const evidence of check.evidence) console.log(`  - ${evidence}`);
	}
	if (!result.ok) process.exitCode = 1;
}

if (require.main === module) main();
