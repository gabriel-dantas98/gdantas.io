import React from 'react';

import { OP } from './tokens';
import styles from './styles.module.css';

export function Cursor({ color = OP.amber }: { color?: string }) {
	return (
		<span
			className={styles.blink}
			style={{
				display: 'inline-block',
				width: '0.55em',
				height: '1em',
				verticalAlign: '-0.12em',
				background: color,
				marginLeft: 4,
			}}
		/>
	);
}

export function Prompt({
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

export function Sec({ label, title, sub }: { label: string; title: string; sub?: string }) {
	return (
		<div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
			<span
				style={{
					fontFamily: OP.font,
					fontSize: 12,
					color: OP.dim2,
					letterSpacing: '0.1em',
				}}>
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
				<span style={{ fontFamily: OP.font, fontSize: 13, color: OP.dim }}>
					{'// '}
					{sub}
				</span>
			)}
		</div>
	);
}

export function Role({
	tag,
	title,
	lines,
	color = OP.amber,
}: {
	tag: string;
	title: string;
	lines: string[];
	color?: string;
}) {
	return (
		<div
			style={{
				border: `1px solid ${OP.rule2}`,
				background: OP.bg2,
				padding: '22px 24px',
			}}>
			<div
				style={{
					fontFamily: OP.font,
					fontSize: 11,
					color,
					letterSpacing: '0.1em',
				}}>
				{tag}
			</div>
			<div style={{ fontFamily: OP.font, fontSize: 18, color: OP.fg, marginTop: 8 }}>
				{title}
			</div>
			<ul
				style={{
					margin: '14px 0 0',
					padding: 0,
					listStyle: 'none',
					display: 'grid',
					gap: 8,
				}}>
				{lines.map((l) => (
					<li
						key={l}
						style={{
							fontFamily: OP.sans,
							fontSize: 14,
							lineHeight: 1.5,
							color: OP.fg,
							opacity: 0.88,
						}}>
						<span style={{ color: OP.dim, marginRight: 6 }}>▸</span>
						{l}
					</li>
				))}
			</ul>
		</div>
	);
}
