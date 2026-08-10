export const SITE_URL = 'https://gdantas.com.br';
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export type SiteLocale = 'pt' | 'en';

export interface AlternateUrl {
	hrefLang: 'pt-BR' | 'en' | 'x-default';
	href: string;
}

function normalizePath(path: string): string {
	if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
		throw new Error('canonical paths must be relative paths starting with /');
	}

	const pathname = path.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/');
	return pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
}

export function canonicalUrl(path: string): string {
	const pathname = normalizePath(path);
	return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`;
}

export function alternateUrls(path: string): AlternateUrl[] {
	const pathname = normalizePath(path);
	const ptPath = pathname === '/en' ? '/' : pathname.replace(/^\/en(?=\/)/, '');
	const enPath = ptPath === '/' ? '/en' : `/en${ptPath}`;

	return [
		{ hrefLang: 'pt-BR', href: canonicalUrl(ptPath) },
		{ hrefLang: 'en', href: canonicalUrl(enPath) },
		{ hrefLang: 'x-default', href: canonicalUrl(ptPath) },
	];
}
