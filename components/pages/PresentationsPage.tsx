import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import posthog from 'posthog-js';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { Elements as BlogElements } from '~/components/Blog/Styles';
import type { PresentationItem, PresentationsProps } from '~/lib/presentations-static-props';
import { I18nProvider, useI18n, useT } from '~/lib/i18n';
import { resolveTalkCopy } from '~/lib/talk-copy';
import { buildCollectionPage } from '~/lib/structured-data';

function TalkPreview({
	presentation,
	title,
}: {
	presentation: PresentationItem;
	title: string;
}) {
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
						title={title}
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
						title={title}
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
						title={`${title} - Spotify`}
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
						title={title}
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
						title={title}
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

export function PresentationsPage({ presentations, locale = 'pt' }: PresentationsProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<PresentationsPageInner presentations={presentations} />
		</I18nProvider>
	);
}

function PresentationsPageInner({ presentations }: { presentations: PresentationItem[] }) {
	const t = useT();
	const { locale } = useI18n();
	const ref = useReveal({ stagger: 0.05, y: 18 });
	const path = locale === 'en' ? '/en/presentations' : '/presentations';
	const collectionItems = presentations.map((presentation) => ({
		name: resolveTalkCopy(t, presentation.slug, {
			title: presentation.title,
			description: presentation.description,
		}).title,
		url: path,
	}));
	return (
		<OperatorPage
			title={t('seo.presentations.title')}
			description={t('seo.presentations.description')}
			structuredData={buildCollectionPage({
				locale,
				path,
				name: t('seo.presentations.title'),
				description: t('seo.presentations.description'),
				items: collectionItems,
			})}
			active="/talks">
			<div ref={ref}>
				<Sec
					as="h1"
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
						const copy = resolveTalkCopy(t, p.slug, {
							title: p.title,
							description: p.description,
						});
						return (
							<article
								key={`${p.title}-${i}`}
								id={p.slug}
								style={{
									border: `1px solid ${OP.rule}`,
									background: 'rgba(17,14,27,0.65)',
									padding: '22px 26px',
									scrollMarginTop: 80,
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
											{copy.title}
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
											{copy.description}
										</p>
									</div>
									<div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
										{contentLink && (
											<a
												href={contentLink}
												target="_blank"
												rel="noreferrer noopener"
												onClick={() =>
													posthog.capture('presentation_played', {
														title: copy.title,
														preview_type: p.preview?.type,
													})
												}
												style={{
													fontFamily: OP.font,
													fontSize: 11,
													color: OP.amber,
													border: `1px solid ${OP.amber}`,
													padding: '4px 10px',
													textDecoration: 'none',
													letterSpacing: '0.08em',
												}}>
												{t('common.play')}
											</a>
										)}
										{p.githubUrl && p.githubUrl !== contentLink && (
											<a
												href={p.githubUrl}
												target="_blank"
												rel="noreferrer noopener"
												onClick={() =>
													posthog.capture('presentation_src_opened', {
														title: copy.title,
													})
												}
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
								<TalkPreview presentation={p} title={copy.title} />
							</article>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/talks">
						ls --preview | wc -l →{' '}
						<span style={{ color: OP.amber }}>
							{presentations.length} {t('talks.footerEntries')}
						</span>
					</Prompt>
				</div>
			</div>
		</OperatorPage>
	);
}
