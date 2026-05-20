import React from 'react';

import { OP } from './tokens';
import { useI18n } from '~/lib/i18n';

interface LangSwitcherProps {
	/** style="compact" usa só letras (PT|EN); style="bracket" usa [ PT · en ]. */
	variant?: 'compact' | 'bracket';
}

// Chip de troca de idioma. Lê locale do I18nProvider, troca rota via
// `switchTo` (que faz router.push do mirror path + grava localStorage).
export function LangSwitcher({ variant = 'bracket' }: LangSwitcherProps) {
	const { locale, switchTo } = useI18n();

	const ptActive = locale === 'pt';
	const enActive = locale === 'en';
	const target = ptActive ? 'en' : 'pt';

	if (variant === 'compact') {
		return (
			<button
				type="button"
				onClick={() => switchTo(target)}
				aria-label={`Switch to ${target.toUpperCase()}`}
				style={{
					background: 'transparent',
					border: `1px solid ${OP.rule2}`,
					color: OP.amber,
					fontFamily: OP.font,
					fontSize: 11,
					padding: '3px 8px',
					letterSpacing: '0.12em',
					cursor: 'pointer',
				}}>
				{locale.toUpperCase()} → {target.toUpperCase()}
			</button>
		);
	}

	return (
		<span
			role="group"
			aria-label="Language"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 4,
				fontFamily: OP.font,
				fontSize: 12,
				color: OP.dim,
				border: `1px solid ${OP.rule2}`,
				padding: '2px 8px',
			}}>
			<button
				type="button"
				onClick={() => !ptActive && switchTo('pt')}
				aria-pressed={ptActive}
				aria-label="Mudar para Português"
				disabled={ptActive}
				style={{
					background: 'transparent',
					border: 'none',
					color: ptActive ? OP.amber : OP.dim,
					fontFamily: OP.font,
					fontSize: 12,
					padding: 0,
					cursor: ptActive ? 'default' : 'pointer',
					letterSpacing: '0.06em',
				}}>
				{ptActive ? 'PT' : 'pt'}
			</button>
			<span style={{ color: OP.dim2 }}>·</span>
			<button
				type="button"
				onClick={() => !enActive && switchTo('en')}
				aria-pressed={enActive}
				aria-label="Switch to English"
				disabled={enActive}
				style={{
					background: 'transparent',
					border: 'none',
					color: enActive ? OP.amber : OP.dim,
					fontFamily: OP.font,
					fontSize: 12,
					padding: 0,
					cursor: enActive ? 'default' : 'pointer',
					letterSpacing: '0.06em',
				}}>
				{enActive ? 'EN' : 'en'}
			</button>
		</span>
	);
}
