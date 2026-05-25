import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import { useT } from '~/lib/i18n';

import { Cursor } from '../primitives/Cursor';
import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const LINKS: Array<{ key: 'emailLabel' | 'githubLabel' | 'linkedinLabel' | 'siteLabel'; value: string }> = [
	{ key: 'emailLabel', value: 'me@gdantas.dev' },
	{ key: 'githubLabel', value: 'github.com/gabriel-dantas98' },
	{ key: 'linkedinLabel', value: 'linkedin.com/in/gabriel-dantas98' },
	{ key: 'siteLabel', value: 'gdantas.com.br' },
];

interface LinkRowProps {
	label: string;
	value: string;
}

function LinkRow({ label, value }: LinkRowProps) {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 10], [0, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	return (
		<div style={{ opacity, color: OP.fg, display: 'flex', gap: 14 }}>
			<span style={{ color: OP.dim, width: 130 }}>{label}</span>
			<span style={{ color: OP.amber }}>{value}</span>
		</div>
	);
}

export function ClosingScene() {
	const t = useT();
	return (
		<TerminalFrame title={t('presentation.closing.prompt')}>
			{LINKS.map((l, i) => (
				<Sequence key={l.key} from={i * 12} layout="none">
					<LinkRow label={t(`presentation.closing.${l.key}`)} value={l.value} />
				</Sequence>
			))}
			<Sequence from={LINKS.length * 12 + 20} layout="none">
				<div style={{ color: OP.ok, marginTop: 14 }}>
					{t('presentation.closing.exit')}
					<Cursor color={OP.ok} />
				</div>
			</Sequence>
		</TerminalFrame>
	);
}
