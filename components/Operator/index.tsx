import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

declare global {
	interface Window {
		gsap: any;
		ScrollTrigger: any;
	}
}

// Insight Valley palette — "sol entre montanhas" tinta o Operator CRT.
export const OP = {
	bg: '#110e1b',
	bg2: '#1a1528',
	bg3: '#221c35',
	bg4: '#252237',
	fg: '#f8f8f9',
	dim: '#a097b5',
	dim2: '#9089a2',
	amber: '#dea627',
	amber2: '#d1a32e',
	violet: '#9650c0',
	violet2: '#7a409b',
	pager: '#c83ea7',
	ok: '#7fb886',
	rule: 'rgba(248,248,249,0.10)',
	rule2: 'rgba(248,248,249,0.18)',
	font: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
	sans: '"IBM Plex Sans", system-ui, sans-serif',
};

const NAV_LINKS: { label: string; href: string }[] = [
	{ label: './about', href: '/about' },
	{ label: './career', href: '/timeline' },
	{ label: './doctrine', href: '/doctrine' },
	{ label: './talks', href: '/talks' },
	{ label: './projects', href: '/projects' },
	{ label: './writing', href: '/writing' },
];

export function useUtcClock() {
	const [now, setNow] = useState<string>('');
	useEffect(() => {
		const fmt = () => new Date().toISOString().slice(0, 19).replace('T', ' ') + 'Z';
		setNow(fmt());
		const id = window.setInterval(() => setNow(fmt()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

export function useReveal({
	delay = 0,
	stagger = 0,
	y = 18,
	duration = 0.7,
	scroll = false,
}: { delay?: number; stagger?: number; y?: number; duration?: number; scroll?: boolean } = {}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let cancelled = false;
		let attempts = 0;
		const start = () => {
			if (cancelled || !ref.current || !window.gsap) return;
			if (scroll && !window.ScrollTrigger && attempts++ < 30) {
				return setTimeout(start, 80);
			}
			const el = ref.current;
			const targets = stagger ? (el.children as unknown as Element[]) : el;
			const trig =
				scroll && window.ScrollTrigger
					? { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
					: {};
			window.gsap.fromTo(
				targets,
				{ opacity: 0, y },
				{
					opacity: 1,
					y: 0,
					duration,
					ease: 'power3.out',
					stagger,
					delay,
					overwrite: 'auto',
					...trig,
				},
			);
		};
		start();
		return () => {
			cancelled = true;
		};
	}, [delay, stagger, y, duration, scroll]);
	return ref;
}

export function Cursor({ color = OP.amber }: { color?: string }) {
	return (
		<span
			style={{
				display: 'inline-block',
				width: '0.55em',
				height: '1em',
				verticalAlign: '-0.12em',
				background: color,
				marginLeft: 4,
				animation: 'op-blink 1s steps(2) infinite',
			}}
		/>
	);
}

export function Prompt({ path = '~', children }: { path?: string; children?: React.ReactNode }) {
	return (
		<span style={{ fontFamily: OP.font }}>
			<span style={{ color: OP.ok }}>gd@platform</span>
			<span style={{ color: OP.dim }}>:</span>
			<span style={{ color: OP.amber }}>{path}</span>
			<span style={{ color: OP.dim }}>$</span>{' '}
			<span style={{ color: OP.fg }}>{children}</span>
		</span>
	);
}

export function Sec({ label, title, sub }: { label: string; title: string; sub?: string }) {
	return (
		<div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
			<span style={{ fontFamily: OP.font, fontSize: 12, color: OP.dim2, letterSpacing: '0.1em' }}>
				{label}
			</span>
			<h2
				style={{
					margin: 0,
					fontFamily: OP.font,
					fontSize: 28,
					fontWeight: 500,
					letterSpacing: '-0.01em',
					color: OP.fg,
				}}>
				{title}
			</h2>
			{sub && (
				<span style={{ fontFamily: OP.font, fontSize: 13, color: OP.dim }}>{'// '}{sub}</span>
			)}
		</div>
	);
}

export function OperatorHeader({ active }: { active?: string }) {
	const clock = useUtcClock();
	return (
		<header
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				padding: '14px 28px',
				borderBottom: `1px solid ${OP.rule}`,
				background: 'rgba(17,14,27,0.85)',
				backdropFilter: 'blur(6px)',
				position: 'sticky',
				top: 0,
				zIndex: 20,
				fontFamily: OP.font,
				fontSize: 12,
				color: OP.dim,
			}}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
				<span style={{ display: 'flex', gap: 6 }}>
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.pager }} />
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.amber }} />
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.ok }} />
				</span>
				<Link href="/" passHref>
					<a
						style={{
							color: OP.fg,
							textDecoration: 'none',
							letterSpacing: '0.08em',
							cursor: 'pointer',
						}}>
						tty/0
					</a>
				</Link>
				<span style={{ color: OP.dim }}>·</span>
				<span>gdantas.io</span>
				<span style={{ color: OP.dim }}>·</span>
				<span style={{ color: OP.amber }} suppressHydrationWarning>
					{clock || '—'}
				</span>
			</div>
			<nav style={{ display: 'flex', gap: 18 }}>
				{NAV_LINKS.map((l) => {
					const isActive = active === l.href;
					return (
						<Link key={l.href} href={l.href} passHref>
							<a
								className="op-nav-link"
								style={{
									color: isActive ? OP.amber : OP.fg,
									textDecoration: 'none',
									letterSpacing: '0.04em',
									position: 'relative',
								}}>
								{isActive ? '▸ ' : '  '}
								{l.label}
							</a>
						</Link>
					);
				})}
			</nav>
		</header>
	);
}

