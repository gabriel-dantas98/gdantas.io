import React from 'react';
import Link from 'next/link';

import { OP } from './tokens';
import { useUtcClock } from './hooks';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { LangSwitcher } from './LangSwitcher';
import { useI18n, withLocale } from '~/lib/i18n';

interface NavLink {
	labelKey: string;
	href: string;
}

const NAV_LINKS: NavLink[] = [
	{ labelKey: 'nav.home', href: '/' },
	{ labelKey: 'nav.about', href: '/about' },
	{ labelKey: 'nav.career', href: '/timeline' },
	{ labelKey: 'nav.doctrine', href: '/doctrine' },
	{ labelKey: 'nav.talks', href: '/talks' },
	{ labelKey: 'nav.projects', href: '/projects' },
	{ labelKey: 'nav.sidequests', href: '/sidequests' },
	{ labelKey: 'nav.writing', href: '/writing' },
];

export function OperatorHeader({ active }: { active?: string }) {
	const clock = useUtcClock();
	const { locale, t } = useI18n();
	const localizedLinks = NAV_LINKS.map((l) => ({
		label: t(l.labelKey),
		href: withLocale(l.href, locale),
		canonicalHref: l.href,
	}));

	return (
		<>
			<header
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 12,
					padding: '14px 20px',
					borderBottom: `1px solid ${OP.rule}`,
					background: 'rgba(17,14,27,0.85)',
					backdropFilter: 'blur(6px)',
					position: 'sticky',
					top: 0,
					zIndex: 20,
					fontFamily: OP.font,
					fontSize: 12,
					color: OP.dim,
				}}>
				<div className="op-header-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
					<span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
						<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.pager }} />
						<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.amber }} />
						<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.ok }} />
					</span>
					<Link
						href={withLocale('/', locale)}
						style={{
							color: OP.fg,
							textDecoration: 'none',
							letterSpacing: '0.08em',
							cursor: 'pointer',
						}}>
						tty/0
					</Link>
					<span style={{ color: OP.dim }}>·</span>
					<span>gdantas.io</span>
					<span className="op-header-clock-sep" style={{ color: OP.dim }}>·</span>
					<span
						className="op-header-clock"
						style={{ color: OP.amber, whiteSpace: 'nowrap' }}
						suppressHydrationWarning>
						{clock || '—'}
					</span>
				</div>

				<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
					<nav className="op-nav-desktop" style={{ display: 'flex', gap: 18 }}>
						{localizedLinks.map((l) => {
							const isActive = active === l.canonicalHref;
							return (
								<Link
									key={l.href}
									href={l.href}
									className="op-nav-link"
									style={{
										color: isActive ? OP.amber : OP.fg,
										textDecoration: 'none',
										letterSpacing: '0.04em',
									}}>
									{isActive ? '▸ ' : '  '}
									{l.label}
								</Link>
							);
						})}
					</nav>

					<span className="op-lang-desktop">
						<LangSwitcher />
					</span>

					<MobileMenuDrawer
						items={localizedLinks.map(({ label, href }) => ({ label, href }))}
						active={active && withLocale(active, locale)}
						topOffset={49}
					/>
				</div>
			</header>

			<style jsx global>{`
				@media (max-width: 880px) {
					.op-header-clock,
					.op-header-clock-sep {
						display: none !important;
					}
				}
				@media (max-width: 720px) {
					.op-nav-desktop {
						display: none !important;
					}
					.op-lang-desktop {
						display: none !important;
					}
				}
			`}</style>
		</>
	);
}
