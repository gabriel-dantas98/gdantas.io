import React, { useMemo, useRef } from 'react';

import { OP } from './tokens';
import { HERO_ICONS } from './data';
import { useGsapReady } from './hooks';

// Chuva de logos de tools (simpleicons CDN) drifting no hero. width/height nas
// imgs evita layout shift; lazy + decoding=async pra não bloquear render.
export function HeroIconRain() {
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

	useGsapReady(() => {
		if (!ref.current) return;
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
				// eslint-disable-next-line @next/next/no-img-element
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
