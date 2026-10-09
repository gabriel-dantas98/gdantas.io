import type { Locale } from '~/lib/i18n';

export interface CvTextSegment {
	text: string;
	strong?: boolean;
}

export interface CvContact {
	label: string;
	href: string;
	kind: 'email' | 'site' | 'linkedin' | 'talks';
}

export interface CvRole {
	title: string;
	meta: string;
	items?: CvTextSegment[][];
	line?: string;
}

export interface CvCompany {
	name: string;
	area?: string;
	span: string;
	roles: CvRole[];
}

export interface CvTalk {
	date: string;
	title: string;
	event: string;
}

export interface CvEducation {
	degree: string;
	school: string;
	when: string;
	badge?: string;
}

export interface CvSkillRow {
	label: string;
	values: string;
}

export interface CvProfile {
	seoTitle: string;
	seoDescription: string;
	title: string;
	summary: CvTextSegment[];
	contacts: CvContact[];
	links: {
		pdf: { href: string; label: string };
		talks: { href: string; label: string };
	};
	sectionLabels: {
		summary: string;
		experience: string;
		talks: string;
		education: string;
		stack: string;
		credentials: string;
		languages: string;
	};
	actions: {
		downloadPdf: string;
		openTalks: string;
	};
	experience: CvCompany[];
	talks: CvTalk[];
	education: CvEducation[];
	skills: CvSkillRow[];
	credentials: string;
	languages: string;
	footerLeft: string;
	footerRight: string;
}

