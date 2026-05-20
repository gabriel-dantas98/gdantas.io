import Image from "next/legacy/image";
import React from 'react';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import ProfilePicture from '../../public/profile-photo-720.jpg';
import { I18nProvider, useT } from '~/lib/i18n';


export function AboutPage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<AboutPageInner />
		</I18nProvider>
	);
}

function AboutPageInner() {
	const t = useT();
	const ref = useReveal({ stagger: 0.07, y: 22 });
	const facts = [0, 1, 2, 3, 4, 5].map((i) => ({
		k: t(`about.facts[${i}].k`),
		v: t(`about.facts[${i}].v`),
	}));
	return (
		<OperatorPage
			title="gdantas ─ cat ~/.about"
			description="Quem é o operador. SRE, plataforma, Backstage, AI ops."
			active="/about">
			<div ref={ref}>
				<Sec
					label={t('about.section.label')}
					title={t('about.section.title')}
					sub={t('about.section.sub')}
				/>
				<div
					className="op-about-grid"
					style={{
						display: 'grid',
						gridTemplateColumns: '320px 1fr',
						gap: 56,
						marginTop: 32,
						alignItems: 'start',
					}}>
					<div
						style={{
							position: 'relative',
							border: `1px solid ${OP.rule2}`,
							padding: 6,
							background: OP.bg2,
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
								zIndex: 2,
							}}>
							{t('about.imgLabel')}
						</div>
						<div
							style={{
								position: 'relative',
								width: '100%',
								aspectRatio: '3/4',
								overflow: 'hidden',
								filter: 'grayscale(0.4) contrast(1.05)',
							}}>
							<Image
								src={ProfilePicture}
								alt="Gabriel Dantas"
								layout="fill"
								objectFit="cover"
								priority
								sizes="320px"
							/>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `linear-gradient(180deg, transparent 60%, ${OP.bg}cc 100%)`,
									pointerEvents: 'none',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									backgroundImage:
										'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(255,255,255,0.04) 2px 3px)',
									pointerEvents: 'none',
								}}
							/>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								fontSize: 10,
								color: OP.dim,
								marginTop: 8,
								padding: '0 4px 2px',
								letterSpacing: '0.08em',
								fontFamily: OP.font,
							}}>
							<span>{t('about.subject')}</span>
							<span>{t('about.shot')}</span>
						</div>
					</div>
					<div style={{ fontFamily: OP.sans, fontSize: 17, lineHeight: 1.65, color: OP.fg }}>
						<p style={{ margin: '0 0 14px' }}>
							{t('about.p1Pre')}
							<span style={{ color: OP.amber }}>{t('about.p1Bold')}</span>
							{t('about.p1Mid')}
							<span style={{ color: OP.amber }}>{t('about.p1Bold2')}</span>
							{t('about.p1Post')}
						</p>
						<p style={{ margin: '0 0 14px' }}>
							{t('about.p2Pre')}
							<span style={{ color: OP.amber }}>{t('about.p2Bold')}</span>
							{t('about.p2Post')}
						</p>
						<div
							style={{
								marginTop: 22,
								display: 'grid',
								gridTemplateColumns: 'auto 1fr',
								gap: '8px 18px',
								fontFamily: OP.font,
								fontSize: 13,
							}}>
							{facts.map((f) => (
								<React.Fragment key={f.k}>
									<span style={{ color: OP.dim }}>{f.k}</span>
									<span style={{ color: OP.fg }}>{f.v}</span>
								</React.Fragment>
							))}
						</div>
						<div
							style={{
								marginTop: 24,
								paddingTop: 18,
								borderTop: `1px dashed ${OP.rule2}`,
								fontFamily: OP.font,
								fontSize: 13,
								color: OP.dim,
							}}>
							{t('about.hobbies')}
						</div>
						<div style={{ marginTop: 28, fontSize: 13 }}>
							<Prompt path="~">cat ~/.about | wc -l → {facts.length + 2} linhas</Prompt>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-about-grid) {
						grid-template-columns: 1fr !important;
						gap: 32px !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
