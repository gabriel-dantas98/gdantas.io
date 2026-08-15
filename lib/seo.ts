import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import type { ComponentProps } from 'react';

import { detectLocaleFromPath } from './i18n';
import { alternateUrls, canonicalUrl } from './site-metadata';

const SITE_NAME = 'gdantas';
const OG_IMAGE = 'https://gdantas.com.br/og/default.png';

const COPY = {
	pt: {
		title: 'gdantas — platform engineer · devex',
		description:
			'Gabriel Dantas — platform engineering e developer experience. Internal Developer Portals, Backstage, Kubernetes, AI ops, observabilidade e RAG sobre infra.',
		locale: 'pt_BR',
		keywords: [
			'platform engineering',
			'developer experience',
			'devex',
			'internal developer portal',
			'backstage',
			'kubernetes',
			'site reliability engineering',
			'sre',
			'devops',
			'ai ops',
			'mcp',
			'rag',
			'observabilidade',
			'gabriel dantas',
		],
	},
	en: {
		title: 'gdantas — platform engineer · devex',
		description:
			'Gabriel Dantas — platform engineering and developer experience. Internal Developer Portals, Backstage, Kubernetes, AI ops, observability and RAG over infrastructure.',
		locale: 'en_US',
		keywords: [
			'platform engineering',
			'developer experience',
			'devex',
			'internal developer portal',
			'backstage',
			'kubernetes',
			'site reliability engineering',
			'sre',
			'devops',
			'ai ops',
			'mcp',
			'rag',
			'observability',
			'gabriel dantas',
		],
	},
} as const;

export function useSeoProps(
	props: Partial<ComponentProps<typeof NextSeo>> = {},
): Partial<ComponentProps<typeof NextSeo>> {
	const router = useRouter();
	const locale = detectLocaleFromPath(router.asPath);
	const copy = COPY[locale];
	const title = props.title || copy.title;
	const description = props.description || copy.description;
	const canonical = canonicalUrl(router.asPath);

	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			site_name: SITE_NAME,
			url: canonical,
			type: 'website',
			locale: copy.locale,
			images: [
				{
					url: OG_IMAGE,
					alt: description,
					width: 1200,
					height: 630,
					type: 'image/png',
				},
			],
		},
		languageAlternates: alternateUrls(router.asPath),
		additionalMetaTags: [
			{ name: 'keywords', content: copy.keywords.join(', ') },
			{ name: 'author', content: 'Gabriel Dantas' },
			{ name: 'application-name', content: SITE_NAME },
			{ name: 'theme-color', content: '#0b0a13' },
			{ name: 'color-scheme', content: 'dark' },
			{
				name: 'robots',
				content: 'index, follow, max-image-preview:large, max-snippet:-1',
			},
			{
				property: 'og:locale:alternate',
				content: locale === 'pt' ? 'en_US' : 'pt_BR',
			},
			{ httpEquiv: 'x-ua-compatible', content: 'IE=edge' },
		],
		...props,
	};
}
