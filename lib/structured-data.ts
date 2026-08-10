import {
	PERSON_ID,
	SITE_URL,
	WEBSITE_ID,
	canonicalUrl,
	type SiteLocale,
} from './site-metadata';

export { PERSON_ID, WEBSITE_ID } from './site-metadata';

export interface PersonSchema {
	'@context': 'https://schema.org';
	'@type': 'Person';
	'@id': string;
	name: string;
	url: string;
	sameAs: string[];
}

export interface WebSiteSchema {
	'@context': 'https://schema.org';
	'@type': 'WebSite';
	'@id': string;
	name: string;
	url: string;
	inLanguage: 'pt-BR' | 'en';
}

export interface ProfilePageSchema {
	'@context': 'https://schema.org';
	'@type': 'ProfilePage';
	'@id': string;
	url: string;
	inLanguage: 'pt-BR' | 'en';
	mainEntity: { '@id': string };
}

export interface ItemListSchema {
	'@type': 'ItemList';
	'@id': string;
	itemListElement: Array<{
		'@type': 'ListItem';
		position: number;
		name: string;
		url: string;
	}>;
}

export interface CollectionPageSchema {
	'@context': 'https://schema.org';
	'@type': 'CollectionPage';
	'@id': string;
	url: string;
	name: string;
	description?: string;
	inLanguage: 'pt-BR' | 'en';
	mainEntity: ItemListSchema;
}

export interface CollectionItem {
	name: string;
	url: string;
}

export interface CollectionPageInput {
	locale: SiteLocale;
	path: string;
	name: string;
	description?: string;
	items: CollectionItem[];
}

function schemaLanguage(locale: SiteLocale): 'pt-BR' | 'en' {
	return locale === 'pt' ? 'pt-BR' : 'en';
}

function publicItemUrl(value: string): string {
	if (value.startsWith('/') && !value.startsWith('//')) {
		return new URL(value, SITE_URL).href;
	}

	const url = new URL(value);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('collection item URLs must use public http(s) destinations');
	}
	return url.href;
}

export function buildPerson(_locale: SiteLocale): PersonSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': PERSON_ID,
		name: 'Gabriel Dantas',
		url: SITE_URL,
		sameAs: [
			'https://github.com/gabriel-dantas98',
			'https://www.linkedin.com/in/gabrieldantasg/',
			'https://medium.com/@_gdantas',
		],
	};
}

export function buildWebSite(locale: SiteLocale): WebSiteSchema {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: 'gdantas',
		url: SITE_URL,
		inLanguage: schemaLanguage(locale),
	};
}

export function buildProfilePage(locale: SiteLocale, path: string): ProfilePageSchema {
	const url = canonicalUrl(path);

	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		'@id': `${url}#profilepage`,
		url,
		inLanguage: schemaLanguage(locale),
		mainEntity: { '@id': PERSON_ID },
	};
}

export function buildCollectionPage(input: CollectionPageInput): CollectionPageSchema {
	const url = canonicalUrl(input.path);
	const mainEntity: ItemListSchema = {
		'@type': 'ItemList',
		'@id': `${url}#itemlist`,
		itemListElement: input.items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: publicItemUrl(item.url),
		})),
	};

	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': `${url}#collectionpage`,
		url,
		name: input.name,
		...(input.description ? { description: input.description } : {}),
		inLanguage: schemaLanguage(input.locale),
		mainEntity,
	};
}
