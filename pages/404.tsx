import React from 'react';
import Link from 'next/link';

import { OP, Prompt, Cursor, OperatorPage, useReveal } from '~/components/Operator';

export default function NotFoundPage() {
	const ref = useReveal({ stagger: 0.08, y: 20 });
	return (
		<OperatorPage
			title="gdantas ─ 404 not found"
			description="Página não encontrada."
			active="/">
			<div
				ref={ref}
				style={{
					maxWidth: 720,
					padding: '64px 0',
					fontFamily: OP.font,
				}}>
				<div style={{ fontSize: 13, color: OP.dim }}>
					<Prompt path="~">
						cat /var/log/access.log | grep 404
						<Cursor />
					</Prompt>
				</div>

				<div
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'auto 1fr',
						gap: 28,
						alignItems: 'baseline',
					}}>
					<div
						style={{
							fontSize: 112,
							color: OP.pager,
							lineHeight: 1,
							letterSpacing: '-0.04em',
							fontWeight: 500,
							textShadow: `0 0 22px ${OP.pager}55`,
						}}>
						404
					</div>
					<div>
						<div style={{ fontSize: 22, color: OP.fg }}>
							route <span style={{ color: OP.amber }}>not found</span>
						</div>
						<div style={{ marginTop: 8, fontSize: 14, color: OP.dim }}>
							Esse caminho não existe no sistema — pode ter sido renomeado,
							removido, ou nunca existiu mesmo.
						</div>
					</div>
				</div>

				<div
					style={{
						marginTop: 36,
						border: `1px solid ${OP.rule}`,
						background: OP.bg2,
						padding: '22px 24px',
						fontSize: 14,
						color: OP.fg,
					}}>
					<div style={{ color: OP.dim, fontSize: 12, marginBottom: 12 }}>
						./suggested-routes
					</div>
					<ul
						style={{
							margin: 0,
							padding: 0,
							listStyle: 'none',
							display: 'grid',
							gap: 8,
						}}>
						{[
							['/', 'home — topology + stack + ping'],
							['/about', 'cat ~/.about'],
							['/talks', 'ls ~/talks'],
							['/projects', 'kubectl get projects'],
							['/links', 'ls ~/.links'],
						].map(([href, desc]) => (
							<li key={href}>
								<Link href={href} passHref>
									<a
										style={{
											display: 'inline-block',
											color: OP.amber,
											textDecoration: 'none',
											padding: '4px 0',
											minHeight: 24,
										}}>
										<span style={{ color: OP.dim }}>cd</span> {href}{' '}
										<span style={{ color: OP.dim }}>{'// '}{desc}</span>
									</a>
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div style={{ marginTop: 32, fontSize: 13, color: OP.dim }}>
					<Prompt path="~">
						exit 404
						<Cursor />
					</Prompt>
				</div>
			</div>
		</OperatorPage>
	);
}
