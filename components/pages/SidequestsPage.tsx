import React from 'react';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { I18nProvider, useT } from '~/lib/i18n';

interface SideQuestStatic {
	tagColor: string;
	status: 'LIVE' | 'WIP';
	links: { label: string; href: string }[];
}

const QUEST_META: SideQuestStatic[] = [
	{
		tagColor: OP.amber,
		status: 'LIVE',
		links: [
			{ label: 'site ↗', href: 'https://www.3dantas.com.br' },
			{ label: 'instagram ↗', href: 'https://www.instagram.com/3dantas.print' },
		],
	},
	{
		tagColor: OP.violet,
		status: 'WIP',
		links: [],
	},
	{
		tagColor: OP.pager,
		status: 'LIVE',
		links: [
			{ label: 'storefront ↗', href: 'https://www.reserva.ink/deployou' },
			{ label: 'instagram ↗', href: 'https://www.instagram.com/deployou' },
		],
	},
];

export function SidequestsPage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<SidequestsPageInner />
		</I18nProvider>
	);
}

function SidequestsPageInner() {
	const t = useT();
	const ref = useReveal({ stagger: 0.08, y: 20 });
	const quests = QUEST_META.map((meta, i) => ({
		...meta,
		tag: t(`sidequests.items[${i}].tag`),
		name: t(`sidequests.items[${i}].name`),
		prompt: t(`sidequests.items[${i}].prompt`),
		tagline: t(`sidequests.items[${i}].tagline`),
		bodyP1: t(`sidequests.items[${i}].bodyP1`),
		bodyP2: t(`sidequests.items[${i}].bodyP2`),
	}));

	return (
		<OperatorPage
			title="gdantas ─ ls ~/.sidequests"
			description="Projetos paralelos e hobbies do Gabriel — impressão 3D (3Dantas), trabalho voluntário (Novarum) e loja de camisetas tech (DeployOu)."
			active="/sidequests">
			<div ref={ref}>
				<Sec
					label={t('sidequests.section.label')}
					title={t('sidequests.section.title')}
					sub={t('sidequests.section.sub')}
				/>

				<div
					className="op-sq-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 18,
					}}>
					{quests.map((q) => (
						<div
							key={q.tag}
							className="op-sq-card"
							style={{
								display: 'flex',
								flexDirection: 'column',
								padding: '22px 24px',
								border: `1px solid ${OP.rule2}`,
								background: OP.bg2,
								gap: 16,
								minHeight: 320,
								position: 'relative',
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
										color: q.tagColor,
										letterSpacing: '0.12em',
										border: `1px solid ${q.tagColor}`,
										padding: '3px 8px',
									}}>
									{q.tag}
								</span>
								<span
									style={{
										fontFamily: OP.font,
										fontSize: 10,
										color: q.status === 'LIVE' ? OP.ok : OP.amber,
										border: `1px solid ${q.status === 'LIVE' ? OP.ok : OP.amber}`,
										padding: '2px 6px',
										letterSpacing: '0.1em',
									}}>
									{q.status}
								</span>
							</div>

							<div>
								<div
									style={{
										fontFamily: OP.font,
										fontSize: 22,
										color: OP.fg,
										fontWeight: 500,
										letterSpacing: '-0.01em',
									}}>
									{q.name}
								</div>
								<div
									style={{
										fontFamily: OP.font,
										fontSize: 11,
										color: OP.dim,
										marginTop: 4,
										letterSpacing: '0.03em',
									}}>
									$ {q.prompt}
								</div>
							</div>

							<div
								style={{
									fontFamily: OP.sans,
									fontSize: 14,
									lineHeight: 1.55,
									color: OP.fg,
									flex: 1,
								}}>
								<div style={{ color: q.tagColor, marginBottom: 10, fontSize: 13 }}>
									› {q.tagline}
								</div>
								<p style={{ margin: '0 0 10px' }}>{q.bodyP1}</p>
								<p style={{ margin: 0, color: OP.dim, fontSize: 13 }}>{q.bodyP2}</p>
							</div>

							{q.links.length > 0 ? (
								<div
									style={{
										display: 'flex',
										gap: 12,
										flexWrap: 'wrap',
										paddingTop: 12,
										borderTop: `1px dashed ${OP.rule}`,
									}}>
									{q.links.map((l) => (
										<a
											key={l.href}
											href={l.href}
											target="_blank"
											rel="noreferrer noopener"
											style={{
												fontFamily: OP.font,
												fontSize: 11,
												color: q.tagColor,
												textDecoration: 'none',
												padding: '4px 0',
												minHeight: 24,
												letterSpacing: '0.06em',
											}}>
											./{l.label}
										</a>
									))}
								</div>
							) : (
								<div
									style={{
										paddingTop: 12,
										borderTop: `1px dashed ${OP.rule}`,
										fontFamily: OP.font,
										fontSize: 11,
										color: OP.dim,
										letterSpacing: '0.06em',
									}}>
									{t('sidequests.emConstrucao')}
								</div>
							)}
						</div>
					))}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.sidequests">
						{t('sidequests.footerPromptPre')}{' '}
						<span style={{ color: OP.amber }}>
							{quests.length} {t('sidequests.footerEntries')}
						</span>{' '}
						{t('sidequests.footerNote')}
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				:global(.op-sq-card:hover) {
					border-color: ${OP.amber} !important;
					background: ${OP.bg3} !important;
				}
				@media (max-width: 900px) {
					:global(.op-sq-grid) {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
