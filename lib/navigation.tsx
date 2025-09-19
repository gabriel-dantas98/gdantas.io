import { useTheme } from 'next-themes';

import { Status } from '~/components';
import { usePersistantState, useStatus } from '~/lib';

import { NavigationItemType, Theme } from '~/types';

import type { NavigationItem, NavigationItems } from '~/types';
import { useI18n } from '~/lib/i18n';

const staticMenuItems: Array<Array<NavigationItem>> = [];

export function useNavigation() {
	const state = usePersistantState();
	const { animations: background, sound } = state.get();
	const { color, loading, status } = useStatus();
	const { theme, setTheme } = useTheme();
	const { t, locale, setLocale } = useI18n();

	const menuItems: NavigationItems = [
		[
			{
				type: NavigationItemType.LINK,
				icon: 'feather:home',
				text: t('nav.home'),
				href: '/',
			},
			{
				type: NavigationItemType.LINK,
				icon: 'feather:clock',
				text: t('nav.timeline'),
				href: '/timeline',
			},
			{
				type: NavigationItemType.LINK,
				icon: 'feather:copy',
				text: t('nav.projects'),
				href: '/projects',
			},
			{
				type: NavigationItemType.LINK,
				icon: 'feather:youtube',
				text: t('nav.talks'),
				href: '/talks',
			},
		],
		[
			{
				type: NavigationItemType.LINK,
				icon: 'feather:linkedin',
				text: t('nav.linkedin'),
				href: 'https://www.linkedin.com/in/gabrieldantasg/',
				external: true,
			},
			{
				type: NavigationItemType.LINK,
				icon: 'feather:github',
				text: t('nav.github'),
				href: 'https://github.com/gabriel-dantas98',
				external: true,
			},
			{
				type: NavigationItemType.LINK,
				icon: 'feather:instagram',
				text: t('nav.instagram'),
				href: 'https://instagram.com/_g_dantas',
				external: true,
			},
		],
		...(!loading && status.discord_status !== 'offline'
			? [
					[
						{
							type: NavigationItemType.LINK,
							icon: <Status.Indicator color={color} pulse />,
							text: t('nav.status'),
							href: '/status',
						} as NavigationItem,
					],
			  ]
			: []),
	];

	const settingsItems: NavigationItems = [
		[
			{
				type: NavigationItemType.ACTION,
				icon: 'feather:image',
				endIcon: background ? 'feather:check-circle' : 'feather:circle',
				text: background ? t('settings.animations_on') : t('settings.animations_off'),
				onClick: () =>
					state.set((settings) => ({
						...settings,
						animations: !settings.animations,
					})),
			},
			{
				type: NavigationItemType.ACTION,
				icon: sound ? 'feather:volume-2' : 'feather:volume-x',
				endIcon: sound ? 'feather:check-circle' : 'feather:circle',
				text: sound ? t('settings.sounds_on') : t('settings.sounds_off'),
				onClick: () =>
					state.set((settings) => ({
						...settings,
						sound: !settings.sound,
					})),
			},
			{
				type: NavigationItemType.DIVIDER,
			},
			{
				type: NavigationItemType.ACTION,
				icon: 'feather:monitor',
				endIcon: theme === Theme.SYSTEM ? 'feather:check-circle' : undefined,
				text: t('settings.system_theme'),
				onClick: () => setTheme(Theme.DARK),
			},
			{
				type: NavigationItemType.ACTION,
				icon: 'feather:sun',
				endIcon: theme === Theme.LIGHT ? 'feather:check-circle' : undefined,
				text: t('settings.light_theme'),
				onClick: () => setTheme(Theme.DARK),
			},
			{
				type: NavigationItemType.ACTION,
				icon: 'feather:moon',
				endIcon: theme === Theme.DARK ? 'feather:check-circle' : undefined,
				text: t('settings.dark_theme'),
				onClick: () => setTheme(Theme.DARK),
			},
			{
				type: NavigationItemType.DIVIDER,
			},
			{
				type: NavigationItemType.ACTION,
				icon: 'feather:globe',
				endIcon: undefined,
				text: t('settings.language'),
				onClick: () => {},
			},
			{
				type: NavigationItemType.ACTION,
				icon: locale === 'pt' ? 'feather:check' : 'feather:circle',
				text: t('settings.language_pt'),
				onClick: () => setLocale('pt'),
			},
			{
				type: NavigationItemType.ACTION,
				icon: locale === 'en' ? 'feather:check' : 'feather:circle',
				text: t('settings.language_en'),
				onClick: () => setLocale('en'),
			},
		],
	];

	return {
		menu: menuItems,
		settings: settingsItems,
	};
}
