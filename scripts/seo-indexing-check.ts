/* eslint-disable no-console */
// Checks that the generated sitemap only advertises indexable public pages.
// Run after `next export` + `next-sitemap`.

import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://gdantas.com.br';

function readUrls(filePath: string): string[] {
	const xml = fs.readFileSync(filePath, 'utf8');
	return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

function main(): void {
	const outDir = path.join(process.cwd(), 'out');
	const sitemapIndex = path.join(outDir, 'sitemap.xml');
	const childSitemaps = readUrls(sitemapIndex)
		.map((url) => path.join(outDir, path.basename(url)))
		.filter((filePath) => fs.existsSync(filePath));

	if (childSitemaps.length === 0) {
		console.error('[seo-indexing-check] FAILED - no generated child sitemap found');
		process.exit(1);
	}

	const urls = childSitemaps.flatMap(readUrls);
	const badUrls = urls.filter((url) => {
		if (!url.startsWith(SITE_URL)) return true;
		if (url.startsWith(`${SITE_URL}/go/`)) return true;
		if (url === `${SITE_URL}/error`) return true;
		return false;
	});

	if (badUrls.length > 0) {
		console.error('[seo-indexing-check] FAILED - sitemap contains non-indexable URLs:');
		for (const url of badUrls) {
			console.error(`  - ${url}`);
		}
		process.exit(1);
	}

	console.log(`[seo-indexing-check] OK - ${urls.length} indexable URL(s) in sitemap`);
}

main();
