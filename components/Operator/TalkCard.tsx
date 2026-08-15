import React from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

import { resolveTalkCopy } from '~/lib/talk-copy';
import type { TalkSummary } from '~/lib/talks';
import { useI18n, useT, withLocale } from '~/lib/i18n';
import { OP } from './tokens';

const KIND_COLORS: Record<TalkSummary['kind'], string> = {
	video: OP.pager,
	audio: OP.ok,
	slides: OP.amber,
	talk: OP.violet,
};

export function TalkCard({
	talk,
	analyticsEvent = 'talk_clicked',
}: {
	talk: TalkSummary;
	analyticsEvent?: 'talk_clicked' | 'talk_card_clicked';
}) {
	const t = useT();
	const { locale } = useI18n();
	const copy = resolveTalkCopy(t, talk.slug, {
		title: talk.title,
		description: talk.description,
	});
	const kind = {
		tag: t(`talks.kinds.${talk.kind}`),
		color: KIND_COLORS[talk.kind],
	};
	const meta = [talk.date, talk.location].filter(Boolean).join(' · ');

	return (
		<>
			<Link
				href={withLocale(`/talks/${talk.slug}`, locale)}
				onClick={() => {
					if (analyticsEvent === 'talk_card_clicked') {
						posthog.capture(analyticsEvent, {
							talk_slug: talk.slug,
							talk_title: copy.title,
							talk_event: talk.event,
						});
						return;
					}
					posthog.capture(analyticsEvent, {
						talk_title: copy.title,
						talk_type: kind.tag,
						talk_slug: talk.slug,
					});
				}}
				className="op-talk-card"
				style={{
					textAlign: 'left',
					display: 'block',
					padding: '20px 22px',
					border: `1px solid ${OP.rule2}`,
					background: OP.bg2,
					color: OP.fg,
					font: 'inherit',
					cursor: 'pointer',
					textDecoration: 'none',
					width: '100%',
					boxSizing: 'border-box',
					transition: 'border-color 120ms ease, background 120ms ease',
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 8,
						flexWrap: 'wrap',
					}}
				>
					<span
						style={{
							fontFamily: OP.font,
							fontSize: 10,
							color: kind.color,
							letterSpacing: '0.12em',
							border: `1px solid ${kind.color}`,
							padding: '2px 8px',
						}}
					>
						{kind.tag}
					</span>
					{meta && (
						<span
							style={{
								fontFamily: OP.font,
								fontSize: 11,
								color: OP.dim,
								letterSpacing: '0.04em',
							}}
						>
							{meta}
						</span>
					)}
					<span style={{ fontFamily: OP.font, fontSize: 11, color: OP.amber }}>
						{t('common.preview')}
					</span>
				</div>
				<div
					style={{
						fontFamily: OP.font,
						fontSize: 15,
						color: OP.fg,
						marginTop: 14,
						lineHeight: 1.4,
					}}
				>
					{copy.title}
				</div>
				<div
					style={{
						fontFamily: OP.sans,
						fontSize: 13,
						color: OP.dim,
						marginTop: 10,
						lineHeight: 1.5,
					}}
				>
					{copy.description}
				</div>
			</Link>
			<style jsx>{`
				:global(.op-talk-card:hover) {
					border-color: ${OP.amber} !important;
					background: ${OP.bg3} !important;
				}
			`}</style>
		</>
	);
}
