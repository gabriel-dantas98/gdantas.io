import { Layout } from '~/layouts';
import { Animate, List } from '~/components';
import { ListActionType } from '~/types';
import { colors } from '~/lib';
import { Toaster } from 'react-hot-toast';
import type { GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import RemarkCodeTitles from 'remark-code-titles';
import RemarkEmoji from 'remark-emoji';
import RemarkPrism from 'remark-prism';
import RemarkSlug from 'remark-slug';
import RehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Elements as BlogElements } from '~/components/Blog/Styles';
import type { ListAction } from '~/types';

interface PresentationItemRaw {
	title: string;
	icon: string;
	color: string;
	description: string;
	url?: string; // legacy canonical link
	contentUrl?: string; // preferred content link
	githubUrl?: string; // repository link
	date?: string;
	location?: string;
	preview?: {
		type: 'google-slides' | 'youtube' | 'github-readme' | 'spotify' | 'canva';
		// youtube
		youtubeId?: string;
		// google slides
		slidesEmbedUrl?: string;
		// github readme snippet
		readmeMarkdown?: string;
		// spotify
		spotifyEmbedUrl?: string;
		// canva
		canvaEmbedUrl?: string;
	};
}

interface PresentationItem extends Omit<PresentationItemRaw, 'preview'> {
	preview?:
		| { type: 'google-slides'; slidesEmbedUrl: string }
		| { type: 'youtube'; youtubeId: string }
		| { type: 'github-readme'; mdx: MDXRemoteSerializeResult }
		| { type: 'spotify'; spotifyEmbedUrl: string }
		| { type: 'canva'; canvaEmbedUrl: string };
}

interface PresentationsProps {
	presentations?: Array<PresentationItem>;
}

export const getStaticProps: GetStaticProps<PresentationsProps> = async () => {
	const { default: raw } = await import('~/data/presentations.json');

	function extractYouTubeId(link?: string) {
		if (!link) return undefined;
		try {
			const url = new URL(link);
			if (url.hostname.includes('youtu.be'))
				return url.pathname.replace('/', '') || undefined;
			if (url.hostname.includes('youtube.com')) {
				if (url.pathname.startsWith('/embed/'))
					return url.pathname.split('/').pop() || undefined;
				if (url.searchParams.get('v')) return url.searchParams.get('v') || undefined;
			}
		} catch {}
		return undefined;
	}

	function toSpotifyEmbed(link?: string) {
		if (!link) return undefined;
		try {
			const url = new URL(link);
			if (!url.hostname.includes('open.spotify.com')) return undefined;
			const parts = url.pathname.split('/').filter(Boolean);
			const type = parts[0];
			const id = parts[1];
			if (!type || !id) return undefined;
			if (!['episode', 'track', 'show', 'playlist'].includes(type)) return undefined;
			return `https://open.spotify.com/embed/${type}/${id}`;
		} catch {}
		return undefined;
	}

	function toCanvaEmbed(link?: string) {
		if (!link) return undefined;
		try {
			const url = new URL(link);
			if (!url.hostname.includes('canva.com')) return undefined;
			// If already a view?embed link, keep it
			if (url.pathname.includes('/view') && url.search.includes('embed')) {
				return url.toString();
			}
			// Extract /design/{id}/{key?}
			const parts = url.pathname.split('/').filter(Boolean);
			const designIdx = parts.indexOf('design');
			const designId = designIdx >= 0 ? parts[designIdx + 1] : undefined;
			const designKey = designIdx >= 0 ? parts[designIdx + 2] : undefined;
			if (!designId) return undefined;
			return designKey
				? `https://www.canva.com/design/${designId}/${designKey}/view?embed`
				: `https://www.canva.com/design/${designId}/view?embed`;
		} catch {}
		return undefined;
	}

	const presentations: Array<PresentationItem> = [];
	for (const item of raw as Array<PresentationItemRaw>) {
		const contentLink = item.contentUrl || item.url;

		// Derive preview if missing
		if (!item.preview) {
			const yt = extractYouTubeId(contentLink);
			if (yt) {
				presentations.push({ ...item, preview: { type: 'youtube', youtubeId: yt } });
				continue;
			}
			const sp = toSpotifyEmbed(contentLink);
			if (sp) {
				presentations.push({ ...item, preview: { type: 'spotify', spotifyEmbedUrl: sp } });
				continue;
			}
			const cv = toCanvaEmbed(contentLink);
			if (cv) {
				presentations.push({ ...item, preview: { type: 'canva', canvaEmbedUrl: cv } });
				continue;
			}
			presentations.push(item as PresentationItem);
			continue;
		}

		// Normalize provided preview data
		if (item.preview.type === 'github-readme' && item.preview.readmeMarkdown) {
			const mdx = await serialize(item.preview.readmeMarkdown, {
				mdxOptions: {
					rehypePlugins: [[RehypeAutolinkHeadings as unknown as any, {}]] as any,
					remarkPlugins: [
						RemarkCodeTitles as unknown as any,
						RemarkEmoji as unknown as any,
						RemarkPrism as unknown as any,
						RemarkSlug as unknown as any,
					] as any,
				},
			});
			presentations.push({
				...item,
				preview: { type: 'github-readme', mdx },
			});
			continue;
		}
		if (item.preview.type === 'google-slides') {
			const slidesEmbedUrl = item.preview.slidesEmbedUrl || toCanvaEmbed(contentLink);
			if (slidesEmbedUrl) {
				presentations.push({ ...item, preview: { type: 'google-slides', slidesEmbedUrl } });
				continue;
			}
		}
		if (item.preview.type === 'youtube') {
			const youtubeId = item.preview.youtubeId || extractYouTubeId(contentLink);
			if (youtubeId) {
				presentations.push({ ...item, preview: { type: 'youtube', youtubeId } });
				continue;
			}
		}
		if (item.preview.type === 'spotify') {
			const spotifyEmbedUrl = item.preview.spotifyEmbedUrl || toSpotifyEmbed(contentLink);
			if (spotifyEmbedUrl) {
				presentations.push({ ...item, preview: { type: 'spotify', spotifyEmbedUrl } });
				continue;
			}
		}
		if (item.preview.type === 'canva') {
			const canvaEmbedUrl = item.preview.canvaEmbedUrl || toCanvaEmbed(contentLink);
			if (canvaEmbedUrl) {
				presentations.push({ ...item, preview: { type: 'canva', canvaEmbedUrl } });
				continue;
			}
		}

		presentations.push(item as PresentationItem);
	}

	return {
		props: {
			presentations,
		},
	};
};

