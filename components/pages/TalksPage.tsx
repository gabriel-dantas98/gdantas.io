import React from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { OP, Sec, Prompt, OperatorPage, TalkCard, useReveal } from '~/components/Operator';
import { I18nProvider, useI18n, useT, withLocale } from '~/lib/i18n';
import type { TalkSummary } from '~/lib/talks';
import { getTalkSummaries } from '~/lib/talks-static-props';
import { resolveTalkCopy } from '~/lib/talk-copy';
import { buildCollectionPage } from '~/lib/structured-data';

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
	const { locale } = useI18n();
	const ref = useReveal({ stagger: 0.05, y: 18 });
	const path = locale === 'en' ? '/en/talks' : '/talks';
	const collectionItems = talks.map((talk) => ({
		name: resolveTalkCopy(t, talk.slug, {
			title: talk.title,
			description: talk.description,
		}).title,
		url: withLocale(`/talks/${talk.slug}`, locale),
	}));

	return (
		<OperatorPage
			title={t('seo.talks.title')}
			description={t('seo.talks.description')}
			structuredData={buildCollectionPage({
				locale,
				path,
				name: t('seo.talks.title'),
				description: t('seo.talks.description'),
				items: collectionItems,
			})}
			active="/talks">
			<div ref={ref}>
				<Sec
					as="h1"
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
							href={withLocale('/presentations', locale)}
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
