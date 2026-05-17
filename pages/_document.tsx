import { Head, Html, Main, NextScript } from 'next/document';

const FONTS_URL =
	'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;700&display=swap';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" type="image/png" href="/favicon.png" />
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
				{/* Truque media=print: o browser baixa o CSS sem bloquear render;
				   onload promove pra all e o swap acontece sem FOIT. */}
				<link
					rel="preload"
					as="style"
					href={FONTS_URL}
					// eslint-disable-next-line react/no-unknown-property
					onLoad={
						"this.onload=null;this.rel='stylesheet'" as unknown as React.ReactEventHandler<HTMLLinkElement>
					}
				/>
				<noscript>
					<link rel="stylesheet" href={FONTS_URL} />
				</noscript>
			</Head>
			<body className="antialiased font-inter bg-gray-50 text-gray-500 dark:bg-gray-900 selection:(bg-gray-900 dark:bg-white text-white dark:text-primary-500)">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
