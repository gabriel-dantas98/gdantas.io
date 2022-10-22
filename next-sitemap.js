const isProduction = process.env.NODE_ENV === 'production';
const domain = isProduction ? 'gabriel-dantas98.github.io/gdantas.io' : 'localhost:3000';
const protocol = isProduction ? 'https' : 'http';

/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
	exclude: ['/server-sitemap.xml'],
	generateRobotsTxt: true,
	robotsTxtOptions: {
		additionalSitemaps: [
			`${protocol}://${domain}/sitemap.xml`,
			`${protocol}://${domain}/server-sitemap.xml`,
		],
	},
	siteUrl: `${protocol}://${domain}`,
};
