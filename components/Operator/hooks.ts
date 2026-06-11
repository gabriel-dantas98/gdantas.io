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

// Boot date: 1998-05-07 (gd nasceu). "uptime" = quanto tempo o sistema tá
// no ar. Calendar math real (respeita meses 28-31 e bissextos), atualiza 1x
// por dia (sem h:m:s — a topbar já tem clock UTC tickando).
const BOOT_DATE = new Date(Date.UTC(1998, 4, 7));

function diffYmd(from: Date, to: Date): { y: number; m: number; d: number } {
	let y = to.getUTCFullYear() - from.getUTCFullYear();
	let m = to.getUTCMonth() - from.getUTCMonth();
	let d = to.getUTCDate() - from.getUTCDate();
	if (d < 0) {
		// "borrow" do mês anterior — usa o último dia do mês anterior pra
		// somar nos dias restantes.
		m -= 1;
		const prevMonth = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0));
		d += prevMonth.getUTCDate();
	}
	if (m < 0) {
		y -= 1;
		m += 12;
	}
	return { y, m, d };
}

export function useUptime() {
	const [text, setText] = useState('');
	useEffect(() => {
		const calc = () => {
			const { y, m, d } = diffYmd(BOOT_DATE, new Date());
			return `${y}y ${m}m ${d}d`;
		};
		setText(calc());
		// 1x/min é suficiente — só muda quando a data vira (00:00 UTC).
		const id = window.setInterval(() => setText(calc()), 60_000);
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
		let onVisible: (() => void) | null = null;

		// Garante o conteúdo visível SEM depender do tween. Usado quando a
		// animação não deve/não pode rodar — reduced-motion, aba em background
		// (rAF suspenso → ticker do GSAP congela → fromTo trava em opacity:0),
		// ou GSAP indisponível. O conteúdo nunca fica preso invisível.
		const showNow = () => {
			const el = ref.current;
			if (!el) return;
			const targets = stagger ? (el.children as unknown as Element[]) : el;
			if (window.gsap) {
				window.gsap.set(targets, { opacity: 1, y: 0, overwrite: 'auto' });
			} else {
				const list = stagger ? Array.from(el.children) : [el];
				list.forEach((n) => {
					(n as HTMLElement).style.opacity = '1';
					(n as HTMLElement).style.transform = 'none';
				});
			}
		};

		const prefersReduced =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const start = () => {
			if (cancelled || !ref.current) return;
			// reduced-motion: sem animação, conteúdo já visível.
			if (prefersReduced) return showNow();
			if (!window.gsap) {
				if (attempts++ < 30) return setTimeout(start, 80);
				return showNow(); // GSAP não chegou: mostra mesmo assim.
			}
			if (scroll && !window.ScrollTrigger && attempts++ < 30) {
				return setTimeout(start, 80);
			}
			// Aba carregada em background (cmd+click, nova aba, sessão
			// restaurada): o rAF está suspenso, o ticker do GSAP dorme e o tween
			// from-opacity:0 trava invisível sem recuperar de forma confiável.
			// Pula a animação e mostra o conteúdo direto — a entrada não seria
			// vista mesmo.
			if (typeof document !== 'undefined' && document.hidden) return showNow();

			const el = ref.current;
			const targets = stagger ? (el.children as unknown as Element[]) : el;
			const trig =
				scroll && window.ScrollTrigger
					? { scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
					: {};
			const tween = window.gsap.fromTo(
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
			// Safety net (só reveals imediatos): se a aba ficar oculta antes do
			// tween terminar, o ticker dorme e ele pode travar no meio. Ao
			// ocultar, força o estado final — ao voltar, já está visível.
			if (!scroll) {
				onVisible = () => {
					if (document.hidden) tween.progress(1);
				};
				document.addEventListener('visibilitychange', onVisible);
			}
		};
		start();
		return () => {
			cancelled = true;
			if (onVisible) document.removeEventListener('visibilitychange', onVisible);
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
