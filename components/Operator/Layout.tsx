import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { OP } from './tokens';
import { OperatorHeader } from './Header';
import { OperatorFooter } from './Footer';
import { useI18n } from '~/lib/i18n';
import { StructuredData } from '~/components/Seo/StructuredData';
import { alternateUrls, canonicalUrl } from '~/lib/site-metadata';

interface OperatorPageProps {
	title: string;
	description?: string;
	active?: string;
	noIndex?: boolean;
	structuredData?: object | object[];
	openGraphType?: 'website' | 'article';
	socialImage?: string;
	jsonLd?: Record<string, unknown>;
	children: React.ReactNode;
}

const DEFAULT_DESC = "Hey 👋 I'm Gabriel, a site reliability engineer";
const DEFAULT_OG_IMAGE = 'https://gdantas.com.br/og/default.png';

// Layout padrão das páginas Operator: NextSeo (OG + twitter + canonical) +
// Head (theme-color) + header sticky + main + footer. Fontes vêm do
// _document.tsx (carregam uma vez por origem). GSAP é carregado via
// dynamic import no _app.tsx (lib/gsap-loader.ts), não mais via <Script> CDN.
export function OperatorPage({
	title,
	description = DEFAULT_DESC,
	active,
	noIndex,
	structuredData,
	openGraphType = 'website',
	socialImage = DEFAULT_OG_IMAGE,
	jsonLd,
	children,
}: OperatorPageProps) {
	const router = useRouter();
	const { locale } = useI18n();
	const url = canonicalUrl(router.asPath);
	const languageAlternates = alternateUrls(router.asPath);

	return (
		<>
			<NextSeo
				title={title}
				description={description}
				canonical={url}
				noindex={noIndex}
				openGraph={{
					title,
					description,
					url,
					locale: locale === 'en' ? 'en_US' : 'pt_BR',
					type: openGraphType,
					site_name: 'gdantas',
					images: [{ url: socialImage, alt: title, width: 1200, height: 630 }],
				}}
				twitter={{
					cardType: 'summary_large_image',
					handle: '@gdantas',
					site: '@gdantas',
				}}
				languageAlternates={noIndex ? [] : languageAlternates}
				additionalMetaTags={[
					{ name: 'theme-color', content: OP.bg },
					{ name: 'author', content: 'Gabriel Dantas' },
				]}
			/>
			<Head>
				{jsonLd && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
						}}
					/>
				)}
				<style>{`
					html, body { background: ${OP.bg}; scroll-behavior: smooth; }
					body { font-family: ${OP.sans}; color: ${OP.fg}; margin: 0; }
					@keyframes op-blink { 50% { opacity: 0 } }
					.op-nav-link { transition: color 120ms ease; }
					.op-nav-link:hover { color: ${OP.amber} !important; }
				`}</style>
			</Head>
			{structuredData && <StructuredData data={structuredData} />}
			<div
				style={{
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.sans,
				}}
			>
				<OperatorHeader active={active} />
				<main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 0' }}>
					{children}
				</main>
				<OperatorFooter />
			</div>
		</>
	);
}
