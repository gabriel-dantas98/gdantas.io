import React from 'react';
import type { GetStaticProps } from 'next';

import { fetchProjects } from '~/lib/projects';
import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import type { Project } from '~/types';


interface ProjectProps {
	stringifiedProjects: string;
}

export const getStaticProps: GetStaticProps<ProjectProps> = async () => {
	const projects = await fetchProjects();
	return {
		props: { stringifiedProjects: JSON.stringify(projects) },
		revalidate: 3600,
	};
};

function projectPodColor(name: string) {
	const palette = [OP.amber, OP.ok, OP.violet, OP.pager, OP.amber2, OP.violet2];
	let hash = 0;
	for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
	return palette[hash % palette.length];
}

function shortName(s: string) {
	return s.length > 22 ? s.slice(0, 21) + '…' : s;
}

export default function ProjectsPage({ stringifiedProjects }: ProjectProps) {
	const projects = JSON.parse(stringifiedProjects) as Project[];
	const ref = useReveal({ stagger: 0.04, y: 16 });
	return (
		<OperatorPage
			title="gdantas ─ kubectl get projects"
			description="Repositórios e experimentos públicos — plataforma, AI ops, side-projects."
			active="/projects">
			<div ref={ref}>
				<Sec
					label="01"
					title="kubectl get projects"
					sub="open source · side-projects · experimentos"
				/>

				<div
					className="op-projects-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
						gap: 12,
					}}>
					{projects.map((p) => {
						const color = projectPodColor(p.name);
						return (
							<a
								key={p.url}
								href={p.url}
								target="_blank"
								rel="noreferrer noopener"
								className="op-pod"
								style={{
									display: 'block',
									padding: '14px 16px',
									border: `1px solid ${OP.rule2}`,
									background: OP.bg2,
									textDecoration: 'none',
									color: OP.fg,
									position: 'relative',
									transition: 'border-color 120ms ease, background 120ms ease',
								}}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: '50%',
											background: color,
											boxShadow: `0 0 8px ${color}99`,
										}}
									/>
									<span style={{ fontFamily: OP.font, fontSize: 11, color: OP.dim }}>
										pod/{p.icon || 'repo'}
									</span>
								</div>
								<div
									style={{
										fontFamily: OP.font,
										fontSize: 14,
										color: OP.fg,
										marginTop: 8,
										letterSpacing: '0.01em',
									}}>
									{shortName(p.name)}
								</div>
								{p.description && (
									<div
										style={{
											fontFamily: OP.sans,
											fontSize: 12,
											color: OP.dim,
											marginTop: 6,
											lineHeight: 1.45,
											display: '-webkit-box',
											WebkitLineClamp: 3,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}>
										{p.description}
									</div>
								)}
								<div
									style={{
										marginTop: 10,
										fontFamily: OP.font,
										fontSize: 10,
										color: color,
										letterSpacing: '0.08em',
									}}>
									./inspect ↗
								</div>
							</a>
						);
					})}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~">
						kubectl get projects | wc -l →{' '}
						<span style={{ color: OP.amber }}>{projects.length} pods</span>
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				:global(.op-pod:hover) {
					border-color: ${OP.amber} !important;
					background: ${OP.bg3} !important;
				}
			`}</style>
		</OperatorPage>
	);
}
