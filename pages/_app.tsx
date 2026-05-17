import NProgress from 'nprogress';
import splitbee from '@splitbee/web';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useEffectOnce, useEvent } from 'react-use';
import { useRouter } from 'next/router';

import 'inter-ui/inter.css';
import 'nprogress/nprogress.css';
import 'windi.css';

import { colors, useClick } from '~/lib';
import { ensureGsap } from '~/lib/gsap-loader';
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

		if (process.env.NODE_ENV === 'production')
			splitbee.init({
				disableCookie: true,
			});
	});

	return (
		<ThemeProvider attribute="class" defaultTheme={Theme.DARK} themes={Object.values(Theme)}>
			{/* Clarity removido — script bloqueado por CSP gerava console error +
			   inspector issue; análise não justificava o custo de perf/BP. */}
			<Component {...pageProps} />
			<style jsx global>{`
				#nprogress .bar {
					height: 0.25rem;
					background-color: ${colors.primary[500]};
				}
			`}</style>
		</ThemeProvider>
	);
}
