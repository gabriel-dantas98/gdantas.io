import React from 'react';
import type { GetStaticProps } from 'next';
import Parser from 'rss-parser';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';

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

function stripHtml(input: string): string {
	return input
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
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

export default function WritingPage({ posts }: WritingPageProps) {
	const ref = useReveal({ stagger: 0.05, y: 16 });
	const hasPosts = posts.length > 0;

	return (
		<OperatorPage
			title="gdantas ─ tail -f ~/.writing"
			description="Notas e posts publicados no medium/@_gdantas. AI ops, plataforma, observabilidade."
			active="/writing">
			<div ref={ref}>
				<Sec label="01" title="tail -f ~/.writing" sub="notes · medium · published" />

				<div style={{ marginTop: 18, fontSize: 13 }}>
					<Prompt path="~/.writing">curl medium.com/feed/@_gdantas | parse-rss</Prompt>
				</div>

				<div
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
						<span>DATE</span>
						<span>STATUS</span>
						<span>TITLE</span>
						<span style={{ textAlign: 'right' }}>TOPIC</span>
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
									style={baseStyle}>
									<span style={{ color: OP.dim }}>{p.date}</span>
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
										LIVE
									</span>
									<span style={{ color: OP.fg }}>{p.title}</span>
									<span
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
							Medium feed offline. Próximos posts vão aparecer aqui automaticamente.
						</div>
					)}

					<div style={{ marginTop: 14, color: OP.dim, fontSize: 12 }}>
						$ tail -f ~/.writing | wc -l →{' '}
						<span style={{ color: OP.amber }}>{posts.length} entries</span> · feed
						sincronizado direto do medium/@_gdantas
					</div>
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.writing">cat README.txt</Prompt>
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
					Tudo aqui é puxado em tempo de build do feed RSS do medium/@_gdantas. Tópicos:
					AI ops, plataforma de dev, observabilidade, agentes pra incidente, RAG sobre
					infra. Cada post novo no Medium aparece nessa lista automaticamente.
				</p>
			</div>
		</OperatorPage>
	);
}
