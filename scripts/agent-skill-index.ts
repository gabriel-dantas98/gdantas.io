/* eslint-disable no-console */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const AGENT_SKILLS_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

export interface SkillIndexEntry {
	name: string;
	type: 'skill-md';
	description: string;
	url: string;
	digest: string;
}

export interface SkillIndex {
	$schema: string;
	skills: SkillIndexEntry[];
}

interface SkillMetadata {
	name: string;
	description: string;
}

function readSkillMetadata(skillBytes: Buffer): SkillMetadata {
	const parsed = matter(skillBytes.toString('utf8'));
	const name = parsed.data.name;
	const description = parsed.data.description;

	if (typeof name !== 'string' || !/^(?!.*--)[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(name)) {
		throw new Error('SKILL.md frontmatter name must be a valid Agent Skills name');
	}
	if (typeof description !== 'string' || description.length === 0 || description.length > 1024) {
		throw new Error('SKILL.md frontmatter description must contain 1-1024 characters');
	}

	return { name, description };
}

function digest(skillBytes: Buffer): string {
	return `sha256:${createHash('sha256').update(skillBytes).digest('hex')}`;
}

export function buildSkillIndex(skillBytes: Buffer): SkillIndex {
	const metadata = readSkillMetadata(skillBytes);

	return {
		$schema: AGENT_SKILLS_SCHEMA,
		skills: [
			{
				name: metadata.name,
				type: 'skill-md',
				description: metadata.description,
				url: `/.well-known/agent-skills/${metadata.name}/SKILL.md`,
				digest: digest(skillBytes),
			},
		],
	};
}

export function validateSkillIndex(index: unknown, skillBytes: Buffer): string[] {
	const errors: string[] = [];
	let metadata: SkillMetadata | undefined;

	try {
		metadata = readSkillMetadata(skillBytes);
	} catch (error) {
		errors.push(error instanceof Error ? error.message : 'SKILL.md frontmatter is invalid');
	}

	if (typeof index !== 'object' || index === null || Array.isArray(index)) {
		return [...errors, 'Agent Skills index must be a JSON object'];
	}

	const candidate = index as Record<string, unknown>;
	if (candidate.$schema !== AGENT_SKILLS_SCHEMA) {
		errors.push(`Agent Skills index schema must be ${AGENT_SKILLS_SCHEMA}`);
	}
	if (!Array.isArray(candidate.skills) || candidate.skills.length !== 1) {
		errors.push('Agent Skills index must contain exactly one skill entry');
		return errors;
	}

	const entry = candidate.skills[0];
	if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
		errors.push('Agent Skills entry must be a JSON object');
		return errors;
	}

	const skill = entry as Record<string, unknown>;
	if (skill.type !== 'skill-md') errors.push('Agent Skills entry type must be skill-md');
	if (typeof skill.url !== 'string' || !/^\/(?!\/)/.test(skill.url)) {
		errors.push('Agent Skills entry URL must be path-absolute');
	}
	if (metadata && skill.name !== metadata.name) {
		errors.push('Agent Skills entry name must match SKILL.md frontmatter');
	}
	if (metadata && skill.description !== metadata.description) {
		errors.push('Agent Skills entry description must match SKILL.md frontmatter');
	}
	if (typeof skill.digest !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(skill.digest)) {
		errors.push(
			'Agent Skills entry digest must be sha256 plus 64 lowercase hexadecimal characters',
		);
	} else if (skill.digest !== digest(skillBytes)) {
		errors.push('Agent Skills entry digest does not match the published SKILL.md bytes');
	}

	return errors;
}

function main(): void {
	const publicDir = path.join(process.cwd(), 'public');
	const skillPath = path.join(
		publicDir,
		'.well-known',
		'agent-skills',
		'exploring-gdantas',
		'SKILL.md',
	);
	const indexPath = path.join(publicDir, '.well-known', 'agent-skills', 'index.json');
	const skillBytes = fs.readFileSync(skillPath);
	const serialized = `${JSON.stringify(buildSkillIndex(skillBytes), null, 2)}\n`;

	fs.writeFileSync(indexPath, serialized, 'utf8');
	console.log(`[ai:prepare] wrote ${path.relative(process.cwd(), indexPath)}`);
}

if (require.main === module) main();
