import React from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

import { OP, OperatorPage, PresentationPreview, Prompt } from '~/components/Operator';
import { I18nProvider, useI18n, useT, withLocale } from '~/lib/i18n';
import type { TalkPageProps } from '~/lib/talk-static-props';

const SITE_URL = 'https://gdantas.com.br';

export function TalkPage({
	presentation,
	locale = 'pt',
}: TalkPageProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<TalkPageInner presentation={presentation} />
		</I18nProvider>
	);
}

function TalkPageInner({ presentation }: TalkPageProps) {
	const t = useT();
	const { locale } = useI18n();
	const slug = presentation.slug!;
	const path = withLocale(`/talks/${slug}`, locale);
	const contentLink = presentation.contentUrl || presentation.url;
	const previewType = presentation.preview?.type || 'talk';
	const meta = [presentation.date, presentation.location].filter(Boolean).join(' · ');
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'PresentationDigitalDocument',
		name: presentation.title,
		description: presentation.description,
		datePublished: presentation.date,
		url: `${SITE_URL}${path}`,
		contentUrl: contentLink,
		inLanguage: locale === 'en' ? 'en' : 'pt-BR',
		author: {
			'@type': 'Person',
			name: 'Gabriel Dantas',
			url: SITE_URL,
		},
	};

	return (
		<OperatorPage
			title={`${presentation.title} ─ gdantas`}
			description={presentation.description}
			active="/talks"
			openGraphType="article"
			jsonLd={jsonLd}
		>
			<article>
				<Link
					href={withLocale('/talks', locale)}
					style={{
						fontFamily: OP.font,
						fontSize: 12,
						color: OP.amber,
						textDecoration: 'none',
						letterSpacing: '0.06em',
					}}
				>
					{t('talks.detail.back')}
				</Link>

				<header style={{ marginTop: 28, maxWidth: 920 }}>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							flexWrap: 'wrap',
							fontFamily: OP.font,
							fontSize: 11,
							letterSpacing: '0.08em',
						}}
					>
						<span
							style={{
								color: OP.amber,
								border: `1px solid ${OP.amber}`,
								padding: '3px 9px',
							}}
						>
							{previewType.toUpperCase()}
						</span>
						{meta && <span style={{ color: OP.dim }}>{meta}</span>}
					</div>
					<h1
						style={{
							margin: '18px 0 0',
							fontFamily: OP.font,
							fontSize: 'clamp(28px, 5vw, 48px)',
							fontWeight: 500,
							lineHeight: 1.12,
							letterSpacing: '-0.035em',
							color: OP.fg,
						}}
					>
						{presentation.title}
					</h1>
					<p
						style={{
							margin: '18px 0 0',
							fontFamily: OP.sans,
							fontSize: 16,
							lineHeight: 1.65,
							color: OP.dim,
							maxWidth: 800,
						}}
					>
						{presentation.description}
					</p>
				</header>

				<div
					className="op-talk-actions"
					style={{ display: 'flex', gap: 10, marginTop: 24 }}
				>
					{contentLink && (
						<a
							href={contentLink}
							target="_blank"
							rel="noreferrer noopener"
							onClick={() =>
								posthog.capture('presentation_played', {
									title: presentation.title,
									talk_slug: slug,
									preview_type: presentation.preview?.type,
								})
							}
							style={{
								fontFamily: OP.font,
								fontSize: 12,
								color: OP.bg,
								background: OP.amber,
								border: `1px solid ${OP.amber}`,
								padding: '9px 14px',
								textDecoration: 'none',
								letterSpacing: '0.06em',
							}}
						>
							{t('talks.detail.open')}
						</a>
					)}
					{presentation.githubUrl && presentation.githubUrl !== contentLink && (
						<a
							href={presentation.githubUrl}
							target="_blank"
							rel="noreferrer noopener"
							onClick={() =>
								posthog.capture('presentation_src_opened', {
									title: presentation.title,
									talk_slug: slug,
								})
							}
							style={{
								fontFamily: OP.font,
								fontSize: 12,
								color: OP.violet,
								border: `1px solid ${OP.violet}`,
								padding: '9px 14px',
								textDecoration: 'none',
								letterSpacing: '0.06em',
							}}
						>
							{t('talks.detail.source')}
						</a>
					)}
				</div>

				<div style={{ marginTop: 32 }}>
					{presentation.preview ? (
						<PresentationPreview presentation={presentation} />
					) : (
						<div
							style={{
								border: `1px solid ${OP.rule2}`,
								background: OP.bg2,
								padding: '40px 24px',
								fontFamily: OP.font,
								fontSize: 13,
								color: OP.dim,
							}}
						>
							{t('talks.detail.previewUnavailable')}
						</div>
					)}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path={`~/talks/${slug}`}>share --copy-url</Prompt>
				</div>
			</article>

			<style jsx>{`
				@media (max-width: 560px) {
					:global(.op-talk-actions) {
						align-items: stretch;
						flex-direction: column;
					}
					:global(.op-talk-actions a) {
						text-align: center;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
