// Carregador único de GSAP via dynamic import. Garante que window.gsap fique
// disponível pra hooks legados (useGsapReady) sem precisar de <Script> + CDN
// bloqueante. Chamado uma vez no _app.tsx logo após mount.

let loading: Promise<void> | null = null;

export function ensureGsap(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();
	if (window.gsap && window.ScrollTrigger) return Promise.resolve();
	if (loading) return loading;
	loading = (async () => {
		const [{ gsap }, { ScrollTrigger }] = await Promise.all([
			import(/* webpackChunkName: "gsap" */ 'gsap'),
			import(/* webpackChunkName: "gsap-scrolltrigger" */ 'gsap/ScrollTrigger'),
		]);
		gsap.registerPlugin(ScrollTrigger);
		window.gsap = gsap;
		window.ScrollTrigger = ScrollTrigger;
	})();
	return loading;
}
