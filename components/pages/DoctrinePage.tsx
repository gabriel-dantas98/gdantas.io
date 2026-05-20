import React from 'react';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { I18nProvider, useT } from '~/lib/i18n';


export function DoctrinePage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<DoctrinePageInner />
		</I18nProvider>
	);
}

function DoctrinePageInner() {
	const t = useT();
	const ref = useReveal({ stagger: 0.06, y: 18 });

	const roles = [0, 1, 2].map((i) => ({
		tag: t(`doctrine.roles[${i}].tag`),
		name: t(`doctrine.roles[${i}].name`),
		text: t(`doctrine.roles[${i}].text`),
	}));

	return (
		<OperatorPage
			title="gdantas ─ cat ~/.doctrine"
			description="Princípios e papéis de operação. So others may live."
			active="/doctrine">
			<div ref={ref}>
				<Sec
					label={t('sections.doctrine.label')}
					title={t('sections.doctrine.title')}
					sub={t('sections.doctrine.sub')}
				/>

				<div
					style={{
						marginTop: 28,
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
						{t('doctrine.manifestoTag')}
					</div>
					<div
						style={{
							fontFamily: OP.sans,
							fontSize: 18,
							lineHeight: 1.7,
							color: OP.fg,
							maxWidth: 760,
							marginTop: 14,
						}}>
						<p style={{ margin: '0 0 14px' }}>
							{t('doctrine.manifestoP1Pre')}
							<span style={{ color: OP.amber }}>{t('doctrine.manifestoP1Amber')}</span>
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

				<div
					className="op-roles-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 18,
					}}>
					{roles.map((r) => (
						<div
							key={r.tag}
							style={{
								border: `1px solid ${OP.rule2}`,
								background: OP.bg2,
								padding: '22px 24px',
							}}>
							<div
								style={{
									fontFamily: OP.font,
									fontSize: 11,
									color: OP.amber,
									letterSpacing: '0.1em',
								}}>
								{r.tag}
							</div>
							<div
								style={{
									fontFamily: OP.font,
									fontSize: 18,
									color: OP.fg,
									marginTop: 8,
								}}>
								{r.name}
							</div>
							<div
								style={{
									marginTop: 14,
									fontFamily: OP.sans,
									fontSize: 14,
									lineHeight: 1.55,
									color: OP.fg,
									opacity: 0.88,
								}}>
								{r.text}
							</div>
						</div>
					))}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.doctrine">grep -i &quot;cultura&quot; * | tail -1</Prompt>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-roles-grid) {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
