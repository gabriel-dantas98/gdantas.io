import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import { useT } from '~/lib/i18n';

import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const POSTS = [
	'plataforma como produto: além da infra',
	'backstage.io: descobrindo serviços ao invés de inventá-los',
	'SLO antes de SLA — por que importa',
	'incidentes como input pro roadmap',
	'developer experience é um número, não uma vibe',
];

interface RowProps {
	text: string;
	idx: number;
	total: number;
}

function PostRow({ text, idx, total }: RowProps) {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [idx * 18, idx * 18 + 12], [0, 1], {
		easing: EASE,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div style={{ opacity, color: OP.fg, display: 'flex', gap: 16 }}>
			<span style={{ color: OP.violet, width: 60 }}>
				{String(total - idx).padStart(2, '0')}
			</span>
			<span>{text}</span>
		</div>
	);
}

export function WritingScene() {
	const t = useT();
	return (
		<TerminalFrame title={t('presentation.writingScene.header')}>
			{POSTS.map((text, i) => (
				<PostRow key={text} text={text} idx={i} total={POSTS.length} />
			))}
		</TerminalFrame>
	);
}
