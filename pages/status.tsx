import { Layout } from '~/layouts';
import { Status } from '~/components';
import { useI18n } from '~/lib/i18n';

export default function StatusPage() {
	const { t } = useI18n();
	return (
		<Layout.Default seo={{ title: t('nav.status') }}>
			<div className="flex flex-grow min-h-screen pt-16 pb-12">
				<div className="flex flex-col justify-center flex-grow w-full max-w-sm px-0 mx-auto sm:max-w-lg sm:px-16">
					<Status.Widget />
				</div>
			</div>
		</Layout.Default>
	);
}
