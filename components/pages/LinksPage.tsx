import React from 'react';
import type { GetStaticProps } from 'next';
import posthog from 'posthog-js';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import linktreeData from '~/data/linktree.json';
import { I18nProvider, useT } from '~/lib/i18n';

interface LinkItem {
	title: string;
	icon: string;
	color: string;
	description: string;
	url: string;
}

interface LinksProps {
	links: LinkItem[];
}

export const getStaticProps: GetStaticProps<LinksProps> = async () => {
	return { props: { links: linktreeData as LinkItem[] } };
};

// Mapeia o feather icon original pra um tag visual no formato terminal.
function kindOf(icon: string, t: (k: string) => string): { tag: string; color: string } {
	if (icon.includes('youtube')) return { tag: t('links.kinds.video'), color: OP.pager };
	if (icon.includes('github')) return { tag: t('links.kinds.code'), color: OP.amber };
	if (icon.includes('linkedin')) return { tag: t('links.kinds.pro'), color: OP.violet };
	if (icon.includes('book')) return { tag: t('links.kinds.write'), color: OP.ok };
	if (icon.includes('mail')) return { tag: t('links.kinds.mail'), color: OP.amber };
	return { tag: t('links.kinds.link'), color: OP.dim };
}

function isInternal(url: string) {
	return url.startsWith('/');
}

export function LinksPage({ links, locale = 'pt' }: LinksProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<LinksPageInner links={links} />
		</I18nProvider>
	);
}

function LinksPageInner({ links }: { links: LinkItem[] }) {
	const t = useT();
	const ref = useReveal({ stagger: 0.05, y: 16 });
	return (
		<OperatorPage
			title="gdantas ─ ls ~/.links"
			description="Linktree: talks, GitHub, LinkedIn, Medium, projetos do Gabriel Dantas."
			active="/">
			<div ref={ref}>
				<Sec
					label={t('links.section.label')}
					title={t('links.section.title')}
					sub={t('links.section.sub')}
				/>

				<div className="op-links-grid">
					{links.map((l, i) => {
						const k = kindOf(l.icon, t);
						const arrow = isInternal(l.url) ? '→' : '↗';
						return (
							<a
								key={l.url}
								href={l.url}
								{...(isInternal(l.url)
									? {}
									: { target: '_blank', rel: 'noreferrer noopener' })}
								className="op-link-tile"
								data-pos={i % 6}
								onClick={() =>
									posthog.capture('link_clicked', {
										link_title: l.title,
										link_type: k.tag,
									})
								}>
								<span className="op-link-tag" style={{ color: k.color, borderColor: k.color }}>
									{k.tag}
								</span>
								<span className="op-link-title">{l.title}</span>
								<span className="op-link-arrow" style={{ color: k.color }}>
									{arrow}
								</span>
							</a>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13, maxWidth: 640 }}>
					<Prompt path="~">
						{t('links.footerPromptPre')}{' '}
						<span style={{ color: OP.amber }}>
							{links.length} {t('links.footerEntries')}
						</span>
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				.op-links-grid {
					display: grid;
					grid-template-columns: 1fr;
					gap: 10px;
					margin-top: 28px;
					max-width: 640px;
				}
				.op-link-tile {
					display: grid;
					grid-template-columns: 60px 1fr 60px;
					gap: 14px;
					align-items: center;
					padding: 14px 18px;
					border: 1px solid ${OP.rule2};
					background: ${OP.bg2};
					text-decoration: none;
					color: ${OP.fg};
					min-height: 56px;
					font-family: ${OP.font};
					transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
				}
				.op-link-tile:hover {
					border-color: ${OP.amber};
					background: ${OP.bg3};
				}
				.op-link-tag {
					font-size: 10px;
					letter-spacing: 0.12em;
					border: 1px solid;
					padding: 3px 8px;
					text-align: center;
					align-self: center;
					justify-self: start;
					white-space: nowrap;
				}
				.op-link-title {
					font-size: 15px;
					color: ${OP.fg};
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.op-link-arrow {
					font-size: 12px;
					letter-spacing: 0.08em;
					text-align: right;
				}

				/* Mobile: 2-col mosaico. dense + spans variáveis dão sensação
				   masonry sem JS. Tile 0 vira hero (2x2), tile 3 vira wide
				   (2x1) — quebra o ritmo regular do grid. */
				@media (max-width: 640px) {
					.op-links-grid {
						grid-template-columns: repeat(2, minmax(0, 1fr));
						grid-auto-flow: dense;
						grid-auto-rows: 96px;
						gap: 8px;
					}
					.op-link-tile {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						align-items: flex-start;
						gap: 8px;
						padding: 14px;
						min-height: 0;
					}
					.op-link-tile[data-pos='0'] {
						grid-column: span 2;
						grid-row: span 2;
					}
					.op-link-tile[data-pos='3'] {
						grid-column: span 2;
					}
					.op-link-title {
						font-size: 15px;
						white-space: normal;
						line-height: 1.25;
						overflow: hidden;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
					}
					.op-link-tile[data-pos='0'] .op-link-title {
						font-size: 22px;
						-webkit-line-clamp: 3;
					}
					.op-link-arrow {
						align-self: flex-end;
						font-size: 16px;
						margin-top: auto;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
