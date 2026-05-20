import { LinksPage, getStaticProps } from '~/components/pages/LinksPage';
export { getStaticProps };
export default function Page(props: any) {
	return <LinksPage {...props} locale="en" />;
}
