import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { OP } from './tokens';
import type { NormalizedPreview } from '~/lib/preview';

interface PreviewModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	tag?: { label: string; color: string };
	meta?: string;
	preview: NormalizedPreview | null;
	href: string;
}

// Modal de preview: iframe do material + CTA "Conferir ↗". Portal pra body
// pra escapar de containing blocks (mesmo motivo do MobileMenuDrawer).
// Fecha em backdrop click / ESC / close button.
export function PreviewModal({
	open,
	onClose,
	title,
	tag,
	meta,
	preview,
	href,
}: PreviewModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!open) return;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [open, onClose]);

	if (!mounted || !open) return null;

	const isAudio = preview?.kind === 'spotify';

	const node = (
		<div
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label={title}
			style={{
				position: 'fixed',
				inset: 0,
				background: 'rgba(11, 8, 18, 0.85)',
				backdropFilter: 'blur(6px)',
				zIndex: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '24px 16px',
				fontFamily: OP.font,
			}}>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					background: OP.bg2,
					border: `1px solid ${OP.rule2}`,
					maxWidth: 1100,
					width: '100%',
					maxHeight: '90vh',
					display: 'flex',
					flexDirection: 'column',
					boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
				}}>
				{/* HEADER */}
				<header
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '14px 18px',
						borderBottom: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.6)',
					}}>
					<span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
						<span style={{ width: 9, height: 9, borderRadius: '50%', background: OP.pager }} />
						<span style={{ width: 9, height: 9, borderRadius: '50%', background: OP.amber }} />
						<span style={{ width: 9, height: 9, borderRadius: '50%', background: OP.ok }} />
					</span>
					{tag && (
						<span
							style={{
								fontSize: 10,
								color: tag.color,
								border: `1px solid ${tag.color}`,
								padding: '2px 8px',
								letterSpacing: '0.12em',
								flexShrink: 0,
							}}>
							{tag.label}
						</span>
					)}
					<span
						style={{
							fontSize: 12,
							color: OP.fg,
							flex: 1,
							minWidth: 0,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}>
						{title}
					</span>
					{meta && (
						<span
							className="op-modal-meta"
							style={{ fontSize: 11, color: OP.dim, flexShrink: 0 }}>
							{meta}
						</span>
					)}
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar"
						style={{
							background: 'transparent',
							border: `1px solid ${OP.rule2}`,
							color: OP.amber,
							fontFamily: OP.font,
							fontSize: 13,
							padding: '4px 10px',
							cursor: 'pointer',
							letterSpacing: '0.08em',
							flexShrink: 0,
						}}>
						[ × ]
					</button>
				</header>

				{/* BODY — preview ou fallback */}
				<div
					style={{
						flex: 1,
						minHeight: 0,
						background: '#000',
						overflow: 'auto',
					}}>
					{preview ? (
						<div
							style={{
								width: '100%',
								height: isAudio ? 232 : 'min(70vh, 620px)',
								position: 'relative',
							}}>
							<iframe
								title={title}
								src={preview.src}
								loading="lazy"
								referrerPolicy="strict-origin-when-cross-origin"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowFullScreen
								style={{
									width: '100%',
									height: '100%',
									border: 0,
									background: '#000',
								}}
							/>
						</div>
					) : (
						<div
							style={{
								padding: '48px 24px',
								textAlign: 'center',
								fontFamily: OP.sans,
								fontSize: 14,
								color: OP.dim,
							}}>
							Preview indisponível pra esse formato — clica em &ldquo;Conferir&rdquo;
							pra abrir direto na fonte.
						</div>
					)}
				</div>

				{/* FOOTER — CTA */}
				<footer
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 12,
						padding: '14px 18px',
						borderTop: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.6)',
					}}>
					<span style={{ fontSize: 11, color: OP.dim, letterSpacing: '0.06em' }}>
						$ open {preview?.kind || 'external'}
					</span>
					<a
						href={href}
						target="_blank"
						rel="noreferrer noopener"
						style={{
							fontFamily: OP.font,
							fontSize: 13,
							color: OP.bg,
							background: OP.amber,
							padding: '8px 18px',
							textDecoration: 'none',
							letterSpacing: '0.08em',
							border: `1px solid ${OP.amber}`,
							fontWeight: 500,
						}}>
						conferir ↗
					</a>
				</footer>
			</div>

			<style jsx>{`
				@media (max-width: 600px) {
					:global(.op-modal-meta) {
						display: none !important;
					}
				}
			`}</style>
		</div>
	);

	return createPortal(node, document.body);
}
