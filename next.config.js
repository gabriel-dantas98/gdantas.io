const WindiCSS = require('windicss-webpack-plugin');
const { withAxiom } = require('next-axiom');

const ContentSecurityPolicy = `
  child-src *.google.com streamable.com *.youtube.com *.youtube-nocookie.com *.spotify.com *.canva.com;
  connect-src *;
  default-src 'self';
  font-src 'self' *.gstatic.com data:;
  img-src * blob: data:;
  media-src 'none';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' data: cdn.splitbee.io;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  worker-src 'self' 'unsafe-inline' blob:;
  frame-src *.youtube.com *.youtube-nocookie.com *.spotify.com *.canva.com *.google.com;
`;

/**
 * @type {import('next').NextConfig}
 */
const config = {
	// assetPrefix removido: next/font (13+) exige '' ou '/' ou URL absoluta.
	// Domínio é gdantas.com.br (root), então paths absolutos funcionam.
	images: {
		domains: [
			// Discord assets
			'cdn.discordapp.com',

			// GitHub assets
			'raw.githubusercontent.com',

			// Spotify Album Art
			'i.scdn.co',

			// Streamable thumbnails
			'cdn-cf-east.streamable.com',

			// Unsplash
			'source.unsplash.com',
			'images.unsplash.com',
		],
		unoptimized: true,
		loader: 'custom',
	},
	// Inspired by: https://github.com/leerob/leerob.io/blob/main/next.config.js#L44-L81
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
					{
						key: 'Content-Security-Policy',
						value: ContentSecurityPolicy.replace(/\n/g, ''),
					},
					// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
					// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
					// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
					// Opt-out of Google FLoC: https://amifloced.org/
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
					},
				],
			},
		];
	},
	reactStrictMode: true,
	swcMinify: true,
	productionBrowserSourceMaps: true,
	webpack: (config, { isServer }) => {
		config.plugins.push(new WindiCSS());

		// remark-prism transitively imports jsdom → https-proxy-agent → net/tls.
		// Those are Node-only modules that end up in the client bundle when
		// components/pages/*Page.tsx re-exports getStaticProps. Stub them.
		if (!isServer) {
			config.resolve.fallback = {
				...(config.resolve.fallback || {}),
				net: false,
				tls: false,
				fs: false,
				child_process: false,
				dns: false,
				http2: false,
				stream: false,
				crypto: false,
				zlib: false,
				path: false,
				os: false,
			};
		}

		return config;
	},
};

module.exports = withAxiom(config);
