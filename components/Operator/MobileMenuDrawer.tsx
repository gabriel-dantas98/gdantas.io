import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { OP } from './tokens';

interface NavItem {
	label: string;
	href: string;
}

interface MobileMenuDrawerProps {
	items: NavItem[];
	active?: string;
	/** offset do topo (px) — depende da altura do header que veio antes do drawer */
	topOffset?: number;
}

// Burger button + overlay drawer responsivo. Visível só em mobile (<720px) via
// CSS global. Fecha ao trocar de rota e trava scroll do body enquanto aberto.
export function MobileMenuDrawer({ items, active, topOffset = 49 }: MobileMenuDrawerProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const close = () => setOpen(false);
		router.events.on('routeChangeComplete', close);
		return () => router.events.off('routeChangeComplete', close);
	}, [router.events]);

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				aria-label={open ? 'Fechar menu' : 'Abrir menu'}
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="op-nav-burger"
				style={{
					display: 'none',
					background: 'transparent',
					border: `1px solid ${OP.rule2}`,
					color: OP.amber,
					fontFamily: OP.font,
					fontSize: 13,
					padding: '6px 12px',
					letterSpacing: '0.08em',
					cursor: 'pointer',
					flexShrink: 0,
				}}>
				{open ? '[ × ]' : '[ ≡ ]'}
			</button>

			{open && (
				<div
					style={{
						position: 'fixed',
						top: topOffset,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(17,14,27,0.98)',
						backdropFilter: 'blur(8px)',
						zIndex: 19,
						padding: '24px 28px',
						overflowY: 'auto',
					}}>
					<nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
						{items.map((l) => {
							const isActive = active === l.href;
							return (
								<Link
									key={l.href}
									href={l.href}
									onClick={() => setOpen(false)}
									style={{
										color: isActive ? OP.amber : OP.fg,
										textDecoration: 'none',
										fontFamily: OP.font,
										fontSize: 18,
										letterSpacing: '0.04em',
										padding: '14px 4px',
										borderBottom: `1px dashed ${OP.rule}`,
										display: 'block',
									}}>
									<span style={{ color: OP.dim, marginRight: 8 }}>
										{isActive ? '▸' : '$'}
									</span>
									{l.label}
								</Link>
							);
						})}
					</nav>
				</div>
			)}
		</>
	);
}
