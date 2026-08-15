type AiSource = 'chatgpt' | 'openai' | 'perplexity' | 'claude' | 'copilot' | 'gemini' | 'mistral';
type ContentType = 'home' | 'about' | 'talks' | 'writing' | 'projects' | 'other';
type LandingLocale = 'pt' | 'en';

export interface AiReferralEventInput {
	referrer: string | null | undefined;
	path: string;
}

export interface AiReferralEvent {
	ai_source: AiSource;
	landing_path: string;
	locale: LandingLocale;
	content_type: ContentType;
}

const AI_HOSTS: Array<{ source: AiSource; host: string }> = [
	{ source: 'chatgpt', host: 'chatgpt.com' },
	{ source: 'openai', host: 'openai.com' },
	{ source: 'perplexity', host: 'perplexity.ai' },
	{ source: 'claude', host: 'claude.ai' },
	{ source: 'copilot', host: 'copilot.microsoft.com' },
	{ source: 'gemini', host: 'gemini.google.com' },
	{ source: 'gemini', host: 'bard.google.com' },
	{ source: 'mistral', host: 'mistral.ai' },
];

function hasHostBoundary(hostname: string, host: string): boolean {
	return hostname === host || hostname.endsWith(`.${host}`);
}

function normalizeLandingPath(path: string): string {
	if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
		return '/';
	}

	const pathname = path.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/');
	return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

function isInternalHost(hostname: string): boolean {
	return hasHostBoundary(hostname, 'gdantas.com.br');
}

export function classifyAiReferral(referrer: string | null | undefined): AiSource | null {
	if (!referrer) return null;

	try {
		const hostname = new URL(referrer).hostname.toLowerCase();
		const match = AI_HOSTS.find(({ host }) => hasHostBoundary(hostname, host));
		return match ? match.source : null;
	} catch {
		return null;
	}
}

export function inferContentType(path: string): ContentType {
	const pathname = normalizeLandingPath(path);
	const route = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

	if (route === '/') return 'home';
	if (route === '/about' || route.startsWith('/about/')) return 'about';
	if (route === '/talks' || route.startsWith('/talks/')) return 'talks';
	if (route === '/writing' || route.startsWith('/writing/')) return 'writing';
	if (route === '/projects' || route.startsWith('/projects/')) return 'projects';
	return 'other';
}

export function buildAiReferralEvent(input: AiReferralEventInput): AiReferralEvent | null {
	if (!input.referrer) return null;

	try {
		if (isInternalHost(new URL(input.referrer).hostname.toLowerCase())) return null;
	} catch {
		return null;
	}

	const aiSource = classifyAiReferral(input.referrer);
	if (!aiSource) return null;

	const landingPath = normalizeLandingPath(input.path);
	return {
		ai_source: aiSource,
		landing_path: landingPath,
		locale: landingPath === '/en' || landingPath.startsWith('/en/') ? 'en' : 'pt',
		content_type: inferContentType(landingPath),
	};
}
