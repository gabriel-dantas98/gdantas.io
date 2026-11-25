import { detectLocaleFromPath, translate, withLocale } from './i18n';
import { canonicalUrl } from './site-metadata';
import { resolveTalkCopy } from './talk-copy';
import { getTalkSummaries } from './talks-static-props';

type ToolResult = {
	content: { type: 'text'; text: string }[];
	isError?: boolean;
};

interface WebMcpTool {
	name: string;
	description: string;
	inputSchema: object;
	annotations: { readOnlyHint: boolean };
	execute: (input: { locale?: unknown }) => ToolResult;
}

interface ModelContext {
	registerTool(tool: WebMcpTool): void | Promise<unknown>;
}

const listTalksTool: WebMcpTool = {
	name: 'list_talks',
	description: 'List Gabriel Dantas’s public talks with titles, descriptions, and links.',
	inputSchema: {
		type: 'object',
		properties: {
			locale: {
				type: 'string',
				enum: ['pt', 'en'],
				description: 'Language of the results. Defaults to the current page language.',
			},
		},
		additionalProperties: false,
	},
	annotations: { readOnlyHint: true },
	execute: ({ locale } = {}) => {
		if (locale !== undefined && locale !== 'pt' && locale !== 'en') {
			return {
				isError: true,
				content: [{ type: 'text', text: 'locale must be "pt" or "en".' }],
			};
		}
		const language = locale === 'pt' || locale === 'en'
			? locale
			: detectLocaleFromPath(window.location.pathname);
		const talks = getTalkSummaries().map((talk) => ({
			...talk,
			...resolveTalkCopy((key) => translate(language, key), talk.slug, talk),
			url: canonicalUrl(withLocale(`/talks/${talk.slug}`, language)),
		}));
		return { content: [{ type: 'text', text: JSON.stringify(talks) }] };
	},
};

const documentsWithRegistration = new WeakSet<Document>();

export async function registerSiteWebMcpTools() {
	const currentDocument = document;
	const context =
		(currentDocument as Document & { modelContext?: ModelContext }).modelContext ??
		(navigator as Navigator & { modelContext?: ModelContext }).modelContext;

	if (typeof context?.registerTool !== 'function' || documentsWithRegistration.has(currentDocument)) return;

	// A tool belongs to the document and stays available across Next.js route changes.
	documentsWithRegistration.add(currentDocument);
	try {
		await context.registerTool(listTalksTool);
	} catch (error) {
		documentsWithRegistration.delete(currentDocument);
		console.warn('WebMCP registration failed for list_talks.', error);
	}
}
