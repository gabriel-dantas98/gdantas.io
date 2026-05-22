import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import enDict from '~/locales/en.json';
import ptDict from '~/locales/pt.json';
import { useI18n, useT } from '~/lib/i18n';

import { Cursor } from '../primitives/Cursor';
import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const PILLAR_INTERVAL = 50;
const TYPE_FRAMES = 35;

interface PillarProps {
	text: string;
}

function PillarLine({ text }: PillarProps) {
	const frame = useCurrentFrame();
	const visibleChars = Math.min(
		text.length,
		Math.floor(
			interpolate(frame, [0, TYPE_FRAMES], [0, text.length], {
				easing: EASE,
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		),
	);
	return (
		<div style={{ color: OP.fg, display: 'flex', gap: 14 }}>
			<span style={{ color: OP.amber }}>›</span>
			<span>
				{text.slice(0, visibleChars)}
				{visibleChars < text.length ? <Cursor /> : null}
			</span>
		</div>
	);
}

export function DoctrineScene() {
	const t = useT();
	const { locale } = useI18n();
	const pillars: string[] =
		(locale === 'en' ? enDict : ptDict).presentation.doctrineScene.pillars;

	return (
		<TerminalFrame title={t('presentation.doctrineScene.header')}>
			{pillars.map((p, i) => (
				<Sequence key={i} from={i * PILLAR_INTERVAL} layout="none">
					<PillarLine text={p} />
				</Sequence>
			))}
		</TerminalFrame>
	);
}
