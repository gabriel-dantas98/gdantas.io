import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';

interface Props {
	text: string;
	duration: string; // ex: "1.2s"
	doneAt?: number; // frame em que spinner vira ✓
}

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Step de pipeline GHA-style:
//   ▶ pending → ◐ running (spinner) → ✓ done
// `frame` é local ao Sequence dono — gerenciado pelo Remotion.
export function LogLine({ text, duration, doneAt = 35 }: Props) {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 8], [0, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(frame, [0, 8], [6, 0], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});

	const done = frame >= doneAt;
	const spinnerChars = ['◐', '◓', '◑', '◒'];
	const spinnerIdx = Math.floor(frame / 2) % spinnerChars.length;

	const timeOpacity = interpolate(frame, [doneAt, doneAt + 10], [0, 1], {
		easing: EASE,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const marker = done ? '✓' : spinnerChars[spinnerIdx];
	const markerColor = done ? OP.ok : OP.amber;

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px)`,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				color: OP.fg,
			}}
		>
			<span style={{ color: markerColor, width: 24, textAlign: 'center' }}>
				{marker}
			</span>
			<span style={{ flex: 1 }}>{text}</span>
			<span style={{ color: OP.dim, opacity: timeOpacity, fontSize: 22 }}>
				{duration}
			</span>
		</div>
	);
}
