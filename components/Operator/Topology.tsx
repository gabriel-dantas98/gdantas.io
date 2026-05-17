import React, { useMemo, useRef } from 'react';

import { OP } from './tokens';
import { useGsapReady } from './hooks';

interface TopologyProps {
	width?: number;
	height?: number;
}

interface Satellite {
	id: string;
	label: string;
	angle: number;
	kind: string;
}

const SATELLITES: Satellite[] = [
	{ id: 'k8s', label: 'kubernetes', angle: -120, kind: 'orchestration' },
	{ id: 'aws', label: 'aws · multi-region', angle: -80, kind: 'cloud' },
	{ id: 'tf', label: 'terraform · opentofu', angle: -40, kind: 'iac' },
	{ id: 'obs', label: 'lgtm · prom · thanos · otel', angle: 0, kind: 'observability' },
	{ id: 'idp', label: 'backstage.io', angle: 40, kind: 'portal' },
	{ id: 'gitops', label: 'argocd · atlantis', angle: 80, kind: 'gitops' },
	{ id: 'ai', label: 'cursor · claude code · langgraph · mcps', angle: 120, kind: 'ai-agents' },
	{ id: 'sec', label: 'vault · opa', angle: 160, kind: 'security' },
	{ id: 'dev', label: 'developers', angle: 200, kind: 'consumer' },
];

// SVG da plataforma como grafo: core "gd" no centro, satélites em órbita,
// pacotes amber/ok/violet navegando vai-e-vem em cada edge.
export function Topology({ width = 1152, height = 520 }: TopologyProps) {
	const ref = useRef<SVGSVGElement>(null);
	const cx = width / 2;
	const cy = height / 2;
	const radius = Math.min(width, height) * 0.42;
	const yScale = 0.75;

	const sats = useMemo(
		() =>
			SATELLITES.map((s) => {
				const a = (s.angle * Math.PI) / 180;
				return {
					...s,
					x: cx + Math.cos(a) * radius,
					y: cy + Math.sin(a) * radius * yScale,
				};
			}),
		[cx, cy, radius],
	);

	useGsapReady(() => {
		if (!ref.current) return;
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

		// 3 pacotes por edge em fases offset → várias request/response simultâneas
		// como cluster real. Cor varia (amber/ok/violet).
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