export const CV_PROFILES: Record<Locale, CvProfile> = {
	pt: {
		seoTitle: 'gdantas ─ currículo',
		seoDescription:
			'Currículo público de Gabriel Dantas Gomes — DevOps, SRE, Platform Engineering e Developer Experience.',
		title: 'DevOps · SRE · Platform & Developer Experience Engineer',
		summary: [
			{ text: 'DevOps, SRE, Platform Engineering', strong: true },
			{
				text: ' com Terraform, Kubernetes, AWS, CI/CD e Developer Experience com IDP Backstage, golden paths e self-service. ',
			},
			{ text: '10 anos', strong: true },
			{ text: ' em infraestrutura desde estágios em 2016; ' },
			{ text: '7 anos no QuintoAndar', strong: true },
			{
				text: ', com observabilidade usando Prometheus, Grafana, OpenTelemetry e ELK. Hoje também opera agentes de IA e coding agents, com observabilidade e eval em Langfuse.',
			},
		],
		contacts: [
			{
				label: 'gabriel.dantasg98@gmail.com',
				href: 'mailto:gabriel.dantasg98@gmail.com',
				kind: 'email',
			},
			{ label: 'gdantas.com.br', href: 'https://gdantas.com.br', kind: 'site' },
			{
				label: 'linkedin/gabrieldantasg',
				href: 'https://www.linkedin.com/in/gabrieldantasg',
				kind: 'linkedin',
			},
			{ label: 'gdantas.com.br/talks', href: 'https://gdantas.com.br/talks', kind: 'talks' },
		],
		links: {
			pdf: { href: '/cv.pdf', label: 'cv.pdf' },
			talks: { href: 'https://gdantas.com.br/talks', label: 'palestras' },
		},
		sectionLabels: {
			summary: 'Resumo',
			experience: 'Experiência',
			talks: 'Palestras (já realizadas)',
			education: 'Formação',
			stack: 'Stack',
			credentials: 'Credenciais',
			languages: 'Idiomas',
		},
		actions: {
			downloadPdf: 'Baixar PDF',
			openTalks: 'Ver palestras',
		},
		experience: [
			{
				name: 'Grupo QuintoAndar',
				area: 'Platform / SRE / DevEx',
				span: 'ago/2019 — presente · 7 anos 3 meses',
				roles: [
					{
						title: 'Senior Platform Engineer — DevEx & AI',
						meta: 'mai/2026 — presente · Remote',
						items: [
							[
								{ text: 'Ferramental para ' },
								{ text: 'coding agents em escala', strong: true },
								{ text: ' (Cursor, Claude Code) e MCPs internos.' },
							],
							[
								{ text: 'Observabilidade e eval de agentes com ' },
								{ text: 'Langfuse', strong: true },
								{ text: ' (traces, custo, qualidade).' },
							],
							[
								{ text: 'RAG / busca', strong: true },
								{ text: ' sobre o IDP; medição DORA, SPACE e DevEx NPS.' },
							],
						],
					},
					{
						title: 'Site Reliability Engineer',
						meta: 'dez/2020 — mai/2026',
						items: [
							[
								{ text: 'Observabilidade com ' },
								{
									text: 'Grafana, Prometheus, Thanos, OpenTelemetry e ELK',
									strong: true,
								},
								{ text: '; práticas SRE.' },
							],
							[
								{ text: 'Developer Experience com ' },
								{ text: 'Backstage.io', strong: true },
								{ text: ' (IDP, golden paths); impacto: ' },
								{ text: '−70% onboarding', strong: true },
								{ text: '.' },
							],
						],
					},
					{
						title: 'Software Engineering Intern · time de SRE',
						meta: 'ago/2019 — dez/2020',
						line: 'IaC, Kubernetes, AWS e Drone CI — entrada na trajetória de plataforma e confiabilidade.',
					},
				],
			},
			{
				name: 'Helix Platform',
				span: 'set/2019 — fev/2020',
				roles: [
					{
						title: 'Partner',
						meta: 'set/2019 — fev/2020',
						line: 'Plataforma resiliente orientada a microsserviços para deploy de aplicações IoT.',
					},
				],
			},
			{
				name: 'Mandic Cloud Solutions',
				span: 'set/2018 — ago/2019',
				roles: [
					{
						title: 'DevOps Intern',
						meta: 'set/2018 — ago/2019',
						line: 'Contas multi-cloud; pipelines CI/CD com Jenkins; provisionamento com Ansible e Terraform; containers Docker.',
					},
				],
			},
			{
				name: 'B4A (Beauty For All)',
				span: 'jul/2017 — set/2018',
				roles: [
					{
						title: 'IT Intern',
						meta: 'jul/2017 — set/2018',
						line: 'Contas AWS; jobs de deploy no Jenkins; Docker para DEV/PROD.',
					},
				],
			},
			{
				name: 'Glambox Brasil',
				span: 'jun/2016 — set/2018',
				roles: [
					{
						title: 'Infrastructure Intern',
						meta: 'jun/2016 — set/2018',
						line: 'Infraestrutura de rede interna; administração GSuite; suporte.',
					},
				],
			},
		],
		talks: [
			{
				date: 'ago 2026',
				title: 'Tornando sua Engenharia Navegável',
				event: 'Codecon Summit · Curitiba',
			},
			{
				date: 'jul 2026',
				title: 'Developer Portal como HUB de MCPs',
				event: 'CNCF Campinas · Bosch',
			},
			{
				date: 'dez 2025',
				title: 'Escalando engenharia com IDPs',
				event: 'DevOps Summit Blueprint · SP',
			},
			{
				date: 'nov 2025',
				title: 'From Flaky to Confident Releases',
				event: 'QuintoAndar Tech Talks',
			},
			{ date: 'nov 2025', title: 'DB na IDE com Cursor e MCP', event: 'Platform Days · SP' },
			{
				date: 'ago 2025',
				title: 'Assistente de Incidentes com MCPs',
				event: 'DevPR Config · Maringá',
			},
			{ date: 'jun 2025', title: 'RAG com dados do IDP', event: 'Platform Days · SP' },
			{ date: 'out 2024', title: 'Backstage 💙 Terraform', event: 'DevOpsDays São Paulo' },
		],
		education: [
			{
				degree: 'MBA AI Engineering & Multi-Agents',
				school: 'FIAP',
				when: 'abr/2026 — abr/2027',
				badge: 'em andamento',
			},
			{
				degree: 'Pós Tech · Machine Learning Engineering',
				school: 'FIAP + Alura',
				when: 'mar/2024 — mar/2025',
			},
			{
				degree: 'Engenharia da Computação',
				school: 'FIAP',
				when: '2016 — 2020 · 1º lugar Innovation Challenge (2018)',
			},
		],
		skills: [
			{
				label: 'observability',
				values: 'LGTM · Prometheus · Thanos · Grafana · OpenTelemetry · ELK',
			},
			{
				label: 'ai agents',
				values: 'Langfuse · LangGraph · MCPs · Cursor · Claude Code · RAG',
			},
			{
				label: 'platform',
				values: 'Kubernetes · AWS · Backstage · Terraform/OpenTofu · ArgoCD · Atlantis',
			},
			{ label: 'languages', values: 'Go · Python · TypeScript' },
		],
		credentials: 'Certified Backstage Associate · Exam Contributor',
		languages: 'PT nativo · EN limited working',
		footerLeft: 'gd@platform · São Paulo',
		footerRight: 'gdantas.com.br/cv',
	},
	en: {
		seoTitle: 'gdantas ─ cv',
		seoDescription:
			'Public CV for Gabriel Dantas Gomes — DevOps, SRE, Platform Engineering and Developer Experience.',
		title: 'DevOps · SRE · Platform & Developer Experience Engineer',
		summary: [
			{ text: 'DevOps, SRE, Platform Engineering', strong: true },
			{
				text: ' with Terraform, Kubernetes, AWS, CI/CD and Developer Experience with Backstage IDP, golden paths and self-service. ',
			},
			{ text: '10 years', strong: true },
			{ text: ' in infrastructure since internships in 2016; ' },
			{ text: '7 years at QuintoAndar', strong: true },
			{
				text: ', with observability using Prometheus, Grafana, OpenTelemetry and ELK. Today he also operates AI agents and coding agents, with observability and evals in Langfuse.',
			},
		],
		contacts: [
			{
				label: 'gabriel.dantasg98@gmail.com',
				href: 'mailto:gabriel.dantasg98@gmail.com',
				kind: 'email',
			},
			{ label: 'gdantas.com.br', href: 'https://gdantas.com.br', kind: 'site' },
			{
				label: 'linkedin/gabrieldantasg',
				href: 'https://www.linkedin.com/in/gabrieldantasg',
				kind: 'linkedin',
			},
			{ label: 'gdantas.com.br/talks', href: 'https://gdantas.com.br/talks', kind: 'talks' },
		],
		links: {
			pdf: { href: '/cv.pdf', label: 'cv.pdf' },
			talks: { href: 'https://gdantas.com.br/talks', label: 'talks' },
		},
		sectionLabels: {
			summary: 'Summary',
			experience: 'Experience',
			talks: 'Talks already presented',
			education: 'Education',
			stack: 'Stack',
			credentials: 'Credentials',
			languages: 'Languages',
		},
		actions: {
			downloadPdf: 'Download PDF',
			openTalks: 'See talks',
		},
		experience: [
			{
				name: 'Grupo QuintoAndar',
				area: 'Platform / SRE / DevEx',
				span: 'Aug/2019 — present · 7 years 3 months',
				roles: [
					{
						title: 'Senior Platform Engineer — DevEx & AI',
						meta: 'May/2026 — present · Remote',
						items: [
							[
								{ text: 'Tooling for ' },
								{ text: 'coding agents at scale', strong: true },
								{ text: ' (Cursor, Claude Code) and internal MCPs.' },
							],
							[
								{ text: 'Agent observability and evals with ' },
								{ text: 'Langfuse', strong: true },
								{ text: ' (traces, cost, quality).' },
							],
							[
								{ text: 'RAG / search', strong: true },
								{ text: ' over the IDP; DORA, SPACE and DevEx NPS measurement.' },
							],
						],
					},
					{
						title: 'Site Reliability Engineer',
						meta: 'Dec/2020 — May/2026',
						items: [
							[
								{ text: 'Observability with ' },
								{
									text: 'Grafana, Prometheus, Thanos, OpenTelemetry and ELK',
									strong: true,
								},
								{ text: '; SRE practices.' },
							],
							[
								{ text: 'Developer Experience with ' },
								{ text: 'Backstage.io', strong: true },
								{ text: ' (IDP, golden paths); impact: ' },
								{ text: '−70% onboarding', strong: true },
								{ text: '.' },
							],
						],
					},
					{
						title: 'Software Engineering Intern · SRE team',
						meta: 'Aug/2019 — Dec/2020',
						line: 'IaC, Kubernetes, AWS and Drone CI — entry point into platform and reliability work.',
					},
				],
			},
			{
				name: 'Helix Platform',
				span: 'Sep/2019 — Feb/2020',
				roles: [
					{
						title: 'Partner',
						meta: 'Sep/2019 — Feb/2020',
						line: 'Resilient microservices-oriented platform for IoT application deploys.',
					},
				],
			},
			{
				name: 'Mandic Cloud Solutions',
				span: 'Sep/2018 — Aug/2019',
				roles: [
					{
						title: 'DevOps Intern',
						meta: 'Sep/2018 — Aug/2019',
						line: 'Multi-cloud accounts; CI/CD pipelines with Jenkins; provisioning with Ansible and Terraform; Docker containers.',
					},
				],
			},
			{
				name: 'B4A (Beauty For All)',
				span: 'Jul/2017 — Sep/2018',
				roles: [
					{
						title: 'IT Intern',
						meta: 'Jul/2017 — Sep/2018',
						line: 'AWS accounts; Jenkins deploy jobs; Docker for DEV/PROD.',
					},
				],
			},
			{
				name: 'Glambox Brasil',
				span: 'Jun/2016 — Sep/2018',
				roles: [
					{
						title: 'Infrastructure Intern',
						meta: 'Jun/2016 — Sep/2018',
						line: 'Internal network infrastructure; GSuite administration; support.',
					},
				],
			},
		],
		talks: [
			{
				date: 'Aug 2026',
				title: 'Tornando sua Engenharia Navegável',
				event: 'Codecon Summit · Curitiba',
			},
			{
				date: 'Jul 2026',
				title: 'Developer Portal como HUB de MCPs',
				event: 'CNCF Campinas · Bosch',
			},
			{
				date: 'Dec 2025',
				title: 'Escalando engenharia com IDPs',
				event: 'DevOps Summit Blueprint · SP',
			},
			{
				date: 'Nov 2025',
				title: 'From Flaky to Confident Releases',
				event: 'QuintoAndar Tech Talks',
			},
			{ date: 'Nov 2025', title: 'DB na IDE com Cursor e MCP', event: 'Platform Days · SP' },
			{
				date: 'Aug 2025',
				title: 'Assistente de Incidentes com MCPs',
				event: 'DevPR Config · Maringá',
			},
			{ date: 'Jun 2025', title: 'RAG com dados do IDP', event: 'Platform Days · SP' },
			{ date: 'Oct 2024', title: 'Backstage 💙 Terraform', event: 'DevOpsDays São Paulo' },
		],
		education: [
			{
				degree: 'MBA AI Engineering & Multi-Agents',
				school: 'FIAP',
				when: 'Apr/2026 — Apr/2027',
				badge: 'in progress',
			},
			{
				degree: 'Pós Tech · Machine Learning Engineering',
				school: 'FIAP + Alura',
				when: 'Mar/2024 — Mar/2025',
			},
			{
				degree: 'Computer Engineering',
				school: 'FIAP',
				when: '2016 — 2020 · 1st place Innovation Challenge (2018)',
			},
		],
		skills: [
			{
				label: 'observability',
				values: 'LGTM · Prometheus · Thanos · Grafana · OpenTelemetry · ELK',
			},
			{
				label: 'ai agents',
				values: 'Langfuse · LangGraph · MCPs · Cursor · Claude Code · RAG',
			},
			{
				label: 'platform',
				values: 'Kubernetes · AWS · Backstage · Terraform/OpenTofu · ArgoCD · Atlantis',
			},
			{ label: 'languages', values: 'Go · Python · TypeScript' },
		],
		credentials: 'Certified Backstage Associate · Exam Contributor',
		languages: 'Native PT · limited working EN',
		footerLeft: 'gd@platform · São Paulo',
		footerRight: 'gdantas.com.br/cv',
	},
};
