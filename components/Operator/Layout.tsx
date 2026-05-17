import React from 'react';
import Head from 'next/head';
import Script from 'next/script';

import { OP } from './tokens';
import { OperatorHeader } from './Header';
import { OperatorFooter } from './Footer';

interface OperatorPageProps {
	title: string;
	description?: string;
	active?: string;
	children: React.ReactNode;
}

// Layout padrão das páginas Operator: Head + GSAP scripts + header sticky +
// main + footer. Fontes vêm do _document.tsx (carregam uma vez por origem).
//
// GSAP em `beforeInteractive` garante window.gsap antes do hydrate — qualquer
// componente que chama useGsapReady inicia animação no primeiro tick.
export function OperatorPage({ title, description, active, children }: OperatorPageProps) {
	return (
		<>
			<Head>
				<title>{title}</title>
				{description && <meta name="description" content={description} />}
				<style>{`
					html, body { background: ${OP.bg}; scroll-behavior: smooth; }
					body { font-family: ${OP.sans}; color: ${OP.fg}; margin: 0; }
					@keyframes op-blink { 50% { opacity: 0 } }
					.op-nav-link { transition: color 120ms ease; }
					.op-nav-link:hover { color: ${OP.amber} !important; }
				`}</style>
			</Head>
			<Script
				src="https://unpkg.com/gsap@3.12.5/dist/gsap.min.js"
				strategy="beforeInteractive"
			/>
			<Script
				src="https://unpkg.com/gsap@3.12.5/dist/ScrollTrigger.min.js"
				strategy="beforeInteractive"
				onLoad={() => {
					if (window.gsap && window.ScrollTrigger) {
						window.gsap.registerPlugin(window.ScrollTrigger);
					}
				}}
			/>
			<div
				style={{
					minHeight: '100vh',
					background: OP.bg,
					color: OP.fg,
					fontFamily: OP.sans,
				}}>
				<OperatorHeader active={active} />
				<main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 0' }}>
					{children}
				</main>
				<OperatorFooter />
			</div>
		</>
	);
}
