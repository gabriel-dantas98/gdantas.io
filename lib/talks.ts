export type TalkKind = 'video' | 'audio' | 'slides' | 'talk';

export interface TalkSummary {
	slug: string;
	event: string;
	title: string;
	description: string;
	date?: string;
	location?: string;
	kind: TalkKind;
}

export function getTalkSocialImagePath(slug: string, locale: 'pt' | 'en' = 'pt') {
	return `/og/talks/${slug}${locale === 'en' ? '-en' : ''}.png`;
}
