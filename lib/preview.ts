// Normalização de previews de talks/presentations. Usado por /talks (modal)
// e /presentations (iframe inline) — mesma lógica de extração, sem duplicar.

export type PreviewKind =
	| 'youtube'
	| 'google-slides'
	| 'canva'
	| 'spotify'
	| 'pdf'
	| 'github-readme';

export interface NormalizedPreview {
	kind: PreviewKind;
	/** URL pronta pra colocar dentro de <iframe src>. */
	src: string;
}

export interface RawPreview {
	type?: string;
	youtubeId?: string;
	slidesEmbedUrl?: string;
	spotifyEmbedUrl?: string;
	canvaEmbedUrl?: string;
	pdfUrl?: string;
	readmeMarkdown?: string;
}

export function extractYouTubeId(link?: string): string | undefined {
	if (!link) return undefined;
	try {
		const url = new URL(link);
		if (url.hostname.includes('youtu.be'))
			return url.pathname.replace('/', '') || undefined;
		if (url.hostname.includes('youtube.com')) {
			if (url.pathname.startsWith('/embed/'))
				return url.pathname.split('/').pop() || undefined;
			if (url.searchParams.get('v')) return url.searchParams.get('v') || undefined;
		}
	} catch {}
	return undefined;
}

export function toSpotifyEmbed(link?: string): string | undefined {
	if (!link) return undefined;
	try {
		const url = new URL(link);
		if (!url.hostname.includes('open.spotify.com')) return undefined;
		const parts = url.pathname.split('/').filter(Boolean);
		const type = parts[0];
		const id = parts[1];
		if (!type || !id) return undefined;
		if (!['episode', 'track', 'show', 'playlist'].includes(type)) return undefined;
		return `https://open.spotify.com/embed/${type}/${id}`;
	} catch {}
	return undefined;
}

export function toCanvaEmbed(link?: string): string | undefined {
	if (!link) return undefined;
	try {
		const url = new URL(link);
		if (!url.hostname.includes('canva.com')) return undefined;
		if (url.pathname.includes('/view') && url.search.includes('embed')) {
			return url.toString();
		}
		const parts = url.pathname.split('/').filter(Boolean);
		const designIdx = parts.indexOf('design');
		const designId = designIdx >= 0 ? parts[designIdx + 1] : undefined;
		const designKey = designIdx >= 0 ? parts[designIdx + 2] : undefined;
		if (!designId) return undefined;
		return designKey
			? `https://www.canva.com/design/${designId}/${designKey}/view?embed`
			: `https://www.canva.com/design/${designId}/view?embed`;
	} catch {}
	return undefined;
}

// Combina o preview declarado (item.preview.*) com inferência a partir do
// contentUrl/url. Retorna o que dá pra embedar; se nada bater, retorna null.
export function derivePreview(item: {
	preview?: RawPreview;
	contentUrl?: string;
	url?: string;
}): NormalizedPreview | null {
	const contentLink = item.contentUrl || item.url;
	const declared = item.preview;

	// Caso 1: preview tipo + dados explícitos
	if (declared?.type === 'youtube') {
		const id = declared.youtubeId || extractYouTubeId(contentLink);
		if (id) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}` };
	}
	if (declared?.type === 'google-slides') {
		const src = declared.slidesEmbedUrl || toCanvaEmbed(contentLink);
		if (src) return { kind: 'google-slides', src };
	}
	if (declared?.type === 'canva') {
		const src = toCanvaEmbed(declared.canvaEmbedUrl || contentLink);
		if (src) return { kind: 'canva', src };
	}
	if (declared?.type === 'spotify') {
		const src = declared.spotifyEmbedUrl || toSpotifyEmbed(contentLink);
		if (src) return { kind: 'spotify', src };
	}
	if (declared?.type === 'pdf') {
		const src = declared.pdfUrl || contentLink;
		if (src) return { kind: 'pdf', src };
	}

	// Caso 2: sem preview declarado — inferir pela URL
	const yt = extractYouTubeId(contentLink);
	if (yt) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt}` };
	const sp = toSpotifyEmbed(contentLink);
	if (sp) return { kind: 'spotify', src: sp };
	const cv = toCanvaEmbed(contentLink);
	if (cv) return { kind: 'canva', src: cv };

	return null;
}
