import { existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';
import { inflateSync } from 'zlib';

import presentations from '../data/presentations.json';
import en from '../locales/en.json';
import pt from '../locales/pt.json';
import {
	crc32,
	DEFAULT_SOCIAL_IMAGE_SOURCE,
	renderTalkOgPixels,
	talkImageSource,
	talkImageSourceHash,
	TALK_OG_HEIGHT,
	TALK_OG_WIDTH,
	validateTalkSlug,
} from './talk-og';

const OG_DIRECTORY = path.join(process.cwd(), 'public', 'og', 'talks');
const errors: string[] = [];

function inspectPng(filePath: string) {
	const buffer = readFileSync(filePath);
	const signature = buffer.subarray(0, 8).toString('hex');
	if (signature !== '89504e470d0a1a0a') throw new Error('não é um PNG válido');

	const width = buffer.readUInt32BE(16);
	const height = buffer.readUInt32BE(20);
	let offset = 8;
	let source = '';
	const idat: Buffer[] = [];
	let ihdrCount = 0;
	let seenIdat = false;
	let idatEnded = false;
	let seenIend = false;

	while (offset < buffer.length) {
		if (offset + 12 > buffer.length) throw new Error('chunk PNG truncado');
		const length = buffer.readUInt32BE(offset);
		if (offset + length + 12 > buffer.length) throw new Error('dados de chunk PNG truncados');
		const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
		const data = buffer.subarray(offset + 8, offset + 8 + length);
		const expectedCrc = buffer.readUInt32BE(offset + 8 + length);
		const actualCrc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
		if (actualCrc !== expectedCrc) throw new Error(`CRC inválido no chunk ${type}`);
		if (type === 'IHDR') {
			ihdrCount += 1;
			if (offset !== 8 || seenIdat || ihdrCount > 1 || length !== 13) {
				throw new Error('IHDR inválido');
			}
			if (
				data[8] !== 8 ||
				data[9] !== 2 ||
				data[10] !== 0 ||
				data[11] !== 0 ||
				data[12] !== 0
			) {
				throw new Error('IHDR deve usar RGB 8-bit sem interlace');
			}
		}
		if (type === 'tEXt') {
			const separator = data.indexOf(0);
			if (separator < 0) throw new Error('chunk tEXt inválido');
			const keyword = data.subarray(0, separator).toString('latin1');
			if (keyword === 'talk-source-sha256') {
				source = data.subarray(separator + 1).toString('latin1');
			}
		}
		if (type === 'IDAT') {
			if (ihdrCount !== 1 || seenIend || idatEnded) throw new Error('IDAT fora de ordem');
			seenIdat = true;
			idat.push(data);
		}
		if (seenIdat && type !== 'IDAT') idatEnded = true;
		if (type === 'IEND') {
			if (length !== 0 || !seenIdat || seenIend) throw new Error('IEND inválido');
			seenIend = true;
		}
		offset += length + 12;
		if (seenIend && offset !== buffer.length) throw new Error('dados após IEND');
	}
	if (ihdrCount !== 1 || !seenIdat || !seenIend) throw new Error('estrutura PNG incompleta');

	const raw = inflateSync(Buffer.concat(idat));
	const stride = width * 3;
	const pixels = Buffer.alloc(stride * height);
	if (raw.length !== (stride + 1) * height) throw new Error('dados RGB com tamanho inválido');
	for (let y = 0; y < height; y += 1) {
		const row = y * (stride + 1);
		if (raw[row] !== 0) throw new Error('filtro PNG inesperado');
		raw.copy(pixels, y * stride, row + 1, row + 1 + stride);
	}

	return { width, height, source, pixels };
}

const presentationSlugs = presentations.map(({ slug }) => slug).sort();
function validateLocale(locale: 'pt' | 'en', items: typeof pt.talks.items | typeof en.talks.items) {
	const localeSlugs = Object.keys(items).sort();
	if (JSON.stringify(localeSlugs) !== JSON.stringify(presentationSlugs)) {
		errors.push(`${locale}: slugs de talks.items divergem de presentations.json`);
	}
	for (const [slug, copy] of Object.entries(items)) {
		if (!copy.title?.trim()) errors.push(`${slug}: título ${locale} ausente`);
		if (!copy.description?.trim()) errors.push(`${slug}: descrição ${locale} ausente`);
	}
}

validateLocale('pt', pt.talks.items);
validateLocale('en', en.talks.items);

const slugs = new Set<string>();
for (const presentation of presentations) {
	try {
		validateTalkSlug(presentation.slug);
	} catch (error) {
		errors.push((error as Error).message);
	}
	if (slugs.has(presentation.slug)) {
		errors.push(`${presentation.slug}: slug duplicado`);
	}
	slugs.add(presentation.slug);
	if (!presentation.event?.trim()) errors.push(`${presentation.slug}: event ausente`);

	for (const [locale, items] of [
		['pt', pt.talks.items],
		['en', en.talks.items],
	] as const) {
		const suffix = locale === 'en' ? '-en' : '';
		const filePath = path.join(OG_DIRECTORY, `${presentation.slug}${suffix}.png`);
		if (!existsSync(filePath)) {
			errors.push(`${presentation.slug}: imagem social ${locale} ausente em public/og/talks`);
			continue;
		}

		try {
			const image = inspectPng(filePath);
			if (image.width !== TALK_OG_WIDTH || image.height !== TALK_OG_HEIGHT) {
				errors.push(
					`${presentation.slug}: esperado ${TALK_OG_WIDTH}x${TALK_OG_HEIGHT}, recebido ${image.width}x${image.height}`,
				);
			}
			const copy = items[presentation.slug as keyof typeof items];
			if (!copy) continue;
			const source = talkImageSource(presentation, copy.title);
			if (image.source !== talkImageSourceHash(source)) {
				errors.push(
					`${presentation.slug}: imagem social ${locale} desatualizada; rode yarn talks:og`,
				);
			}
			if (!image.pixels.equals(renderTalkOgPixels(source))) {
				errors.push(
					`${presentation.slug}: pixels ${locale} divergem do renderer determinístico`,
				);
			}
		} catch (error) {
			errors.push(`${presentation.slug}: ${(error as Error).message}`);
		}
	}
}

const defaultImage = path.join(process.cwd(), 'public', 'og', 'default.png');
if (!existsSync(defaultImage)) {
	errors.push('default.png: imagem social fallback ausente');
} else {
	try {
		const image = inspectPng(defaultImage);
		if (image.width !== TALK_OG_WIDTH || image.height !== TALK_OG_HEIGHT) {
			errors.push(
				`default.png: esperado ${TALK_OG_WIDTH}x${TALK_OG_HEIGHT}, recebido ${image.width}x${image.height}`,
			);
		}
		if (image.source !== talkImageSourceHash(DEFAULT_SOCIAL_IMAGE_SOURCE)) {
			errors.push('default.png: source hash desatualizado; rode yarn talks:og');
		}
		if (!image.pixels.equals(renderTalkOgPixels(DEFAULT_SOCIAL_IMAGE_SOURCE))) {
			errors.push('default.png: imagem social fallback desatualizada; rode yarn talks:og');
		}
	} catch (error) {
		errors.push(`default.png: ${(error as Error).message}`);
	}
}

if (existsSync(OG_DIRECTORY)) {
	for (const file of readdirSync(OG_DIRECTORY).filter((name) => name.endsWith('.png'))) {
		const slug = file.slice(0, -4).replace(/-en$/, '');
		if (!slugs.has(slug)) errors.push(`${file}: imagem órfã sem talk em presentations.json`);
	}
}

if (errors.length) {
	console.error(`[talks-check] FAIL (${errors.length})`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`[talks-check] OK — ${presentations.length} talks com imagens sociais válidas`);
