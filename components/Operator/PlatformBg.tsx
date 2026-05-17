import React from 'react';

import { OP } from './tokens';
import { PLATFORM_TOOLS } from './data';

// Wallpaper de chips de CNCF tools drifting no fundo do hero. Os keyframes são
// gerados inline porque cada chip tem deslocamento determinístico próprio.
export function PlatformBg() {
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
						(p, i) =>
							`@keyframes op-drift-${i}{0%{transform:translate(0,0)}50%{transform:translate(${p.dx}px,${p.dy}px)}100%{transform:translate(0,0)}}`,
					)
					.join('')}
			</style>
		</div>
	);
}
