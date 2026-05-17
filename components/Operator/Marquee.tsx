import React from 'react';

import { OP } from './tokens';

interface MarqueeProps {
	items: string[];
	speed?: number;
}

// Ticker horizontal infinito. Duplica items pra animar -50% sem buracos.
export function Marquee({ items, speed = 60 }: MarqueeProps) {
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
				maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
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
		</div>
	);
}
