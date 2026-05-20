import React from 'react';
import type { GetStaticProps } from 'next';
import Parser from 'rss-parser';
import posthog from 'posthog-js';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { I18nProvider, useT } from '~/lib/i18n';

type MediumPost = {
	date: string;
	dateIso: string;
	title: string;
	excerpt: string;
	topic: string;
	href: string;
};

type WritingPageProps = {
	posts: MediumPost[];
};

const MEDIUM_FEED_URL = 'https://medium.com/feed/@_gdantas';

// RSS Medium não inclui <style>/<script>; só preciso strip de tags genéricas.
// (evitar literals com </style> ou </script> pq SWC do Next 13 confunde com
// JSX closing tags mesmo dentro de string.)
function stripHtml(input: string): string {
	return input
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function formatYearMonth(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

export const getStaticProps: GetStaticProps<WritingPageProps> = async () => {
	try {
		const parser: Parser<{}, { categories?: string[]; 'content:encoded'?: string }> = new Parser({
			timeout: 10000,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (compatible; gdantas.dev/2.x; +https://gdantas.dev)',
			},
			customFields: {
				item: ['categories', ['content:encoded', 'content:encoded']],
			},
		});

		const feed = await parser.parseURL(MEDIUM_FEED_URL);

		const posts: MediumPost[] = (feed.items || [])
			.map((item) => {
				const iso = item.isoDate || item.pubDate || '';
				const rawContent =
					(item as any)['content:encoded'] ||
					item.content ||
					item.contentSnippet ||
					'';
				const snippet = stripHtml(String(rawContent));
				const excerpt =
					snippet.length > 140 ? snippet.slice(0, 137).trimEnd() + '…' : snippet;
				const categories: string[] = Array.isArray(item.categories)
					? (item.categories as string[])
					: [];
				const topic = (categories[0] || 'medium').toString().toLowerCase().replace(/\s+/g, '-');
				return {
					date: formatYearMonth(iso),
					dateIso: iso,
					title: (item.title || 'Untitled').trim(),
					excerpt,
					topic,
					href: item.link || 'https://medium.com/@_gdantas',
				};
			})
			.sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1));

		return {
			props: { posts },
			revalidate: 3600,
		};
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('[writing] failed to fetch Medium feed:', err);
		return {
			props: { posts: [] },
			revalidate: 3600,
		};
	}
};

export function WritingPage({ posts, locale = 'pt' }: WritingPageProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<WritingPageInner posts={posts} />
		</I18nProvider>
	);
}

function WritingPageInner({ posts }: { posts: MediumPost[] }) {
	const t = useT();
	const ref = useReveal({ stagger: 0.05, y: 16 });
	const hasPosts = posts.length > 0;

	return (
		<OperatorPage
			title="gdantas ─ tail -f ~/.writing"
			description="Notas e posts publicados no medium/@_gdantas. AI ops, plataforma, observabilidade."
			active="/writing">
			<div ref={ref}>
				<Sec
					label={t('writing.section.label')}
					title={t('writing.section.title')}
					sub={t('writing.section.sub')}
				/>

				<div style={{ marginTop: 18, fontSize: 13 }}>
					<Prompt path="~/.writing">{t('writing.prompt')}</Prompt>
				</div>

				<div
					className="op-writing-card"
					style={{
						marginTop: 20,
						border: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.65)',
						padding: '22px 28px',
						fontFamily: OP.font,
						fontSize: 13,
						color: OP.fg,
						overflow: 'hidden',
					}}>
					<div
						className="op-writing-head"
						style={{
							display: 'grid',
							gridTemplateColumns: '90px 70px 1fr 140px',
							gap: 16,
							fontSize: 11,
							color: OP.dim,
							letterSpacing: '0.08em',
							paddingBottom: 10,
							borderBottom: `1px dashed ${OP.rule2}`,
						}}>
						<span>{t('writing.colDate')}</span>
						<span>{t('writing.colStatus')}</span>
						<span>{t('writing.colTitle')}</span>
						<span style={{ textAlign: 'right' }}>{t('writing.colTopic')}</span>
					</div>

					{hasPosts ? (
						posts.map((p) => {
							const baseStyle: React.CSSProperties = {
								display: 'grid',
								gridTemplateColumns: '90px 70px 1fr 140px',
								gap: 16,
								padding: '12px 0',
								borderBottom: `1px dashed ${OP.rule}`,
								alignItems: 'center',
								textDecoration: 'none',
								color: OP.fg,
							};
							return (
								<a
									key={p.href}
									href={p.href}
									target="_blank"
									rel="noreferrer noopener"
									className="op-writing-row"
									onClick={() => posthog.capture('writing_post_opened', { post_title: p.title, post_slug: p.href, topic: p.topic })}
									style={baseStyle}>
									<span className="op-writing-date" style={{ color: OP.dim }}>{p.date}</span>
									<span
										style={{
											fontSize: 10,
											color: OP.ok,
											border: `1px solid ${OP.ok}`,
											padding: '1px 6px',
											letterSpacing: '0.08em',
											alignSelf: 'center',
											justifySelf: 'start',
										}}>
										{t('writing.statusLive')}
									</span>
									<span style={{ color: OP.fg }}>{p.title}</span>
									<span
										className="op-writing-topic"
										style={{
											color: OP.violet,
											textAlign: 'right',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}>
										#{p.topic}
									</span>
								</a>
							);
						})
					) : (
						<div
							style={{
								padding: '24px 0',
								color: OP.dim,
								fontSize: 13,
								textAlign: 'center',
							}}>
							{t('writing.emptyState')}
						</div>
					)}

					<div style={{ marginTop: 14, color: OP.dim, fontSize: 12 }}>
						{t('writing.footerPromptPre')}{' '}
						<span style={{ color: OP.amber }}>
							{posts.length} {t('writing.footerEntries')}
						</span>{' '}
						{t('writing.footerNote')}
					</div>
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.writing">{t('writing.readmePrompt')}</Prompt>
				</div>
				<p
					style={{
						margin: '10px 0 0',
						fontFamily: OP.sans,
						fontSize: 16,
						color: OP.dim,
						maxWidth: 720,
						lineHeight: 1.6,
					}}>
					{t('writing.readmeBody')}
				</p>
			</div>

			<style jsx global>{`
				@media (max-width: 640px) {
					.op-writing-card {
						padding: 18px 16px !important;
					}
					.op-writing-head {
						display: none !important;
					}
					.op-writing-row {
						grid-template-columns: 1fr !important;
						gap: 6px !important;
						padding: 14px 0 !important;
					}
					.op-writing-date,
					.op-writing-topic {
						text-align: left !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
