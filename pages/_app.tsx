import NProgress from 'nprogress';
import splitbee from '@splitbee/web';
import posthog from 'posthog-js';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useEffectOnce, useEvent } from 'react-use';
import { useRouter } from 'next/router';

import 'inter-ui/inter.css';
import 'nprogress/nprogress.css';
import 'windi.css';

import { colors, useClick } from '~/lib';
import { ensureGsap } from '~/lib/gsap-loader';
import { fontVars } from '~/lib/fonts';
import { I18nProvider, detectLocaleFromPath, withLocale } from '~/lib/i18n';
import { Theme } from '~/types';

NProgress.configure({
	easing: 'ease',
	minimum: 0.3,
	showSpinner: false,
	speed: 800,
});

import { reportWebVitals as axiomReportWebVitals } from 'next-axiom';
import type { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
	// Só envia pra axiom em prod com endpoint configurado — evita warnings em
	// dev e em deploys sem env vars.
	if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT) {
		axiomReportWebVitals(metric);
	}
}

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [play] = useClick();

	useEvent('mousedown', () => play());
	useEvent('mouseup', () => play());

	useEffectOnce(() => {
		router.events.on('routeChangeStart', () => NProgress.start());
		router.events.on('routeChangeComplete', () => NProgress.done());
		router.events.on('routeChangeError', () => NProgress.done());

		// GSAP via dynamic import — substitui o <Script> CDN bloqueante.
		// Chamado uma vez aqui; hooks Operator esperam window.gsap via retry.
		ensureGsap();

		// i18n: na 1ª visita sem preferência salva, se o browser prefere EN e
		// o usuário caiu numa rota PT, manda pro mirror /en/<path>. Preferência
		// explícita no LangSwitcher grava localStorage.lang e essa detecção
		// para de atuar.
		try {
			const stored = window.localStorage.getItem('lang');
			if (!stored) {
				const browser = (navigator.language || 'pt').toLowerCase();
				if (browser.startsWith('en')) {
					const currentLocale = detectLocaleFromPath(router.asPath);
					if (currentLocale === 'pt') {
						router.replace(withLocale(router.asPath, 'en'));
					}
				}
			}
		} catch {
			// localStorage bloqueado (modo privado iOS): ignora a detecção.
		}

		if (process.env.NODE_ENV === 'production')
			splitbee.init({
				disableCookie: true,
			});

		posthog.init(
			process.env.NEXT_PUBLIC_POSTHOG_KEY ||
				'phc_CNLrSr8MiyZPcFQHcd2HdtfdvBdmP3CHwmHj82hbUy2T',
			{
				api_host: 'https://us.i.posthog.com',
				ui_host: 'https://us.posthog.com',
				defaults: '2026-01-30',
				capture_exceptions: true,
				person_profiles: 'identified_only',
				debug: process.env.NODE_ENV === 'development',
			},
		);
	});

	return (
		<ThemeProvider attribute="class" defaultTheme={Theme.DARK} themes={Object.values(Theme)}>
			{/* Clarity removido — script bloqueado por CSP gerava console error +
			   inspector issue; análise não justificava o custo de perf/BP. */}
			<I18nProvider>
				<div className={fontVars} style={{ minHeight: '100vh' }}>
					<Component {...pageProps} />
				</div>
			</I18nProvider>
			<style jsx global>{`
				#nprogress .bar {
					height: 0.25rem;
					background-color: ${colors.primary[500]};
				}
			`}</style>
		</ThemeProvider>
	);
}
