import { Player, type PlayerRef } from '@remotion/player';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { OP } from '~/components/Operator';
import { useT, type Locale } from '~/lib/i18n';

import { CHAPTERS, FPS, HEIGHT, TOTAL_DURATION, WIDTH } from './chapters';
import { PresentationComposition } from './composition/PresentationComposition';

interface Props {
	locale: Locale;
}

export default function PresentationPlayer({ locale }: Props) {
	const t = useT();
	const playerRef = useRef<PlayerRef>(null);
	const [currentFrame, setCurrentFrame] = useState(0);

	// Player.seekTo aceita frames. Polling no rAF é o jeito recomendado de
	// rastrear posição (sem evento dedicado em @remotion/player 4.0).
	useEffect(() => {
		let raf = 0;
		const tick = () => {
			const player = playerRef.current;
			if (player) setCurrentFrame(Math.round(player.getCurrentFrame()));
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	const seekTo = useCallback((frame: number) => {
		const player = playerRef.current;
		if (!player) return;
		player.seekTo(frame);
		if (!player.isPlaying()) player.play();
	}, []);

	const activeChapterId = CHAPTERS.find((c, i) => {
		const next = CHAPTERS[i + 1];
		if (!next) return true;
		return currentFrame < next.startFrame;
	})?.id;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
				color: OP.fg,
				fontFamily: OP.font,
			}}
		>
			<div
				style={{
					width: '100%',
					aspectRatio: `${WIDTH} / ${HEIGHT}`,
					border: `1px solid ${OP.rule2}`,
					borderRadius: 12,
					overflow: 'hidden',
					backgroundColor: OP.bg,
				}}
				data-testid="presentation-player-shell"
			>
				<Player
					ref={playerRef}
					component={PresentationComposition}
					inputProps={{ locale }}
					durationInFrames={TOTAL_DURATION}
					compositionWidth={WIDTH}
					compositionHeight={HEIGHT}
					fps={FPS}
					controls
					acknowledgeRemotionLicense
					style={{ width: '100%', height: '100%' }}
				/>
			</div>

			<nav
				aria-label={t('presentation.header.title')}
				data-testid="presentation-chapter-nav"
				data-current-frame={currentFrame}
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: 8,
					padding: '12px 14px',
					border: `1px solid ${OP.rule}`,
					borderRadius: 10,
					backgroundColor: OP.bg2,
				}}
			>
				{CHAPTERS.map((chapter) => {
					const isActive = chapter.id === activeChapterId;
					return (
						<button
							key={chapter.id}
							type="button"
							onClick={() => seekTo(chapter.startFrame)}
							data-testid={`presentation-chapter-${chapter.id}`}
							data-active={isActive ? 'true' : 'false'}
							style={{
								appearance: 'none',
								cursor: 'pointer',
								padding: '8px 14px',
								borderRadius: 6,
								border: `1px solid ${isActive ? OP.amber : OP.rule2}`,
								backgroundColor: isActive ? 'rgba(222,166,39,0.12)' : 'transparent',
								color: isActive ? OP.amber : OP.fg,
								fontFamily: OP.font,
								fontSize: 14,
							}}
						>
							{t(chapter.labelKey)} · {formatTime(chapter.startFrame, FPS)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}

function formatTime(frame: number, fps: number): string {
	const totalSeconds = Math.floor(frame / fps);
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}
