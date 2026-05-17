// Insight Valley palette tinta a estrutura Operator/CRT.
// Verde fica pra semântica "ok/healthy" — não substituir por violet.
export const OP = {
	bg: '#110e1b',
	bg2: '#1a1528',
	bg3: '#221c35',
	bg4: '#252237',
	fg: '#f8f8f9',
	dim: '#a097b5',
	dim2: '#9089a2',
	amber: '#dea627',
	amber2: '#d1a32e',
	violet: '#9650c0',
	violet2: '#7a409b',
	pager: '#c83ea7',
	ok: '#7fb886',
	rule: 'rgba(248,248,249,0.10)',
	rule2: 'rgba(248,248,249,0.18)',
	font: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
	sans: '"IBM Plex Sans", system-ui, sans-serif',
} as const;

export type OperatorTokens = typeof OP;
