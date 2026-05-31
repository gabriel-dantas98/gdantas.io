import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { OP } from '~/components/Operator';
import { useI18n, useT } from '~/lib/i18n';

// Splash que carrega antes da homepage. Visualmente imita uma página de
// erro (estilo /error.tsx) mas a brincadeira é a pergunta "should I deploy
// today?" — o veredito vem da api real shouldideploy.today.
//
// Comportamento:
//   - typewriter no comando `curl …`
//   - fetch com timeout, fallback se a api cair
//   - HTTP code grande: 200 (deploy ok) | 418 (NÃO — homenagem ao teapot)
//   - hold curto e fade out revelando o site
//   - Esc / click no overlay = pula direto

interface ApiResponse {
	shouldideploy: boolean;
	message: string;
}

// Mantemos o feel de "terminal carregando", mas o splash inteiro precisa
// caber em ~2.5s pra não atrapalhar a entrada na home.
const TYPE_INTERVAL_MS = 12;
const CHECK_MIN_MS = 250;
const FETCH_TIMEOUT_MS = 1200;
const VERDICT_HOLD_MS = 1400;
const FADE_OUT_MS = 260;

type Phase = 'typing' | 'checking' | 'verdict' | 'fading' | 'done';

export function BootSplash() {
	const t = useT();
	const { locale } = useI18n();
	const [mounted, setMounted] = useState(false);
	const [phase, setPhase] = useState<Phase>('typing');
	const [typedChars, setTypedChars] = useState(0);
	const [verdict, setVerdict] = useState<ApiResponse | null>(null);
	const [error, setError] = useState(false);
	const dismissedRef = useRef(false);

	// Skip sob automação (Playwright/Puppeteer setam navigator.webdriver).
	// Evita que o overlay bloqueie clicks nos testes E2E. Roda só client-side
	// (mounted=true) pra não criar mismatch de hidratação.
	useEffect(() => {
		setMounted(true);
	}, []);

	const isAutomated =
		mounted && typeof navigator !== 'undefined' && Boolean((navigator as Navigator).webdriver);

	const tz = useMemo(() => detectTz(), []);
	const command = `$ curl -s "shouldideploy.today/api?tz=${tz}&lang=${locale}"`;

	const dismiss = useCallback(() => {
		if (dismissedRef.current) return;
		dismissedRef.current = true;
		setPhase('fading');
		window.setTimeout(() => setPhase('done'), FADE_OUT_MS);
	}, []);

	useEffect(() => {
		if (phase !== 'typing') return;
		if (typedChars >= command.length) {
			const tt = window.setTimeout(() => setPhase('checking'), 140);
			return () => window.clearTimeout(tt);
		}
		const tt = window.setTimeout(() => setTypedChars((n) => n + 1), TYPE_INTERVAL_MS);
		return () => window.clearTimeout(tt);
	}, [phase, typedChars, command.length]);

	useEffect(() => {
		if (phase !== 'checking') return;
		const controller = new AbortController();
		const startedAt = Date.now();
		const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

		fetch(`https://shouldideploy.today/api?tz=${encodeURIComponent(tz)}&lang=${locale}`, {
			signal: controller.signal,
		})
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
			.then((data: ApiResponse) => {
				const wait = Math.max(0, CHECK_MIN_MS - (Date.now() - startedAt));
				window.setTimeout(() => {
					setVerdict(data);
					setPhase('verdict');
				}, wait);
			})
			.catch(() => {
				const wait = Math.max(0, CHECK_MIN_MS - (Date.now() - startedAt));
				window.setTimeout(() => {
					setError(true);
					setPhase('verdict');
				}, wait);
			})
			.finally(() => window.clearTimeout(timeout));

		return () => {
			window.clearTimeout(timeout);
			controller.abort();
		};
	}, [phase, tz, locale]);

	useEffect(() => {
		if (phase !== 'verdict') return;
		const tt = window.setTimeout(dismiss, VERDICT_HOLD_MS);
		return () => window.clearTimeout(tt);
	}, [phase, dismiss]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') dismiss();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [dismiss]);

	if (!mounted || isAutomated || phase === 'done') return null;

	const status = computeStatus(verdict, error);

	return (
		<div
			role="status"
			aria-live="polite"
			aria-label={t('boot.aria')}
			onClick={dismiss}
			data-testid="boot-splash"
			data-phase={phase}
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				gap: 36,
				padding: '0 clamp(24px, 8vw, 96px)',
				backgroundColor: OP.bg,
				color: OP.fg,
				fontFamily: OP.font,
				opacity: phase === 'fading' ? 0 : 1,
				transition: `opacity ${FADE_OUT_MS}ms ease-out`,
				cursor: 'pointer',
			}}
		>
			<div style={{ fontSize: 13, color: OP.dim, maxWidth: 720 }}>
				<span style={{ color: OP.amber }}>{command.slice(0, typedChars)}</span>
				{phase === 'typing' ? <BlinkingCursor /> : null}
			</div>

			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 16,
					maxWidth: 920,
				}}
			>
				<div
					style={{
						fontSize: 'clamp(96px, 16vw, 200px)',
						color: status.color,
						lineHeight: 1,
						letterSpacing: '-0.04em',
						fontWeight: 500,
						textShadow: `0 0 36px ${status.color}66`,
						// reserva o espaço enquanto o spinner gigante toma o lugar
						minHeight: 'clamp(96px, 16vw, 200px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{phase === 'checking' ? <BigSpinner color={OP.amber} /> : status.code}
				</div>
				<div style={{ fontSize: 'clamp(22px, 2.6vw, 32px)', color: OP.dim }}>
					{t('boot.question')}
				</div>

				{phase === 'verdict' ? (
					<>
						<div
							style={{
								fontSize: 'clamp(48px, 8vw, 96px)',
								color: status.color,
								fontWeight: 600,
								letterSpacing: '-0.02em',
								lineHeight: 1.05,
								marginTop: 8,
								textShadow: `0 0 24px ${status.color}55`,
							}}
						>
							{status.verdict}
						</div>
						<div
							style={{
								marginTop: 4,
								fontSize: 'clamp(18px, 2vw, 24px)',
								color: OP.fg,
								maxWidth: 720,
								lineHeight: 1.4,
							}}
						>
							{error ? t('boot.fallback') : verdict?.message}
						</div>
					</>
				) : (
					<div
						style={{
							marginTop: 8,
							fontSize: 'clamp(18px, 2vw, 22px)',
							color: OP.dim,
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							minHeight: 40,
						}}
					>
						<Spinner /> {t('boot.checking')}
					</div>
				)}
			</div>

			<div
				style={{
					fontSize: 12,
					color: OP.dim,
					opacity: 0.7,
					letterSpacing: '0.08em',
				}}
			>
				{t('boot.skipHint')}
			</div>
		</div>
	);
}

