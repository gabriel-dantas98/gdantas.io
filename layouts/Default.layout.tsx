import dynamic from 'next/dynamic';
import { NextSeo } from 'next-seo';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import particlesOptions from '../data/particles.json';
import { Navbar } from '~/components';
import { usePersistantState, useSeoProps } from '~/lib';

import type { WithChildren, WithProps } from '~/types';
import { useCallback } from 'react';

const Background = dynamic(() =>
	import('~/components/Background/Standard.component').then(({ Standard }) => Standard),
);

interface DefaultLayoutProps extends WithChildren {
	background?: boolean;
	seo?: Partial<WithProps<typeof NextSeo>>;
}

export function DefaultLayout({
	background: overrideBackground,
	children,
	seo: customSeo,
}: DefaultLayoutProps) {
	const { animations: background } = usePersistantState().get();
	const showBackground = overrideBackground ?? background;
	// const particlesInit = useCallback((main) => {
	// 	loadFull(main);
	// }, []);

	const seo = useSeoProps(customSeo);

	return (
		<>
			<NextSeo {...seo} />
			<Navbar.Standard />
			<main className="flex flex-col justify-center px-8">
				{/* <Particles options={particlesOptions} init={particlesInit} /> */}
				{showBackground && <Background />}
				{children}
			</main>
		</>
	);
}