function Preview({ presentation }: { presentation: PresentationItem }) {
	if (!presentation.preview) return null;
	if (presentation.preview.type === 'google-slides') {
		return (
			<div className="mt-4 w-full">
				<div className="w-full h-64 sm:h-80 md:h-96">
					<iframe
						className="w-full h-full rounded-lg border-2 border-gray-200 dark:border-gray-700"
						src={presentation.preview.slidesEmbedUrl}
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			</div>
		);
	}
	if (presentation.preview.type === 'youtube') {
		return (
			<div className="mt-4 w-full">
				<div className="w-full h-64 sm:h-80 md:h-96">
					<iframe
						className="w-full h-full rounded-lg border-2 border-gray-200 dark:border-gray-700"
						src={`https://www.youtube-nocookie.com/embed/${presentation.preview.youtubeId}`}
						title={presentation.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			</div>
		);
	}
	if (presentation.preview.type === 'spotify') {
		return (
			<div className="mt-4 w-full">
				<div className="w-full" style={{ height: 352 }}>
					<iframe
						className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700"
						src={presentation.preview.spotifyEmbedUrl}
						title={`${presentation.title} - Spotify embed`}
						frameBorder={0}
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						allowFullScreen
						loading="lazy"
					/>
				</div>
			</div>
		);
	}
	if (presentation.preview.type === 'canva') {
		return (
			<div className="mt-4 w-full">
				<div className="w-full h-64 sm:h-80 md:h-96">
					<iframe
						className="w-full h-full rounded-lg border-2 border-gray-200 dark:border-gray-700"
						src={presentation.preview.canvaEmbedUrl}
						allowFullScreen
						allow="clipboard-write"
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			</div>
		);
	}
	if (presentation.preview.type === 'github-readme') {
		return (
			<div className="mt-4 w-full">
				<div className="max-w-none prose dark:prose-invert">
					<BlogElements />
					<MDXRemote {...presentation.preview.mdx} />
				</div>
			</div>
		);
	}
	return null;
}

export default function PresentationsPage({ presentations }: PresentationsProps) {
	return (
		<Layout.Default seo={{ title: 'gdantas ─ presentations' }}>
			<Toaster
				toastOptions={{
					position: 'bottom-right',
					style: {
						background: colors.gray[900],
						borderColor: colors.gray[800],
						borderWidth: '2px',
						color: colors?.gray[700],
					},
				}}
			/>
			<div className="mx-2 my-24 sm:mx-6 lg:mb-28 lg:mx-8">
				<div className="relative mx-auto max-w-4xl">
					<List.Container>
						{presentations?.map((p, index) => (
							<Animate
								animation={{ y: [50, 0], opacity: [0, 1] }}
								key={index}
								transition={{ delay: 0.1 * index }}>
								{(() => {
									const actions: Array<ListAction> = [];
									const contentLink = p.contentUrl || p.url;
									if (contentLink) {
										actions.push({
											type: ListActionType.LINK,
											icon: 'feather:external-link',
											label: `${p.title} conteúdo`,
											href: contentLink,
										});
									}
									if (p.githubUrl && p.githubUrl !== contentLink) {
										actions.push({
											type: ListActionType.LINK,
											icon: 'feather:github',
											label: `${p.title} GitHub`,
											href: p.githubUrl,
										});
									}
									return (
										<List.Item
											actions={actions}
											description={[p.description, p.location, p.date]
												.filter(Boolean)
												.join(' • ')}
											icon={p.icon}
											iconColor={p.color}
											title={p.title}>
											<Preview presentation={p} />
										</List.Item>
									);
								})()}
							</Animate>
						))}
					</List.Container>
				</div>
			</div>
		</Layout.Default>
	);
}
