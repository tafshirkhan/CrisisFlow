
import dotenv from 'dotenv';
import pg from 'pg';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(currentDir, '../../../../.env'),
});

const { Pool } = pg;

const connectionString = process.env.ASSIGNMENT_DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'ASSIGNMENT_DATABASE_URL is missing. Check the root .env file.',
  );
}

export const pool = new Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
  console.error('Unexpected Assignment Service database pool error:', error);
});

/////This reads the Identity Service URL and internal API key from the root .env
export const identityServiceUrl =
  process.env.IDENTITY_SERVICE_URL ?? 'http://localhost:3002';

export const identityServiceApiKey =
  process.env.IDENTITY_SERVICE_API_KEY;
///This reads the Identity Service URL and internal API key from the root .env