import { format, parse } from 'date-fns';
import { Icon } from '@iconify/react';

import { Button, Pill } from '~/components';
import { Layout } from '~/layouts';

import type { GetStaticProps } from 'next';

import type { Timeline, TimelineEvent } from '~/types';
import { useI18n } from '~/lib/i18n';

interface TimelineProps {
	timeline?: Timeline;
}

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
	const { default: rawTimeline } = await import('~/data/timeline.json');
	const timeline = (rawTimeline as Array<TimelineEvent>).sort(
		(a, b) => +new Date(b.date) - +new Date(a.date),
	);

	return {
		props: {
			timeline,
		},
	};
};

export default function TimelinePage({ timeline: rawTimeline }: TimelineProps) {
	const { t } = useI18n();
	const timeline = rawTimeline.map((event) => ({
		...event,
		// Note: Custom parser needed as Safari on iOS doesn't like the standard `new Date()` parsing
		date: parse(event.date.toString(), 'MM-dd-yyyy', new Date()),
	}));

	return (
		<Layout.Default seo={{ title: t('timeline.seo_title') }}>
			<div className="flex flex-grow min-h-screen pt-16 pb-12">
				<div className="flex flex-col justify-center flex-grow w-full max-w-sm px-0 mx-auto sm:max-w-3xl sm:px-16">
					<ul className="-mb-8" role="list">
						{timeline.map((event, index) => (
							<li className="my-1" key={event.title}>
								<div className="relative pb-8">
									{index !== timeline.length - 1 && (
										<span
											aria-hidden="true"
											className="absolute top-1 left-1/2 w-0.5 h-full -ml-px bg-gray-200 dark:bg-gray-600"
										/>
									)}

									<div className="relative flex items-center px-2 py-3 space-x-3 bg-opacity-75 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:bg-opacity-75 backdrop-filter backdrop-blur-sm dark:border-gray-600">
										<div className="relative items-center justify-center hidden w-12 h-12 px-1 mx-2 rounded-full bg-primary-500 bg-opacity-15 backdrop-filter backdrop-blur-sm saturate-200">
											<Icon
												aria-hidden="true"
												className="w-6 h-6 text-primary-500"
												icon={event.icon}
											/>
										</div>

										<div className="flex-1 min-w-0">
											<h1 className="flex flex-wrap justify-between mb-2 text-lg font-bold tracking-tight text-gray-500 dark:text-white">
												<span>{event.title}</span>
												<span className="flex-1 sm:hidden" />
												<Pill.Date className="mt-2 sm:mt-0" small={true}>
													{format(event.date, 'yyyy')}
												</Pill.Date>
											</h1>

											<p className="my-2 text-base text-gray-300 whitespace-pre-line">
												{event.description}
											</p>

											{event.link && (
												<Button.Outline
													className="mt-2"
													href={event.link.url}
													rel="noopener noreferrer"
													small={true}
													target="_blank">
													{event.link.text}
													<Icon
														aria-hidden="true"
														className="ml-3"
														icon="feather:external-link"
													/>
												</Button.Outline>
											)}
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</Layout.Default>
	);
}
