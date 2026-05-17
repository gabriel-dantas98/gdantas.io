import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { OP, Prompt, Cursor, OperatorPage, useReveal } from '~/components/Operator';

export default function ErrorPage() {
	const router = useRouter();
	const { status } = router.query;
	const code = (Array.isArray(status) ? status[0] : status) || '500';
	const ref = useReveal({ stagger: 0.08, y: 20 });

	return (
        <OperatorPage
			title={`gdantas ─ ${code}`}
			description="Algo deu errado do nosso lado."
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
						tail -f /var/log/error.log
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
						{code}
					</div>
					<div>
						<div style={{ fontSize: 22, color: OP.fg }}>
							something <span style={{ color: OP.amber }}>broke</span>
						</div>
						<div style={{ marginTop: 8, fontSize: 14, color: OP.dim }}>
							Não foi você. Foi do nosso lado. Já estamos investigando — tenta de
							novo daqui a pouco.
						</div>
					</div>
				</div>

				<div
					style={{
						marginTop: 36,
						display: 'flex',
						gap: 12,
						flexWrap: 'wrap',
					}}>
					<button
						type="button"
						onClick={() => history.go(-1)}
						style={{
							fontFamily: OP.font,
							fontSize: 12,
							color: OP.amber,
							background: 'transparent',
							border: `1px solid ${OP.amber}`,
							padding: '8px 14px',
							letterSpacing: '0.08em',
							cursor: 'pointer',
							minHeight: 36,
						}}>
						← back
					</button>
					<Link href="/" style={{
                        fontFamily: OP.font,
                        fontSize: 12,
                        color: OP.ok,
                        background: 'transparent',
                        border: `1px solid ${OP.ok}`,
                        padding: '8px 14px',
                        letterSpacing: '0.08em',
                        textDecoration: 'none',
                        display: 'inline-block',
                        minHeight: 36,
                        lineHeight: '20px',
                    }}>
						
							cd ~
						
					</Link>
				</div>
			</div>
        </OperatorPage>
    );
}
