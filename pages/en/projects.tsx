import { ProjectsPage, getStaticProps } from '~/components/pages/ProjectsPage';
export { getStaticProps };
export default function Page(props: any) {
	return <ProjectsPage {...props} locale="en" />;
}
