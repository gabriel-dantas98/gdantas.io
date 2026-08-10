import assert from 'node:assert/strict';
import test from 'node:test';

import {
	PERSON_ID,
	WEBSITE_ID,
	buildCollectionPage,
	buildPerson,
	buildProfilePage,
	buildWebSite,
} from '../lib/structured-data';

test('buildPerson publishes the stable person identity and public profiles', () => {
	const person = buildPerson('pt');

	assert.equal(PERSON_ID, 'https://gdantas.com.br/#person');
	assert.deepEqual(person, {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': 'https://gdantas.com.br/#person',
		name: 'Gabriel Dantas',
		url: 'https://gdantas.com.br',
		sameAs: [
			'https://github.com/gabriel-dantas98',
			'https://www.linkedin.com/in/gabrieldantasg/',
			'https://medium.com/@_gdantas',
		],
	});
});

test('buildWebSite localizes its language while preserving the website identity', () => {
	assert.equal(WEBSITE_ID, 'https://gdantas.com.br/#website');
	assert.equal(buildWebSite('pt').inLanguage, 'pt-BR');
	assert.equal(buildWebSite('en').inLanguage, 'en');
	assert.equal(buildWebSite('en')['@id'], 'https://gdantas.com.br/#website');
});

test('buildProfilePage references the person as its main entity', () => {
	const profilePage = buildProfilePage('en', '/en/about/');

	assert.equal(profilePage['@type'], 'ProfilePage');
	assert.equal(profilePage.url, 'https://gdantas.com.br/en/about');
	assert.equal(profilePage.mainEntity['@id'], 'https://gdantas.com.br/#person');
	assert.equal(profilePage.inLanguage, 'en');
});

test('buildCollectionPage exposes real supplied items through an ItemList', () => {
	const collectionPage = buildCollectionPage({
		locale: 'en',
		path: '/en/talks',
		name: 'Talks',
		items: [{ name: 'Incident response with AI agents', url: '/en/talks/incident-agents' }],
	});

	assert.equal(collectionPage['@type'], 'CollectionPage');
	assert.equal(collectionPage.mainEntity['@type'], 'ItemList');
	assert.deepEqual(collectionPage.mainEntity.itemListElement, [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Incident response with AI agents',
			url: 'https://gdantas.com.br/en/talks/incident-agents',
		},
	]);
});

test('schema builders never serialize undefined values', () => {
	const serialized = JSON.stringify([
		buildPerson('pt'),
		buildWebSite('en'),
		buildProfilePage('pt', '/about'),
		buildCollectionPage({ locale: 'pt', path: '/projects', name: 'Projects', items: [] }),
	]);

	assert.doesNotMatch(serialized, /undefined/);
});
