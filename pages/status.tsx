import React from 'react';

import { OP, Sec, OperatorPage, useReveal } from '~/components/Operator';
import { Status } from '~/components';

export default function StatusPage() {
	const ref = useReveal({ stagger: 0.06, y: 18 });
	return (
		<OperatorPage
			title="gdantas ─ systemctl status"
			description="Status do operador — Lanyard / Discord presence."
			active="/">
			<div ref={ref} style={{ maxWidth: 520 }}>
				<Sec label="01" title="systemctl status" sub="discord presence + agora" />
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
