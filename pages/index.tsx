import dynamic from 'next/dynamic';
import { differenceInYears } from 'date-fns';
import { Icon } from '@iconify/react';
import Image from 'next/image';

import { Animate, Button, Pill } from '~/components';
import { NavigationItemType } from '~/types';
import { Layout } from '~/layouts';

import type { EventProps } from '~/components/Event.component';
import type { NavigationItem } from '~/types';

import ProfilePicture from '../public/profile-photo.jpg';
import { useI18n } from '~/lib/i18n';
const myLoader = ({ src, width, quality }) => {
	return `${src}?w=${width}&q=${quality || 75}`;
};
const Event = dynamic<EventProps>(
	() => import('~/components/Event.component').then(({ Event }) => Event),
	{
		ssr: false,
	},
);

export default function HomePage() {
	const { t } = useI18n();
	const ACTIONS: Array<NavigationItem> = [
		{
			type: NavigationItemType.LINK,
			external: true,
			href: 'https://github.com/gabriel-dantas98',
			icon: <Icon className="mr-3" icon="feather:github" />,
			text: t('home.actions.github'),
		},
		{
			type: NavigationItemType.LINK,
			href: 'https://medium.com/@_gdantas',
			icon: <Icon className="mr-3" icon="akar-icons:medium-fill" />,
			text: t('home.actions.medium'),
		},
		{
			type: NavigationItemType.LINK,
			href: '/projects',
			icon: <Icon className="mr-3" icon="feather:copy" />,
			text: t('home.actions.projects'),
		},
		{
			type: NavigationItemType.LINK,
			href: '/presentations',
			icon: <Icon className="mr-3" icon="feather:youtube" />,
			text: t('home.actions.talks'),
		},
	];
	const description = t('home.description');

	return (
		<Layout.Default>
			<div className="">
				<div className="flex justify-center items-center py-12 min-h-screen">
					<div className="space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:sm:max-w-2xl lg:sm:max-w-7xl">
						<Animate
							as="h1"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="text-4xl font-extrabold tracking-tight text-gray-500 dark:text-white sm:text-6xl md:text-6xl lg:text-7xl">
							{t('home.title')} <br className="hidden sm:block" />{' '}
							<Pill.Standard className="mt-4 text-2xl font-semibold sm:text-4xl">
								{t('home.role')}
							</Pill.Standard>
						</Animate>

						<Animate
							as="p"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="mx-auto mt-4 max-w-xs text-base text-gray-300 md:mt-8 sm:text-lg md:text-2xl md:max-w-3xl"
							transition={{
								delay: 0.5,
							}}>
							{description}
						</Animate>

						<div className="flex flex-col justify-center items-center mt-8 space-y-4 w-full sm:flex-row sm:space-x-4 sm:space-y-0 sm:mt-4">
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
										<Button.Outline
											target={action.external ? '_blank' : undefined}
											href={action.href}>
											{action.icon}
											<span>{action.text}</span>
										</Button.Outline>
									</Animate>
								);
							})}
						</div>
					</div>
				</div>
				<div className="grid justify-center items-center py-12 min-h-screen md:grid-cols-2 gap-04">
					<div className="space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:sm:max-w-2xl lg:sm:max-w-7xl">
						<Animate
							as="p"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="mx-auto mt-4 max-w-xs text-base text-white whitespace-pre-line md:mt-8 sm:text-lg md:text-2xl md:max-w-3xl"
							transition={{
								delay: 0.5,
							}}>
							{t('home.bio')}
						</Animate>
					</div>
					<div className="flex justify-center items-center space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:sm:max-w-2xl lg:sm:max-w-7xl">
						<div className="relative w-[20rem] h-[30rem] md:h-[40rem] md:w-[30rem]">
							<Image
								src={ProfilePicture}
								alt="Logo"
								layout="fill"
								loader={myLoader}
								objectFit="cover"
								className="rounded" // you can use other classes here too
							/>
						</div>
					</div>
				</div>
			</div>
		</Layout.Default>
	);
}
