
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../app.js';
import { authorize } from './authorize.js';

describe('Role-based authorization', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    process.env.JWT_SECRET =
      'test-only-jwt-secret-at-least-32-characters-long';

    app = buildApp();

    // Test-only route; this does not add a production endpoint.
    app.get(
      '/test/dispatcher',
      { preHandler: authorize('DISPATCHER') },
      async () => ({ message: 'Dispatcher access granted.' }),
    );

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.JWT_SECRET;
  });

  it('rejects requests without a token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test/dispatcher',
    });

    expect(response.statusCode).toBe(401);
  });

  it('rejects a citizen accessing a dispatcher route', async () => {
    const token = app.jwt.sign({
      sub: 'citizen-test-id',
      email: 'citizen@example.com',
      role: 'CITIZEN',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test/dispatcher',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().message).toBe(
      'You do not have permission to access this resource.',
    );
  });

  it('allows a dispatcher to access a dispatcher route', async () => {
    const token = app.jwt.sign({
      sub: 'dispatcher-test-id',
      email: 'dispatcher@example.com',
      role: 'DISPATCHER',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/test/dispatcher',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe(
      'Dispatcher access granted.',
    );
  });
});