export function OperatorFooter() {
	return (
		<footer
			style={{
				marginTop: 96,
				padding: '32px 28px 40px',
				borderTop: `1px solid ${OP.rule}`,
				display: 'grid',
				gridTemplateColumns: '1fr auto',
				gap: 32,
				alignItems: 'end',
				fontFamily: OP.font,
				fontSize: 13,
				color: OP.dim,
			}}>
			<div>
				<div>
					<Prompt path="~">echo $SIGN</Prompt>
				</div>
				<div
					style={{
						fontSize: 48,
						fontWeight: 500,
						letterSpacing: '-0.025em',
						marginTop: 10,
						color: OP.fg,
					}}>
					— <span style={{ color: OP.amber }}>gd</span>
				</div>
				<div style={{ marginTop: 6 }}>Osasco / São Paulo · BR</div>
			</div>
			<div style={{ textAlign: 'right' }}>
				<div style={{ color: OP.dim }}>./contact</div>
				{[
					{ url: 'https://www.linkedin.com/in/gabrieldantasg/', label: 'linkedin/gabrieldantasg' },
					{ url: 'https://github.com/gabriel-dantas98', label: 'github/gabriel-dantas98' },
					{ url: 'https://medium.com/@_gdantas', label: 'medium/@_gdantas' },
				].map((c) => (
					<div key={c.url} style={{ marginTop: 4 }}>
						<a
							href={c.url}
							target="_blank"
							rel="noreferrer noopener"
							style={{
								color: OP.fg,
								textDecoration: 'none',
								display: 'inline-block',
								padding: '6px 0',
								minHeight: 24,
							}}>
							{c.label} ↗
						</a>
					</div>
				))}
			</div>
		</footer>
	);
}

export function OperatorPage({
	title,
	description,
	active,
	children,
}: {
	title: string;
	description?: string;
	active?: string;
	children: React.ReactNode;
}) {
	return (
		<>
			<Head>
				<title>{title}</title>
				{description && <meta name="description" content={description} />}
				<style>{`
					html, body { background: ${OP.bg}; scroll-behavior: smooth; }
					body { font-family: ${OP.sans}; color: ${OP.fg}; margin: 0; }
					@keyframes op-blink { 50% { opacity: 0 } }
					.op-nav-link { transition: color 120ms ease; }
					.op-nav-link:hover { color: ${OP.amber} !important; }
					.op-fade-in { opacity: 0; }
				`}</style>
			</Head>
			<Script
				src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
				strategy="afterInteractive"
			/>
			<Script
				src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
				strategy="afterInteractive"
			/>
			<div
				style={{
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.sans,
				}}>
				<OperatorHeader active={active} />
				<main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 0' }}>{children}</main>
				<OperatorFooter />
			</div>
		</>
	);
}
