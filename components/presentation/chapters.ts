// Capítulos da apresentação. `startFrame` é cumulativo — usado pelo chapter
// nav pra calcular onde pular. Soma das durações = duração total da
// composição (1500 frames = 50s @ 30fps).

export interface Chapter {
	id: 'hero' | 'doctrine' | 'talks' | 'projects' | 'timeline' | 'writing' | 'closing';
	labelKey: string;
	startFrame: number;
	durationInFrames: number;
}

const DURATIONS: Array<Pick<Chapter, 'id' | 'durationInFrames' | 'labelKey'>> = [
	{ id: 'hero', durationInFrames: 360, labelKey: 'presentation.chapters.hero' },
	{ id: 'doctrine', durationInFrames: 180, labelKey: 'presentation.chapters.doctrine' },
	{ id: 'talks', durationInFrames: 240, labelKey: 'presentation.chapters.talks' },
	{ id: 'projects', durationInFrames: 240, labelKey: 'presentation.chapters.projects' },
	{ id: 'timeline', durationInFrames: 240, labelKey: 'presentation.chapters.timeline' },
	{ id: 'writing', durationInFrames: 150, labelKey: 'presentation.chapters.writing' },
	{ id: 'closing', durationInFrames: 90, labelKey: 'presentation.chapters.closing' },
];

export const CHAPTERS: Chapter[] = DURATIONS.reduce<Chapter[]>((acc, d) => {
	const startFrame = acc.length ? acc[acc.length - 1].startFrame + acc[acc.length - 1].durationInFrames : 0;
	acc.push({ ...d, startFrame });
	return acc;
}, []);

export const TOTAL_DURATION = CHAPTERS.reduce((sum, c) => sum + c.durationInFrames, 0);
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