interface StatusInfo {
	code: string;
	color: string;
	verdict: string;
}

function computeStatus(v: ApiResponse | null, error: boolean): StatusInfo {
	// No 'checking' o spinner gigante substitui o code, então este placeholder
	// só aparece de fato em 'verdict' com erro.
	if (error || !v) return { code: '—', color: OP.amber, verdict: '—' };
	if (v.shouldideploy) return { code: '200', color: OP.ok, verdict: 'YES' };
	return { code: '418', color: OP.pager, verdict: 'NO' };
}

function detectTz(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
}

function BlinkingCursor() {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const id = window.setInterval(() => setVisible((v) => !v), 500);
		return () => window.clearInterval(id);
	}, []);
	return (
		<span
			style={{
				display: 'inline-block',
				width: '0.55em',
				height: '1em',
				marginLeft: 2,
				verticalAlign: 'text-bottom',
				backgroundColor: visible ? OP.amber : 'transparent',
			}}
		/>
	);
}

function Spinner() {
	const [i, setI] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => setI((n) => (n + 1) % 4), 110);
		return () => window.clearInterval(id);
	}, []);
	return <span style={{ color: OP.amber }}>{['◐', '◓', '◑', '◒'][i]}</span>;
}

// Spinner grande que ocupa o lugar do código HTTP durante o 'checking'.
// Usamos os mesmos glifos do Spinner pequeno pra manter coerência visual.
function BigSpinner({ color }: { color: string }) {
	const [i, setI] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => setI((n) => (n + 1) % 4), 110);
		return () => window.clearInterval(id);
	}, []);
	return (
		<span
			style={{
				color,
				fontSize: '0.8em',
				lineHeight: 1,
				textShadow: `0 0 36px ${color}66`,
				opacity: 0.85,
			}}>
			{['◐', '◓', '◑', '◒'][i]}
		</span>
	);
}
