import React from 'react';
import { AbsoluteFill } from 'remotion';

import { OP } from '~/components/Operator';

interface Props {
	title: string;
	children: React.ReactNode;
}

// Chrome CRT reutilizado por todas as cenas. AbsoluteFill garante que cada
// cena cobre o canvas inteiro do Player.
export function TerminalFrame({ title, children }: Props) {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: OP.bg,
				fontFamily: OP.font,
				padding: 64,
				color: OP.fg,
			}}
		>
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					border: `1px solid ${OP.rule2}`,
					borderRadius: 12,
					backgroundColor: OP.bg2,
					overflow: 'hidden',
					boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
				}}
			>
				<header
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						padding: '14px 22px',
						borderBottom: `1px solid ${OP.rule}`,
						backgroundColor: OP.bg3,
					}}
				>
					<span style={dotStyle('#ff5f57')} />
					<span style={dotStyle('#febc2e')} />
					<span style={dotStyle('#28c840')} />
					<span style={{ marginLeft: 16, color: OP.dim, fontSize: 18 }}>
						{title}
					</span>
				</header>
				<div
					style={{
						flex: 1,
						padding: '32px 40px',
						display: 'flex',
						flexDirection: 'column',
						gap: 14,
						fontSize: 28,
						lineHeight: 1.4,
					}}
				>
					{children}
				</div>
			</div>
		</AbsoluteFill>
	);
}

function dotStyle(bg: string): React.CSSProperties {
	return { width: 14, height: 14, borderRadius: '50%', backgroundColor: bg };
}
