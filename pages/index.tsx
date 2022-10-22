import dynamic from 'next/dynamic';
import { differenceInYears } from 'date-fns';
import { Icon } from '@iconify/react';

import { Animate, Button, Pill } from '~/components';
import { EventType, NavigationItemType } from '~/types';
import { Layout } from '~/layouts';

import type { EventProps } from '~/components/Event.component';
import type { NavigationItem } from '~/types';

const Event = dynamic<EventProps>(
	() => import('~/components/Event.component').then(({ Event }) => Event),
	{
		ssr: false,
	},
);

const ACTIONS: Array<NavigationItem> = [
	{
		type: NavigationItemType.LINK,
		external: true,
		href: 'https://github.com/gabriel-dantas98',
		icon: <Icon className="mr-3" icon="feather:github" />,
		text: 'GitHub',
	},
	{
		type: NavigationItemType.LINK,
		href: 'https://medium.com/@_gdantas',
		icon: <Icon className="mr-3" icon="akar-icons:medium-fill" />,
		text: 'Medium',
	},
	{
		type: NavigationItemType.LINK,
		href: '/projects',
		icon: <Icon className="mr-3" icon="feather:copy" />,
		text: 'Projects',
	},
];

export default function HomePage() {
	const description = 'Um desenvolvedor que prefere as emoções de infraestrutura';

	return (
		<Layout.Default>
			<div className="flex items-center justify-center min-h-screen py-12">
				<div className="w-full max-w-lg space-y-8 text-center sm:max-w-2xl md:sm:max-w-2xl lg:sm:max-w-7xl">
					<Animate
						as="h1"
						animation={{
							opacity: [0, 1],
							scale: [0.75, 1],
						}}
						className="text-4xl font-extrabold tracking-tight text-gray-500 dark:text-white sm:text-6xl md:text-6xl lg:text-7xl">
						Eae! Sou Gabriel Dantas 🚀 <br className="hidden sm:block" />{' '}
						<Pill.Standard className="mt-4 text-2xl font-semibold sm:text-4xl">
							Site Reliability Engineer
						</Pill.Standard>
					</Animate>

					<Animate
						as="p"
						animation={{
							opacity: [0, 1],
							scale: [0.75, 1],
						}}
						className="max-w-xs mx-auto mt-4 text-base text-gray-300 md:mt-8 sm:text-lg md:text-2xl md:max-w-3xl"
						transition={{
							delay: 0.5,
						}}>
						{description}
					</Animate>

					<div className="flex flex-col items-center justify-center w-full mt-8 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mt-4">
						{ACTIONS.map((action, index) => {
							if (action.type !== NavigationItemType.LINK) return null;

							return (
								<Animate
									animation={{
										y: [50, 0],
										opacity: [0, 1],
									}}
									className="w-full sm:w-auto"
									key={index}
									transition={{
										delay: 0.1 * (index + 2) + 0.5,
									}}>
									<Button.Outline target="_blank" href={action.href}>
										{action.icon}
										<span>{action.text}</span>
									</Button.Outline>
								</Animate>
							);
						})}
					</div>
				</div>
			</div>
			<div className="flex items-center justify-center min-h-screen py-12">
				<div className="w-full max-w-lg space-y-8 text-center sm:max-w-2xl md:sm:max-w-2xl lg:sm:max-w-7xl">
					<Animate
						as="h1"
						animation={{
							opacity: [0, 1],
							scale: [0.75, 1],
						}}
						className="text-4xl font-extrabold tracking-tight text-gray-500 dark:text-white sm:text-6xl md:text-6xl lg:text-7xl">
						Eae! Sou Gabriel Dantas 🚀 <br className="hidden sm:block" />{' '}
						<Pill.Standard className="mt-4 text-2xl font-semibold sm:text-4xl">
							Site Reliability Engineer
						</Pill.Standard>
					</Animate>

					<Animate
						as="p"
						animation={{
							opacity: [0, 1],
							scale: [0.75, 1],
						}}
						className="max-w-xs mx-auto mt-4 text-base text-gray-300 md:mt-8 sm:text-lg md:text-2xl md:max-w-3xl"
						transition={{
							delay: 0.5,
						}}>
						{description}
					</Animate>

					<div className="flex flex-col items-center justify-center w-full mt-8 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mt-4">
						{ACTIONS.map((action, index) => {
							if (action.type !== NavigationItemType.LINK) return null;

							return (
								<Animate
									animation={{
										y: [50, 0],
										opacity: [0, 1],
									}}
									className="w-full sm:w-auto"
									key={index}
									transition={{
										delay: 0.1 * (index + 2) + 0.5,
									}}>
									<Button.Outline target="_blank" href={action.href}>
										{action.icon}
										<span>{action.text}</span>
									</Button.Outline>
								</Animate>
							);
						})}
					</div>
				</div>
			</div>
		</Layout.Default>
	);
}
