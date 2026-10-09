import assert from 'node:assert/strict';
import test from 'node:test';

import { CV_PROFILES } from '~/lib/cv';

test('public CV content stays generic and omits private/specific FIAP application details', () => {
	const pt = JSON.stringify(CV_PROFILES.pt);

	assert.match(pt, /OpenTelemetry/);
	assert.doesNotMatch(pt, /OTel/);
	assert.doesNotMatch(pt, /Professor MBA/);
	assert.doesNotMatch(pt, /Módulo 4 AI Operation/);
	assert.doesNotMatch(pt, /Fit para o módulo/);
	assert.doesNotMatch(pt, /disponível 19h/);
	assert.doesNotMatch(pt, /\(11\)|95997/);
	assert.equal(CV_PROFILES.pt.links.talks.href, 'https://gdantas.com.br/talks');
});

test('CV profile mirrors the same structure for Portuguese and English', () => {
	assert.deepEqual(Object.keys(CV_PROFILES.en), Object.keys(CV_PROFILES.pt));
	assert.equal(CV_PROFILES.pt.experience.length, CV_PROFILES.en.experience.length);
	assert.equal(CV_PROFILES.pt.talks.length, CV_PROFILES.en.talks.length);
	assert.equal(CV_PROFILES.pt.education.length, CV_PROFILES.en.education.length);
});
