import { fetchProjects } from '~/lib/projects';
import { Layout } from '~/layouts';
import { Animate, List } from '~/components';
import { ListActionType } from '~/types';
import { colors } from '~/lib';

import type { GetStaticProps } from 'next';

import { Toaster } from 'react-hot-toast';

type Link = Array<LinkItem>;

interface LinkItem {
	title: string;
	icon: string;
	color: string;
	description: string;
	url: string;
}

interface LinksProps {
	links?: Link;
}

export const getStaticProps: GetStaticProps<LinksProps> = async () => {
	const { default: links } = await import('~/data/linktree.json');
	return {
		props: {
			links,
		},
	};
};

export default function LinksPage({ links: links }: LinksProps) {
	return (
		<Layout.Default seo={{ title: 'gdantas ─ links' }}>
			<Toaster
				toastOptions={{
					position: 'bottom-right',
					style: {
						background: colors.gray[900],
						borderColor: colors.gray[800],
						borderWidth: '2px',
						color: colors?.gray[700],
					},
				}}
			/>
			<div className="mx-2 my-24 sm:mx-6 lg:mb-28 lg:mx-8">
				<div className="relative max-w-xl mx-auto">
					<List.Container>
						{links?.map((link, index) => (
							<Animate
								animation={{ y: [50, 0], opacity: [0, 1] }}
								key={index}
								transition={{
									delay: 0.1 * index,
								}}>
								<List.Item
									actions={[
										{
											type: ListActionType.LINK,
											icon: 'feather:external-link',
											label: `${link.title} homepage`,
											href: link.url,
										},
									]}
									description={link.description}
									icon={link.icon}
									iconColor={link.color}
									title={link.title}></List.Item>
							</Animate>
						))}
					</List.Container>
				</div>
			</div>
		</Layout.Default>
	);
}
