import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { loadShortcuts, findShortcut } from '~/lib/shortcuts';

interface RedirectProps {
	url: string;
	slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => ({
	paths: loadShortcuts().map((s) => ({ params: { slug: s.slug } })),
	fallback: false, // qualquer slug fora do YAML cai no 404
});

export const getStaticProps: GetStaticProps<RedirectProps, { slug: string }> = async ({
	params,
}) => {
	const slug = params!.slug;
	const shortcut = findShortcut(slug);
	if (!shortcut) {
		// fallback:false garante que o getStaticPaths gerou tudo, então isso
		// nunca deveria acontecer — defensive throw.
		throw new Error(`go/[slug]: shortcut "${slug}" not found at build time`);
	}
	return { props: { url: shortcut.url, slug } };
};

const GoRedirect: NextPage<RedirectProps> = ({ url, slug }) => (
	<>
		<Head>
			<title>↗ /go/{slug}</title>
			<meta httpEquiv="refresh" content={`0; url=${url}`} />
			<meta name="robots" content="noindex,nofollow" />
		</Head>
		<a href={url}>Redirecting to {url}…</a>
		<script
			dangerouslySetInnerHTML={{
				__html: `window.location.replace(${JSON.stringify(url)});`,
			}}
		/>
	</>
);

export default GoRedirect;
