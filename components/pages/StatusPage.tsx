import React from 'react';

import { OP, Sec, OperatorPage, useReveal } from '~/components/Operator';
import { Status } from '~/components';
import { I18nProvider, useT } from '~/lib/i18n';

export function StatusPage({ locale = 'pt' }: { locale?: 'pt' | 'en' }) {
	return (
		<I18nProvider locale={locale}>
			<StatusPageInner />
		</I18nProvider>
	);
}

function StatusPageInner() {
	const t = useT();
	const ref = useReveal({ stagger: 0.06, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ systemctl status"
			description="Status do operador — Lanyard / Discord presence."
			active="/">
			<div ref={ref} style={{ maxWidth: 520 }}>
				<Sec
					label={t('status.section.label')}
					title={t('status.section.title')}
					sub={t('status.section.sub')}
				/>
				<div
					style={{
						marginTop: 28,
						padding: '22px 24px',
						border: `1px solid ${OP.rule}`,
						background: OP.bg2,
					}}>
					<Status.Widget />
				</div>
			</div>
		</OperatorPage>
	);
}
