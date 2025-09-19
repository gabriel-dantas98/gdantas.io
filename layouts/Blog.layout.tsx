import { NextSeo } from 'next-seo';

import { Navbar } from '~/components';
import { useSeoProps } from '~/lib';
import { useI18n } from '~/lib/i18n';

import type { ComponentProps, PropsWithChildren } from 'react';

interface BlogLayoutProps {
	seo?: Partial<ComponentProps<typeof NextSeo>>;
}

export function BlogLayout({ children, seo }: PropsWithChildren<BlogLayoutProps>) {
	const { t } = useI18n();
	const seoProps = useSeoProps({
		title: t('blog.seo_title'),
		...seo,
	});

	return (
		<>
			<NextSeo {...seoProps} />
			<Navbar.Standard />
			<main className="flex flex-col justify-center sm:px-8">{children}</main>
		</>
	);
}
