import { WritingPage, getStaticProps } from '~/components/pages/WritingPage';
export { getStaticProps };
export default function Page(props: any) {
	return <WritingPage {...props} locale="en" />;
}
