import { TalkPage } from '~/components/pages/TalkPage';
import { getTalkStaticPaths, getTalkStaticProps } from '~/lib/talk-static-props';

export { getTalkStaticPaths as getStaticPaths, getTalkStaticProps as getStaticProps };

export default function Page(props: React.ComponentProps<typeof TalkPage>) {
	return <TalkPage {...props} locale="pt" />;
}
