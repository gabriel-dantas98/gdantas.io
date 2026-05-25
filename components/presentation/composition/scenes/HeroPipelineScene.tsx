import React from 'react';
import { Sequence } from 'remotion';

import { useT } from '~/lib/i18n';

import { Cursor } from '../primitives/Cursor';
import { LogLine } from '../primitives/LogLine';
import { TerminalFrame } from '../primitives/TerminalFrame';

// Steps GHA-style. Cada step entra em cascata a cada 50 frames.
const STEPS: Array<{ key: string; duration: string }> = [
	{ key: 'setup', duration: '0.3s' },
	{ key: 'checkout', duration: '1.1s' },
	{ key: 'role', duration: '0.8s' },
	{ key: 'stack', duration: '1.4s' },
	{ key: 'doctrine', duration: '1.2s' },
	{ key: 'talks', duration: '0.5s' },
	{ key: 'boot', duration: '0.1s' },
];

const STEP_INTERVAL = 50;

export function HeroPipelineScene() {
	const t = useT();

	return (
		<TerminalFrame title={t('presentation.hero.header')}>
			{STEPS.map((step, idx) => (
				<Sequence
					key={step.key}
					from={idx * STEP_INTERVAL}
					layout="none"
				>
					<LogLine
						text={t(`presentation.hero.steps.${step.key}`)}
						duration={step.duration}
					/>
				</Sequence>
			))}
			<Sequence from={STEPS.length * STEP_INTERVAL + 20} layout="none">
				<div style={{ marginTop: 12 }}>
					<Cursor />
				</div>
			</Sequence>
		</TerminalFrame>
	);
}
