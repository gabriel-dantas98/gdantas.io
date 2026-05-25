import React from 'react';
import { AbsoluteFill, Series } from 'remotion';

import { I18nProvider, type Locale } from '~/lib/i18n';

import { CHAPTERS } from '../chapters';
import { ClosingScene } from './scenes/ClosingScene';
import { DoctrineScene } from './scenes/DoctrineScene';
import { HeroPipelineScene } from './scenes/HeroPipelineScene';
import { ProjectsScene } from './scenes/ProjectsScene';
import { TalksScene } from './scenes/TalksScene';
import { TimelineScene } from './scenes/TimelineScene';
import { WritingScene } from './scenes/WritingScene';

interface Props {
	locale: Locale;
}

const SCENE_BY_ID: Record<string, React.ComponentType> = {
	hero: HeroPipelineScene,
	doctrine: DoctrineScene,
	talks: TalksScene,
	projects: ProjectsScene,
	timeline: TimelineScene,
	writing: WritingScene,
	closing: ClosingScene,
};

// O Player roda fora do React tree do site (canvas próprio), então temos
// que reinjetar I18nProvider aqui pras cenas usarem useT(). Locale vem do
// PresentationPage via inputProps do Player.
export function PresentationComposition({ locale }: Props) {
	return (
		<I18nProvider locale={locale}>
			<AbsoluteFill>
				<Series>
					{CHAPTERS.map((chapter) => {
						const Scene = SCENE_BY_ID[chapter.id];
						return (
							<Series.Sequence
								key={chapter.id}
								durationInFrames={chapter.durationInFrames}
							>
								<Scene />
							</Series.Sequence>
						);
					})}
				</Series>
			</AbsoluteFill>
		</I18nProvider>
	);
}
