import { TimelinePage, getStaticProps } from '~/components/pages/TimelinePage';
export { getStaticProps };
export default function Page(props: any) {
	return <TimelinePage {...props} locale="en" />;
}
