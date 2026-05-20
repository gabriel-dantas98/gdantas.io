import { TalksPage, getStaticProps } from '~/components/pages/TalksPage';
export { getStaticProps };
export default function Page(props: any) {
	return <TalksPage {...props} locale="en" />;
}
