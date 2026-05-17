import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { OP } from './tokens';
import { OperatorHeader } from './Header';
import { OperatorFooter } from './Footer';

interface OperatorPageProps {
	title: string;
	description?: string;
	active?: string;
	noIndex?: boolean;
	children: React.ReactNode;
}

const SITE_URL = 'https://gdantas.com.br';
const DEFAULT_DESC = "Hey 👋 I'm Gabriel, a site reliability engineer";
const OG_IMAGE = 'https://gdantas.com.br/banner.png';

// Layout padrão das páginas Operator: NextSeo (OG + twitter + canonical) +
// Head (theme-color) + header sticky + main + footer. Fontes vêm do
// _document.tsx (carregam uma vez por origem). GSAP é carregado via
// dynamic import no _app.tsx (lib/gsap-loader.ts), não mais via <Script> CDN.
export function OperatorPage({
	title,
	description = DEFAULT_DESC,
	active,
	noIndex,
	children,
}: OperatorPageProps) {
	const router = useRouter();
	const url = `${SITE_URL}${router.asPath === '/' ? '' : router.asPath}`;

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
					type: 'website',
					site_name: 'gdantas',
					images: [
						{ url: OG_IMAGE, alt: description, width: 1280, height: 720 },
					],
				}}
				twitter={{
					cardType: 'summary_large_image',
					handle: '@gdantas',
					site: '@gdantas',
				}}
				additionalMetaTags={[
					{ name: 'theme-color', content: OP.bg },
					{ name: 'author', content: 'Gabriel Dantas' },
				]}
			/>
			<Head>
				<style>{`
					html, body { background: ${OP.bg}; scroll-behavior: smooth; }
					body { font-family: ${OP.sans}; color: ${OP.fg}; margin: 0; }
					@keyframes op-blink { 50% { opacity: 0 } }
					.op-nav-link { transition: color 120ms ease; }
					.op-nav-link:hover { color: ${OP.amber} !important; }
				`}</style>
			</Head>
			<div
				style={{
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.sans,
				}}>
				<OperatorHeader active={active} />
				<main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 0' }}>
					{children}
				</main>
				<OperatorFooter />
			</div>
		</>
	);
}
