import React from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';


interface TalkItem {
	title: string;
	icon: string;
	color: string;
	description: string;
	url: string;
}

interface TalksProps {
	talks: TalkItem[];
}

export const getStaticProps: GetStaticProps<TalksProps> = async () => {
	const { default: talks } = await import('~/data/talks.json');
	return { props: { talks } };
};

function kindOf(t: TalkItem): { tag: string; color: string } {
	if (t.icon.includes('youtube')) return { tag: 'VIDEO', color: OP.pager };
	if (t.icon.includes('headphones')) return { tag: 'AUDIO', color: OP.ok };
	if (t.icon.includes('book')) return { tag: 'SLIDES', color: OP.amber };
	return { tag: 'TALK', color: OP.violet };
}

export default function TalksPage({ talks }: TalksProps) {
	const ref = useReveal({ stagger: 0.05, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ ls ~/talks"
			description="Talks, podcasts e slides — engenharia de plataforma, Backstage, AI ops."
			active="/talks">
			<div ref={ref}>
				<Sec label="01" title="ls ~/talks" sub="recent · slides + video + audio" />

				<div
					className="op-talks-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: 14,
					}}>
					{talks.map((t) => {
						const k = kindOf(t);
						return (
							<a
								key={t.url}
								href={t.url}
								target="_blank"
								rel="noreferrer noopener"
								className="op-talk-card"
								style={{
									display: 'block',
									padding: '20px 22px',
									border: `1px solid ${OP.rule2}`,
									background: OP.bg2,
									textDecoration: 'none',
									color: OP.fg,
									transition: 'border-color 120ms ease, background 120ms ease',
								}}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}>
									<span
										style={{
											fontFamily: OP.font,
											fontSize: 10,
											color: k.color,
											letterSpacing: '0.12em',
											border: `1px solid ${k.color}`,
											padding: '2px 8px',
										}}>
										{k.tag}
									</span>
									<span style={{ fontFamily: OP.font, fontSize: 11, color: OP.dim }}>
										./play ↗
									</span>
								</div>
								<div
									style={{
										fontFamily: OP.font,
										fontSize: 15,
										color: OP.fg,
										marginTop: 14,
										lineHeight: 1.4,
									}}>
									{t.title}
								</div>
								<div
									style={{
										fontFamily: OP.sans,
										fontSize: 13,
										color: OP.dim,
										marginTop: 10,
										lineHeight: 1.5,
									}}>
									{t.description}
								</div>
							</a>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/talks">
						ls --all | wc -l →{' '}
						<span style={{ color: OP.amber }}>{talks.length} entries</span> ·{' '}
						<Link href="/presentations" passHref>
							<a style={{ color: OP.amber, textDecoration: 'none' }}>
								↗ presentations (com preview embeddado)
							</a>
						</Link>
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-talks-grid) {
						grid-template-columns: 1fr !important;
					}
				}
				:global(.op-talk-card:hover) {
					border-color: ${OP.amber} !important;
					background: ${OP.bg3} !important;
				}
			`}</style>
		</OperatorPage>
	);
}
