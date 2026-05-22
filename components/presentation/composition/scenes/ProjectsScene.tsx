import React from 'react';
import { Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';

import { OP } from '~/components/Operator';
import { useT } from '~/lib/i18n';

import { TerminalFrame } from '../primitives/TerminalFrame';

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CARD_INTERVAL = 30;

// Projetos do GitHub vêm de API em runtime no resto do site (lib/projects.ts).
// Pra cena, usar lista curada estática — Remotion não pode fazer fetch.
const PROJECTS = [
	{ name: 'gdantas.io', tag: 'site · Next.js 13' },
	{ name: 'backstage-rag', tag: 'rag · IDP knowledge' },
	{ name: 'devparana-incident-agent-mcps', tag: 'demo · incident agent + MCPs' },
	{ name: 'gdantas-go-tools', tag: 'cli · go utilities' },
];

interface CardProps {
	name: string;
	tag: string;
}

function ProjectCard({ name, tag }: CardProps) {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 12], [0, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const scale = interpolate(frame, [0, 12], [0.96, 1], {
		easing: EASE,
		extrapolateRight: 'clamp',
	});
	const glow = 0.4 + 0.3 * Math.sin(frame / 15);
	return (
		<div
			style={{
				opacity,
				transform: `scale(${scale})`,
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
				padding: '18px 22px',
				border: `1px solid ${OP.amber}`,
				borderRadius: 10,
				backgroundColor: OP.bg3,
				boxShadow: `0 0 32px rgba(222, 166, 39, ${glow * 0.35})`,
			}}
		>
			<span style={{ color: OP.amber, fontSize: 24 }}>{name}</span>
			<span style={{ color: OP.dim, fontSize: 18 }}>{tag}</span>
		</div>
	);
}

export function ProjectsScene() {
	const t = useT();
	return (
		<TerminalFrame title={t('presentation.projectsScene.header')}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 18,
				}}
			>
				{PROJECTS.map((p, i) => (
					<Sequence key={p.name} from={i * CARD_INTERVAL} layout="none">
						<ProjectCard name={p.name} tag={p.tag} />
					</Sequence>
				))}
			</div>
		</TerminalFrame>
	);
}
