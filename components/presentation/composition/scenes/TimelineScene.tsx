import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import timelineData from '~/data/timeline.json';
import { useT } from '~/lib/i18n';

import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const MAX_ITEMS = 5;
const ITEM_INTERVAL = 32;

interface TimelineItem {
	date: string;
	title: string;
	description: string;
}

interface RowProps {
	item: TimelineItem;
}

function TimelineRow({ item }: RowProps) {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 10], [0, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const translateX = interpolate(frame, [0, 10], [-20, 0], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const yearSha = `${item.date.slice(-4)} ${randomSha(item.title)}`;
	return (
		<div
			style={{
				opacity,
				transform: `translateX(${translateX}px)`,
				display: 'flex',
				gap: 16,
				color: OP.fg,
			}}
		>
			<span style={{ color: OP.amber, width: 200 }}>{yearSha}</span>
			<span style={{ flex: 1 }}>
				{item.title}
				<span style={{ color: OP.dim, marginLeft: 12 }}>· {item.description}</span>
			</span>
		</div>
	);
}

// SHA-ish determinístico a partir do título — só pra dar o look git log.
function randomSha(seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return Math.abs(h).toString(16).slice(0, 7).padStart(7, '0');
}

export function TimelineScene() {
	const t = useT();
	const items = (timelineData as TimelineItem[]).slice(0, MAX_ITEMS);
	return (
		<TerminalFrame title={t('presentation.timelineScene.header')}>
			{items.map((item, i) => (
				<Sequence key={i} from={i * ITEM_INTERVAL} layout="none">
					<TimelineRow item={item} />
				</Sequence>
			))}
		</TerminalFrame>
	);
}
