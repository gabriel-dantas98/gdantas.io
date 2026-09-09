import presentationsData from '~/data/presentations.json';
import type { TalkKind, TalkSummary } from './talks';

interface RawPresentation {
	slug: string;
	event: string;
	title: string;
	icon: string;
	description: string;
	date?: string;
	location?: string;
	preview?: { type?: string };
}

function inferTalkKind(presentation: RawPresentation): TalkKind {
	const previewType = presentation.preview?.type || '';
	if (presentation.icon.includes('youtube') || previewType === 'youtube') return 'video';
	if (presentation.icon.includes('headphones') || previewType === 'spotify') return 'audio';
	if (
		presentation.icon.includes('book') ||
		previewType === 'canva' ||
		previewType === 'google-slides' ||
		previewType === 'pdf'
	)
		return 'slides';
	return 'talk';
}

export function getTalkSummaries(): TalkSummary[] {
	return (presentationsData as RawPresentation[]).map((presentation) => {
		const summary: TalkSummary = {
			slug: presentation.slug,
			event: presentation.event,
			title: presentation.title,
			description: presentation.description,
			kind: inferTalkKind(presentation),
		};
		if (presentation.date) summary.date = presentation.date;
		if (presentation.location) summary.location = presentation.location;
		return summary;
	});
}
