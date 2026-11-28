import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('global fonts usam IBM Plex via next/font, sem inter-ui legado', () => {
	const appSource = fs.readFileSync(path.join(repoRoot, 'pages/_app.tsx'), 'utf8');
	assert.doesNotMatch(appSource, /inter-ui/);

	const windiSource = fs.readFileSync(path.join(repoRoot, 'windi.config.ts'), 'utf8');
	assert.match(windiSource, /var\(--font-sans\)/);

	const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')) as {
		dependencies: Record<string, string>;
	};
	assert.equal(pkg.dependencies['inter-ui'], undefined);
});