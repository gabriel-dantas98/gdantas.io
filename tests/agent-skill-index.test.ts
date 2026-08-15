import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSkillIndex, validateSkillIndex } from '../scripts/agent-skill-index';

const SKILL_BYTES = Buffer.from(
	[
		'---',
		'name: exploring-gdantas',
		'description: Explore Gabriel Dantas public site with evidence-first, page-specific citations.',
		'---',
		'',
		'# Exploring gdantas',
		'',
		'Prefer the canonical page for each claim.',
		'',
	].join('\n'),
	'utf8',
);

test('buildSkillIndex emits one v0.2.0 skill-md entry from frontmatter and raw bytes', () => {
	const index = buildSkillIndex(SKILL_BYTES);

	assert.deepEqual(index, {
		$schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
		skills: [
			{
				name: 'exploring-gdantas',
				type: 'skill-md',
				description:
					'Explore Gabriel Dantas public site with evidence-first, page-specific citations.',
				url: '/.well-known/agent-skills/exploring-gdantas/SKILL.md',
				digest: 'sha256:c46b6ed714d06f59702db939e8efa070dd92a9c9350ee2135bc6040bee585559',
			},
		],
	});
	assert.deepEqual(validateSkillIndex(index, SKILL_BYTES), []);
});

test('buildSkillIndex digest is sensitive to every raw SKILL.md byte', () => {
	const changedBytes = Buffer.concat([SKILL_BYTES, Buffer.from('\n')]);

	assert.notEqual(
		buildSkillIndex(SKILL_BYTES).skills[0].digest,
		buildSkillIndex(changedBytes).skills[0].digest,
	);
});

test('validateSkillIndex rejects a skill whose published bytes were tampered with', () => {
	const index = buildSkillIndex(SKILL_BYTES);
	const errors = validateSkillIndex(
		index,
		Buffer.from(SKILL_BYTES.toString('utf8').replace('canonical', 'alternate')),
	);

	assert.ok(
		errors.some((error) => /digest/i.test(error)),
		errors.join('\n'),
	);
});

test('validateSkillIndex rejects non-v0.2.0 discovery metadata', () => {
	const index = buildSkillIndex(SKILL_BYTES);
	const invalidIndex = {
		...index,
		$schema: 'https://schemas.agentskills.io/discovery/0.1.0/schema.json',
		skills: [{ ...index.skills[0], url: 'exploring-gdantas/SKILL.md' }],
	};
	const errors = validateSkillIndex(invalidIndex, SKILL_BYTES);

	assert.ok(
		errors.some((error) => /schema/i.test(error)),
		errors.join('\n'),
	);
	assert.ok(
		errors.some((error) => /path-absolute/i.test(error)),
		errors.join('\n'),
	);
});

test('buildSkillIndex rejects names with consecutive hyphens', () => {
	const invalidSkill = Buffer.from(
		SKILL_BYTES.toString('utf8').replace('exploring-gdantas', 'exploring--gdantas'),
	);

	assert.throws(() => buildSkillIndex(invalidSkill), /valid Agent Skills name/i);
});

test('validateSkillIndex rejects a network-path skill URL', () => {
	const index = buildSkillIndex(SKILL_BYTES);
	const networkPathIndex = {
		...index,
		skills: [{ ...index.skills[0], url: '//cdn.example/SKILL.md' }],
	};

	assert.ok(
		validateSkillIndex(networkPathIndex, SKILL_BYTES).some((error) =>
			/path-absolute/i.test(error),
		),
	);
});
