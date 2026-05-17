import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" type="image/png" href="/favicon.png" />
				{/* Preconnect + preload das fontes para encurtar LCP. Sem media trick:
				    o display=swap garante swap rápido com fallback. */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="preconnect"
					href="https://cdn.simpleicons.org"
					crossOrigin="anonymous"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;700&display=swap"
				/>
			</Head>
			<body className="antialiased font-inter bg-gray-50 text-gray-500 dark:bg-gray-900 selection:(bg-gray-900 dark:bg-white text-white dark:text-primary-500)">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
