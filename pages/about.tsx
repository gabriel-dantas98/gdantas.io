import Image from 'next/image';
import React from 'react';

import { Operator } from '~/components';
import ProfilePicture from '../public/profile-photo.jpg';

const { OP, Sec, Prompt, OperatorPage, useReveal } = Operator;

const FACTS: { k: string; v: string }[] = [
	{ k: '$ uname', v: 'gdantas · sre @ quintoandar' },
	{ k: '$ stack', v: 'k8s · aws · backstage · terraform/opentofu · argocd · cursor sdk · claude code api · langgraph · mcps · lgtm · otel · thanos' },
	{ k: '$ impact', v: '−70% onboarding · IDP self-service · AI ops · RAG sobre infra' },
	{ k: '$ creds', v: 'Exam Contributor · Certified Backstage Associate' },
	{ k: '$ edu', v: 'FIAP · Eng. Comp + pós ML Eng + MBA AI Eng & Multi-agents' },
	{ k: '$ loc', v: 'Osasco · São Paulo · BR' },
];

export default function AboutPage() {
	const ref = useReveal({ stagger: 0.07, y: 22 });
	return (
		<OperatorPage
			title="gdantas ─ cat ~/.about"
			description="Quem é o operador. SRE, plataforma, Backstage, AI ops."
			active="/about">
			<div ref={ref}>
				<Sec label="01" title="cat ~/.about" sub="quem é o operador" />
				<div
					className="op-about-grid"
					style={{
						display: 'grid',
						gridTemplateColumns: '320px 1fr',
						gap: 56,
						marginTop: 32,
						alignItems: 'start',
					}}>
					<div
						style={{
							position: 'relative',
							border: `1px solid ${OP.rule2}`,
							padding: 6,
							background: OP.bg2,
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
								zIndex: 2,
							}}>
							IMG · gd.jpg
						</div>
						<div
							style={{
								position: 'relative',
								width: '100%',
								aspectRatio: '3/4',
								overflow: 'hidden',
								filter: 'grayscale(0.4) contrast(1.05)',
							}}>
							<Image
								src={ProfilePicture}
								alt="Gabriel Dantas"
								layout="fill"
								objectFit="cover"
								priority
								sizes="320px"
							/>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `linear-gradient(180deg, transparent 60%, ${OP.bg}cc 100%)`,
									pointerEvents: 'none',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									backgroundImage:
										'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.04) 2px 3px)',
									pointerEvents: 'none',
								}}
							/>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								fontSize: 10,
								color: OP.dim,
								marginTop: 8,
								padding: '0 4px 2px',
								letterSpacing: '0.08em',
								fontFamily: OP.font,
							}}>
							<span>SUBJECT · gabriel</span>
							<span>F1.8 · SP/BR</span>
						</div>
					</div>
					<div style={{ fontFamily: OP.sans, fontSize: 17, lineHeight: 1.65, color: OP.fg }}>
						<p style={{ margin: '0 0 14px' }}>
							<span style={{ color: OP.amber }}>SRE no QuintoAndar</span> há 5+ anos. Mexo com
							observabilidade (Grafana, Prometheus, Thanos, OTel, ELK) e DevEx com{' '}
							<span style={{ color: OP.amber }}>Backstage</span>. Antes disso fui estagiário
							em ops, devops e infra. Soma 6+ anos.
						</p>
						<p style={{ margin: '0 0 14px' }}>
							O lema dos Rescue Swimmers da U.S. Coast Guard é{' '}
							<span style={{ color: OP.amber }}>&ldquo;So Others May Live&rdquo;</span>.
							Plataforma é parecido. A gente faz o trabalho chato pra que o time de produto
							consiga fazer o trabalho deles sem tropeçar em yaml.
						</p>
						<div
							style={{
								marginTop: 22,
								display: 'grid',
								gridTemplateColumns: 'auto 1fr',
								gap: '8px 18px',
								fontFamily: OP.font,
								fontSize: 13,
							}}>
							{FACTS.map((f) => (
								<React.Fragment key={f.k}>
									<span style={{ color: OP.dim }}>{f.k}</span>
									<span style={{ color: OP.fg }}>{f.v}</span>
								</React.Fragment>
							))}
						</div>
						<div
							style={{
								marginTop: 24,
								paddingTop: 18,
								borderTop: `1px dashed ${OP.rule2}`,
								fontFamily: OP.font,
								fontSize: 13,
								color: OP.dim,
							}}>
							Fora do trabalho: pós em ML Eng, MBA em AI Eng + Multi-agents, curso de teologia
							pastoral. Café preto, livro físico, terminal escuro.
						</div>
						<div style={{ marginTop: 28, fontSize: 13 }}>
							<Prompt path="~">cat ~/.about | wc -l → {FACTS.length + 2} linhas</Prompt>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-about-grid) {
						grid-template-columns: 1fr !important;
						gap: 32px !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
