import { useEffect, useRef, useState } from 'react';

declare global {
	interface Window {
		gsap: any;
		ScrollTrigger: any;
	}
}

// Re-renderiza a cada `intervalMs` — barato e suficiente pra atualizar UI ticking.
export function useTicker(intervalMs = 1000) {
	const [, setTick] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
}

export function useUtcClock() {
	const [now, setNow] = useState<string>('');
	useEffect(() => {
		const fmt = () => new Date().toISOString().slice(0, 19).replace('T', ' ') + 'Z';
		setNow(fmt());
		const id = window.setInterval(() => setNow(fmt()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}

// Glambox intern foi o primeiro commit da carreira — uptime conta a partir daí.
const CAREER_START = new Date('2016-06-01T00:00:00Z').getTime();

export function useUptime() {
	const [text, setText] = useState('');
	useEffect(() => {
		const calc = () => {
			const diff = Date.now() - CAREER_START;
			const s = Math.floor(diff / 1000) % 60;
			const m = Math.floor(diff / 60000) % 60;
			const h = Math.floor(diff / 3600000) % 24;
			const d = Math.floor(diff / 86400000);
			const years = Math.floor(d / 365);
			const months = Math.floor((d % 365) / 30);
			const days = (d % 365) % 30;
			return `${years}y ${months}m ${days}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
		};
		setText(calc());
		const id = window.setInterval(() => setText(calc()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return text;
}

export function useTypewriter(text: string, speed = 35, startDelay = 0) {
	const [out, setOut] = useState('');
	useEffect(() => {
		let i = 0;
		setOut('');
		const start = window.setTimeout(() => {
			const id = window.setInterval(() => {
				i += 1;
				setOut(text.slice(0, i));
				if (i >= text.length) window.clearInterval(id);
			}, speed);
		}, startDelay);
		return () => window.clearTimeout(start);
	}, [text, speed, startDelay]);
	return out;
}

export function useMouseSpotlight(ref: React.RefObject<HTMLElement>) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const onMove = (e: MouseEvent) => {
			const r = el.getBoundingClientRect();
			const x = ((e.clientX - r.left) / r.width) * 100;
			const y = ((e.clientY - r.top) / r.height) * 100;
			el.style.setProperty('--mx', `${x}%`);
			el.style.setProperty('--my', `${y}%`);
		};
		el.addEventListener('mousemove', onMove);
		return () => el.removeEventListener('mousemove', onMove);
	}, [ref]);
}

interface RevealOpts {
	delay?: number;
	stagger?: number;
	y?: number;
	duration?: number;
	scroll?: boolean;
}

// Espera GSAP via window globals; faz retry se ainda não chegou. ScrollTrigger
// é opcional (usado quando scroll=true).
export function useReveal({
	delay = 0,
	stagger = 0,
	y = 18,
	duration = 0.7,
	scroll = false,
}: RevealOpts = {}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let cancelled = false;
		let attempts = 0;
		const start = () => {
			if (cancelled || !ref.current || !window.gsap) {
				if (!cancelled && attempts++ < 30) return setTimeout(start, 80);
				return;
			}
			if (scroll && !window.ScrollTrigger && attempts++ < 30) {
				return setTimeout(start, 80);
			}
			const el = ref.current;
			const targets = stagger ? (el.children as unknown as Element[]) : el;
			const trig =
				scroll && window.ScrollTrigger
					? { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
					: {};
			window.gsap.fromTo(
				targets,
				{ opacity: 0, y },
				{
					opacity: 1,
					y: 0,
					duration,
					ease: 'power3.out',
					stagger,
					delay,
					overwrite: 'auto',
					...trig,
				},
			);
		};
		start();
		return () => {
			cancelled = true;
		};
	}, [delay, stagger, y, duration, scroll]);
	return ref;
}

// Roda `boot` quando window.gsap ficar disponível; retry até 4s.
export function useGsapReady(boot: () => void | (() => void), deps: React.DependencyList = []) {
	useEffect(() => {
		let cancelled = false;
		let attempts = 0;
		let cleanup: void | (() => void);
		const run = () => {
			if (cancelled) return;
			if (!window.gsap) {
				if (attempts++ < 40) setTimeout(run, 100);
				return;
			}
			cleanup = boot();
		};
		run();
		return () => {
			cancelled = true;
			if (typeof cleanup === 'function') cleanup();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}
