import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

export interface Shortcut {
	slug: string;
	url: string;
	/** Texto humano mostrado no /go index. Opcional. */
	label?: string;
}

interface RawYaml {
	links: Shortcut[];
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,32}$/;

// Palavras reservadas pelo Next routing — não dá pra ter um slug que coincide.
const RESERVED_SLUGS = new Set(['index', '_next', 'new', 'edit']);

let cached: Shortcut[] | null = null;

/** Lê + valida `data/shortcuts.yaml`. Falha o build em qualquer entrada
 *  malformada (slug inválido, url ausente, duplicata, palavra reservada). */
export function loadShortcuts(): Shortcut[] {
	if (cached) return cached;
	const file = path.join(process.cwd(), 'data', 'shortcuts.yaml');
	const raw = fs.readFileSync(file, 'utf8');
	const parsed = yaml.load(raw) as RawYaml | null;
	if (!parsed || !Array.isArray(parsed.links)) {
		throw new Error('data/shortcuts.yaml: missing top-level `links` array');
	}
	const seen = new Set<string>();
	for (const s of parsed.links) {
		if (typeof s.slug !== 'string') {
			throw new Error(`shortcuts.yaml: entry missing slug: ${JSON.stringify(s)}`);
		}
		if (!SLUG_REGEX.test(s.slug)) {
			throw new Error(`shortcuts.yaml: invalid slug "${s.slug}" — must be [a-z0-9][a-z0-9-]{0,32}`);
		}
		if (RESERVED_SLUGS.has(s.slug)) {
			throw new Error(`shortcuts.yaml: slug "${s.slug}" is reserved`);
		}
		if (seen.has(s.slug)) {
			throw new Error(`shortcuts.yaml: duplicate slug "${s.slug}"`);
		}
		seen.add(s.slug);
		if (typeof s.url !== 'string' || !s.url) {
			throw new Error(`shortcuts.yaml: missing url for slug "${s.slug}"`);
		}
		if (!/^(https?:\/\/|\/)/.test(s.url)) {
			throw new Error(`shortcuts.yaml: invalid url "${s.url}" for slug "${s.slug}" — must start with http(s):// or /`);
		}
	}
	cached = parsed.links;
	return cached;
}

export function findShortcut(slug: string): Shortcut | undefined {
	return loadShortcuts().find((s) => s.slug === slug);
}
