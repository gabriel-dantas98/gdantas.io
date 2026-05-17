// Public surface do design system Operator. Cada arquivo cuida da sua área:
// tokens, hooks, primitivos, animações pesadas e layout.

export { OP, type OperatorTokens } from './tokens';
export {
	useTicker,
	useUtcClock,
	useUptime,
	useTypewriter,
	useMouseSpotlight,
	useReveal,
	useGsapReady,
} from './hooks';
export { PLATFORM_TOOLS, HERO_ICONS, TOPICS } from './data';
export { Cursor, Prompt, Sec, Role } from './primitives';
export { Marquee } from './Marquee';
export { PlatformBg } from './PlatformBg';
export { HeroIconRain } from './HeroIconRain';
export { Topology } from './Topology';
export { ClusterGrid } from './ClusterGrid';
export { TalkPreview, type Talk } from './TalkPreview';
export { OperatorHeader } from './Header';
export { OperatorFooter } from './Footer';
export { OperatorPage } from './Layout';
