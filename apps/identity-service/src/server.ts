
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(currentDir, '../../../.env'),
});

const app = buildApp();
const port = Number(process.env.IDENTITY_PORT ?? 3002);
const host = process.env.IDENTITY_HOST ?? '127.0.0.1';

try {
  await app.listen({ port, host });
  console.log(`Identity Service listening on http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
