import React from 'react';
import Link from 'next/link';

import { OP } from './tokens';
import { useUtcClock } from './hooks';

interface NavLink {
	label: string;
	href: string;
}

const NAV_LINKS: NavLink[] = [
	{ label: './about', href: '/about' },
	{ label: './career', href: '/timeline' },
	{ label: './doctrine', href: '/doctrine' },
	{ label: './talks', href: '/talks' },
	{ label: './projects', href: '/projects' },
	{ label: './writing', href: '/writing' },
];

export function OperatorHeader({ active }: { active?: string }) {
	const clock = useUtcClock();
	return (
        <header
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				padding: '14px 28px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
				<span style={{ display: 'flex', gap: 6 }}>
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.pager }} />
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.amber }} />
					<span style={{ width: 10, height: 10, borderRadius: '50%', background: OP.ok }} />
				</span>
				<Link href="/" style={{
                    color: OP.fg,
                    textDecoration: 'none',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                }}>
					
						tty/0
					
				</Link>
				<span style={{ color: OP.dim }}>·</span>
				<span>gdantas.io</span>
				<span style={{ color: OP.dim }}>·</span>
				<span style={{ color: OP.amber }} suppressHydrationWarning>
					{clock || '—'}
				</span>
			</div>
            <nav style={{ display: 'flex', gap: 18 }}>
				{NAV_LINKS.map((l) => {
					const isActive = active === l.href;
					return (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="op-nav-link"
                            style={{
                                color: isActive ? OP.amber : OP.fg,
                                textDecoration: 'none',
                                letterSpacing: '0.04em',
                                position: 'relative',
                            }}>

                            {isActive ? '▸ ' : '  '}
                            {l.label}

                        </Link>
                    );
				})}
			</nav>
        </header>
    );
}
