import { PresentationsPage, getStaticProps } from '~/components/pages/PresentationsPage';
export { getStaticProps };
export default function Page(props: any) {
	return <PresentationsPage {...props} locale="en" />;
}
