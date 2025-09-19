import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

interface RedirectItem {
	source: string;
	destination: string;
}

interface RedirectsYaml {
	redirects: RedirectItem[];
}

interface RedirectPageProps {
	destination: string | null;
}

const RedirectPage: NextPage<RedirectPageProps> = ({ destination }) => {
	if (!destination) {
		return null;
	}

	return (
		<>
			<Head>
				<title>Redirecting…</title>
				<meta httpEquiv="refresh" content={`0; url=${destination}`} />
			</Head>
			<a href={destination}>Redirecting…</a>
			<script
				dangerouslySetInnerHTML={{
					__html: `window.location.replace(${JSON.stringify(destination)});`,
				}}
			/>
		</>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	const file = path.join(process.cwd(), 'data', 'redirects.yaml');
	const text = fs.readFileSync(file, 'utf8');
	const data = yaml.load(text) as RedirectsYaml | undefined;
	const items = data?.redirects ?? [];
	const paths = items
		.filter((r) => r.source.startsWith('/links/'))
		.map((r) => ({ params: { slug: r.source.replace(/^\/links\//, '') } }));

	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<RedirectPageProps> = async ({ params }) => {
	const slug = String(params?.slug ?? '');
	const file = path.join(process.cwd(), 'data', 'redirects.yaml');
	const text = fs.readFileSync(file, 'utf8');
	const data = yaml.load(text) as RedirectsYaml | undefined;
	const items = data?.redirects ?? [];
	const match = items.find((r) => r.source === `/links/${slug}`);

	return {
		props: {
			destination: match?.destination ?? null,
		},
		revalidate: 60,
	};
};

export default RedirectPage;
