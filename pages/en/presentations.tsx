import { PresentationsPage } from '~/components/pages/PresentationsPage';
import { getStaticProps } from '~/lib/presentations-static-props';
export { getStaticProps };
export default function Page(props: any) {
	return <PresentationsPage {...props} locale="en" />;
}
