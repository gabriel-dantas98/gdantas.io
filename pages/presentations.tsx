import React from 'react';
import type { GetStaticProps } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import RemarkCodeTitles from 'remark-code-titles';
import RemarkEmoji from 'remark-emoji';
import RemarkPrism from 'remark-prism';
import RemarkSlug from 'remark-slug';
import RehypeAutolinkHeadings from 'rehype-autolink-headings';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { Elements as BlogElements } from '~/components/Blog/Styles';


interface PresentationItemRaw {
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

interface PresentationItem extends Omit<PresentationItemRaw, 'preview'> {
	preview?:
		| { type: 'google-slides'; slidesEmbedUrl: string }
		| { type: 'youtube'; youtubeId: string }
		| { type: 'github-readme'; mdx: MDXRemoteSerializeResult }
		| { type: 'spotify'; spotifyEmbedUrl: string }
		| { type: 'canva'; canvaEmbedUrl: string }
		| { type: 'pdf'; pdfUrl: string };
}

interface PresentationsProps {
	presentations: PresentationItem[];
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

	return { props: { presentations } };
};

function TalkPreview({ presentation }: { presentation: PresentationItem }) {
	if (!presentation.preview) return null;
	const frame: React.CSSProperties = {
		width: '100%',
		height: '100%',
		border: 0,
		background: OP.bg2,
	};
	const wrap: React.CSSProperties = {
		marginTop: 16,
		width: '100%',
		aspectRatio: '16 / 9',
		border: `1px solid ${OP.rule2}`,
		background: OP.bg2,
		position: 'relative',
	};
	const chrome = (
		<div
			style={{
				position: 'absolute',
				top: -1,
				left: -1,
				fontFamily: OP.font,
				fontSize: 10,
				color: OP.amber,
				padding: '3px 9px',
				background: OP.bg,
				border: `1px solid ${OP.rule2}`,
				zIndex: 2,
				letterSpacing: '0.08em',
			}}>
			PREVIEW · {presentation.preview.type.toUpperCase()}
		</div>
	);

	switch (presentation.preview.type) {
		case 'google-slides':
			return (
				<div style={wrap}>
					{chrome}
					<iframe
						style={frame}
						src={presentation.preview.slidesEmbedUrl}
						title={presentation.title}
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			);
		case 'youtube':
			return (
				<div style={wrap}>
					{chrome}
					<iframe
						style={frame}
						src={`https://www.youtube-nocookie.com/embed/${presentation.preview.youtubeId}`}
						title={presentation.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			);
		case 'spotify':
			return (
				<div style={{ ...wrap, aspectRatio: 'auto', height: 232 }}>
					{chrome}
					<iframe
						style={frame}
						src={presentation.preview.spotifyEmbedUrl}
						title={`${presentation.title} - Spotify`}
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						allowFullScreen
						loading="lazy"
					/>
				</div>
			);
		case 'canva':
			return (
				<div style={wrap}>
					{chrome}
					<iframe
						style={frame}
						src={presentation.preview.canvaEmbedUrl}
						title={presentation.title}
						allowFullScreen
						allow="clipboard-write"
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			);
		case 'pdf':
			return (
				<div style={wrap}>
					{chrome}
					<iframe
						style={frame}
						src={presentation.preview.pdfUrl}
						title={presentation.title}
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
						loading="lazy"
					/>
				</div>
			);
		case 'github-readme':
			return (
				<div
					style={{
						marginTop: 16,
						padding: '20px 22px',
						border: `1px solid ${OP.rule2}`,
						background: OP.bg2,
						position: 'relative',
					}}>
					{chrome}
					<div className="prose prose-sm dark:prose-invert" style={{ marginTop: 14 }}>
						<BlogElements />
						<MDXRemote {...presentation.preview.mdx} />
					</div>
				</div>
			);
		default:
			return null;
	}
}

export default function PresentationsPage({ presentations }: PresentationsProps) {
	const ref = useReveal({ stagger: 0.05, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ presentations"
			description="Apresentações com preview embeddado — slides, vídeos, podcasts."
			active="/talks">
			<div ref={ref}>
				<Sec
					label="01"
					title="ls ~/talks --preview"
					sub="cada talk com preview embeddado"
				/>

				<div
					style={{
						marginTop: 32,
						display: 'grid',
						gap: 22,
					}}>
					{presentations.map((p, i) => {
						const contentLink = p.contentUrl || p.url;
						return (
							<article
								key={`${p.title}-${i}`}
								style={{
									border: `1px solid ${OP.rule}`,
									background: 'rgba(17,14,27,0.65)',
									padding: '22px 26px',
								}}>
								<header
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										gap: 18,
										alignItems: 'baseline',
										flexWrap: 'wrap',
									}}>
									<div style={{ minWidth: 0, flex: 1 }}>
										<div
											style={{
												fontFamily: OP.font,
												fontSize: 11,
												color: OP.dim,
												letterSpacing: '0.08em',
											}}>
											{[p.date, p.location].filter(Boolean).join(' · ') || '— · —'}
										</div>
										<h3
											style={{
												margin: '6px 0 0',
												fontFamily: OP.font,
												fontSize: 17,
												color: OP.fg,
												fontWeight: 500,
												lineHeight: 1.35,
											}}>
											{p.title}
										</h3>
										<p
											style={{
												margin: '8px 0 0',
												fontFamily: OP.sans,
												fontSize: 14,
												color: OP.dim,
												lineHeight: 1.55,
												maxWidth: 720,
											}}>
											{p.description}
										</p>
									</div>
									<div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
										{contentLink && (
											<a
												href={contentLink}
												target="_blank"
												rel="noreferrer noopener"
												style={{
													fontFamily: OP.font,
													fontSize: 11,
													color: OP.amber,
													border: `1px solid ${OP.amber}`,
													padding: '4px 10px',
													textDecoration: 'none',
													letterSpacing: '0.08em',
												}}>
												./play ↗
											</a>
										)}
										{p.githubUrl && p.githubUrl !== contentLink && (
											<a
												href={p.githubUrl}
												target="_blank"
												rel="noreferrer noopener"
												style={{
													fontFamily: OP.font,
													fontSize: 11,
													color: OP.violet,
													border: `1px solid ${OP.violet}`,
													padding: '4px 10px',
													textDecoration: 'none',
													letterSpacing: '0.08em',
												}}>
												./src ↗
											</a>
										)}
									</div>
								</header>
								<TalkPreview presentation={p} />
							</article>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/talks">
						ls --preview | wc -l →{' '}
						<span style={{ color: OP.amber }}>{presentations.length} entries</span>
					</Prompt>
				</div>
			</div>
		</OperatorPage>
	);
}
