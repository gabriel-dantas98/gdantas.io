import React from 'react';
import type { GetStaticProps } from 'next';

import { OP, Sec, Prompt, OperatorPage, useReveal } from '~/components/Operator';
import { useT } from '~/lib/i18n';
import { loadShortcuts, type Shortcut } from '~/lib/shortcuts';

interface GoIndexProps {
	shortcuts: Shortcut[];
}

export const getStaticProps: GetStaticProps<GoIndexProps> = async () => {
	const shortcuts = loadShortcuts().map((s) => {
		const item: Shortcut = { slug: s.slug, url: s.url };
		if (s.label) item.label = s.label;
		return item;
	});
	return { props: { shortcuts } };
};

export default function GoIndexPage({ shortcuts }: GoIndexProps) {
	const t = useT();
	const ref = useReveal({ stagger: 0.04, y: 14 });
	const isExternal = (u: string) => /^https?:\/\//.test(u);

	return (
		<OperatorPage
			title="gdantas ─ ls ~/.shortcuts"
			description="URL shortener as code · /go/<slug>"
			active="/go">
			<div ref={ref}>
				<Sec
					label={t('go.section.label')}
					title={t('go.section.title')}
					sub={t('go.section.sub')}
				/>

				<div
					className="op-go-card"
					style={{
						marginTop: 28,
						border: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.65)',
						padding: '22px 28px',
						fontFamily: OP.font,
						fontSize: 13,
						color: OP.fg,
						overflow: 'hidden',
					}}>
					<div
						className="op-go-head"
						style={{
							display: 'grid',
							gridTemplateColumns: '110px 1fr 60px',
							gap: 16,
							fontSize: 11,
							color: OP.dim,
							letterSpacing: '0.08em',
							paddingBottom: 10,
							borderBottom: `1px dashed ${OP.rule2}`,
						}}>
						<span>{t('go.colSlug')}</span>
						<span>{t('go.colLabel')}</span>
						<span style={{ textAlign: 'right' }}>↗</span>
					</div>

					{shortcuts.map((s) => (
						<a
							key={s.slug}
							href={`/go/${s.slug}`}
							{...(isExternal(s.url)
								? {}
								: {})}
							className="op-go-row"
							style={{
								display: 'grid',
								gridTemplateColumns: '110px 1fr 60px',
								gap: 16,
								padding: '12px 0',
								borderBottom: `1px dashed ${OP.rule}`,
								alignItems: 'center',
								textDecoration: 'none',
								color: OP.fg,
							}}>
							<span style={{ color: OP.amber }}>/go/{s.slug}</span>
							<span>
								<div style={{ color: OP.fg }}>{s.label || s.url}</div>
								{s.label && (
									<div
										style={{
											color: OP.dim,
											fontSize: 11,
											marginTop: 2,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}>
										{s.url}
									</div>
								)}
							</span>
							<span
								style={{
									textAlign: 'right',
									color: isExternal(s.url) ? OP.violet : OP.ok,
									fontSize: 12,
								}}>
								{isExternal(s.url) ? 'ext' : 'int'}
							</span>
						</a>
					))}

					<div style={{ marginTop: 14, color: OP.dim, fontSize: 12 }}>
						{t('go.footerPromptPre')}{' '}
						<span style={{ color: OP.amber }}>
							{shortcuts.length} {t('go.footerEntries')}
						</span>{' '}
						{t('go.footerNote')}
					</div>
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/.shortcuts">cat data/shortcuts.yaml</Prompt>
				</div>
			</div>

			<style jsx global>{`
				@media (max-width: 640px) {
					.op-go-card {
						padding: 18px 16px !important;
					}
					.op-go-head {
						display: none !important;
					}
					.op-go-row {
						grid-template-columns: 1fr !important;
						gap: 4px !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
