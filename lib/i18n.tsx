import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import { useRouter } from 'next/router';

import ptDict from '~/locales/pt.json';
import enDict from '~/locales/en.json';

export type Locale = 'pt' | 'en';

// PT é source of truth — type das chaves vem dele. EN tem que espelhar
// (validado por scripts/i18n-check.ts no CI).
type Dict = typeof ptDict;

const DICTS: Record<Locale, Dict> = {
	pt: ptDict as Dict,
	en: enDict as Dict,
};

interface I18nValue {
	locale: Locale;
	t: (key: string) => string;
	/** Troca a locale via router.push pro mirror path. */
	switchTo: (next: Locale) => void;
	/** Path no outro locale — usado pelo LangSwitcher pra preview do destino. */
	mirrorPath: (target: Locale) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

// Dot-notation lookup. Suporta arrays (key[i]) e graceful fallback pra PT
// se a chave não existir no locale ativo. Se nem em PT existir, devolve a
// própria chave (sinal visível pra dev "tem chave faltando aqui").
function lookup(dict: any, key: string): string | undefined {
	const parts = key.split('.');
	let cur: any = dict;
	for (const p of parts) {
		if (cur == null) return undefined;
		// suporta `roles[0].title`
		const arrMatch = p.match(/^([^\[]+)\[(\d+)\]$/);
		if (arrMatch) {
			cur = cur[arrMatch[1]];
			if (Array.isArray(cur)) cur = cur[Number(arrMatch[2])];
			else cur = undefined;
		} else {
			cur = cur[p];
		}
	}
	return typeof cur === 'string' ? cur : undefined;
}

export function detectLocaleFromPath(path: string): Locale {
	return path.startsWith('/en') ? 'en' : 'pt';
}

export function stripLocale(path: string): string {
	if (path === '/en' || path === '/en/') return '/';
	if (path.startsWith('/en/')) return path.slice(3);
	return path;
}

export function withLocale(path: string, locale: Locale): string {
	const clean = stripLocale(path);
	if (locale === 'pt') return clean;
	if (clean === '/') return '/en';
	return '/en' + clean;
}

interface ProviderProps {
	/** Locale forçado (ex: página `/en/about` passa locale="en"). Default:
	 *  deriva da URL via router. Permite o page component receber locale
	 *  como prop e respeitar. */
	locale?: Locale;
	children: React.ReactNode;
}

export function I18nProvider({ locale: forced, children }: ProviderProps) {
	const router = useRouter();
	const locale: Locale = forced || detectLocaleFromPath(router.asPath);

	const t = useCallback(
		(key: string): string => {
			const hit = lookup(DICTS[locale], key);
			if (hit !== undefined) return hit;
			const fallback = lookup(DICTS.pt, key);
			if (fallback !== undefined) return fallback;
			if (process.env.NODE_ENV !== 'production') {
				// eslint-disable-next-line no-console
				console.warn(`[i18n] missing key: ${key}`);
			}
			return key;
		},
		[locale],
	);

	const mirrorPath = useCallback(
		(target: Locale) => withLocale(router.asPath, target),
		[router.asPath],
	);

	const switchTo = useCallback(
		(target: Locale) => {
			if (typeof window !== 'undefined') {
				try {
					window.localStorage.setItem('lang', target);
				} catch {
					// ignore — preferência só não persiste.
				}
			}
			router.push(mirrorPath(target));
		},
		[router, mirrorPath],
	);

	const value = useMemo<I18nValue>(
		() => ({ locale, t, switchTo, mirrorPath }),
		[locale, t, switchTo, mirrorPath],
	);

	// Atualiza <html lang> client-side toda vez que troca locale (server-side
	// é setado pelo _document.tsx via initial render).
	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = locale;
		}
	}, [locale]);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
	return ctx;
}

export function useT(): (key: string) => string {
	return useI18n().t;
}
