import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

// Self-hosted via next/font/google — sem render-blocking nem requests pro
// gstatic. As CSS vars `--font-mono` e `--font-sans` ficam expostas via
// className aplicado no <body> pelo _app.tsx, e o OP token usa elas.
export const plexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	display: 'swap',
	variable: '--font-mono',
	fallback: ['ui-monospace', 'Menlo', 'monospace'],
	adjustFontFallback: false,
});

export const plexSans = IBM_Plex_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '700'],
	display: 'swap',
	variable: '--font-sans',
	fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const fontVars = `${plexMono.variable} ${plexSans.variable}`;
