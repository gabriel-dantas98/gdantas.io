import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" type="image/png" href="/favicon.png" />
				{/* Fontes IBM Plex Mono + Sans self-hosted via next/font/google
				   (lib/fonts.ts) — zero render-blocking, zero requests ao gstatic. */}
				<link
					rel="preconnect"
					href="https://cdn.simpleicons.org"
					crossOrigin="anonymous"
				/>
			</Head>
			<body className="antialiased font-inter bg-gray-50 text-gray-500 dark:bg-gray-900 selection:(bg-gray-900 dark:bg-white text-white dark:text-primary-500)">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
