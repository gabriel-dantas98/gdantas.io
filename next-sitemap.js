const isProduction = process.env.NODE_ENV === 'production';
const domain = isProduction ? 'gdantas.com.br' : 'localhost:3000';
const protocol = isProduction ? 'https' : 'http';

/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
	// Static export already emitted ./out before next-sitemap runs,
	// so write the generated sitemap into the export dir. robots.txt is a
	// reviewed public artifact and must not be overwritten by next-sitemap.
	outDir: './out',
	generateRobotsTxt: false,
	autoLastmod: false,
	siteUrl: `${protocol}://${domain}`,
	exclude: [
		// PT-only utility index has no truthful EN mirror.
		'/go',
		// Redirect-only shortcut targets intentionally emit noindex.
		'/go/*',
		// Utility error page should not compete with real content in search.
		'/error',
	],
	transform: async (config, url) => ({
		loc: url,
		priority: config.priority,
		...(config.alternateRefs ? { alternateRefs: config.alternateRefs } : {}),
	}),
};
