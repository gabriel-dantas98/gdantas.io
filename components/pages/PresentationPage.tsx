import dynamic from 'next/dynamic';
import React from 'react';

import { OperatorPage, Sec } from '~/components/Operator';
import { I18nProvider, useI18n, useT, type Locale } from '~/lib/i18n';

// @remotion/player só pode rodar no browser (acessa Web Audio + canvas).
// next/dynamic({ ssr: false }) garante que o static export não tenta
// prerender o componente.
const PresentationPlayer = dynamic(
	() => import('~/components/presentation/PresentationPlayer'),
	{
		ssr: false,
		loading: () => (
			<div
				style={{
					padding: 24,
					border: '1px dashed rgba(248,248,249,0.18)',
					borderRadius: 12,
					color: '#a097b5',
					fontFamily: 'var(--font-mono), ui-monospace, monospace',
				}}
			>
				booting…
			</div>
		),
	},
);

export function PresentationPage({ locale = 'pt' }: { locale?: Locale }) {
	return (
		<I18nProvider locale={locale}>
			<PresentationPageInner />
		</I18nProvider>
	);
}

function PresentationPageInner() {
	const t = useT();
	const { locale } = useI18n();
	return (
		<OperatorPage
			title={t('presentation.meta.title')}
			description={t('presentation.meta.description')}
			active="/presentation"
		>
			<Sec
				label={t('presentation.header.label')}
				title={t('presentation.header.title')}
				sub={t('presentation.header.sub')}
			/>
			<div style={{ marginTop: 32 }}>
				<PresentationPlayer locale={locale} />
			</div>
		</OperatorPage>
	);
}
