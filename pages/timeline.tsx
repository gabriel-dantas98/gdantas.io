import React from 'react';
import type { GetStaticProps } from 'next';
import { format, parse } from 'date-fns';

import { Operator } from '~/components';
import type { Timeline, TimelineEvent } from '~/types';

const { OP, Sec, Prompt, OperatorPage, useReveal } = Operator;

interface TimelineProps {
	timeline: Timeline;
}

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
	const { default: rawTimeline } = await import('~/data/timeline.json');
	const timeline = (rawTimeline as TimelineEvent[]).sort(
		(a, b) => +new Date(b.date) - +new Date(a.date),
	);
	return { props: { timeline } };
};

// Deterministic short hash so each commit gets a stable "git log" sha.
function shaFromTitle(title: string) {
	let h = 0;
	for (let i = 0; i < title.length; i += 1) h = (h * 33 + title.charCodeAt(i)) >>> 0;
	return h.toString(16).padStart(7, '0').slice(0, 7);
}

export default function TimelinePage({ timeline: rawTimeline }: TimelineProps) {
	const ref = useReveal({ stagger: 0.05, y: 16 });
	const timeline = rawTimeline.map((event) => ({
		...event,
		_date: parse(event.date.toString(), 'MM-dd-yyyy', new Date()),
	}));

	return (
		<OperatorPage
			title="gdantas ─ git log --career"
			description="Commits da carreira — empresas, papéis e marcos."
			active="/timeline">
			<div ref={ref}>
				<Sec label="01" title="git log --career" sub="commits que importam" />

				<div
					style={{
						marginTop: 28,
						border: `1px solid ${OP.rule}`,
						background: 'rgba(17,14,27,0.65)',
						padding: '24px 28px',
						fontFamily: OP.font,
						fontSize: 13,
						lineHeight: 1.6,
						color: OP.fg,
						overflow: 'hidden',
					}}>
					{timeline.map((event, i) => {
						const isHead = i === 0;
						return (
							<div
								key={event.title}
								style={{
									display: 'grid',
									gridTemplateColumns: '120px 1fr',
									gap: 18,
									paddingBottom: 14,
									marginBottom: 14,
									borderBottom:
										i === timeline.length - 1 ? 'none' : `1px dashed ${OP.rule}`,
								}}>
								<div>
									<div style={{ color: OP.amber }}>{shaFromTitle(event.title)}</div>
									<div style={{ color: OP.dim, fontSize: 11, marginTop: 2 }}>
										{format(event._date, 'yyyy-MM')}
									</div>
								</div>
								<div>
									<div>
										<span style={{ color: OP.fg }}>{event.title}</span>
										{isHead && (
											<span
												style={{
													marginLeft: 10,
													fontSize: 10,
													padding: '2px 6px',
													border: `1px solid ${OP.ok}`,
													color: OP.ok,
													letterSpacing: '0.1em',
												}}>
												HEAD
											</span>
										)}
									</div>
									<div
										style={{
											fontFamily: OP.sans,
											fontSize: 14,
											color: OP.fg,
											opacity: 0.85,
											marginTop: 4,
											whiteSpace: 'pre-line',
										}}>
										{event.description}
									</div>
									{event.link && (
										<a
											href={event.link.url}
											target="_blank"
											rel="noreferrer noopener"
											style={{
												display: 'inline-block',
												marginTop: 8,
												fontFamily: OP.font,
												fontSize: 11,
												color: OP.violet,
												border: `1px solid ${OP.violet}`,
												padding: '3px 9px',
												textDecoration: 'none',
												letterSpacing: '0.08em',
											}}>
											{event.link.text} ↗
										</a>
									)}
								</div>
							</div>
						);
					})}
					<div style={{ color: OP.dim, fontSize: 12 }}>
						$ git log --oneline | wc -l →{' '}
						<span style={{ color: OP.amber }}>{timeline.length} commits</span> · learning
						rate compounding
					</div>
				</div>

				<div style={{ marginTop: 28, fontSize: 13 }}>
					<Prompt path="~">git log --career --pretty=oneline</Prompt>
				</div>
			</div>
		</OperatorPage>
	);
}
