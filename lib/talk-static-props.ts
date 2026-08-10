import type { GetStaticPaths, GetStaticProps } from 'next';

import { loadPresentations, type PresentationItem } from '~/lib/presentations-static-props';

export interface TalkPageProps {
	presentation: PresentationItem;
}

export const getTalkStaticPaths: GetStaticPaths<{ slug: string }> = async () => ({
	paths: (await loadPresentations()).map((item) => ({
		params: { slug: item.slug! },
	})),
	fallback: false,
});

export const getTalkStaticProps: GetStaticProps<TalkPageProps, { slug: string }> = async ({
	params,
}) => {
	const presentation = (await loadPresentations()).find((item) => item.slug === params?.slug);
	return presentation ? { props: { presentation } } : { notFound: true };
};
