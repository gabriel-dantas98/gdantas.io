import React from 'react';
import posthog from 'posthog-js';

import {
	OP,
	Sec,
	Prompt,
	OperatorPage,
	PresentationPreview,
	useReveal,
} from '~/components/Operator';
import type { PresentationItem, PresentationsProps } from '~/lib/presentations-static-props';
import { I18nProvider, useT } from '~/lib/i18n';
import { resolveTalkCopy } from '~/lib/talk-copy';

export function PresentationsPage({
	presentations,
	locale = 'pt',
}: PresentationsProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<PresentationsPageInner presentations={presentations} />
		</I18nProvider>
	);
}

function PresentationsPageInner({ presentations }: { presentations: PresentationItem[] }) {
	const t = useT();
	const ref = useReveal({ stagger: 0.05, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ presentations"
			description="Apresentações com preview embeddado — slides, vídeos, podcasts."
			active="/talks"
		>
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
					}}
				>
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
								}}
							>
								<header
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										gap: 18,
										alignItems: 'baseline',
										flexWrap: 'wrap',
									}}
								>
									<div style={{ minWidth: 0, flex: 1 }}>
										<div
											style={{
												fontFamily: OP.font,
												fontSize: 11,
												color: OP.dim,
												letterSpacing: '0.08em',
											}}
										>
											{[p.date, p.location].filter(Boolean).join(' · ') ||
												'— · —'}
										</div>
										<h3
											style={{
												margin: '6px 0 0',
												fontFamily: OP.font,
												fontSize: 17,
												color: OP.fg,
												fontWeight: 500,
												lineHeight: 1.35,
											}}
										>
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
											}}
										>
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
												}}
											>
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
												}}
											>
												./src ↗
											</a>
										)}
									</div>
								</header>
								<PresentationPreview presentation={p} title={copy.title} />
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
