const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const root = process.cwd();
const yamlFile = path.join(root, 'data', 'redirects.yaml');
const vercelFile = path.join(root, 'vercel.json');

function readYaml() {
	const text = fs.readFileSync(yamlFile, 'utf8');
	const data = yaml.load(text);
	return (data && Array.isArray(data.redirects) ? data.redirects : []).filter(Boolean);
}

function readVercel() {
	const json = fs.readFileSync(vercelFile, 'utf8');
	return JSON.parse(json);
}

function writeVercel(config) {
	fs.writeFileSync(vercelFile, JSON.stringify(config, null, 2) + '\n');
}

function main() {
	const yamlRedirects = readYaml();
	const vercel = readVercel();
	const existing = Array.isArray(vercel.redirects) ? vercel.redirects : [];

	const keep = existing.filter(
		(r) => r && typeof r.source === 'string' && !r.source.startsWith('/links/'),
	);
	const merged = [...keep, ...yamlRedirects];

	vercel.redirects = merged;
	writeVercel(vercel);
	console.log(`Synced ${yamlRedirects.length} /links/* redirects into vercel.json`);
}

main();
