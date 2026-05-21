import React, { useEffect, useRef, useState } from 'react';

import { OP } from './tokens';

export type Talk = {
	date: string;
	event: string;
	loc: string;
	kind: 'video' | 'slides' | 'slides+code';
	slug: string;
	title: string;
	preview: string;
	runtime?: string;
	slides?: number;
	youtubeId?: string;
	slidesEmbed?: string;
	canvaEmbed?: string;
	pdfUrl?: string;
	href: string;
	links: Array<[string, string]>;
};

// IntersectionObserver pra montar iframes só quando o card chega perto da
// viewport. Evita baixar megabytes de embed Google Slides/Canva/PDF no LCP.
function useNearViewport<T extends HTMLElement>(margin = '300px') {
	const ref = useRef<T | null>(null);
	const [near, setNear] = useState(false);
	useEffect(() => {
		if (near || !ref.current || typeof IntersectionObserver === 'undefined') return;
		const el = ref.current;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setNear(true);
						io.disconnect();
						return;
					}
				}
			},
			{ rootMargin: margin },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [near, margin]);
	return { ref, near };
}

// Preview "CRT frame" usado no home. Renderiza:
// - youtubeId → thumb leve (img.youtube.com)
// - slidesEmbed/canvaEmbed/pdfUrl → iframe lazy (só monta quando perto da
//   viewport, via IntersectionObserver)
// - senão → texto do preview
//
// Iframe fica com pointer-events:none pro clique propagar pro <a> que envolve
// o card (vai pra /presentations#slug).
export function TalkPreview({ talk }: { talk: Talk }) {
	const isVideo = talk.kind === 'video';
	const accent = isVideo ? OP.ok : OP.amber;
	const thumb = talk.youtubeId
		? `https://img.youtube.com/vi/${talk.youtubeId}/hqdefault.jpg`
		: null;
	const embed = talk.slidesEmbed || talk.canvaEmbed || talk.pdfUrl || null;
	const { ref: hostRef, near } = useNearViewport<HTMLDivElement>();
	return (
		<div
			ref={hostRef}
			style={{
				aspectRatio: '16/9',
				background: '#06080a',
				position: 'relative',
				borderBottom: `1px solid ${OP.rule2}`,
				overflow: 'hidden',
			}}>
			{thumb && (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={thumb}
					alt={talk.title}
					loading="lazy"
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: 'brightness(0.55) saturate(0.8)',
					}}
				/>
			)}
			{!thumb && embed && near && (
				<iframe
					src={embed}
					title={talk.title}
					loading="lazy"
					allow="autoplay; encrypted-media; fullscreen"
					sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						border: 'none',
						pointerEvents: 'none',
						filter: 'brightness(0.85)',
					}}
				/>
			)}
			{!thumb && embed && !near && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'grid',
						placeItems: 'center',
						background: `repeating-linear-gradient(135deg, ${OP.bg2} 0 12px, ${OP.bg3} 12px 24px)`,
						color: OP.dim,
						fontFamily: OP.font,
						fontSize: 11,
						letterSpacing: '0.1em',
					}}>
					[ ./loading ↗ ]
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					opacity: thumb || embed ? 0.35 : 0.6,
					backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.025) 2px 3px), radial-gradient(ellipse at center, ${accent}11 0%, transparent 65%)`,
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					padding: '8px 12px',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontFamily: OP.font,
					fontSize: 11,
					color: OP.dim,
					background: 'rgba(0,0,0,0.65)',
					borderBottom: `1px solid ${OP.rule}`,
				}}>
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.pager }} />
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.amber }} />
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.ok }} />
				<span style={{ marginLeft: 6 }}>
					{isVideo ? '~/talks/video' : '~/talks/slides'} · {talk.slug}
				</span>
				<span style={{ marginLeft: 'auto', color: accent }}>
					{isVideo ? '▸ video' : '▤ deck'}
				</span>
			</div>
			{!thumb && !embed && (
				<div
					style={{
						position: 'absolute',
						inset: '40px 26px 56px',
						display: 'flex',
						alignItems: 'center',
					}}>
					<div
						style={{
							fontFamily: OP.font,
							fontSize: 16,
							color: OP.fg,
							lineHeight: 1.3,
							maxWidth: '94%',
						}}>
						<span style={{ color: accent }}>›</span> {talk.preview}
					</div>
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					padding: '8px 12px',
					display: 'flex',
					justifyContent: 'space-between',
					fontFamily: OP.font,
					fontSize: 11,
					color: OP.dim,
					background: 'rgba(0,0,0,0.65)',
					borderTop: `1px solid ${OP.rule}`,
				}}>
				<span>{talk.date}</span>
				<span>{talk.runtime || (isVideo ? '—:—' : `${talk.slides || '∞'} slides`)}</span>
			</div>
			<div
				style={{
					position: 'absolute',
					right: 18,
					bottom: 36,
					width: 44,
					height: 44,
					borderRadius: 99,
					border: `1px solid ${accent}`,
					color: accent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'rgba(0,0,0,0.65)',
					fontSize: 16,
				}}>
				{isVideo ? '▶' : '↗'}
			</div>
		</div>
	);
}
