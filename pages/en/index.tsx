import { HomePage, getStaticProps } from '~/components/pages/HomePage';
export { getStaticProps };
export default function Page(props: any) {
	return <HomePage {...props} locale="en" />;
}
