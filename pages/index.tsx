import Head from 'next/head';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useSeoProps } from '~/lib';
import ProfilePicture from '../public/profile-photo.jpg';

declare global {
	interface Window {
		gsap: any;
		ScrollTrigger: any;
	}
}

const imgLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
	`${src}?w=${width}&q=${quality || 75}`;

// Insight Valley palette — "sol entre montanhas" tinta o Operator CRT.
// Mantém estrutura terminal/scanlines, troca true-black por ink purple-deep
// e os accents (amber/pager) por sun yellow + accent pink. Verde fica pra
// semântica "ok/healthy" pra status não perder leitura.
const OP = {
	bg: '#110e1b', // ink
	bg2: '#1a1528', // ink-2
	bg3: '#221c35', // ink-3
	bg4: '#252237', // ink-4 (highlight)
	fg: '#f8f8f9', // paper
	dim: '#a097b5',
	dim2: '#9089a2',
	amber: '#dea627', // accent-yellow (sun)
	amber2: '#d1a32e', // sun shade
	violet: '#9650c0', // accent-violet (mountain)
	violet2: '#7a409b',
	pager: '#c83ea7', // accent-pink (critical/highlight)
	ok: '#7fb886', // healthy — keep green pra status
	rule: 'rgba(248,248,249,0.10)',
	rule2: 'rgba(248,248,249,0.18)',
	font: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
	sans: '"IBM Plex Sans", system-ui, sans-serif',
};

// — live ticking utilities —

function useTicker(intervalMs = 1000) {
	const [, setTick] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
}

