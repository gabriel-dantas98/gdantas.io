import React, { useRef } from 'react';

import { OP } from './tokens';
import { useGsapReady } from './hooks';

interface ClusterGridProps {
	rows?: number;
	cols?: number;
}

// Grid de pods com ciclo de vida real: healthy → terminating(amber) →
// dead(pager) → scaling(violet, back-bounce) → healthy(ok). ~25% dos pods
// entram em rotação aleatória entre 4-13s.
export function ClusterGrid({ rows = 4, cols = 28 }: ClusterGridProps) {
	const ref = useRef<HTMLDivElement>(null);

	useGsapReady(() => {
		if (!ref.current) return;
		const cells = Array.from(ref.current.querySelectorAll<HTMLDivElement>('.fx-cell'));
		const timers: number[] = [];

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

		const targets = cells.map((_, i) => i).filter(() => Math.random() < 0.25);
		targets.forEach((i) => {
			timers.push(window.setTimeout(() => cycle(i), Math.random() * 12000));
		});

		return () => {
			timers.forEach((t) => window.clearTimeout(t));
		};
	}, []);

	// Maioria ok, alguns amber (warning), poucos pager (alert).
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
