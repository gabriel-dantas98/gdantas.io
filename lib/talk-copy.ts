// Resolve title/description de talks via locales, com fallback pro
// presentations.json. Mesmo padrão do HomePage (`talks.home.<slug>`).
// Catálogo completo: `talks.items.<slug>.{title,description}`.

export function resolveTalkCopy(
	t: (key: string) => string,
	slug: string | undefined,
	fallback: { title: string; description: string },
): { title: string; description: string } {
	if (!slug) return fallback;

	const titleKey = `talks.items.${slug}.title`;
	const descKey = `talks.items.${slug}.description`;
	const title = t(titleKey);
	const description = t(descKey);

	return {
		title: title.startsWith('talks.items.') ? fallback.title : title,
		description: description.startsWith('talks.items.')
			? fallback.description
			: description,
	};
}
