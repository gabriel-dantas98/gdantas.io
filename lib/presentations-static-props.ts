import type { GetStaticProps } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import RemarkCodeTitles from 'remark-code-titles';
import RemarkEmoji from 'remark-emoji';
import RemarkPrism from 'remark-prism';
import RemarkSlug from 'remark-slug';
import RehypeAutolinkHeadings from 'rehype-autolink-headings';

import presentationsData from '~/data/presentations.json';

interface PresentationItemRaw {
	slug?: string;
	title: string;
	icon: string;
	color: string;
	description: string;
	url?: string;
	contentUrl?: string;
	githubUrl?: string;
	date?: string;
	location?: string;
	preview?: {
		type: 'google-slides' | 'youtube' | 'github-readme' | 'spotify' | 'canva' | 'pdf';
		youtubeId?: string;
		slidesEmbedUrl?: string;
		readmeMarkdown?: string;
		spotifyEmbedUrl?: string;
		canvaEmbedUrl?: string;
		pdfUrl?: string;
	};
}

export interface PresentationItem extends Omit<PresentationItemRaw, 'preview'> {
	preview?:
		| { type: 'google-slides'; slidesEmbedUrl: string }
		| { type: 'youtube'; youtubeId: string }
		| { type: 'github-readme'; mdx: MDXRemoteSerializeResult }
		| { type: 'spotify'; spotifyEmbedUrl: string }
		| { type: 'canva'; canvaEmbedUrl: string }
		| { type: 'pdf'; pdfUrl: string };
}

export interface PresentationsProps {
	presentations: PresentationItem[];
}

function extractYouTubeId(link?: string) {
	if (!link) return undefined;
	try {
		const url = new URL(link);
		if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '') || undefined;
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
		if (url.pathname.includes('/view') && url.search.includes('embed')) {
			return url.toString();
		}
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

export async function loadPresentations(): Promise<PresentationItem[]> {
	const raw = presentationsData as PresentationItemRaw[];
	const seenSlugs = new Set<string>();
	for (const item of raw) {
		if (!item.slug) {
			throw new Error(`Presentation "${item.title}" is missing a slug`);
		}
		if (seenSlugs.has(item.slug)) {
			throw new Error(`Duplicate presentation slug: "${item.slug}"`);
		}
		seenSlugs.add(item.slug);
	}

	const presentations: PresentationItem[] = [];
	for (const item of raw as PresentationItemRaw[]) {
		const contentLink = item.contentUrl || item.url;

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
			presentations.push({ ...item, preview: { type: 'github-readme', mdx } });
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
			const canvaEmbedUrl = toCanvaEmbed(item.preview.canvaEmbedUrl || contentLink);
			if (canvaEmbedUrl) {
				presentations.push({ ...item, preview: { type: 'canva', canvaEmbedUrl } });
				continue;
			}
		}
		if (item.preview.type === 'pdf') {
			const pdfUrl = item.preview.pdfUrl || contentLink;
			if (pdfUrl) {
				presentations.push({ ...item, preview: { type: 'pdf', pdfUrl } });
				continue;
			}
		}

		presentations.push(item as PresentationItem);
	}

	return presentations;
}

export const getStaticProps: GetStaticProps<PresentationsProps> = async () => {
	return { props: { presentations: await loadPresentations() } };
};
