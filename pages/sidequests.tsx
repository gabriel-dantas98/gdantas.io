import React from 'react';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';

interface SideQuest {
	tag: string;
	tagColor: string;
	name: string;
	prompt: string; // sub-text estilo terminal embaixo do nome
	tagline: string;
	body: React.ReactNode;
	status: 'LIVE' | 'WIP';
	links: { label: string; href: string }[];
}

const QUESTS: SideQuest[] = [
	{
		tag: 'PRINT',
		tagColor: OP.amber,
		name: '3Dantas',
		prompt: 'maker · impressão 3D · hobby sustentável',
		tagline: 'craft em filamento — peças sob encomenda + linha própria.',
		body: (
			<>
				<p style={{ margin: '0 0 10px' }}>
					Marca de impressão 3D rodando em <strong>Bambu Lab A1 mini</strong>.
					Encomendas (Funkos personalizados, chaveiros, trofeus, brinquedos
					sensoriais) entram via WhatsApp; em paralelo, linha própria{' '}
					<em>Funkos Santos</em> no catálogo.
				</p>
				<p style={{ margin: 0, color: OP.dim, fontSize: 13 }}>
					Métrica: <span style={{ color: OP.amber }}>hobby sustentável</span> —
					operação se paga em ≥50% de qualquer reinvestimento.
				</p>
			</>
		),
		status: 'LIVE',
		links: [
			{ label: 'site ↗', href: 'https://www.3dantas.com.br' },
			{ label: 'instagram ↗', href: 'https://www.instagram.com/3dantas.print' },
		],
	},
	{
		tag: 'FAITH',
		tagColor: OP.violet,
		name: 'Novarum',
		prompt: 'voluntariado · ferramental pra ministérios',
		tagline: 'tooling pra coroinhas, EJC e Pascom — tirar peso da logística.',
		body: (
			<>
				<p style={{ margin: '0 0 10px' }}>
					Braço técnico do meu trabalho voluntário na Igreja Católica. Construir
					ferramentas que rodam em planilha + WhatsApp + processos improvisados,
					pra ministério focar em <strong>gente</strong>, não em logística.
				</p>
				<p style={{ margin: 0, color: OP.dim, fontSize: 13 }}>
					Público: coroinhas (altar servers), EJC (Encontro de Jovens com
					Cristo), Pascom (Pastoral da Comunicação). Hosting near-zero.
				</p>
			</>
		),
		status: 'WIP',
		links: [],
	},
	{
		tag: 'MERCH',
		tagColor: OP.pager,
		name: 'DeployOu',
		prompt: 'loja · camisetas tech-themed',
		tagline: 'dev humor brasileiro — trocadilhos de DevOps em algodão.',
		body: (
			<>
				<p style={{ margin: '0 0 10px' }}>
					Marca de camisetas via <strong>Reserva INK</strong> (sem gestão de
					estoque). Foco em humor de dev br: trocadilhos de Kubernetes, SRE,
					Cloud Native. Tom direto, irônico, cúmplice — fala com quem entende
					a piada sem precisar explicar.
				</p>
				<p style={{ margin: 0, color: OP.dim, fontSize: 13 }}>
					Audiência: devs, SREs, platform engineers — gente que ri da própria
					área. Operação em modo autopilot.
				</p>
			</>
		),
		status: 'LIVE',
		links: [
			{ label: 'storefront ↗', href: 'https://www.reserva.ink/deployou' },
			{ label: 'instagram ↗', href: 'https://www.instagram.com/deployou' },
		],
	},
];

export default function SidequestsPage() {
	const ref = useReveal({ stagger: 0.08, y: 20 });
	return (
		<OperatorPage
			title="gdantas ─ ls ~/.sidequests"
			description="Projetos paralelos e hobbies do Gabriel — impressão 3D (3Dantas), trabalho voluntário (Novarum) e loja de camisetas tech (DeployOu)."
			active="/sidequests">
			<div ref={ref}>
				<Sec
					label="01"
					title="ls ~/.sidequests"
					sub="o que rola fora do horário comercial"
				/>

				<div
					className="op-sq-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 18,
					}}>
					{QUESTS.map((q) => (
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
								{q.body}
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
									./em-construção
								</div>
							)}
						</div>
					))}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.sidequests">
						ls -l | wc -l →{' '}
						<span style={{ color: OP.amber }}>{QUESTS.length} quests</span> · novos
						projetos aparecem aqui conforme vão saindo do papel
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
