/**
 * Dev server only: `POST /__tuning` with `{ section, values }` saves one section of the tuning
 * panel to `src/lib/tuning/values.json`. Only keys already in that section are accepted, with
 * the same type, so the file keeps its shape.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FILE = fileURLToPath(new URL('./src/lib/tuning/values.json', import.meta.url));

/** @param {import('node:http').IncomingMessage} request */
async function readBody(request) {
	let body = '';
	for await (const chunk of request) {
		body += chunk;
		if (body.length > 10_000) throw new Error('Body too large');
	}
	return body;
}

/**
 * @param {Record<string, Record<string, unknown>>} file
 * @param {unknown} body
 */
function merge(file, body) {
	const { section, values } = /** @type {{ section?: unknown, values?: unknown }} */ (body ?? {});
	if (typeof section !== 'string' || !Object.hasOwn(file, section)) {
		throw new Error(`Unknown section « ${String(section)} »`);
	}
	if (!values || typeof values !== 'object') throw new Error('Missing values');

	const current = file[section];
	for (const [key, value] of Object.entries(values)) {
		const valid =
			Object.hasOwn(current, key) &&
			typeof value === typeof current[key] &&
			(typeof value !== 'number' || Number.isFinite(value));
		if (!valid) throw new Error(`Invalid value for ${section}.${key}: ${JSON.stringify(value)}`);
	}
	return { ...current, ...values };
}

/** @returns {import('vite').Plugin} */
export function tuning() {
	/** Saves one after the other: no lost write when two sections are saved at once. */
	let queue = Promise.resolve();

	return {
		name: 'tuning-save',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/__tuning', (request, response) => {
				if (request.method !== 'POST') {
					response.statusCode = 405;
					response.end();
					return;
				}

				queue = queue.then(async () => {
					try {
						const body = JSON.parse(await readBody(request));
						const file = JSON.parse(await readFile(FILE, 'utf8'));
						file[body.section] = merge(file, body);
						await writeFile(FILE, `${JSON.stringify(file, null, '\t')}\n`);
						response.setHeader('content-type', 'application/json');
						response.end(JSON.stringify(file[body.section]));
					} catch (error) {
						response.statusCode = 400;
						response.end(error instanceof Error ? error.message : String(error));
					}
				});
			});
		}
	};
}
