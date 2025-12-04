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
const myLoader = ({ src, width, quality }) => {
	return `${src}?w=${width}&q=${quality || 75}`;
};
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
	{
		type: NavigationItemType.LINK,
		href: '/presentations',
		icon: <Icon className="mr-3" icon="feather:youtube" />,
		text: 'Talks',
	},
];

export default function HomePage() {
	const description = 'Um desenvolvedor que prefere as emoções de infraestrutura';
	const age = (new Date().getFullYear() - 1998).toString();

	return (
		<Layout.Default>
			<div className="">
				<div className="flex justify-center items-center px-4 py-12 min-h-screen sm:px-6 lg:px-8">
					<div className="space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
						<Animate
							as="h1"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="text-3xl font-extrabold tracking-tight text-gray-500 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
							Eae! Sou Gabriel Dantas 🚀 <br className="hidden sm:block" />{' '}
							<Pill.Standard className="mt-4 text-xl font-semibold sm:text-3xl md:text-4xl">
								Platform Engineer
							</Pill.Standard>
						</Animate>

						<Animate
							as="p"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="mx-auto mt-4 max-w-xs text-sm text-gray-300 md:mt-8 sm:text-base md:text-xl lg:text-2xl md:max-w-3xl"
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
				<div className="grid justify-center items-center px-4 py-12 min-h-screen md:grid-cols-2 gap-8 sm:px-6 lg:px-8">
					<div className="space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:max-w-xl lg:max-w-2xl">
						<Animate
							as="p"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="mx-auto mt-4 px-2 max-w-xs text-sm text-white whitespace-pre-line md:mt-8 sm:text-base md:text-lg lg:text-xl md:max-w-3xl"
							transition={{
								delay: 0.5,
							}}>
							Platform Engineer apaixonado por transformar o dia-a-dia de devs através de automação.
							<br />
							<br />
							Com 6+ anos de experiência em DevOps/SRE e Engenharia de Plataforma, lidero iniciativas de Developer Experience que impactam centenas de desenvolvedores diariamente.
							<br />
							<br />
							Inspirado no lema "So Others May Live" do U.S. Coast Guard Rescue Swimmer - fazemos o trabalho complexo e vamos onde outros não iriam, para que os times de desenvolvimento possam focar no que realmente importa: entregar valor.
							<br />
							<br />
							Nossa missão é tornar o complexo simples, e o melhor caminho o mais fácil.
							<br />
							<br />
							O que faço na prática:
							<br />
							<br />
							• Construo plataformas de self-service com Backstage.io que reduziram em 70% o tempo de onboarding de novos serviços
							<br />
							<br />
							• Desenvolvo agentes de IA e soluções RAG para automatizar tarefas repetitivas (revisão de PRs, geração de docs, análise de incidentes)
							<br />
							<br />
							• Implemento observabilidade que conta histórias - não apenas métricas, mas insights acionáveis com Grafana, Prometheus e OpenTelemetry
							<br />
							<br />
							Stack atual: Kubernetes, AWS, Terraform, Python, Go, LangChain, TypeScript, Vector DBs
							<br />
							<br />
							Formado em Engenharia da Computação (FIAP) e cursando pós em Machine Learning Engineering, combino solidez em infraestrutura com inovação em IA/ML.
							<br />
							<br />
							💡 Se você acredita que DevEx é o multiplicador de produtividade das empresas tech, vamos conversar!
						</Animate>
					</div>
					<div className="flex justify-center items-center w-full mt-8 md:mt-0">
						<div className="relative w-64 h-96 sm:w-72 sm:h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem]">
							<Image
								src={ProfilePicture}
								alt="Gabriel Dantas"
								layout="fill"
								loader={myLoader}
								objectFit="cover"
								className="rounded-lg shadow-lg"
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-center items-center px-4 py-12 min-h-screen sm:px-6 lg:px-8">
					<div className="space-y-8 w-full max-w-lg text-center sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
						<Animate
							as="h2"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="text-2xl font-bold tracking-tight text-gray-500 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
							Bora trocar figurinha? 🤝
						</Animate>

						<Animate
							as="p"
							animation={{
								opacity: [0, 1],
								scale: [0.75, 1],
							}}
							className="mx-auto mt-4 px-2 max-w-xs text-sm text-gray-300 md:mt-8 sm:text-base md:text-lg lg:text-xl md:max-w-2xl"
							transition={{
								delay: 0.5,
							}}>
							É sempre bom poder trocar experiências e ideias, pode me pingar :)
						</Animate>

						<Animate
							animation={{
								y: [50, 0],
								opacity: [0, 1],
							}}
							className="flex justify-center w-full"
							transition={{
								delay: 0.8,
							}}>
							<Button.Outline
								target="_blank"
								href="https://www.linkedin.com/in/gabrieldantasg/">
								<Icon className="mr-3" icon="feather:linkedin" />
								<span>Me chama no LinkedIn</span>
							</Button.Outline>
						</Animate>
					</div>
				</div>
			</div>
		</Layout.Default>
	);
}
