import React from 'react';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';


const ROLES: { tag: string; title: string; lines: string[]; color: keyof typeof OP }[] = [
	{
		tag: 'ROLE.01',
		title: 'Operador de plataforma',
		color: 'amber',
		lines: [
			'Carregar o pager pra que ninguém precise.',
			'Paved roads > golden paths > hands-on assistido.',
			'A interface da plataforma é a documentação que ninguém lê.',
		],
	},
	{
		tag: 'ROLE.02',
		title: 'Engenheiro de DevEx',
		color: 'violet',
		lines: [
			'Tempo de onboarding é métrica de produto.',
			'Backstage como software catalog, não como portal de vaidade.',
			'Self-service ou não vale a pena automatizar.',
		],
	},
	{
		tag: 'ROLE.03',
		title: 'AI ops + observabilidade',
		color: 'pager',
		lines: [
			'Modelo sem telemetria é alquimia.',
			'RAG sobre infra > runbook estático.',
			'Agente que não tem feedback loop é só um cron job caro.',
		],
	},
];

const PRINCIPLES = [
	'A plataforma trabalha pra que outras pessoas vivam (entreguem).',
	'Errar barato e cedo > acertar caro e tarde.',
	'Postmortem sem culpado, com curiosidade.',
	'Toda automação começa como runbook escrito à mão.',
	'O incidente é sempre sobre o sistema, nunca sobre a pessoa.',
	'Documentar enquanto se constrói, não depois.',
];

export default function DoctrinePage() {
	const ref = useReveal({ stagger: 0.06, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ cat ~/.doctrine"
			description="Princípios e papéis de operação. So others may live."
			active="/doctrine">
			<div ref={ref}>
				<Sec label="01" title="cat ~/.doctrine" sub='"So Others May Live"' />

				<div
					style={{
						marginTop: 28,
						border: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.65)',
						padding: '28px 32px',
						position: 'relative',
					}}>
					<div
						style={{
							position: 'absolute',
							top: -1,
							left: -1,
							fontFamily: OP.font,
							fontSize: 10,
							color: OP.amber,
							padding: '4px 10px',
							background: OP.bg,
							border: `1px solid ${OP.rule2}`,
						}}>
						MANIFESTO.md
					</div>
					<p
						style={{
							margin: '14px 0 0',
							fontFamily: OP.sans,
							fontSize: 18,
							lineHeight: 1.7,
							color: OP.fg,
							maxWidth: 760,
						}}>
						Plataforma é o trabalho chato pra que o time de produto consiga
						entregar sem tropeçar em yaml. O lema dos Rescue Swimmers da U.S.
						Coast Guard cabe aqui:{' '}
						<span style={{ color: OP.amber }}>&ldquo;So Others May Live&rdquo;</span>.
					</p>
					<ul
						style={{
							margin: '22px 0 0',
							padding: 0,
							listStyle: 'none',
							display: 'grid',
							gap: 10,
							fontFamily: OP.font,
							fontSize: 14,
							color: OP.fg,
						}}>
						{PRINCIPLES.map((p, i) => (
							<li key={p} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 8 }}>
								<span style={{ color: OP.dim }}>{String(i + 1).padStart(2, '0')}.</span>
								<span>{p}</span>
							</li>
						))}
					</ul>
				</div>

				<div
					className="op-roles-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 18,
					}}>
					{ROLES.map((r) => (
						<div
							key={r.tag}
							style={{
								border: `1px solid ${OP.rule2}`,
								background: OP.bg2,
								padding: '22px 24px',
							}}>
							<div
								style={{
									fontFamily: OP.font,
									fontSize: 11,
									color: OP[r.color] as string,
									letterSpacing: '0.1em',
								}}>
								{r.tag}
							</div>
							<div
								style={{
									fontFamily: OP.font,
									fontSize: 18,
									color: OP.fg,
									marginTop: 8,
								}}>
								{r.title}
							</div>
							<ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
								{r.lines.map((l) => (
									<li
										key={l}
										style={{
											fontFamily: OP.sans,
											fontSize: 14,
											lineHeight: 1.5,
											color: OP.fg,
											opacity: 0.88,
										}}>
										<span style={{ color: OP.dim, marginRight: 6 }}>▸</span>
										{l}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.doctrine">grep -i &quot;cultura&quot; * | tail -1</Prompt>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-roles-grid) {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
