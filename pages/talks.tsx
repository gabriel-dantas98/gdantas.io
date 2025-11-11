import { fetchProjects } from '~/lib/projects';
import { Layout } from '~/layouts';
import { Animate, List } from '~/components';
import { ListActionType } from '~/types';
import { colors } from '~/lib';

import type { GetStaticProps } from 'next';

import { Toaster } from 'react-hot-toast';
import { useI18n } from '~/lib/i18n';

type Talk = Array<TalkItem>;

interface TalkItem {
	title: string;
	icon: string;
	color: string;
	description: string;
	url: string;
}

interface TalksProps {
	talks?: Talk;
}

export const getStaticProps: GetStaticProps<TalksProps> = async () => {
	const { default: talks } = await import('~/data/talks.json');
	return {
		props: {
			talks,
		},
	};
};

export default function TalksPage({ talks: talks }: TalksProps) {
	const { t } = useI18n();
	return (
		<Layout.Default seo={{ title: t('talks.seo_title') }}>
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
						{talks?.map((talk, index) => (
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
											label: t('talks.label_homepage', { title: talk.title }),
											href: talk.url,
										},
									]}
									description={talk.description}
									icon={talk.icon}
									iconColor={talk.color}
									title={talk.title}></List.Item>
							</Animate>
						))}
					</List.Container>
				</div>
			</div>
		</Layout.Default>
	);
}
