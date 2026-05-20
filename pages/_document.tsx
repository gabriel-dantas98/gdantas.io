import Document, {
	DocumentContext,
	DocumentInitialProps,
	Head,
	Html,
	Main,
	NextScript,
} from 'next/document';

interface Props extends DocumentInitialProps {
	htmlLang: 'pt' | 'en';
}

// Pega o locale do path no SSR pra emitir <html lang> correto pra search
// engines. Pages /en/* → "en"; resto → "pt". Client-side, o I18nProvider
// continua atualizando document.documentElement.lang quando o usuário troca.
class MyDocument extends Document<Props> {
	static async getInitialProps(ctx: DocumentContext): Promise<Props> {
		const initialProps = await Document.getInitialProps(ctx);
		const pathname = ctx.pathname || '';
		const htmlLang: 'pt' | 'en' = pathname.startsWith('/en') ? 'en' : 'pt';
		return { ...initialProps, htmlLang };
	}

	render() {
		const lang = this.props.htmlLang;
		return (
			<Html lang={lang}>
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
}

export default MyDocument;
