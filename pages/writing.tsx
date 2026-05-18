import React from 'react';

import posthog from 'posthog-js';
import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';


// Drafts/published — preencher conforme posts forem ao ar.
const POSTS: { date: string; status: 'draft' | 'live'; slug: string; title: string; topic: string; href?: string }[] = [
	{
		date: '2026-05',
		status: 'draft',
		slug: 'rag-sobre-infra',
		title: 'RAG sobre infra: parando de jogar contexto na cara do modelo',
		topic: 'AI ops',
	},
	{
		date: '2026-04',
		status: 'draft',
		slug: 'backstage-software-catalog-real',
		title: 'Software Catalog que ninguém abandona em 6 meses',
		topic: 'Backstage',
	},
	{
		date: '2026-02',
		status: 'draft',
		slug: 'observabilidade-fluida',
		title: 'Observabilidade sem dashboards — só perguntas',
		topic: 'observability',
	},
	{
		date: '2025-11',
		status: 'live',
		slug: 'medium-archive',
		title: 'Arquivo: textos antigos no medium/@_gdantas',
		topic: 'archive',
		href: 'https://medium.com/@_gdantas',
	},
];

export default function WritingPage() {
	const ref = useReveal({ stagger: 0.05, y: 16 });
	return (
		<OperatorPage
			title="gdantas ─ tail -f ~/.writing"
			description="Notas, drafts e posts. AI ops, plataforma, observabilidade."
			active="/writing">
			<div ref={ref}>
				<Sec label="01" title="tail -f ~/.writing" sub="notes · drafts · published" />

				<div
					style={{
						marginTop: 28,
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
							gridTemplateColumns: '90px 70px 1fr 110px',
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
					{POSTS.map((p) => {
						const isLive = p.status === 'live';
						const content = (
							<>
								<span style={{ color: OP.dim }}>{p.date}</span>
								<span
									style={{
										fontSize: 10,
										color: isLive ? OP.ok : OP.amber,
										border: `1px solid ${isLive ? OP.ok : OP.amber}`,
										padding: '1px 6px',
										letterSpacing: '0.08em',
										alignSelf: 'center',
										justifySelf: 'start',
									}}>
									{p.status.toUpperCase()}
								</span>
								<span style={{ color: OP.fg }}>{p.title}</span>
								<span style={{ color: OP.violet, textAlign: 'right' }}>#{p.topic}</span>
							</>
						);
						const baseStyle: React.CSSProperties = {
							display: 'grid',
							gridTemplateColumns: '90px 70px 1fr 110px',
							gap: 16,
							padding: '12px 0',
							borderBottom: `1px dashed ${OP.rule}`,
							alignItems: 'center',
							textDecoration: 'none',
							color: OP.fg,
						};
						return p.href ? (
							<a key={p.slug} href={p.href} target="_blank" rel="noreferrer noopener" onClick={() => posthog.capture("writing_post_opened", { post_title: p.title, post_slug: p.slug, topic: p.topic })} style={baseStyle}>
								{content}
							</a>
						) : (
							<div key={p.slug} style={baseStyle}>
								{content}
							</div>
						);
					})}
					<div style={{ marginTop: 14, color: OP.dim, fontSize: 12 }}>
						$ tail -f ~/.writing | wc -l →{' '}
						<span style={{ color: OP.amber }}>{POSTS.length} entries</span> · drafts em
						progresso, publicações vão sendo cravadas aqui
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
					Notas longas vão sair aqui em vez do medium. Tópicos: AI ops, plataforma de
					dev, observabilidade, agentes pra incidente, RAG sobre infra. Cada draft que
					vira live abre um link clicável acima.
				</p>
			</div>
		</OperatorPage>
	);
}
