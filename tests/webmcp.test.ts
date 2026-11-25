import assert from 'node:assert/strict';
import { test } from 'node:test';

import { registerSiteWebMcpTools } from '../lib/webmcp';

test('a rejected WebMCP registration can be retried without duplicating a pending registration', async () => {
	const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
	let rejectRegistration: (reason: Error) => void;
	const pending = new Promise<void>((_, reject) => {
		rejectRegistration = reject;
	});
	// Keep the regression test itself from producing an unhandled rejection.
	void pending.catch(() => {});
	let attempts = 0;
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: {
			modelContext: {
				registerTool() {
					attempts++;
					if (attempts === 1) return pending;
					if (attempts === 2) throw new Error('Browser threw during registration');
				},
			},
		},
	});
	try {
		const registration = registerSiteWebMcpTools();
		await registerSiteWebMcpTools();
		assert.equal(attempts, 1);

		rejectRegistration(new Error('Browser rejected registration'));
		await registration;
		await registerSiteWebMcpTools();
		assert.equal(attempts, 2);

		await registerSiteWebMcpTools();
		await registerSiteWebMcpTools();
		assert.equal(attempts, 3);
	} finally {
		if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
		else Reflect.deleteProperty(globalThis, 'document');
	}
});
