import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';

import type { ComponentProps } from 'react';

export function useSeoProps(
	props: Partial<ComponentProps<typeof NextSeo>> = {},
): Partial<ComponentProps<typeof NextSeo>> {
	const router = useRouter();

	const title = 'gdantas ─ site reliability engineer';
	const description = "Hey 👋 I'm Gabriel, a site reliability engineer";

	return {
		title,
		description,
		canonical: `https://gdantas.io/${router.asPath}`,
		openGraph: {
			title,
			description,
			site_name: 'gdantas',
			url: `https://gdantas.io/${router.asPath}`,
			type: 'website',
			images: [
				{
					url: 'https://gdantas.io/banner.png',
					alt: description,
					width: 1280,
					height: 720,
				},
			],
		},
		twitter: {
			cardType: 'summary_large_image',
			handle: '@gdantas',
			site: '@gdantas',
		},
		...props,
	};
}
