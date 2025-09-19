import { NextSeo } from 'next-seo';

import { useSeoProps } from '~/lib';
import { useI18n } from '~/lib/i18n';

import type { WithChildren, WithProps } from '~/types';

interface DefaultLayoutProps extends WithChildren {
	seo?: Partial<WithProps<typeof NextSeo>>;
}

export function ErrorLayout({ children, seo }: DefaultLayoutProps) {
	const { t } = useI18n();
	const seoProps = useSeoProps({
		title: t('error.seo_title'),
		...seo,
	});

	return (
		<>
			<NextSeo {...seoProps} />
			<main className="flex flex-col justify-center px-8">
				<div className="relative h-screen pt-24 sm:pt-16 pb-20 px-4 sm:px-6 lg:pb-28 lg:px-8">
					{children}
				</div>
			</main>
		</>
	);
}
