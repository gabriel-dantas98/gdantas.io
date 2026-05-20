/* eslint-disable no-console */
// Compara estrutura de chaves entre pt.json e en.json.
// Falha o build se qualquer chave existe em um e não no outro, ou se tipos
// (string vs array vs object) divergem.
//
// PT é source of truth. Run via `yarn i18n:check`.

import fs from 'fs';
import path from 'path';

interface Diff {
	pathInJson: string;
	kind: 'missing-in-en' | 'missing-in-pt' | 'type-mismatch' | 'array-length-mismatch';
	detail?: string;
}

function typeOf(v: unknown): string {
	if (v === null) return 'null';
	if (Array.isArray(v)) return 'array';
	return typeof v;
}

function walk(
	pt: unknown,
	en: unknown,
	keyPath: string,
	diffs: Diff[],
): void {
	const ptType = typeOf(pt);
	const enType = typeOf(en);

	if (enType === 'undefined') {
		diffs.push({ pathInJson: keyPath || '<root>', kind: 'missing-in-en' });
		return;
	}
	if (ptType === 'undefined') {
		diffs.push({ pathInJson: keyPath || '<root>', kind: 'missing-in-pt' });
		return;
	}
	if (ptType !== enType) {
		diffs.push({
			pathInJson: keyPath || '<root>',
			kind: 'type-mismatch',
			detail: `pt=${ptType} en=${enType}`,
		});
		return;
	}

	if (ptType === 'object') {
		const ptObj = pt as Record<string, unknown>;
		const enObj = en as Record<string, unknown>;
		const allKeys = Array.from(new Set([...Object.keys(ptObj), ...Object.keys(enObj)]));
		for (const k of allKeys) {
			walk(ptObj[k], enObj[k], keyPath ? `${keyPath}.${k}` : k, diffs);
		}
		return;
	}

	if (ptType === 'array') {
		const ptArr = pt as unknown[];
		const enArr = en as unknown[];
		if (ptArr.length !== enArr.length) {
			diffs.push({
				pathInJson: keyPath,
				kind: 'array-length-mismatch',
				detail: `pt.length=${ptArr.length} en.length=${enArr.length}`,
			});
			return;
		}
		for (let i = 0; i < ptArr.length; i += 1) {
			walk(ptArr[i], enArr[i], `${keyPath}[${i}]`, diffs);
		}
	}
}

function main(): void {
	const root = process.cwd();
	const ptPath = path.join(root, 'locales/pt.json');
	const enPath = path.join(root, 'locales/en.json');
	const pt = JSON.parse(fs.readFileSync(ptPath, 'utf8'));
	const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

	const diffs: Diff[] = [];
	walk(pt, en, '', diffs);

	if (diffs.length === 0) {
		console.log('[i18n-check] OK — pt.json and en.json structures match');
		return;
	}

	console.error(`[i18n-check] FAILED — ${diffs.length} divergence(s):\n`);
	for (const d of diffs) {
		console.error(`  - ${d.pathInJson}  [${d.kind}]${d.detail ? ' ' + d.detail : ''}`);
	}
	console.error('\nAdd the missing key/value to the JSON that lacks it. PT is the source of truth.');
	process.exit(1);
}

main();
