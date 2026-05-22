import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import talksData from '~/data/talks.json';
import { useT } from '~/lib/i18n';

import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CARD_INTERVAL = 35;
const MAX_CARDS = 5;

interface CardProps {
	title: string;
	color: string;
	description: string;
}

function TalkCard({ title, color, description }: CardProps) {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(frame, [0, 12], [24, 0], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px)`,
				display: 'flex',
				gap: 16,
				padding: '14px 20px',
				border: `1px solid ${OP.rule2}`,
				borderRadius: 8,
				backgroundColor: OP.bg3,
			}}
		>
			<span
				style={{
					width: 8,
					alignSelf: 'stretch',
					backgroundColor: color,
					borderRadius: 4,
				}}
			/>
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
				<span style={{ color: OP.fg, fontSize: 24 }}>{title}</span>
				<span style={{ color: OP.dim, fontSize: 18 }}>{description}</span>
			</div>
		</div>
	);
}

export function TalksScene() {
	const t = useT();
	const talks = (talksData as CardProps[]).slice(0, MAX_CARDS);

	return (
		<TerminalFrame title={t('presentation.talksScene.header')}>
			{talks.map((talk, i) => (
				<Sequence key={i} from={i * CARD_INTERVAL} layout="none">
					<TalkCard
						title={talk.title}
						color={talk.color}
						description={talk.description}
					/>
				</Sequence>
			))}
		</TerminalFrame>
	);
}