function useUtcClock() {
	const [now, setNow] = useState<string>('');
	useEffect(() => {
		const fmt = () =>
			new Date().toISOString().slice(0, 19).replace('T', ' ') + 'Z';
		setNow(fmt());
		const id = window.setInterval(() => setNow(fmt()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

// Career start: 2016-06-01 (Glambox intern). Live uptime ticker.
const CAREER_START = new Date('2016-06-01T00:00:00Z').getTime();
function useUptime() {
	const [text, setText] = useState('');
	useEffect(() => {
		const calc = () => {
			const diff = Date.now() - CAREER_START;
			const s = Math.floor(diff / 1000) % 60;
			const m = Math.floor(diff / 60000) % 60;
			const h = Math.floor(diff / 3600000) % 24;
			const d = Math.floor(diff / 86400000);
			const years = Math.floor(d / 365);
			const months = Math.floor((d % 365) / 30);
			const days = (d % 365) % 30;
			return `${years}y ${months}m ${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		};
		setText(calc());
		const id = window.setInterval(() => setText(calc()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return text;
}

function useTypewriter(text: string, speed = 35, startDelay = 0) {
	const [out, setOut] = useState('');
	useEffect(() => {
		let i = 0;
		setOut('');
		const start = window.setTimeout(() => {
			const id = window.setInterval(() => {
				i += 1;
				setOut(text.slice(0, i));
				if (i >= text.length) window.clearInterval(id);
			}, speed);
		}, startDelay);
		return () => window.clearTimeout(start);
	}, [text, speed, startDelay]);
	return out;
}

function useMouseSpotlight(ref: React.RefObject<HTMLElement>) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onMove = (e: MouseEvent) => {
			const r = el.getBoundingClientRect();
			const x = ((e.clientX - r.left) / r.width) * 100;
			const y = ((e.clientY - r.top) / r.height) * 100;
			el.style.setProperty('--mx', `${x}%`);
			el.style.setProperty('--my', `${y}%`);
		};
		el.addEventListener('mousemove', onMove);
		return () => el.removeEventListener('mousemove', onMove);
	}, [ref]);
}

// horizontal infinite ticker of CNCF tools
function Marquee({ items, speed = 60 }: { items: string[]; speed?: number }) {
	const doubled = [...items, ...items];
	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
				borderTop: `1px solid ${OP.rule}`,
				borderBottom: `1px solid ${OP.rule}`,
				padding: '14px 0',
				background: 'rgba(17,14,27,0.85)',
				maskImage:
					'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
				WebkitMaskImage:
					'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
			}}>
			<div
				style={{
					display: 'flex',
					gap: 36,
					whiteSpace: 'nowrap',
					width: 'max-content',
					animation: `op-marquee ${speed}s linear infinite`,
				}}>
				{doubled.map((t, i) => (
					<span
						key={`${t}-${i}`}
						style={{
							fontFamily: OP.font,
							fontSize: 13,
							color: i % 5 === 0 ? OP.amber : OP.dim,
							letterSpacing: '0.06em',
						}}>
						<span style={{ color: OP.dim }}>[</span>
						{t}
						<span style={{ color: OP.dim }}>]</span>
					</span>
				))}
			</div>
			<style>{`@keyframes op-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
		</div>
	);
}

function Cursor({ color = OP.amber }: { color?: string }) {
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

function Prompt({
	path = '~',
	children,
}: {
	path?: string;
	children?: React.ReactNode;
}) {
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

function useReveal({
	delay = 0,
	stagger = 0,
	y = 18,
	duration = 0.7,
	scroll = false,
}: {
	delay?: number;
	stagger?: number;
	y?: number;
	duration?: number;
	scroll?: boolean;
} = {}) {
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
			const trig = scroll && window.ScrollTrigger
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

const PLATFORM_TOOLS = [
	'kubernetes', 'helm', 'argocd', 'fluxcd', 'prometheus', 'grafana', 'opentelemetry',
	'jaeger', 'tempo', 'loki', 'envoy', 'istio', 'linkerd', 'cert-manager', 'external-dns',
	'karpenter', 'crossplane', 'backstage.io', 'terraform', 'pulumi', 'vault', 'etcd',
	'kyverno', 'opa', 'tekton', 'spinnaker', 'cilium', 'falco', 'kustomize', 'velero',
	'fluentd', 'thanos', 'cortex', 'keda', 'knative', 'contour', 'traefik', 'rook',
	'longhorn', 'dragonfly', 'litmus', 'chaos-mesh', 'minio', 'redis', 'kafka',
];

function PlatformBg() {
	const items = PLATFORM_TOOLS.map((t, i) => {
		const x = (i * 47 + 11) % 100;
		const y = (i * 71 + 23) % 100;
		const dur = 22 + ((i * 13) % 26);
		const del = -((i * 9) % 30);
		const op = 0.05 + ((i * 3) % 7) * 0.012;
		const dx = (i % 2 ? 1 : -1) * (12 + ((i * 5) % 18));
		const dy = (i % 3 ? -1 : 1) * (10 + ((i * 7) % 22));
		const accent = i % 9 === 0;
		return { t, x, y, dur, del, op, dx, dy, accent };
	});
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				pointerEvents: 'none',
				zIndex: 0,
			}}>
			{items.map((p, i) => (
				<span
					key={p.t}
					style={{
						position: 'absolute',
						left: `${p.x}%`,
						top: `${p.y}%`,
						fontFamily: OP.font,
						fontSize: 12,
						whiteSpace: 'nowrap',
						color: p.accent ? OP.amber : OP.fg,
						opacity: p.op,
						animation: `op-drift-${i} ${p.dur}s ease-in-out ${p.del}s infinite`,
						textShadow: p.accent ? `0 0 12px ${OP.amber}88` : 'none',
					}}>
					<span style={{ color: OP.dim }}>[</span>
					{p.t}
					<span style={{ color: OP.dim }}>]</span>
				</span>
			))}
			<style>
				{items
					.map(
						(p, i) => `@keyframes op-drift-${i}{0%{transform:translate(0,0)}50%{transform:translate(${p.dx}px,${p.dy}px)}100%{transform:translate(0,0)}}`,
					)
					.join('')}
			</style>
		</div>
	);
}

// Reduzido pra 24 ícones (era 44) — corta ~20 requests pro cdn.simpleicons.org.
// Mantém os mais reconhecíveis pra preservar a vibe CNCF wallpaper.
const HERO_ICONS = [
	'kubernetes', 'docker', 'helm', 'terraform', 'grafana', 'prometheus',
	'opentelemetry', 'istio', 'vault', 'cilium', 'github', 'githubactions',
	'redis', 'postgresql', 'apachekafka', 'elasticsearch', 'python', 'go',
	'typescript', 'cloudflare', 'nodedotjs', 'anthropic', 'langchain', 'hashicorp',
];

function HeroIconRain() {
	const ref = useRef<HTMLDivElement>(null);
	const items = useMemo(
		() =>
			HERO_ICONS.map((slug, i) => ({
				slug,
				x: (i * 71 + 13) % 100,
				y: (i * 53 + 29) % 100,
				size: 28 + ((i * 11) % 5) * 6,
				rot0: ((i * 37) % 30) - 15,
				rot1: ((i * 41) % 30) - 15 + (i % 2 ? 40 : -40),
				dx: (i % 2 ? 1 : -1) * (18 + ((i * 7) % 22)),
				dy: (i % 3 ? -1 : 1) * (22 + ((i * 5) % 28)),
				dur: 14 + ((i * 13) % 18),
				del: -((i * 7) % 20),
				op: 0.18 + ((i * 19) % 11) * 0.012,
				accent: i % 7 === 0,
			})),
		[],
	);

	useEffect(() => {
		if (!ref.current || !window.gsap) return;
		const nodes = ref.current.querySelectorAll('.op-hero-icon');
		nodes.forEach((node, i) => {
			const p = items[i];
			window.gsap.to(node, {
				x: p.dx,
				y: p.dy,
				rotation: p.rot1,
				duration: p.dur,
				delay: p.del,
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true,
			});
			window.gsap.to(node, {
				opacity: p.op * 1.6,
				duration: 3 + (i % 5),
				ease: 'sine.inOut',
				repeat: -1,
				yoyo: true,
				delay: -((i * 3) % 6),
			});
		});
	}, [items]);

	return (
		<div
			ref={ref}
			aria-hidden="true"
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				pointerEvents: 'none',
				zIndex: 0,
				maskImage:
					'radial-gradient(ellipse 90% 70% at 50% 50%, #000 30%, transparent 90%)',
				WebkitMaskImage:
					'radial-gradient(ellipse 90% 70% at 50% 50%, #000 30%, transparent 90%)',
			}}>
			{items.map((p, i) => (
				<img
					key={p.slug + i}
					className="op-hero-icon"
					src={`https://cdn.simpleicons.org/${p.slug}/${p.accent ? 'dea627' : 'f8f8f9'}`}
					alt=""
					width={p.size}
					height={p.size}
					loading="lazy"
					decoding="async"
					onError={(e) => {
						const t = e.target as HTMLImageElement;
						t.style.visibility = 'hidden';
						t.style.opacity = '0';
						t.removeAttribute('src');
					}}
					style={{
						position: 'absolute',
						left: `${p.x}%`,
						top: `${p.y}%`,
						width: p.size,
						height: p.size,
						opacity: p.op,
						transform: `rotate(${p.rot0}deg)`,
						filter: p.accent ? `drop-shadow(0 0 12px ${OP.amber}66)` : 'none',
					}}
				/>
			))}
		</div>
	);
}

function Sec({ label, title, sub }: { label: string; title: string; sub: string }) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'baseline',
				gap: 18,
				position: 'relative',
				zIndex: 1,
				flexWrap: 'wrap',
			}}>
			<span style={{ fontSize: 12, color: OP.dim, letterSpacing: '0.12em' }}>{label}</span>
			<span style={{ fontSize: 26, color: OP.fg }}>{title}</span>
			<span style={{ fontSize: 13, color: OP.dim }}>{'// '}{sub}</span>
		</div>
	);
}

function Role({
	tag,
	role,
	children,
}: {
	tag: string;
	role: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ borderTop: `1px solid ${OP.rule}`, paddingTop: 18, marginTop: 18 }}>
			<div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
				<span style={{ fontSize: 11, color: OP.dim, letterSpacing: '0.1em' }}>{tag}</span>
				<span style={{ fontSize: 22, color: OP.amber, fontWeight: 500 }}>{role}</span>
			</div>
			<div
				style={{
					fontFamily: OP.sans,
					fontSize: 16,
					lineHeight: 1.55,
					color: OP.fg,
					marginTop: 10,
				}}>
				{children}
			</div>
		</div>
	);
}

type Talk = {
	date: string;
	event: string;
	loc: string;
	kind: 'video' | 'slides' | 'slides+code';
	slug: string;
	title: string;
	preview: string;
	runtime?: string;
	slides?: number;
	youtubeId?: string;
	slidesEmbed?: string;
	href: string;
	links: Array<[string, string]>;
};

