import React from 'react';
import type { GetStaticProps } from 'next';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import linktreeData from '~/data/linktree.json';

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
function kindOf(icon: string): { tag: string; color: string } {
	if (icon.includes('youtube')) return { tag: 'VIDEO', color: OP.pager };
	if (icon.includes('github')) return { tag: 'CODE', color: OP.amber };
	if (icon.includes('linkedin')) return { tag: 'PRO', color: OP.violet };
	if (icon.includes('book')) return { tag: 'WRITE', color: OP.ok };
	if (icon.includes('mail')) return { tag: 'MAIL', color: OP.amber };
	return { tag: 'LINK', color: OP.dim };
}

function isInternal(url: string) {
	return url.startsWith('/');
}

export default function LinksPage({ links }: LinksProps) {
	const ref = useReveal({ stagger: 0.05, y: 16 });
	return (
		<OperatorPage
			title="gdantas ─ ls ~/.links"
			description="Linktree: talks, GitHub, LinkedIn, Medium, projetos do Gabriel Dantas."
			active="/">
			<div ref={ref}>
				<Sec label="01" title="ls ~/.links" sub="atalhos pros canais" />

				<div
					style={{
						marginTop: 28,
						display: 'grid',
						gap: 10,
						maxWidth: 640,
					}}>
					{links.map((l) => {
						const k = kindOf(l.icon);
						return (
							<a
								key={l.url}
								href={l.url}
								{...(isInternal(l.url)
									? {}
									: { target: '_blank', rel: 'noreferrer noopener' })}
								className="op-link-row"
								style={{
									display: 'grid',
									gridTemplateColumns: '60px 1fr 60px',
									gap: 14,
									alignItems: 'center',
									padding: '14px 18px',
									border: `1px solid ${OP.rule2}`,
									background: OP.bg2,
									textDecoration: 'none',
									color: OP.fg,
									minHeight: 56,
									transition: 'border-color 120ms ease, background 120ms ease',
								}}>
								<span
									style={{
										fontFamily: OP.font,
										fontSize: 10,
										color: k.color,
										letterSpacing: '0.12em',
										border: `1px solid ${k.color}`,
										padding: '3px 8px',
										textAlign: 'center',
									}}>
									{k.tag}
								</span>
								<span
									style={{
										fontFamily: OP.font,
										fontSize: 15,
										color: OP.fg,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}>
									{l.title}
								</span>
								<span
									style={{
										fontFamily: OP.font,
										fontSize: 12,
										color: k.color,
										letterSpacing: '0.08em',
										textAlign: 'right',
									}}>
									{isInternal(l.url) ? '→' : '↗'}
								</span>
							</a>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13, maxWidth: 640 }}>
					<Prompt path="~">
						ls ~/.links | wc -l →{' '}
						<span style={{ color: OP.amber }}>{links.length} entries</span>
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				:global(.op-link-row:hover) {
					border-color: ${OP.amber} !important;
					background: ${OP.bg3} !important;
				}
			`}</style>
		</OperatorPage>
	);
}
