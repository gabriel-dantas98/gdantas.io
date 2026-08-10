import React from 'react';
import { MDXRemote } from 'next-mdx-remote';

import { Elements as BlogElements } from '~/components/Blog/Styles';
import type { PresentationItem } from '~/lib/presentations-static-props';
import { OP } from './tokens';

export function PresentationPreview({ presentation }: { presentation: PresentationItem }) {
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
			}}
		>
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
					}}
				>
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
