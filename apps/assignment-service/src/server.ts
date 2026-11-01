import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(currentDir, '../../../.env'),
});

const start = async (): Promise<void> => {
  try {
    const app = buildApp();

    const port = Number(process.env.ASSIGNMENT_PORT) || 3003;

    await app.listen({
      port,
      host: '127.0.0.1',
    });

    console.log(`Assignment Service running on port ${port}`);
  } catch (error) {
    console.error('Failed to start Assignment Service:', error);
    process.exit(1);
  }
};

void start();