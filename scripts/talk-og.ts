import { createHash } from 'crypto';
import { deflateSync } from 'zlib';

export const TALK_OG_WIDTH = 1200;
export const TALK_OG_HEIGHT = 630;
export const TALK_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const RENDERER_VERSION = 1;

interface TalkImagePresentation {
	slug: string;
	title: string;
	color: string;
	date?: string;
	location?: string;
	preview?: { type?: string };
}

export interface TalkImageSource {
	slug: string;
	title: string;
	date: string;
	location: string;
	previewType: string;
	color: string;
}

export const DEFAULT_SOCIAL_IMAGE_SOURCE: TalkImageSource = {
	slug: 'gdantas',
	title: 'Platform engineering, DevEx e sistemas que ajudam times a entregar melhor',
	date: '',
	location: 'Osasco / Sao Paulo / BR',
	previewType: 'platform engineer',
	color: '#dea627',
};

const FONT: Record<string, string[]> = {
	A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
	B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
	C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
	D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
	E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
	F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
	G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
	H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
	I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
	J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
	K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
	L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
	M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
	N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
	O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
	P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
	Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
	R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
	S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
	T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
	U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
	V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
	W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
	X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
	Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
	Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
	'0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
	'1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
	'2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
	'3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
	'4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
	'5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
	'6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
	'7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
	'8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
	'9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
	'.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
	',': ['00000', '00000', '00000', '00000', '00110', '00110', '00100'],
	':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
	'-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
	'/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
	'+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
	'&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
	'!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
	'?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
	"'": ['00100', '00100', '00000', '00000', '00000', '00000', '00000'],
	'(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
	')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
	'@': ['01110', '10001', '10111', '10101', '10111', '10000', '01110'],
	' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function normalizeText(value: string) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[–—]/g, '-')
		.replace(/[^A-Za-z0-9 .,:\-\/+&!?()'@]/g, '')
		.toUpperCase();
}

function hexColor(value: string): [number, number, number] {
	const match = /^#([0-9a-f]{6})$/i.exec(value);
	if (!match) return [222, 166, 39];
	return [0, 2, 4].map((offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16)) as [
		number,
		number,
		number,
	];
}

class Canvas {
	readonly pixels = Buffer.alloc(TALK_OG_WIDTH * TALK_OG_HEIGHT * 3);

	constructor(color: [number, number, number]) {
		this.rect(0, 0, TALK_OG_WIDTH, TALK_OG_HEIGHT, color);
	}

	setPixel(x: number, y: number, color: [number, number, number]) {
		if (x < 0 || y < 0 || x >= TALK_OG_WIDTH || y >= TALK_OG_HEIGHT) return;
		const offset = (y * TALK_OG_WIDTH + x) * 3;
		this.pixels[offset] = color[0];
		this.pixels[offset + 1] = color[1];
		this.pixels[offset + 2] = color[2];
	}

	rect(x: number, y: number, width: number, height: number, color: [number, number, number]) {
		for (let py = y; py < y + height; py += 1) {
			for (let px = x; px < x + width; px += 1) this.setPixel(px, py, color);
		}
	}

	text(value: string, x: number, y: number, scale: number, color: [number, number, number]) {
		let cursor = x;
		for (const character of normalizeText(value)) {
			const glyph = FONT[character] || FONT['?'];
			for (let row = 0; row < glyph.length; row += 1) {
				for (let column = 0; column < glyph[row].length; column += 1) {
					if (glyph[row][column] === '1') {
						this.rect(cursor + column * scale, y + row * scale, scale, scale, color);
					}
				}
			}
			cursor += 6 * scale;
		}
	}
}

function wrapText(value: string, maxCharacters: number, maxLines: number) {
	const words = normalizeText(value).split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = '';
	for (const word of words) {
		const next = line ? `${line} ${word}` : word;
		if (next.length <= maxCharacters) {
			line = next;
			continue;
		}
		if (line) lines.push(line);
		line = word;
	}
	if (line) lines.push(line);
	if (lines.length > maxLines) {
		lines.length = maxLines;
		lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, maxCharacters - 3)}...`;
	}
	return lines;
}

export function crc32(buffer: Buffer) {
	let crc = 0xffffffff;
	for (let index = 0; index < buffer.length; index += 1) {
		const byte = buffer[index];
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data = Buffer.alloc(0)) {
	const typeBuffer = Buffer.from(type, 'ascii');
	const chunk = Buffer.alloc(data.length + 12);
	chunk.writeUInt32BE(data.length, 0);
	typeBuffer.copy(chunk, 4);
	data.copy(chunk, 8);
	chunk.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), data.length + 8);
	return chunk;
}

function encodePng(pixels: Buffer, sourceHash: string) {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(TALK_OG_WIDTH, 0);
	ihdr.writeUInt32BE(TALK_OG_HEIGHT, 4);
	ihdr[8] = 8;
	ihdr[9] = 2;
	const stride = TALK_OG_WIDTH * 3;
	const raw = Buffer.alloc((stride + 1) * TALK_OG_HEIGHT);
	for (let y = 0; y < TALK_OG_HEIGHT; y += 1) {
		pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
	}
	const text = Buffer.from(`talk-source-sha256\0${sourceHash}`, 'latin1');
	return Buffer.concat([
		Buffer.from('89504e470d0a1a0a', 'hex'),
		pngChunk('IHDR', ihdr),
		pngChunk('tEXt', text),
		pngChunk('IDAT', deflateSync(raw, { level: 9 })),
		pngChunk('IEND'),
	]);
}

export function validateTalkSlug(slug: string) {
	if (!TALK_SLUG_PATTERN.test(slug)) {
		throw new Error(`${slug}: slug inválido; use kebab-case com até 64 caracteres`);
	}
	if (slug.endsWith('-en')) {
		throw new Error(
			`${slug}: slug inválido; o sufixo -en é reservado para imagens localizadas`,
		);
	}
}

export function talkImageSource(
	presentation: TalkImagePresentation,
	title = presentation.title,
): TalkImageSource {
	return {
		slug: presentation.slug,
		title,
		date: presentation.date || '',
		location: presentation.location || '',
		previewType: presentation.preview?.type || 'talk',
		color: presentation.color,
	};
}

export function talkImageSourceHash(source: TalkImageSource) {
	return createHash('sha256')
		.update(JSON.stringify({ rendererVersion: RENDERER_VERSION, ...source }))
		.digest('hex');
}

export function renderTalkOgPixels(source: TalkImageSource) {
	const background: [number, number, number] = [17, 14, 27];
	const panel: [number, number, number] = [26, 21, 40];
	const foreground: [number, number, number] = [248, 248, 249];
	const dim: [number, number, number] = [160, 151, 181];
	const rule: [number, number, number] = [54, 46, 72];
	const accent = hexColor(source.color);
	const canvas = new Canvas(background);

	for (let x = 0; x < TALK_OG_WIDTH; x += 40) canvas.rect(x, 0, 1, TALK_OG_HEIGHT, rule);
	for (let y = 0; y < TALK_OG_HEIGHT; y += 40) canvas.rect(0, y, TALK_OG_WIDTH, 1, rule);
	canvas.rect(48, 42, 1104, 546, panel);
	canvas.rect(48, 42, 1104, 4, accent);
	canvas.rect(82, 82, 10, 10, [224, 78, 78]);
	canvas.rect(104, 82, 10, 10, [222, 166, 39]);
	canvas.rect(126, 82, 10, 10, [127, 184, 134]);
	canvas.text('GDANTAS.IO / TALKS', 164, 78, 3, dim);
	canvas.text(source.previewType, 82, 132, 3, accent);

	const titleLines = wrapText(source.title, 34, 5);
	for (let index = 0; index < titleLines.length; index += 1) {
		canvas.text(titleLines[index], 82, 188 + index * 54, 5, foreground);
	}

	const meta = [source.date, source.location].filter(Boolean).join(' / ');
	if (meta) canvas.text(meta, 82, 500, 3, dim);
	canvas.rect(82, 548, 1036, 1, rule);
	canvas.text(`GD@PLATFORM:~/TALKS/${source.slug}$ SHARE`, 82, 566, 2, accent);

	return canvas.pixels;
}

export function renderTalkOgPng(source: TalkImageSource) {
	return encodePng(renderTalkOgPixels(source), talkImageSourceHash(source));
}
