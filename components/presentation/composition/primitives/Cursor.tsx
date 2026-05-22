import React from 'react';
import { useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';

interface Props {
	color?: string;
}

// Pisca a cada ~15 frames (2hz @ 30fps). Sem CSS animation pra não quebrar
// no render do Remotion.
export function Cursor({ color = OP.amber }: Props) {
	const frame = useCurrentFrame();
	const visible = Math.floor(frame / 15) % 2 === 0;
	return (
		<span
			style={{
				display: 'inline-block',
				width: '0.55em',
				height: '1.05em',
				marginLeft: 4,
				verticalAlign: 'text-bottom',
				backgroundColor: visible ? color : 'transparent',
			}}
		/>
	);
}
