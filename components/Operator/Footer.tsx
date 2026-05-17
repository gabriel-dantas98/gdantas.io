import React from 'react';

import { OP } from './tokens';
import { Prompt } from './primitives';

interface ContactLink {
	url: string;
	label: string;
}

const CONTACTS: ContactLink[] = [
	{ url: 'https://www.linkedin.com/in/gabrieldantasg/', label: 'linkedin/gabrieldantasg' },
	{ url: 'https://github.com/gabriel-dantas98', label: 'github/gabriel-dantas98' },
	{ url: 'https://medium.com/@_gdantas', label: 'medium/@_gdantas' },
];

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
				{CONTACTS.map((c) => (
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
