import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const siteUrl = process.env.WEBMCP_SITE_URL;
const echoToolName = 'webmcp_local_echo';
const toolName = siteUrl ? 'list_talks' : echoToolName;
const html = `<!doctype html>
<meta charset="utf-8">
<title>WebMCP smoke test</title>
<script>
	document.modelContext?.registerTool({
		name: "${echoToolName}",
		description: "Echo a message to test the local WebMCP round trip",
		inputSchema: {
			type: "object",
			properties: { message: { type: "string" } },
			required: ["message"],
		},
		execute: ({ message }) => ({ content: [{ type: "text", text: message }] }),
	});
</script>`;
const server = siteUrl ? undefined : createServer((_request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
	response.end(html);
});

let browser;
try {
	if (server) {
		server.listen(0, '127.0.0.1');
		await once(server, 'listening');
	}
	browser = await chromium.launch({
		executablePath: process.env.WEBMCP_CHROMIUM_PATH || undefined,
		args: ['--enable-features=WebMCP'],
	});
	const page = await browser.newPage();
	const response = await page.goto(siteUrl ?? `http://127.0.0.1:${server.address().port}/`);
	assert.ok(response?.ok(), `Test page returned HTTP ${response?.status()}.`);
	assert.equal(
		await page.evaluate(() => typeof document.modelContext?.registerTool),
		'function',
		'This Chromium build does not expose document.modelContext.registerTool.',
	);

	const session = await page.context().newCDPSession(page);
	const [[{ tools }]] = await Promise.all([
		once(session, 'WebMCP.toolsAdded', { signal: AbortSignal.timeout(5000) }).catch((error) => {
			throw new Error(`Chromium did not report the tool "${toolName}".`, { cause: error });
		}),
		session.send('WebMCP.enable'),
	]);
	const tool = tools.find(({ name }) => name === toolName);
	assert.ok(tool, `Chromium did not discover the registered tool "${toolName}".`);

	const message = 'olá, WebMCP';
	const inputs = siteUrl ? [{ locale: 'pt' }, { locale: 'en' }] : [{ message }];
	for (const input of inputs) {
		const [[result], { invocationId }] = await Promise.all([
			once(session, 'WebMCP.toolResponded', { signal: AbortSignal.timeout(5000) }),
			session.send('WebMCP.invokeTool', {
				frameId: tool.frameId,
				...(tool.toolId ? { toolId: tool.toolId } : { toolName }),
				input,
			}),
		]);
		assert.equal(result.invocationId, invocationId);
		assert.equal(result.status, 'Completed', result.errorText || 'Tool did not complete.');
		const output = typeof result.output === 'string' ? JSON.parse(result.output) : result.output;
		if (siteUrl) {
			const talks = JSON.parse(output.content[0].text);
			assert.ok(Array.isArray(talks) && talks.length > 0, 'The site returned an empty talk catalog.');
			const prefix = input.locale === 'en' ? '/en' : '';
			for (const talk of talks) {
				assert.ok(talk.slug && talk.title && talk.description);
				assert.equal(talk.url, `https://gdantas.com.br${prefix}/talks/${talk.slug}`);
			}
		} else {
			assert.deepEqual(output, { content: [{ type: 'text', text: message }] });
		}
	}
	console.log(`WebMCP OK: ${toolName} registered, discovered, and executed.`);
} finally {
	server?.close();
	await browser?.close();
}
