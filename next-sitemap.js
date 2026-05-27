const isProduction = process.env.NODE_ENV === 'production';
const domain = isProduction ? 'gdantas.com.br' : 'localhost:3000';
const protocol = isProduction ? 'https' : 'http';

/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
	// Static export already emitted ./out before next-sitemap runs,
	// so write the generated sitemap/robots into the export dir.
	outDir: './out',
	generateRobotsTxt: true,
	siteUrl: `${protocol}://${domain}`,
};
