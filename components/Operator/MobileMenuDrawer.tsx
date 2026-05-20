import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { OP } from './tokens';
import { LangSwitcher } from './LangSwitcher';

interface NavItem {
	label: string;
	href: string;
}

interface MobileMenuDrawerProps {
	items: NavItem[];
	active?: string;
	/** offset do topo do drawer (px) — esconde o header sticky atrás dele */
	topOffset?: number;
}

// Burger button + overlay drawer responsivo. O overlay é montado via Portal em
// document.body porque o <header> tem `backdrop-filter: blur` que cria
// containing block pra position:fixed — sem portal o drawer fica preso dentro
// do header (height = 48px em vez de viewport - top).
export function MobileMenuDrawer({ items, active, topOffset = 49 }: MobileMenuDrawerProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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

	const overlay = open ? (
		<div
			role="dialog"
			aria-modal="true"
			style={{
				position: 'fixed',
				top: topOffset,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(17,14,27,0.98)',
				backdropFilter: 'blur(8px)',
				zIndex: 30,
				padding: '24px 28px',
				overflowY: 'auto',
				fontFamily: OP.font,
			}}>
			<div style={{ marginBottom: 20 }}>
				<LangSwitcher />
			</div>
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
	) : null;

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
			{mounted && overlay && createPortal(overlay, document.body)}
			{/* CSS responsivo viaja com o componente — não depende de quem o
			   monta (OperatorHeader sticky vs topbar bespoke da home). */}
			<style jsx global>{`
				@media (max-width: 720px) {
					.op-nav-burger {
						display: inline-block !important;
					}
				}
			`}</style>
		</>
	);
}
