import React from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { OP, Sec, Prompt, OperatorPage, TalkCard, useReveal } from '~/components/Operator';
import { I18nProvider, useT } from '~/lib/i18n';
import type { TalkSummary } from '~/lib/talks';
import { getTalkSummaries } from '~/lib/talks-static-props';

interface TalksProps {
	talks: TalkSummary[];
}

// Source of truth única: presentations.json. /talks mostra cards leves que
// levam para as páginas estáticas individuais; embeds só carregam no detalhe.
export const getStaticProps: GetStaticProps<TalksProps> = async () => {
	return { props: { talks: getTalkSummaries() } };
};

export function TalksPage({ talks, locale = 'pt' }: TalksProps & { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<TalksPageInner talks={talks} />
		</I18nProvider>
	);
}

function TalksPageInner({ talks }: { talks: TalkSummary[] }) {
	const t = useT();
	const ref = useReveal({ stagger: 0.05, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ ls ~/talks"
			description="Talks, podcasts e slides — engenharia de plataforma, Backstage, AI ops."
			active="/talks"
		>
			<div ref={ref}>
				<Sec
					label={t('talks.section.label')}
					title={t('talks.section.title')}
					sub={t('talks.section.sub')}
				/>

				<div
					className="op-talks-grid"
					style={{
						marginTop: 32,
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: 14,
					}}
				>
					{talks.map((talk) => (
						<TalkCard key={talk.slug} talk={talk} />
					))}
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~/talks">
						{t('talks.footerPrompt')}{' '}
						<span style={{ color: OP.amber }}>
							{talks.length} {t('talks.footerEntries')}
						</span>{' '}
						·{' '}
						<Link
							href="/presentations"
							style={{ color: OP.amber, textDecoration: 'none' }}
						>
							{t('talks.footerLink')}
						</Link>
					</Prompt>
				</div>
			</div>

			<style jsx>{`
				@media (max-width: 720px) {
					:global(.op-talks-grid) {
						grid-template-columns: 1fr !important;
					}
				}
			`}</style>
		</OperatorPage>
	);
}
