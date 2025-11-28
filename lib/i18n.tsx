import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import en from '~/locales/en.json';
import pt from '~/locales/pt.json';

export type Locale = 'en' | 'pt';

interface I18nContextValue {
	locale: Locale;
	setLocale: (next: Locale) => void;
	t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const TRANSLATIONS: Record<Locale, any> = { en, pt };

function getFromPath(object: any, path: string): any {
	return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), object);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
	if (!params) return template;
	return Object.keys(params).reduce((acc, key) => acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(params[key])), template);
}

function detectInitialLocale(): Locale {
	if (typeof window === 'undefined') return 'pt';
	const stored = window.localStorage.getItem('locale');
	if (stored === 'en' || stored === 'pt') return stored;
	const nav = window.navigator?.language?.toLowerCase() || '';
	if (nav.startsWith('pt')) return 'pt';
	return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(detectInitialLocale());

	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.lang = locale;
		}
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('locale', locale);
		}
	}, [locale]);

	const t = useCallback((key: string, params?: Record<string, string | number>) => {
		const value = getFromPath(TRANSLATIONS[locale], key);
		if (typeof value === 'string') return interpolate(value, params);
		return key;
	}, [locale]);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
	}, []);

	const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error('useI18n must be used within I18nProvider');
	return ctx;
}
