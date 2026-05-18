import React, { useState } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';
import posthog from 'posthog-js';

import {
	OP,
	Sec,
	Prompt,
	OperatorPage,
	PreviewModal,
	useReveal,
} from '~/components/Operator';
import { derivePreview, type NormalizedPreview, type RawPreview } from '~/lib/preview';
import presentationsData from '~/data/presentations.json';

interface RawPresentation {
	title: string;
	icon: string;
	color: string;
	description: string;
	url?: string;
	contentUrl?: string;
	githubUrl?: string;
	date?: string;
	location?: string;
	preview?: RawPreview;
}

interface TalkItem {
	title: string;
	icon: string;
	description: string;
	url: string;
	date?: string;
	location?: string;
	kind: 'video' | 'audio' | 'slides' | 'talk';
	preview: NormalizedPreview | null;
}

interface TalksProps {
	talks: TalkItem[];
}

function inferKind(p: RawPresentation): TalkItem['kind'] {
	const previewType = p.preview?.type || '';
	if (p.icon.includes('youtube') || previewType === 'youtube') return 'video';
	if (p.icon.includes('headphones') || previewType === 'spotify') return 'audio';
	if (
		p.icon.includes('book') ||
		previewType === 'canva' ||
		previewType === 'google-slides' ||
		previewType === 'pdf'
	)
		return 'slides';
	return 'talk';
}

// Source of truth única: presentations.json. /talks mostra cards leves; o
// preview embeddado abre num modal (PreviewModal) quando o usuário clica.
export const getStaticProps: GetStaticProps<TalksProps> = async () => {
	const raw = presentationsData as RawPresentation[];
	const talks: TalkItem[] = raw.map((p) => {
		const item: TalkItem = {
			title: p.title,
			icon: p.icon,
			description: p.description,
			url: p.contentUrl || p.url || 'https://github.com/gabriel-dantas98',
			kind: inferKind(p),
			preview: derivePreview(p),
		};
		if (p.date) item.date = p.date;
		if (p.location) item.location = p.location;
		return item;
	});
	return { props: { talks } };
};

const KIND_TAG: Record<TalkItem['kind'], { tag: string; color: string }> = {
	video: { tag: 'VIDEO', color: OP.pager },
	audio: { tag: 'AUDIO', color: OP.ok },
	slides: { tag: 'SLIDES', color: OP.amber },
	talk: { tag: 'TALK', color: OP.violet },
};

export default function TalksPage({ talks }: TalksProps) {
	const ref = useReveal({ stagger: 0.05, y: 18 });
	const [activeIdx, setActiveIdx] = useState<number | null>(null);
	const active = activeIdx != null ? talks[activeIdx] : null;
	const activeKind = active ? KIND_TAG[active.kind] : null;
	const activeMeta = active
		? [active.date, active.location].filter(Boolean).join(' · ')
		: '';

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
					{talks.map((t, i) => {
						const k = KIND_TAG[t.kind];
						const meta = [t.date, t.location].filter(Boolean).join(' · ');
						return (
							<button
								key={`${t.url}-${i}`}
								type="button"
								onClick={() => {
									setActiveIdx(i);
									posthog.capture("talk_clicked", { talk_title: t.title, talk_type: k.tag });
								}}
								className="op-talk-card"
								style={{
									textAlign: 'left',
									display: 'block',
									padding: '20px 22px',
									border: `1px solid ${OP.rule2}`,
									background: OP.bg2,
									color: OP.fg,
									font: 'inherit',
									cursor: 'pointer',
									width: '100%',
									transition: 'border-color 120ms ease, background 120ms ease',
								}}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										gap: 8,
										flexWrap: 'wrap',
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
									{meta && (
										<span
											style={{
												fontFamily: OP.font,
												fontSize: 11,
												color: OP.dim,
												letterSpacing: '0.04em',
											}}>
											{meta}
										</span>
									)}
									<span style={{ fontFamily: OP.font, fontSize: 11, color: OP.amber }}>
										./preview ↗
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
							</button>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/talks">
						ls --all | wc -l →{' '}
						<span style={{ color: OP.amber }}>{talks.length} entries</span> ·{' '}
						<Link
							href="/presentations"
							style={{ color: OP.amber, textDecoration: 'none' }}>
							↗ presentations (lista completa com previews inline)
						</Link>
					</Prompt>
				</div>
			</div>

			{active && activeKind && (
				<PreviewModal
					open
					onClose={() => setActiveIdx(null)}
					title={active.title}
					tag={{ label: activeKind.tag, color: activeKind.color }}
					meta={activeMeta || undefined}
					preview={active.preview}
					href={active.url}
				/>
			)}

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
