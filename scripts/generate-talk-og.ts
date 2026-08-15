import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

import presentations from '../data/presentations.json';
import en from '../locales/en.json';
import pt from '../locales/pt.json';
import {
	DEFAULT_SOCIAL_IMAGE_SOURCE,
	renderTalkOgPng,
	talkImageSource,
	validateTalkSlug,
} from './talk-og';

const outputDirectory = path.resolve(process.cwd(), 'public', 'og', 'talks');
for (const presentation of presentations) validateTalkSlug(presentation.slug);
mkdirSync(outputDirectory, { recursive: true });

for (const presentation of presentations) {
	for (const [locale, items] of [
		['pt', pt.talks.items],
		['en', en.talks.items],
	] as const) {
		const suffix = locale === 'en' ? '-en' : '';
		const output = path.resolve(outputDirectory, `${presentation.slug}${suffix}.png`);
		if (path.dirname(output) !== outputDirectory)
			throw new Error(`destino inválido: ${output}`);
		const copy = items[presentation.slug as keyof typeof items];
		if (!copy?.title?.trim()) throw new Error(`${presentation.slug}: título ${locale} ausente`);
		writeFileSync(output, renderTalkOgPng(talkImageSource(presentation, copy.title)));
		console.log(`[talks-og] ${path.relative(process.cwd(), output)}`);
	}
}

const defaultOutput = path.join(process.cwd(), 'public', 'og', 'default.png');
writeFileSync(defaultOutput, renderTalkOgPng(DEFAULT_SOCIAL_IMAGE_SOURCE));
console.log(`[talks-og] ${path.relative(process.cwd(), defaultOutput)}`);
