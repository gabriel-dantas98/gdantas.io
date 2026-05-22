import React, { useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import posthog from 'posthog-js';

import { useSeoProps } from '~/lib';
import {
	OP,
	useReveal,
	useUtcClock,
	useUptime,
	useTypewriter,
	useMouseSpotlight,
	useGsapReady,
	PLATFORM_TOOLS,
	Cursor,
	Prompt,
	Sec,
	PlatformBg,
	HeroIconRain,
	TalkPreview,
	MobileMenuDrawer,
	type Talk,
} from '~/components/Operator';
import { LangSwitcher } from '~/components/Operator/LangSwitcher';
import styles from '../../pages/home.module.css';
import { I18nProvider, useT } from '~/lib/i18n';
import { BootSplash } from '~/components/Boot/BootSplash';

// Topology/ClusterGrid/Marquee são below-the-fold + carregam GSAP timelines
// pesadas. Dynamic SSR-off mantém esses chunks fora do critical path.
// PlatformBg + HeroIconRain ficam estáticos pq são wallpaper do hero (above
// fold) — deferir gera flash visual no LCP.
const Topology = dynamic(
	() => import('~/components/Operator/Topology').then((m) => m.Topology),
	{ ssr: false, loading: () => <div style={{ minHeight: 520 }} /> },
);
const ClusterGrid = dynamic(
	() => import('~/components/Operator/ClusterGrid').then((m) => m.ClusterGrid),
	{ ssr: false, loading: () => <div style={{ minHeight: 84 }} /> },
);
const Marquee = dynamic(
	() => import('~/components/Operator/Marquee').then((m) => m.Marquee),
	{ ssr: false, loading: () => <div style={{ height: 56 }} /> },
);

// Talks que aparecem na home — `04 ls ~/talks`. A lista completa com previews
// embeddados (YouTube/Canva/Slides/PDF/Spotify) vive em /presentations e usa
// `data/presentations.json` como fonte.
const TALKS: Talk[] = [
	{
		date: '2025-12-02',
		event: 'DevOps Summit BP',
		loc: 'São Paulo · BR',
		kind: 'slides',
		slug: 'idp-portals',
		title: 'Escalando engenharia com Internal Developer Portals: navegabilidade, autonomia e governança',
		preview: 'idp.scale = navigability + autonomy + governance',
		slides: 64,
		canvaEmbed: 'https://www.canva.com/design/DAG1K_yOuwc/HOCw_nGAM77blCVRM9XRNw/view?embed',
		href: 'https://www.canva.com/design/DAG1K_yOuwc/HOCw_nGAM77blCVRM9XRNw/edit',
		links: [['canva', 'slides ↗']],
	},
	{
		date: '2025-11-25',
		event: 'QuintoAndar Tech Talks',
		loc: 'Online',
		kind: 'video',
		slug: 'flaky-to-confident',
		runtime: '32:17',
		title: 'Building with AI: from flaky to confident releases',
		preview: 'flaky_tests → genai → root-cause → suggested-fix',
		youtubeId: 'uJ4BVndB6FU',
		href: 'https://www.youtube.com/watch?v=uJ4BVndB6FU',
		links: [['youtube', 'watch ↗']],
	},
	{
		date: '2025-11-18',
		event: 'Platform Days',
		loc: 'São Paulo · BR',
		kind: 'slides+code',
		slug: 'cursor-mcp-db',
		title: 'Trazendo o banco de dados para dentro da IDE com Cursor + MCP',
		preview: '$ cursor + mcp postgres → consultas em prod sem medo',
		slides: 38,
		pdfUrl: 'https://drive.google.com/file/d/1Jk8cweq_AKYDymIbmPwheR5PBAmRxODh/preview',
		href: 'https://github.com/gfranco9/Platform-Days-Database-MCP',
		links: [
			['drive', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-08-24',
		event: 'DevPR Config · 10 anos',
		loc: 'Maringá · PR',
		kind: 'slides+code',
		slug: 'incident-mcps',
		title: 'Criando seu Assistente de Incidentes com MCPs',
		preview: 'oncall.assistant = pager + mcp + runbooks + 🤖',
		slides: 42,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1caZhQFIXv2K4e1ljIR9I85Xv51vegV3-S64tanx4Q4M/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1caZhQFIXv2K4e1ljIR9I85Xv51vegV3-S64tanx4Q4M',
		links: [
			['gdocs', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-06-10',
		event: 'Platform Days',
		loc: 'São Paulo · BR',
		kind: 'slides+code',
		slug: 'rag-idp',
		title: 'Construindo um RAG com dados do seu Internal Developer Portal',
		preview: 'rag(idp.catalog) → answers about your own infra',
		slides: 56,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1JAKOJF8vri4hrO1z1IBOaAATrHyrMkxcThGcoq4bXxk/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1JAKOJF8vri4hrO1z1IBOaAATrHyrMkxcThGcoq4bXxk',
		links: [
			['gdocs', 'slides ↗'],
			['github', 'repo ↗'],
		],
	},
	{
		date: '2025-05-16',
		event: 'Platform Talks',
		loc: 'Online',
		kind: 'video',
		slug: 'qa-idp',
		title: "Discover QuintoAndar's IDP",
		preview: 'idp.case = quintoandar / backstage',
		youtubeId: 'KUsXbWtMXzc',
		runtime: '24:00',
		href: 'https://www.youtube.com/watch?v=KUsXbWtMXzc',
		links: [['youtube', 'watch ↗']],
	},
	{
		date: '2024-10-01',
		event: 'DevopsDays SP',
		loc: 'São Paulo · BR',
		kind: 'slides',
		slug: 'backstage-tf',
		title: 'Backstage 💙 Terraform',
		preview: 'backstage.scaffolder + terraform = paved road',
		slides: 47,
		slidesEmbed:
			'https://docs.google.com/presentation/d/1y6YO9QQjlpEsgxMAOMtUvVcA0OznyMycgAR0EQYAaI8/embed?start=false&loop=false&delayms=3000',
		href: 'https://docs.google.com/presentation/d/1y6YO9QQjlpEsgxMAOMtUvVcA0OznyMycgAR0EQYAaI8',
		links: [['gdocs', 'slides ↗']],
	},
	{
		date: '2023-07-12',
		event: 'QuintoAndar Tech Talk',
		loc: 'Online',
		kind: 'video',
		slug: 'idp-backstage',
		title: 'Como desenvolvemos o developer portal usando o Backstage.io',
		preview: 'backstage.io → portal de devs no QA',
		youtubeId: 'Y57gUwb1v3g',
		runtime: '28:00',
		href: 'https://www.youtube.com/watch?v=Y57gUwb1v3g',
		links: [['youtube', 'watch ↗']],
	},
];

// Stack tiles — quero como dataset pra fácil edição. Renderiza no `02 cat ~/.stack`.
const STACK: Array<[string, string]> = [
	['orchestration', 'Kubernetes'],
	['cloud', 'AWS'],
	['iac', 'Terraform · OpenTofu'],
	['gitops', 'ArgoCD · Atlantis'],
	['portal', 'Backstage.io'],
	['languages', 'Go · Python · TS'],
	['ai', 'Cursor SDK · Claude Code API · LangGraph · MCPs'],
	['observability', 'LGTM Stack · Prometheus · Thanos · OTel'],
	['data', 'Vector DBs · Postgres'],
];

const CTA_META: Array<{ href: string; color: string }> = [
	{ href: 'https://www.linkedin.com/in/gabrieldantasg/', color: OP.amber },
	{ href: 'https://www.linkedin.com/in/gabrieldantasg/', color: OP.violet },
	{ href: 'https://www.linkedin.com/in/gabrieldantasg/', color: OP.pager },
];

const CONTACTS = [
	{ url: 'https://www.linkedin.com/in/gabrieldantasg/', label: 'linkedin/gabrieldantasg' },
	{ url: 'https://github.com/gabriel-dantas98', label: 'github/gabriel-dantas98' },
	{ url: 'https://medium.com/@_gdantas', label: 'medium/@_gdantas' },
];

export function HomePage({ locale = 'pt' }: { locale?: 'pt' | 'en' } = {}) {
	return (
		<I18nProvider locale={locale}>
			<BootSplash />
			<HomePageInner />
		</I18nProvider>
	);
}

function HomePageInner() {
	const t = useT();
	const seo = useSeoProps();
	const heroRef = useReveal({ stagger: 0.08, delay: 0.1, y: 22 });
	const topoRef = useReveal({ stagger: 0.05, y: 30, scroll: true });
	const stackRef = useReveal({ stagger: 0.04, y: 14, scroll: true });
	const doctRef = useReveal({ stagger: 0.1, y: 20, scroll: true });
	const talksRef = useReveal({ stagger: 0.06, y: 18, scroll: true });
	const pingRef = useReveal({ stagger: 0.1, y: 22, scroll: true });
	const progressRef = useRef<HTMLDivElement>(null);
	const heroBlockRef = useRef<HTMLDivElement>(null);
	const clock = useUtcClock();
	const uptime = useUptime();
	const whoami = useTypewriter('whoami', 70, 200);
	const titleA = useTypewriter('gabriel', 60, 600);
	const titleB = useTypewriter('dantas', 60, 1200);
	useMouseSpotlight(heroBlockRef);

	const topbarLinks: Array<[string, string]> = [
		[t('nav.about'), '/about'],
		[t('nav.career'), '/timeline'],
		[t('nav.doctrine'), '/doctrine'],
		[t('nav.talks'), '/talks'],
		[t('nav.projects'), '/projects'],
		[t('nav.sidequests'), '/sidequests'],
		[t('nav.writing'), '/writing'],
	];

	const ctas = CTA_META.map((meta, i) => ({
		...meta,
		tag: t(`ping.ctas[${i}].tag`),
		title: t(`ping.ctas[${i}].title`),
		desc: t(`ping.ctas[${i}].desc`),
	}));

	const roles = [0, 1, 2].map((i) => ({
		tag: t(`doctrine.roles[${i}].tag`),
		name: t(`doctrine.roles[${i}].name`),
		text: t(`doctrine.roles[${i}].text`),
	}));

	// Scroll-triggered niceties: barra de progresso, parallax dos ícones do
	// hero, slide-in dos commits de carreira, pop dos stack tiles.
	useGsapReady(() => {
		window.gsap.registerPlugin(window.ScrollTrigger);
		if (progressRef.current) {
			window.gsap.to(progressRef.current, {
				scaleX: 1,
				ease: 'none',
				scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
			});
		}
		window.gsap.to('.op-hero-icon', {
			yPercent: -25,
			ease: 'none',
			scrollTrigger: { trigger: '.op-hero-block', start: 'top top', end: 'bottom top', scrub: 0.5 },
		});
		window.gsap.utils.toArray('.op-stack-tile').forEach((tile: HTMLElement, i: number) => {
			window.gsap.fromTo(
				tile,
				{ opacity: 0, scale: 0.85, y: 16 },
				{
					opacity: 1,
					scale: 1,
					y: 0,
					duration: 0.5,
					delay: (i % 4) * 0.06,
					ease: 'back.out(1.4)',
					scrollTrigger: { trigger: tile, start: 'top 92%', once: true },
				},
			);
		});
		return () => {
			if (window.ScrollTrigger) {
				window.ScrollTrigger.getAll().forEach((t: any) => t.kill());
			}
		};
	}, []);

	return (
        <>
            <NextSeo {...seo} />
            <Head>
				<style>{`html, body { background: ${OP.bg}; scroll-behavior: smooth; } body { font-family: ${OP.sans}; color: ${OP.fg}; margin: 0; }`}</style>
			</Head>
            {/* GSAP é carregado via dynamic import no _app.tsx (lib/gsap-loader).
			   Hooks Operator esperam window.gsap via retry pattern. */}
            <div
				ref={progressRef}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					height: 2,
					background: OP.amber,
					transformOrigin: '0 50%',
					transform: 'scaleX(0)',
					zIndex: 50,
					boxShadow: `0 0 12px ${OP.amber}88`,
				}}
			/>
            <main
				className={`${styles.host} ${styles.hostPad}`}
				style={{
					width: '100%',
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.font,
					padding: '40px 64px 80px',
					position: 'relative',
					overflow: 'hidden',
					boxSizing: 'border-box',
				}}>
				<PlatformBg />
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						opacity: 0.45,
						zIndex: 0,
						backgroundImage:
							'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.02) 2px 3px)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: -120,
						right: -120,
						width: 360,
						height: 360,
						zIndex: 0,
						background: `radial-gradient(closest-side, ${OP.amber}22, transparent 70%)`,
						pointerEvents: 'none',
					}}
				/>

				{/* TOP BAR */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						position: 'relative',
						zIndex: 1,
						gap: 16,
						flexWrap: 'wrap',
					}}>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.pager }} />
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.amber }} />
						<span style={{ width: 10, height: 10, borderRadius: 99, background: OP.ok }} />
						<span style={{ marginLeft: 14, fontSize: 12, color: OP.dim }}>
							tty/0 · gdantas.io ·{' '}
							<span style={{ color: OP.ok }} suppressHydrationWarning>
								{clock || '—'}
							</span>
						</span>
					</div>
					<div className={styles.topbarNav} style={{ display: 'flex', gap: 22, fontSize: 13 }}>
						{topbarLinks.map(([label, href]) => (
							<Link
								key={href}
								href={href}
								style={{ color: OP.dim, textDecoration: 'none', transition: 'color .15s' }}
								onMouseEnter={(e) => (e.currentTarget.style.color = OP.amber)}
								onMouseLeave={(e) => (e.currentTarget.style.color = OP.dim)}>
								<span style={{ color: OP.amber }}>›</span> {label}
							</Link>
						))}
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<LangSwitcher />
						<MobileMenuDrawer
							items={topbarLinks.map(([label, href]) => ({ label, href }))}
							topOffset={0}
						/>
					</div>
				</div>

				{/* HERO */}
				<div
					ref={heroBlockRef}
					className={`op-hero-block ${styles.mouseSpot}`}
					style={{ position: 'relative', marginTop: 64 }}>
					<HeroIconRain />
					<div ref={heroRef} style={{ position: 'relative', zIndex: 2 }}>
						<div style={{ fontSize: 13, color: OP.dim }}>
							<Prompt path="~">
								<span suppressHydrationWarning>{whoami}</span>
								<Cursor />
							</Prompt>
						</div>
						<div
							className={`${styles.heroTitle} ${styles.amberGlow}`}
							style={{
								marginTop: 18,
								fontSize: 88,
								lineHeight: 0.96,
								fontWeight: 500,
								letterSpacing: '-0.03em',
								fontVariantNumeric: 'tabular-nums',
							}}>
							<span suppressHydrationWarning>{titleA || ' '}</span>
							<br />
							<span style={{ color: OP.amber }} suppressHydrationWarning>
								{titleB || ' '}
							</span>
							<span
								style={{
									color: OP.dim,
									fontSize: 32,
									fontWeight: 400,
									marginLeft: 18,
								}}>
								/ {t('hero.role')}
							</span>
						</div>
						<div className={styles.heroGrid}>
							<div
								style={{
									fontFamily: OP.sans,
									fontSize: 18,
									lineHeight: 1.55,
									color: OP.fg,
									maxWidth: 620,
								}}>
								{t('hero.bioP1')}
								<div style={{ marginTop: 18, color: OP.dim, fontStyle: 'italic', fontSize: 16 }}>
									{t('hero.quote')}
								</div>
							</div>
							<div
								style={{
									borderLeft: `1px solid ${OP.rule}`,
									paddingLeft: 24,
									fontSize: 13,
									color: OP.dim,
									background: 'rgba(17,14,27,0.6)',
								}}>
								<div>{t('hero.uptimeLabel')}</div>
								<div
									style={{
										color: OP.fg,
										fontSize: 22,
										marginTop: 4,
										fontVariantNumeric: 'tabular-nums',
										letterSpacing: '-0.01em',
									}}
									suppressHydrationWarning>
									{uptime || '—'}
								</div>
								<div style={{ marginTop: 22 }}>{t('hero.statusLabel')}</div>
								<div
									style={{
										color: OP.ok,
										fontSize: 16,
										marginTop: 4,
										display: 'flex',
										alignItems: 'center',
										gap: 8,
									}}>
									<span className={styles.statusDot} style={{ background: OP.ok }} />
									{t('hero.statusValue')}
								</div>
								<div style={{ marginTop: 22 }}>{t('hero.baseLabel')}</div>
								<div style={{ color: OP.fg, fontSize: 16, marginTop: 4 }}>
									{t('hero.baseValue')}
								</div>
							</div>
						</div>
						<div style={{ marginTop: 44, fontSize: 13 }}>
							<Prompt path="~">
								_<Cursor />
							</Prompt>
						</div>
					</div>
				</div>

				{/* 01 — TOPOLOGY */}
				<div ref={topoRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec
						label={t('sections.topology.label')}
						title={t('sections.topology.title')}
						sub={t('sections.topology.sub')}
					/>
					<div
						style={{
							marginTop: 24,
							border: `1px solid ${OP.rule}`,
							background: 'rgba(17,14,27,0.55)',
							padding: '24px 28px 20px',
							position: 'relative',
							overflow: 'hidden',
						}}>
						<div
							style={{
								position: 'absolute',
								top: 14,
								left: 18,
								fontSize: 11,
								color: OP.dim,
								letterSpacing: '0.1em',
							}}>
							{t('topology.cluster')}
						</div>
						<div
							style={{
								position: 'absolute',
								top: 14,
								right: 18,
								fontSize: 11,
								color: OP.ok,
								letterSpacing: '0.1em',
							}}>
							{t('topology.synced')}
						</div>
						<div style={{ marginTop: 28 }}>
							<Topology width={1152} height={520} />
						</div>
						<div style={{ marginTop: 12, paddingTop: 18, borderTop: `1px dashed ${OP.rule2}` }}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									gap: 12,
									fontSize: 11,
									color: OP.dim,
									marginBottom: 10,
									flexWrap: 'wrap',
								}}>
								<span>{t('topology.kubectlBar')}</span>
								<span>{t('topology.p95')}</span>
							</div>
							<div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
								<div style={{ minWidth: 480 }}>
									<ClusterGrid rows={4} cols={28} />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 02 — STACK */}
				<div ref={stackRef} style={{ marginTop: 96, position: 'relative', zIndex: 1 }}>
					<Sec
						label={t('sections.stack.label')}
						title={t('sections.stack.title')}
						sub={t('sections.stack.sub')}
					/>
					<div
						className={styles.stackGrid}
						style={{ background: OP.rule, border: `1px solid ${OP.rule}`, marginTop: 24 }}>
						{STACK.map(([k, v]) => (
							<div
								key={k}
								className="op-stack-tile"
								style={{ background: OP.bg, padding: '22px 20px' }}>
								<div
									style={{
										fontSize: 11,
										color: OP.dim,
										letterSpacing: '0.1em',
										textTransform: 'uppercase',
									}}>
									{k}
								</div>
								<div style={{ fontSize: 19, marginTop: 8 }}>{v}</div>
							</div>
						))}
					</div>
				</div>

				{/* 03 — DOCTRINE */}
				<div
					id="doctrine"
					ref={doctRef}
					style={{ marginTop: 112, position: 'relative', zIndex: 1, scrollMarginTop: 80 }}>
					<Sec
						label={t('sections.doctrine.label')}
						title={t('sections.doctrine.title')}
						sub={t('sections.doctrine.sub')}
					/>
					<div className={styles.doctrineGrid}>
						<div
							style={{
								background: 'rgba(17,14,27,0.65)',
								border: `1px solid ${OP.rule}`,
								padding: '28px 30px',
								position: 'relative',
							}}>
							<div
								style={{
									position: 'absolute',
									top: -1,
									left: -1,
									fontFamily: OP.font,
									fontSize: 10,
									color: OP.amber,
									padding: '4px 10px',
									background: OP.bg,
									border: `1px solid ${OP.rule2}`,
								}}>
								{t('doctrine.manifestoTag')}
							</div>
							<div
								style={{
									fontFamily: OP.sans,
									fontSize: 18,
									lineHeight: 1.65,
									color: OP.fg,
									marginTop: 14,
								}}>
								<p style={{ margin: '0 0 14px' }}>
									{t('doctrine.manifestoP1Pre')}
									<span style={{ color: OP.amber }}>
										<em>{t('doctrine.manifestoP1Amber')}</em>
									</span>
									{t('doctrine.manifestoP1Post')}
								</p>
								<p style={{ margin: '0 0 14px' }}>
									{t('doctrine.manifestoP2Pre')}
									<span style={{ color: OP.amber }}>{t('doctrine.manifestoP2Amber')}</span>
									{t('doctrine.manifestoP2Post')}
								</p>
								<p style={{ margin: '0 0 14px' }}>
									{t('doctrine.manifestoP3Pre')}
									<span style={{ color: OP.amber }}>{t('doctrine.manifestoP3Amber')}</span>
								</p>
								<p style={{ margin: 0 }}>{t('doctrine.manifestoP4')}</p>
							</div>
							<div
								style={{
									marginTop: 28,
									paddingTop: 20,
									borderTop: `1px dashed ${OP.rule2}`,
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: 12,
									color: OP.dim,
								}}>
								<span>{t('doctrine.sig')}</span>
								<span>{t('doctrine.sigDate')}</span>
							</div>
						</div>
						<div>
							{roles.map((r) => (
								<div
									key={r.tag}
									style={{
										border: `1px solid ${OP.rule}`,
										padding: '20px 22px',
										marginBottom: 14,
										background: OP.bg2,
									}}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											fontSize: 11,
											color: OP.dim,
											letterSpacing: '0.08em',
										}}>
										<span>{r.tag}</span>
										<span style={{ color: OP.amber }}>{r.name}</span>
									</div>
									<div
										style={{
											marginTop: 10,
											fontFamily: OP.sans,
											fontSize: 15,
											lineHeight: 1.55,
										}}>
										{r.text}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* 04 — TALKS */}
				<div ref={talksRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec
						label={t('sections.talks.label')}
						title={t('sections.talks.title')}
						sub={t('sections.talks.sub')}
					/>
					<div className={styles.talksGrid} style={{ marginTop: 28 }}>
						{TALKS.map((rawTk) => {
							// Talks são listadas estaticamente em PT no array TALKS, mas
							// title/preview têm chaves por slug em locales/* pra suporte EN.
							// Fallback pro original quando a chave não existe.
							const i18nTitle = t(`talks.home.${rawTk.slug}.title`);
							const i18nPreview = t(`talks.home.${rawTk.slug}.preview`);
							const tk = {
								...rawTk,
								title: i18nTitle.startsWith('talks.home.') ? rawTk.title : i18nTitle,
								preview: i18nPreview.startsWith('talks.home.') ? rawTk.preview : i18nPreview,
							};
							return (
							<a
								key={tk.slug}
								href={`/presentations#${tk.slug}`}
								className={styles.tiltCard}
								onClick={() => posthog.capture('talk_card_clicked', { talk_slug: tk.slug, talk_title: tk.title, talk_event: tk.event })}
								style={{
									background: OP.bg2,
									border: `1px solid ${OP.rule}`,
									display: 'flex',
									flexDirection: 'column',
									textDecoration: 'none',
									color: 'inherit',
								}}
								onMouseMove={(e) => {
									const r = e.currentTarget.getBoundingClientRect();
									const px = (e.clientX - r.left) / r.width - 0.5;
									const py = (e.clientY - r.top) / r.height - 0.5;
									e.currentTarget.style.transform = `perspective(1200px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(6px)`;
									e.currentTarget.style.borderColor = OP.amber;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform =
										'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
									e.currentTarget.style.borderColor = OP.rule;
								}}>
								<TalkPreview talk={tk} />
								<div
									style={{
										padding: '20px 22px 22px',
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
									}}>
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											fontSize: 11,
											color: OP.dim,
											letterSpacing: '0.08em',
											textTransform: 'uppercase',
										}}>
										<span>{tk.event}</span>
										<span>{tk.loc}</span>
									</div>
									<div style={{ fontSize: 17, lineHeight: 1.4, marginTop: 10 }}>
										{tk.title}
									</div>
									<div
										style={{
											marginTop: 16,
											paddingTop: 14,
											borderTop: `1px solid ${OP.rule}`,
											display: 'flex',
											gap: 14,
											fontSize: 12,
											flexWrap: 'wrap',
										}}>
										{tk.links.map(([k, label]) => (
											<span key={k} style={{ color: OP.amber }}>
												<span style={{ color: OP.dim }}>./</span>
												{k} <span style={{ color: OP.dim }}>{label}</span>
											</span>
										))}
									</div>
								</div>
							</a>
							);
						})}
					</div>
					<div style={{ marginTop: 22, fontSize: 13, color: OP.dim }}>
						<Prompt path="~/talks">ls --all</Prompt>{' '}
						<Link href="/presentations" style={{ color: OP.amber, textDecoration: 'none' }}>
							↗ all talks
						</Link>
					</div>
				</div>

				{/* 05 — PING --HELP */}
				<div ref={pingRef} style={{ marginTop: 112, position: 'relative', zIndex: 1 }}>
					<Sec
						label={t('sections.ping.label')}
						title={t('sections.ping.title')}
						sub={t('sections.ping.sub')}
					/>
					<div
						style={{
							marginTop: 24,
							border: `1px solid ${OP.rule}`,
							background: 'rgba(17,14,27,0.65)',
							padding: '28px 32px',
							position: 'relative',
						}}>
						<div
							style={{
								position: 'absolute',
								top: -1,
								left: -1,
								fontFamily: OP.font,
								fontSize: 10,
								color: OP.amber,
								padding: '4px 10px',
								background: OP.bg,
								border: `1px solid ${OP.rule2}`,
							}}>
							{t('ping.chrome')}
						</div>
						<div
							style={{
								fontFamily: OP.sans,
								fontSize: 17,
								lineHeight: 1.65,
								color: OP.fg,
								marginTop: 14,
								maxWidth: 760,
							}}>
							<p style={{ margin: '0 0 8px' }}>{t('ping.intro')}</p>
							<p style={{ margin: 0, color: OP.dim, fontSize: 15 }}>{t('ping.prompt')}</p>
						</div>
						<div className={styles.pingGrid}>
							{ctas.map((cta) => (
								<a
									key={cta.tag}
									href={cta.href}
									target="_blank"
									rel="noreferrer noopener"
									onClick={() => posthog.capture('cta_clicked', { cta_type: cta.tag, cta_title: cta.title })}
									style={{
										display: 'block',
										padding: '20px 22px',
										border: `1px solid ${OP.rule2}`,
										background: OP.bg2,
										textDecoration: 'none',
										color: OP.fg,
										transition:
											'transform 120ms ease, border-color 120ms ease, background 120ms ease',
									}}>
									<div
										style={{
											fontFamily: OP.font,
											fontSize: 11,
											color: cta.color,
											letterSpacing: '0.1em',
										}}>
										{cta.tag}
									</div>
									<div
										style={{
											fontFamily: OP.font,
											fontSize: 16,
											marginTop: 8,
											color: OP.fg,
										}}>
										{cta.title}
									</div>
									<div
										style={{
											fontFamily: OP.sans,
											fontSize: 13,
											color: OP.dim,
											marginTop: 10,
											lineHeight: 1.55,
										}}>
										{cta.desc}
									</div>
									<div
										style={{
											fontFamily: OP.font,
											fontSize: 11,
											color: cta.color,
											marginTop: 14,
											letterSpacing: '0.08em',
										}}>
										./run ↗
									</div>
								</a>
							))}
						</div>
					</div>
				</div>

				{/* MARQUEE */}
				<div style={{ marginTop: 96, position: 'relative', zIndex: 1 }}>
					<Marquee items={PLATFORM_TOOLS} speed={80} />
				</div>

				{/* CONTACT */}
				<div
					style={{
						marginTop: 64,
						paddingTop: 40,
						borderTop: `1px solid ${OP.rule}`,
						position: 'relative',
						zIndex: 1,
					}}>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr auto',
							gap: 32,
							alignItems: 'end',
						}}>
						<div>
							<div style={{ fontSize: 13, color: OP.dim }}>
								<Prompt path="~">{t('footer.prompt')}</Prompt>
							</div>
							<div
								style={{
									fontSize: 56,
									fontWeight: 500,
									letterSpacing: '-0.025em',
									marginTop: 14,
								}}>
								— <span style={{ color: OP.amber }}>gd</span>
							</div>
							<div style={{ fontSize: 13, color: OP.dim, marginTop: 8 }}>
								{t('footer.baseValue')}
							</div>
						</div>
						<div style={{ fontSize: 14, textAlign: 'right' }}>
							<div style={{ color: OP.dim }}>{t('footer.contactLabel')}</div>
							{CONTACTS.map((c) => (
								<div key={c.url} style={{ marginTop: 6 }}>
									<a
										href={c.url}
										target="_blank"
										rel="noreferrer noopener"
										onClick={() => posthog.capture('contact_link_clicked', { label: c.label })}
										style={{
											color: OP.fg,
											textDecoration: 'none',
											display: 'inline-block',
											padding: '6px 0',
											minHeight: 24,
										}}>
										{c.label} ↗
									</a>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
        </>
    );
}