function TalkPreview({ talk }: { talk: Talk }) {
	const isVideo = talk.kind === 'video';
	const accent = isVideo ? OP.ok : OP.amber;
	const thumb = talk.youtubeId
		? `https://img.youtube.com/vi/${talk.youtubeId}/hqdefault.jpg`
		: null;
	return (
		<div
			style={{
				aspectRatio: '16/9',
				background: '#06080a',
				position: 'relative',
				borderBottom: `1px solid ${OP.rule2}`,
				overflow: 'hidden',
			}}>
			{thumb && (
				<img
					src={thumb}
					alt={talk.title}
					loading="lazy"
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						filter: 'brightness(0.55) saturate(0.8)',
					}}
				/>
			)}
			{/* Slides embed só carrega na /presentations; aqui só placeholder visual */}
			{!thumb && talk.slidesEmbed && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'grid',
						placeItems: 'center',
						background: `repeating-linear-gradient(135deg, ${OP.bg2} 0 12px, ${OP.bg3} 12px 24px)`,
						color: OP.dim,
						fontFamily: OP.font,
						fontSize: 11,
						letterSpacing: '0.1em',
					}}>
					[ ./slides ↗ ]
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					opacity: thumb || talk.slidesEmbed ? 0.4 : 0.6,
					backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.025) 2px 3px), radial-gradient(ellipse at center, ${accent}11 0%, transparent 65%)`,
					pointerEvents: 'none',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					padding: '8px 12px',
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontFamily: OP.font,
					fontSize: 11,
					color: OP.dim,
					background: 'rgba(0,0,0,0.65)',
					borderBottom: `1px solid ${OP.rule}`,
				}}>
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.pager }} />
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.amber }} />
				<span style={{ width: 8, height: 8, borderRadius: 99, background: OP.ok }} />
				<span style={{ marginLeft: 6 }}>
					{isVideo ? '~/talks/video' : '~/talks/slides'} · {talk.slug}
				</span>
				<span style={{ marginLeft: 'auto', color: accent }}>
					{isVideo ? '▸ video' : '▤ deck'}
				</span>
			</div>
			{!thumb && !talk.slidesEmbed && (
				<div
					style={{
						position: 'absolute',
						inset: '40px 26px 56px',
						display: 'flex',
						alignItems: 'center',
					}}>
					<div
						style={{
							fontFamily: OP.font,
							fontSize: 16,
							color: OP.fg,
							lineHeight: 1.3,
							maxWidth: '94%',
						}}>
						<span style={{ color: accent }}>›</span> {talk.preview}
					</div>
				</div>
			)}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					padding: '8px 12px',
					display: 'flex',
					justifyContent: 'space-between',
					fontFamily: OP.font,
					fontSize: 11,
					color: OP.dim,
					background: 'rgba(0,0,0,0.65)',
					borderTop: `1px solid ${OP.rule}`,
				}}>
				<span>{talk.date}</span>
				<span>{talk.runtime || (isVideo ? '—:—' : `${talk.slides || '∞'} slides`)}</span>
			</div>
			<div
				style={{
					position: 'absolute',
					right: 18,
					bottom: 36,
					width: 44,
					height: 44,
					borderRadius: 99,
					border: `1px solid ${accent}`,
					color: accent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'rgba(0,0,0,0.65)',
					fontSize: 16,
				}}>
				{isVideo ? '▶' : '↗'}
			</div>
		</div>
	);
}

function Topology({ width = 1152, height = 520 }: { width?: number; height?: number }) {
	const ref = useRef<SVGSVGElement>(null);
	const cx = width / 2;
	const cy = height / 2;
	const radius = Math.min(width, height) * 0.42;
	const yScale = 0.75;

	const sats = useMemo(
		() =>
			[
				{ id: 'k8s', label: 'kubernetes', angle: -120, kind: 'orchestration' },
				{ id: 'aws', label: 'aws · multi-region', angle: -80, kind: 'cloud' },
				{ id: 'tf', label: 'terraform · opentofu', angle: -40, kind: 'iac' },
				{ id: 'obs', label: 'lgtm · prom · thanos · otel', angle: 0, kind: 'observability' },
				{ id: 'idp', label: 'backstage.io', angle: 40, kind: 'portal' },
				{ id: 'gitops', label: 'argocd · atlantis', angle: 80, kind: 'gitops' },
				{ id: 'ai', label: 'cursor · claude code · langgraph · mcps', angle: 120, kind: 'ai-agents' },
				{ id: 'sec', label: 'vault · opa', angle: 160, kind: 'security' },
				{ id: 'dev', label: 'developers', angle: 200, kind: 'consumer' },
			].map((s) => {
				const a = (s.angle * Math.PI) / 180;
				return {
					...s,
					x: cx + Math.cos(a) * radius,
					y: cy + Math.sin(a) * radius * yScale,
				};
			}),
		[cx, cy, radius],
	);

	useEffect(() => {
		if (!ref.current || !window.gsap) return;
		const root = ref.current;
		const q = (sel: string) => root.querySelectorAll(sel);

		window.gsap.fromTo(
			'.fx-core-ring',
			{ attr: { r: 36 }, opacity: 0.7 },
			{ attr: { r: 64 }, opacity: 0, duration: 2.2, ease: 'power2.out', repeat: -1 },
		);
		window.gsap.to(q('.fx-sat-ring'), {
			attr: { r: 14 },
			opacity: 0,
			duration: 2,
			ease: 'power2.out',
			repeat: -1,
			stagger: { each: 0.18, from: 'random' },
		});
		// 3 pacotes por edge, com fases offset → várias request/response simultâneas
		// como um cluster real. Cor varia (amber/ok/violet) pra reforçar a vibe.
		sats.forEach((s, i) => {
			const colors = [OP.amber, OP.ok, OP.violet];
			for (let p = 0; p < 3; p += 1) {
				const pkt = root.querySelector(`.fx-pkt-${i}-${p}`);
				if (!pkt) continue;
				const tl = window.gsap.timeline({
					repeat: -1,
					defaults: { ease: 'sine.inOut' },
				});
				const outDur = 1.2 + ((i + p) % 3) * 0.2;
				const inDur = 1.1 + ((i + p) % 2) * 0.25;
				tl.set(pkt, { attr: { cx, cy, fill: colors[p % colors.length] }, opacity: 0 })
					.to(pkt, { opacity: 1, duration: 0.14 })
					.to(pkt, { attr: { cx: s.x, cy: s.y }, duration: outDur })
					.to(pkt, { opacity: 0, duration: 0.12 })
					.to({}, { duration: 0.2 + (i % 3) * 0.08 })
					.set(pkt, { attr: { cx: s.x, cy: s.y } })
					.to(pkt, { opacity: 1, duration: 0.14 })
					.to(pkt, { attr: { cx, cy }, duration: inDur })
					.to(pkt, { opacity: 0, duration: 0.12 })
					.to({}, { duration: 0.3 + (i % 3) * 0.15 });
				tl.progress(((i * 0.13) + p * 0.34) % 1);
			}
		});
	}, [sats, cx, cy]);

	return (
		<svg
			ref={ref}
			viewBox={`0 0 ${width} ${height}`}
			style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
			{[radius * 0.5, radius * 0.78, radius].map((r, i) => (
				<ellipse
					key={i}
					cx={cx}
					cy={cy}
					rx={r}
					ry={r * yScale}
					fill="none"
					stroke={OP.rule}
					strokeWidth="1"
					strokeDasharray="2 6"
				/>
			))}
			{sats.map((s) => (
				<line
					key={s.id}
					x1={cx}
					y1={cy}
					x2={s.x}
					y2={s.y}
					stroke={OP.amber}
					strokeOpacity="0.35"
					strokeWidth="1"
					strokeDasharray="3 5"
				/>
			))}
			{sats.map((s) => (
				<g key={s.id}>
					<circle
						className="fx-sat-ring"
						cx={s.x}
						cy={s.y}
						r="10"
						fill="none"
						stroke={OP.amber}
						strokeOpacity="0.55"
					/>
					<circle
						cx={s.x}
						cy={s.y}
						r="7"
						fill={OP.bg2}
						stroke={OP.amber}
						strokeWidth="1.3"
					/>
					<circle cx={s.x} cy={s.y} r="2.5" fill={OP.amber} />
				</g>
			))}
			{sats.flatMap((_, i) =>
				[0, 1, 2].map((p) => (
					<circle
						key={`pkt-${i}-${p}`}
						className={`fx-pkt-${i}-${p}`}
						cx={cx}
						cy={cy}
						r={p === 0 ? 4 : 3}
						fill={OP.amber}
						opacity="0"
					/>
				)),
			)}
			{sats.map((s) => {
				const offY = s.y < cy ? -22 : 26;
				return (
					<g key={`l-${s.id}`}>
						<text
							x={s.x}
							y={s.y + offY}
							fill={OP.fg}
							fontSize="12"
							fontFamily={OP.font}
							textAnchor="middle">
							[{s.label}]
						</text>
						<text
							x={s.x}
							y={s.y + offY + 14}
							fill={OP.dim}
							fontSize="10"
							fontFamily={OP.font}
							textAnchor="middle"
							letterSpacing="1">
							{s.kind.toUpperCase()}
						</text>
					</g>
				);
			})}
			<circle
				className="fx-core-ring"
				cx={cx}
				cy={cy}
				r="36"
				fill="none"
				stroke={OP.amber}
				strokeOpacity="0.7"
			/>
			<circle cx={cx} cy={cy} r="34" fill={OP.bg3} stroke={OP.amber} strokeWidth="2" />
			<text
				x={cx}
				y={cy + 4}
				fill={OP.amber}
				fontSize="15"
				fontFamily={OP.font}
				textAnchor="middle"
				fontWeight="500">
				gd
			</text>
			<text
				x={cx}
				y={cy + 54}
				fill={OP.fg}
				fontSize="11"
				fontFamily={OP.font}
				textAnchor="middle"
				letterSpacing="2">
				[ PLATFORM ]
			</text>
		</svg>
	);
}

function ClusterGrid({ rows = 4, cols = 28 }: { rows?: number; cols?: number }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current || !window.gsap) return;
		const cells = Array.from(ref.current.querySelectorAll<HTMLDivElement>('.fx-cell'));
		const timers: number[] = [];

		// Pulse "respirando" de cada pod (variação sutil de opacidade/scale).
		cells.forEach((c, i) => {
			window.gsap.fromTo(
				c,
				{ opacity: 0.6, scale: 0.94 },
				{
					opacity: 1,
					scale: 1,
					duration: 0.9 + ((i * 7) % 9) * 0.1,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
					delay: (i * 0.07) % 6,
				},
			);
		});

		// Ciclo de vida: healthy(ok) → terminating(amber) → dead(pager) → scaling(violet) → healthy
		// Cada pod sorteia um delay e dispara seu próprio mini-ciclo.
		const cycle = (cellIdx: number) => {
			const c = cells[cellIdx];
			if (!c) return;
			const tl = window.gsap.timeline({
				onComplete: () => {
					const nextDelay = 4000 + Math.random() * 9000;
					timers.push(window.setTimeout(() => cycle(cellIdx), nextDelay));
				},
			});
			tl.to(c, {
				background: OP.amber,
				boxShadow: `0 0 6px ${OP.amber}`,
				duration: 0.4,
				ease: 'power2.in',
			})
				.to(c, {
					background: OP.pager,
					boxShadow: `0 0 8px ${OP.pager}`,
					scale: 0.7,
					duration: 0.35,
					ease: 'power2.in',
				})
				.to(c, { opacity: 0.15, scale: 0.55, duration: 0.4 })
				.to(c, { opacity: 0, scale: 0.3, duration: 0.5 })
				.to(c, {
					background: OP.violet,
					boxShadow: `0 0 10px ${OP.violet}`,
					opacity: 0.7,
					scale: 0.9,
					duration: 0.6,
					ease: 'back.out(2)',
				})
				.to(c, {
					background: OP.ok,
					boxShadow: `0 0 4px ${OP.ok}88`,
					opacity: 1,
					scale: 1,
					duration: 0.5,
					ease: 'power2.out',
				})
				.to(c, { boxShadow: 'none', duration: 0.4 });
		};

		// Dispara ciclos em ~25% das células, escalonados pelos primeiros 12s.
		const targets = cells.map((_, i) => i).filter(() => Math.random() < 0.25);
		targets.forEach((i) => {
			timers.push(window.setTimeout(() => cycle(i), Math.random() * 12000));
		});

		return () => {
			timers.forEach((t) => window.clearTimeout(t));
		};
	}, []);

	// Mistura inicial: maioria ok, alguns amber (warning), poucos pager (alert).
	const initialColor = (i: number) => {
		if ((i * 17) % 41 === 0) return OP.pager;
		if ((i * 13) % 11 === 0) return OP.amber;
		return OP.ok;
	};

	return (
		<div
			ref={ref}
			style={{
				display: 'grid',
				gap: 6,
				gridTemplateColumns: `repeat(${cols}, 1fr)`,
				gridTemplateRows: `repeat(${rows}, 18px)`,
			}}>
			{Array.from({ length: rows * cols }, (_, i) => (
				<div
					key={i}
					className="fx-cell"
					style={{
						background: initialColor(i),
						borderRadius: 2,
						opacity: 0.6,
						willChange: 'transform, opacity, background',
					}}
				/>
			))}
		</div>
	);
}

const TALKS: Talk[] = [
	{
		date: '2025-12-02',
		event: 'DevOps Summit BP',
		loc: 'São Paulo · BR',
		kind: 'slides',
		slug: 'idp-portals',
		title: 'Escalando engenharia com Internal Developer Portals: navegabilidade, autonomia e governança',
		preview: 'idp.scale = navigability + autonomy + governance',
		slides: 64,
		href: 'https://www.canva.com/design/DAG1K_yOuwc/HOCw_nGAM77blCVRM9XRNw/edit',
		links: [['canva', 'slides ↗']],
	},
	{
		date: '2025-11-25',
		event: 'QuintoAndar Tech Talks',
		loc: 'Online',
		kind: 'video',
		slug: 'flaky-to-confident',
		runtime: '32:17',
		title: 'Building with AI: from flaky to confident releases',
		preview: 'flaky_tests → genai → root-cause → suggested-fix',
		youtubeId: 'uJ4BVndB6FU',
		href: 'https://www.youtube.com/watch?v=uJ4BVndB6FU',
		links: [['youtube', 'watch ↗']],
	},
	{
		date: '2025-11-18',
		event: 'Platform Days',
		loc: 'São Paulo · BR',
		kind: 'slides+code',
		slug: 'cursor-mcp-db',
		title: 'Trazendo o banco de dados para dentro da IDE com Cursor + MCP',
		preview: '$ cursor + mcp postgres → consultas em prod sem medo',
		slides: 38,
		href: 'https://github.com/gfranco9/Platform-Days-Database-MCP',
		links: [
			['drive', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-08-24',
		event: 'DevPR Config · 10 anos',
		loc: 'Maringá · PR',
		kind: 'slides+code',
		slug: 'incident-mcps',
		title: 'Criando seu Assistente de Incidentes com MCPs',
		preview: 'oncall.assistant = pager + mcp + runbooks + 🤖',
		slides: 42,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1caZhQFIXv2K4e1ljIR9I85Xv51vegV3-S64tanx4Q4M/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1caZhQFIXv2K4e1ljIR9I85Xv51vegV3-S64tanx4Q4M',
		links: [
			['gdocs', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-06-10',
		event: 'Platform Days',
		loc: 'São Paulo · BR',
		kind: 'slides+code',
		slug: 'rag-idp',
		title: 'Construindo um RAG com dados do seu Internal Developer Portal',
		preview: 'rag(idp.catalog) → answers about your own infra',
		slides: 56,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1JAKOJF8vri4hrO1z1IBOaAATrHyrMkxcThGcoq4bXxk/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1JAKOJF8vri4hrO1z1IBOaAATrHyrMkxcThGcoq4bXxk',
		links: [
			['gdocs', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-05-16',
		event: 'Platform Talks',
		loc: 'Online',
		kind: 'video',
		slug: 'qa-idp',
		title: "Discover QuintoAndar's IDP",
		preview: 'idp.case = quintoandar / backstage',
		youtubeId: 'KUsXbWtMXzc',
		runtime: '24:00',
		href: 'https://www.youtube.com/watch?v=KUsXbWtMXzc',
		links: [['youtube', 'watch ↗']],
	},
	{
		date: '2024-10-01',
		event: 'DevopsDays SP',
		loc: 'São Paulo · BR',
		kind: 'slides',
		slug: 'backstage-tf',
		title: 'Backstage 💙 Terraform',
		preview: 'backstage.scaffolder + terraform = paved road',
		slides: 47,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1y6YO9QQjlpEsgxMAOMtUvVcA0OznyMycgAR0EQYAaI8/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1y6YO9QQjlpEsgxMAOMtUvVcA0OznyMycgAR0EQYAaI8',
		links: [['gdocs', 'slides ↗']],
	},
	{
		date: '2023-07-12',
		event: 'QuintoAndar Tech Talk',
		loc: 'Online',
		kind: 'video',
		slug: 'idp-backstage',
		title: 'Como desenvolvemos o developer portal usando o Backstage.io',
		preview: 'backstage.io → portal de devs no QA',
		youtubeId: 'Y57gUwb1v3g',
		runtime: '28:00',
		href: 'https://www.youtube.com/watch?v=Y57gUwb1v3g',
		links: [['youtube', 'watch ↗']],
	},
];

const TOPICS = [
	'backstage', 'idp', 'rag sobre infra', 'agentes com mcp', 'observabilidade',
	'otel', 'paved roads', 'devex', 'sre', 'sli/slo', 'incident response',
	'go', 'python', 'k8s', 'aws',
];

export default function HomePage() {
	const seo = useSeoProps();
	const heroRef = useReveal({ stagger: 0.08, delay: 0.1, y: 22 });
	const topoRef = useReveal({ stagger: 0.05, y: 30, scroll: true });
	const stackRef = useReveal({ stagger: 0.04, y: 14, scroll: true });
	const doctRef = useReveal({ stagger: 0.1, y: 20, scroll: true });
	const talksRef = useReveal({ stagger: 0.06, y: 18, scroll: true });
	const pingRef = useReveal({ stagger: 0.1, y: 22, scroll: true });
	const progressRef = useRef<HTMLDivElement>(null);
	const heroBlockRef = useRef<HTMLDivElement>(null);
	const clock = useUtcClock();
	const uptime = useUptime();
	const whoami = useTypewriter('whoami', 70, 200);
	const titleA = useTypewriter('gabriel', 60, 600);
	const titleB = useTypewriter('dantas', 60, 1200);
	useMouseSpotlight(heroBlockRef);

	useEffect(() => {
		let cancelled = false;
		let attempts = 0;
		const wire = () => {
			if (cancelled) return;
			if (!window.gsap || !window.ScrollTrigger) {
				if (attempts++ < 40) return setTimeout(wire, 80);
				return;
			}
			window.gsap.registerPlugin(window.ScrollTrigger);
			if (progressRef.current) {
				window.gsap.to(progressRef.current, {
					scaleX: 1,
					ease: 'none',
					scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
				});
			}
			window.gsap.to('.op-hero-icon', {
				yPercent: -25,
				ease: 'none',
				scrollTrigger: { trigger: '.op-hero-block', start: 'top top', end: 'bottom top', scrub: 0.5 },
			});
			window.gsap.utils.toArray('.op-career-row').forEach((row: HTMLElement, i: number) => {
				window.gsap.fromTo(
					row,
					{ opacity: 0, x: i % 2 === 0 ? -40 : 40 },
					{
						opacity: 1,
						x: 0,
						duration: 0.7,
						ease: 'power2.out',
						scrollTrigger: { trigger: row, start: 'top 90%', once: true },
					},
				);
			});
			window.gsap.utils.toArray('.op-stack-tile').forEach((tile: HTMLElement, i: number) => {
				window.gsap.fromTo(
					tile,
					{ opacity: 0, scale: 0.85, y: 16 },
					{
						opacity: 1,
						scale: 1,
						y: 0,
						duration: 0.5,
						delay: (i % 4) * 0.06,
						ease: 'back.out(1.4)',
						scrollTrigger: { trigger: tile, start: 'top 92%', once: true },
					},
				);
			});
		};
		wire();
		return () => {
			cancelled = true;
			if (window.ScrollTrigger) {
				window.ScrollTrigger.getAll().forEach((t: any) => t.kill());
			}
		};
	}, []);

	return (
		<>
			<NextSeo {...seo} />
			<Head>
				<style>{`
					html, body { background: ${OP.bg}; scroll-behavior: smooth; }
					body { font-family: ${OP.sans}; color: ${OP.fg}; }
					@keyframes op-blink { 50% { opacity: 0 } }
					@keyframes op-pulse {
						0%   { box-shadow: 0 0 0 0 ${OP.ok}cc; }
						70%  { box-shadow: 0 0 0 12px ${OP.ok}00; }
						100% { box-shadow: 0 0 0 0 ${OP.ok}00; }
					}
					@keyframes op-glow-amber {
						0%,100% { text-shadow: 0 0 0 ${OP.amber}00; }
						50% { text-shadow: 0 0 18px ${OP.amber}66; }
					}
					.op-tilt-card { transform-style: preserve-3d; will-change: transform; transition: transform .15s ease-out, border-color .2s; }
					.op-amber-glow { animation: op-glow-amber 3.5s ease-in-out infinite; }
					.op-mouse-spot::before {
						content: "";
						position: absolute;
						inset: 0;
						pointer-events: none;
						background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 30%), ${OP.amber}1a, transparent 55%);
						transition: background .12s ease-out;
						z-index: 1;
					}
					.op-host *, .op-host *::before, .op-host *::after { box-sizing: border-box; }
					.op-host img { display: block; max-width: 100%; }
					.op-stack-grid { grid-template-columns: repeat(4, 1fr); }
					@media (max-width: 900px) {
						.op-stack-grid { grid-template-columns: repeat(2, 1fr) !important; }
						.op-talks-grid { grid-template-columns: 1fr !important; }
						.op-doctrine-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
						.op-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
						.op-challenges-grid { grid-template-columns: 1fr !important; }
						.op-host-pad { padding: 24px 20px 64px !important; }
						.op-hero-title { font-size: 56px !important; }
						.op-topbar-nav { display: none !important; }
						.op-about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
					}
				`}</style>
			</Head>
			<Script
				src="https://unpkg.com/gsap@3.12.5/dist/gsap.min.js"
				strategy="afterInteractive"
			/>
			<Script
				src="https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js"
				strategy="afterInteractive"
				onLoad={() => {
					if (window.gsap && window.ScrollTrigger) {
						window.gsap.registerPlugin(window.ScrollTrigger);
					}
				}}
			/>
			<div
				ref={progressRef}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					height: 2,
					background: OP.amber,
					transformOrigin: '0 50%',
					transform: 'scaleX(0)',
					zIndex: 50,
					boxShadow: `0 0 12px ${OP.amber}88`,
				}}
			/>
			<main
				className="op-host op-host-pad"
				style={{
					width: '100%',
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.font,
					padding: '40px 64px 80px',
					position: 'relative',
					overflow: 'hidden',
					boxSizing: 'border-box',
				}}>
				<PlatformBg />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						opacity: 0.45,
						zIndex: 0,
						backgroundImage:
							'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.02) 2px 3px)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: -120,
						right: -120,
						width: 360,
						height: 360,
						zIndex: 0,
						background: `radial-gradient(closest-side, ${OP.amber}22, transparent 70%)`,
						pointerEvents: 'none',
					}}
				/>

				{/* TOP BAR */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						position: 'relative',
						zIndex: 1,
						gap: 16,
						flexWrap: 'wrap',
					}}>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.pager }} />
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.amber }} />
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.ok }} />
						<span style={{ marginLeft: 14, fontSize: 12, color: OP.dim }}>
							tty/0 · gdantas.io ·{' '}
							<span style={{ color: OP.ok }} suppressHydrationWarning>
								{clock || '—'}
							</span>
						</span>
					</div>
					<div
						className="op-topbar-nav"
						style={{ display: 'flex', gap: 22, fontSize: 13 }}>
						{[
							['./about', '#about'],
							['./career', '#career'],
							['./doctrine', '#doctrine'],
							['./talks', '/presentations'],
							['./projects', '/projects'],
							['./writing', 'https://medium.com/@_gdantas'],
						].map(([s, href]) => (
							<a
								key={s}
								href={href}
								target={href.startsWith('http') ? '_blank' : undefined}
								rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
								style={{
									color: OP.dim,
									textDecoration: 'none',
									transition: 'color .15s',
								}}
								onMouseEnter={(e) => (e.currentTarget.style.color = OP.amber)}
								onMouseLeave={(e) => (e.currentTarget.style.color = OP.dim)}>
								<span style={{ color: OP.amber }}>›</span> {s}
							</a>
						))}
					</div>
				</div>

				{/* HERO */}
				<div
					ref={heroBlockRef}
					className="op-hero-block op-mouse-spot"
					style={{ position: 'relative', marginTop: 64 }}>
					<HeroIconRain />
					<div ref={heroRef} style={{ position: 'relative', zIndex: 2 }}>
						<div style={{ fontSize: 13, color: OP.dim }}>
							<Prompt path="~">
								<span suppressHydrationWarning>{whoami}</span>
								<Cursor />
							</Prompt>
						</div>
						<div
							className="op-hero-title"
							style={{
								marginTop: 18,
								fontSize: 88,
								lineHeight: 0.96,
								fontWeight: 500,
								letterSpacing: '-0.03em',
								fontVariantNumeric: 'tabular-nums',
							}}>
							<span suppressHydrationWarning>{titleA || ' '}</span>
							<br />
							<span
								className="op-amber-glow"
								style={{ color: OP.amber }}
								suppressHydrationWarning>
								{titleB || ' '}
							</span>
							<span
								style={{
									color: OP.dim,
									fontSize: 32,
									fontWeight: 400,
									marginLeft: 18,
								}}>
								/ platform engineer
							</span>
						</div>
						<div
							className="op-hero-grid"
							style={{
								display: 'grid',
								gridTemplateColumns: '1.5fr 1fr',
								gap: 64,
								marginTop: 56,
							}}>
							<div
								style={{
									fontFamily: OP.sans,
									fontSize: 18,
									lineHeight: 1.55,
									color: OP.fg,
									maxWidth: 620,
								}}>
								6+ anos fazendo plataforma de dev. Hoje no QuintoAndar, mexendo com
								Backstage, agentes com MCP e observabilidade que serve pra debugar
								de verdade.
								<div
									style={{
										marginTop: 18,
										color: OP.dim,
										fontStyle: 'italic',
										fontSize: 16,
									}}>
									&ldquo;So others may live.&rdquo; — U.S. Coast Guard Rescue Swimmer
								</div>
							</div>
							<div
								style={{
									borderLeft: `1px solid ${OP.rule}`,
									paddingLeft: 24,
									fontSize: 13,
									color: OP.dim,
									background: 'rgba(17,14,27,0.6)',
								}}>
								<div>UPTIME</div>
								<div
									style={{
										color: OP.fg,
										fontSize: 22,
										marginTop: 4,
										fontVariantNumeric: 'tabular-nums',
										letterSpacing: '-0.01em',
									}}
									suppressHydrationWarning>
									{uptime || '—'}
								</div>
								<div style={{ marginTop: 22 }}>STATUS</div>
								<div
									style={{
										color: OP.ok,
										fontSize: 16,
										marginTop: 4,
										display: 'flex',
										alignItems: 'center',
										gap: 8,
									}}>
									<span
										style={{
											display: 'inline-block',
											width: 10,
											height: 10,
											borderRadius: 99,
											background: OP.ok,
											boxShadow: `0 0 0 0 ${OP.ok}`,
											animation: 'op-pulse 1.6s ease-out infinite',
										}}
									/>
									on-call for devex
								</div>
								<div style={{ marginTop: 22 }}>BASE</div>
								<div style={{ color: OP.fg, fontSize: 16, marginTop: 4 }}>
									São Paulo, BR
								</div>
							</div>
						</div>
						<div style={{ marginTop: 44, fontSize: 13 }}>
							<Prompt path="~">
								_<Cursor />
							</Prompt>
						</div>
					</div>
				</div>


				{/* TOPOLOGY */}
				<div ref={topoRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec label="01" title="kubectl get topology" sub="the platform as a graph" />
					<div
						style={{
							marginTop: 24,
							border: `1px solid ${OP.rule}`,
							background: 'rgba(17,14,27,0.55)',
							padding: '24px 28px 20px',
							position: 'relative',
							overflow: 'hidden',
						}}>
						<div
							style={{
								position: 'absolute',
								top: 14,
								left: 18,
								fontSize: 11,
								color: OP.dim,
								letterSpacing: '0.1em',
							}}>
							CLUSTER · sa-east-1
						</div>
						<div
							style={{
								position: 'absolute',
								top: 14,
								right: 18,
								fontSize: 11,
								color: OP.ok,
								letterSpacing: '0.1em',
							}}>
							● synced
						</div>
						<div style={{ marginTop: 28 }}>
							<Topology width={1152} height={520} />
						</div>
						<div
							style={{
								marginTop: 12,
								paddingTop: 18,
								borderTop: `1px dashed ${OP.rule2}`,
							}}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: 11,
									color: OP.dim,
									marginBottom: 10,
								}}>
								<span>$ kubectl get pods --watch · 112 pods · 4 namespaces</span>
								<span>p95 latency 38ms</span>
							</div>
							<ClusterGrid rows={4} cols={28} />
						</div>
					</div>
				</div>

				{/* STACK */}
				<div ref={stackRef} style={{ marginTop: 96, position: 'relative', zIndex: 1 }}>
					<Sec label="02" title="cat ~/.stack" sub="o que tá rodando agora" />
					<div
						className="op-stack-grid"
						style={{
							display: 'grid',
							gap: 1,
							background: OP.rule,
							border: `1px solid ${OP.rule}`,
							marginTop: 24,
						}}>
						{[
							['orchestration', 'Kubernetes'],
							['cloud', 'AWS'],
							['iac', 'Terraform · OpenTofu'],
							['gitops', 'ArgoCD · Atlantis'],
							['portal', 'Backstage.io'],
							['languages', 'Go · Python · TS'],
							['ai', 'Cursor SDK · Claude Code API · LangGraph · MCPs'],
							['observability', 'LGTM Stack · Prometheus · Thanos · OTel'],
							['data', 'Vector DBs · Postgres'],
						].map(([k, v]) => (
							<div
								key={k}
								className="op-stack-tile"
								style={{ background: OP.bg, padding: '22px 20px' }}>
								<div
									style={{
										fontSize: 11,
										color: OP.dim,
										letterSpacing: '0.1em',
										textTransform: 'uppercase',
									}}>
									{k}
								</div>
								<div style={{ fontSize: 19, marginTop: 8 }}>{v}</div>
							</div>
						))}
					</div>
				</div>

				{/* DOUTRINA */}
				<div
					id="doctrine"
					ref={doctRef}
					style={{ marginTop: 112, position: 'relative', zIndex: 1, scrollMarginTop: 80 }}>
					<Sec label="03" title="cat ~/.doctrine" sub='"So Others May Live"' />
					<div
						className="op-doctrine-grid"
						style={{
							display: 'grid',
							gridTemplateColumns: '1.05fr 1fr',
							gap: 56,
							marginTop: 28,
						}}>
						<div
							style={{
								background: 'rgba(17,14,27,0.65)',
								border: `1px solid ${OP.rule}`,
								padding: '28px 30px',
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
							<div
								style={{
									fontFamily: OP.sans,
									fontSize: 18,
									lineHeight: 1.65,
									color: OP.fg,
									marginTop: 14,
								}}>
								<p style={{ margin: '0 0 14px' }}>
									Plataforma é trabalho de{' '}
									<span style={{ color: OP.amber }}>bastidor</span>. A gente entra na
									água gelada pra que o resto do time não precise.
								</p>
								<p style={{ margin: '0 0 14px' }}>
									O lema dos <em>Rescue Swimmers</em> da U.S. Coast Guard é{' '}
									<span style={{ color: OP.amber }}>
										&ldquo;So Others May Live&rdquo;
									</span>
									. É isso. Fazer o trabalho que ninguém quer fazer pra que o dev
									chegue mais cedo no que importa.
								</p>
								<p style={{ margin: 0 }}>
									O objetivo é simples: tornar o caminho certo o caminho mais fácil.
								</p>
							</div>
							<div
								style={{
									marginTop: 28,
									paddingTop: 20,
									borderTop: `1px dashed ${OP.rule2}`,
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: 12,
									color: OP.dim,
								}}>
								<span>— gd</span>
								<span>last edited: today</span>
							</div>
						</div>
						<div>
							<Role tag="ROLE 01" role="DevOps">
								<span style={{ color: OP.amber }}>Cultura</span>, não ferramenta. O
								que me importa é o <em>feedback loop</em> entre quem constrói e quem
								mantém. Quanto mais curto, melhor.
							</Role>
							<Role tag="ROLE 02" role="SRE">
								Engenheiro que trata operação como{' '}
								<span style={{ color: OP.amber }}>software</span>. Lê SLO antes de
								escrever código, mede toil, vira incidente em postmortem e
								postmortem em mudança real. Pager é dado, não castigo.
							</Role>
							<Role tag="ROLE 03" role="Platform Engineer">
								É quando tudo isso{' '}
								<span style={{ color: OP.amber }}>vira produto</span>. Self-service,
								paved roads, abstrações que protegem o dev sem prender. Meço sucesso
								pelo tempo que economizo dos outros.
							</Role>
						</div>
					</div>
				</div>

				{/* TALKS */}
				<div ref={talksRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec label="04" title="ls ~/talks" sub="recent · slides + video" />
					<div
						className="op-talks-grid"
						style={{
							marginTop: 28,
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: 24,
							perspective: '1200px',
						}}>
						{TALKS.map((t) => (
							<a
								key={t.slug}
								href={`/presentations#${t.slug}`}
								className="op-tilt-card"
								style={{
									background: OP.bg2,
									border: `1px solid ${OP.rule}`,
									display: 'flex',
									flexDirection: 'column',
									textDecoration: 'none',
									color: 'inherit',
								}}
								onMouseMove={(e) => {
									const r = e.currentTarget.getBoundingClientRect();
									const px = (e.clientX - r.left) / r.width - 0.5;
									const py = (e.clientY - r.top) / r.height - 0.5;
									e.currentTarget.style.transform = `perspective(1200px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(6px)`;
									e.currentTarget.style.borderColor = OP.amber;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform =
										'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
									e.currentTarget.style.borderColor = OP.rule;
								}}>
								<TalkPreview talk={t} />
								<div
									style={{
										padding: '20px 22px 22px',
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
									}}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											fontSize: 11,
											color: OP.dim,
											letterSpacing: '0.08em',
											textTransform: 'uppercase',
										}}>
										<span>{t.event}</span>
										<span>{t.loc}</span>
									</div>
									<div style={{ fontSize: 17, lineHeight: 1.4, marginTop: 10 }}>
										{t.title}
									</div>
									<div
										style={{
											marginTop: 16,
											paddingTop: 14,
											borderTop: `1px solid ${OP.rule}`,
											display: 'flex',
											gap: 14,
											fontSize: 12,
											flexWrap: 'wrap',
										}}>
										{t.links.map(([k, label]) => (
											<span key={k} style={{ color: OP.amber }}>
												<span style={{ color: OP.dim }}>./</span>
												{k} <span style={{ color: OP.dim }}>{label}</span>
											</span>
										))}
									</div>
								</div>
							</a>
						))}
					</div>
					<div style={{ marginTop: 22, fontSize: 13, color: OP.dim }}>
						<Prompt path="~/talks">ls --all</Prompt>{' '}
						<Link href="/presentations" passHref>
							<a style={{ color: OP.amber, textDecoration: 'none' }}>↗ all talks</a>
						</Link>
					</div>
				</div>

				{/* PING --HELP — CTA */}
				<div ref={pingRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec label="05" title="ping --help" sub="acha que consigo te ajudar a resolver algum desafio?" />
					<div
						style={{
							marginTop: 24,
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
							CHALLENGES.txt
						</div>
						<div
							style={{
								fontFamily: OP.sans,
								fontSize: 17,
								lineHeight: 1.65,
								color: OP.fg,
								marginTop: 14,
								maxWidth: 760,
							}}>
							<p style={{ margin: '0 0 8px' }}>
								Plataforma travada num gargalo de DevEx? Backstage parado no
								Software Catalog? IA sem chão de observabilidade? RAG que precisa
								comer infra inteira? Pode chamar.
							</p>
							<p style={{ margin: 0, color: OP.dim, fontSize: 15 }}>
								$ ping <span style={{ color: OP.ok }}>gd</span>{' '}
								<span style={{ color: OP.amber }}>↗</span>
							</p>
						</div>
						<div
							className="op-ping-grid"
							style={{
								marginTop: 24,
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: 14,
							}}>
							{[
								{
									tag: '— TALK',
									title: 'agendar um papo',
									desc: 'café virtual, 30min. sem pitch, sem funil.',
									href: 'https://cal.com/gdantas/30min',
									color: OP.amber,
								},
								{
									tag: '— CONNECT',
									title: 'mandar mensagem',
									desc: 'linkedin pra coisa rápida, github pra issue, medium pra papo de ideia.',
									href: 'https://www.linkedin.com/in/gabrieldantasg/',
									color: OP.violet,
								},
								{
									tag: '— BUILD',
									title: 'colaborar num projeto',
									desc: 'plataforma interna, RAG sobre infra, agentes pra ops. abrir uma issue conta.',
									href: 'https://github.com/gabriel-dantas98',
									color: OP.pager,
								},
							].map((cta) => (
								<a
									key={cta.tag}
									href={cta.href}
									target="_blank"
									rel="noreferrer noopener"
									className="op-ping-card"
									style={{
										display: 'block',
										padding: '20px 22px',
										border: `1px solid ${OP.rule2}`,
										background: OP.bg2,
										textDecoration: 'none',
										color: OP.fg,
										transition: 'transform 120ms ease, border-color 120ms ease, background 120ms ease',
									}}>
									<div style={{ fontFamily: OP.font, fontSize: 11, color: cta.color, letterSpacing: '0.1em' }}>
										{cta.tag}
									</div>
									<div style={{ fontFamily: OP.font, fontSize: 16, marginTop: 8, color: OP.fg }}>
										{cta.title}
									</div>
									<div style={{ fontFamily: OP.sans, fontSize: 13, color: OP.dim, marginTop: 10, lineHeight: 1.55 }}>
										{cta.desc}
									</div>
									<div style={{ fontFamily: OP.font, fontSize: 11, color: cta.color, marginTop: 14, letterSpacing: '0.08em' }}>
										./run ↗
									</div>
								</a>
							))}
						</div>
					</div>
				</div>

				{/* MARQUEE — continuous ticker */}
				<div style={{ marginTop: 96, position: 'relative', zIndex: 1 }}>
					<Marquee items={PLATFORM_TOOLS} speed={80} />
				</div>

				{/* CONTACT */}
				<div
					style={{
						marginTop: 64,
						paddingTop: 40,
						borderTop: `1px solid ${OP.rule}`,
						position: 'relative',
						zIndex: 1,
					}}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr auto',
							gap: 32,
							alignItems: 'end',
						}}>
						<div>
							<div style={{ fontSize: 13, color: OP.dim }}>
								<Prompt path="~">echo $SIGN</Prompt>
							</div>
							<div
								style={{
									fontSize: 56,
									fontWeight: 500,
									letterSpacing: '-0.025em',
									marginTop: 14,
								}}>
								— <span style={{ color: OP.amber }}>gd</span>
							</div>
							<div style={{ fontSize: 13, color: OP.dim, marginTop: 8 }}>
								Osasco / São Paulo · BR
							</div>
						</div>
						<div style={{ fontSize: 14, textAlign: 'right' }}>
							<div style={{ color: OP.dim }}>./contact</div>
							<div style={{ marginTop: 8 }}>
								<a
									href="https://www.linkedin.com/in/gabrieldantasg/"
									target="_blank"
									rel="noreferrer noopener"
									style={{ color: OP.fg, textDecoration: 'none', display: 'inline-block', padding: '6px 0', minHeight: 24 }}>
									linkedin/gabrieldantasg ↗
								</a>
							</div>
							<div>
								<a
									href="https://github.com/gabriel-dantas98"
									target="_blank"
									rel="noreferrer noopener"
									style={{ color: OP.fg, textDecoration: 'none', display: 'inline-block', padding: '6px 0', minHeight: 24 }}>
									github/gabriel-dantas98 ↗
								</a>
							</div>
							<div>
								<a
									href="https://medium.com/@_gdantas"
									target="_blank"
									rel="noreferrer noopener"
									style={{ color: OP.fg, textDecoration: 'none', display: 'inline-block', padding: '6px 0', minHeight: 24 }}>
									medium/@_gdantas ↗
								</a>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
