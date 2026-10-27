
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import argon2 from 'argon2';
import type { FastifyInstance } from 'fastify';

// Mock database repository functions so tests never change the real database.
vi.mock('../repositories/user.repository.js', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  findUserById: vi.fn(),
}));

import {
  findUserByEmail,
  createUser,
  findUserById,
} from '../repositories/user.repository.js';
import { buildApp } from '../app.js';

const TEST_PASSWORD = 'TestPassword!123';

const testUser = {
  id: '4432c7ba-ac26-46b7-a82b-407baf82dbc4',
  full_name: 'Test Citizen',
  email: 'citizen.test@example.com',
  password_hash: '',
  role: 'CITIZEN',
  is_active: true,
  created_at: new Date('2026-01-01T10:00:00.000Z'),
  updated_at: new Date('2026-01-01T10:00:00.000Z'),
};

describe('Identity Service authentication routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    testUser.password_hash = await argon2.hash(TEST_PASSWORD, {
      type: argon2.argon2id,
    });
  });

  beforeEach(() => {
    process.env.JWT_SECRET =
      'test-only-jwt-secret-at-least-32-characters-long';

    vi.clearAllMocks();
    app = buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
  });

  it('registers a new citizen successfully', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null as never);
    vi.mocked(createUser).mockResolvedValue(testUser as never);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        fullName: 'Test Citizen',
        email: 'citizen.test@example.com',
        password: TEST_PASSWORD,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();

    expect(body.message).toBe('Citizen account created successfully.');
    expect(body.user.email).toBe('citizen.test@example.com');
    expect(body.user.role).toBe('CITIZEN');
    expect(body.user).not.toHaveProperty('password_hash');
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects registration when the email already exists', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser as never);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        fullName: 'Test Citizen',
        email: 'citizen.test@example.com',
        password: TEST_PASSWORD,
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().message).toBe(
      'An account with this email already exists.',
    );
    expect(createUser).not.toHaveBeenCalled();
  });

  it('logs in with valid credentials and returns an access token', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser as never);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: TEST_PASSWORD,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.message).toBe('Login successful.');
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.tokenType).toBe('Bearer');
    expect(body.expiresIn).toBe(900);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user).not.toHaveProperty('password_hash');
  });

  it('rejects an incorrect password', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser as never);

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: 'WrongPassword!123',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().message).toBe(
      'Invalid email or password.',
    );
  });

  it('rejects access to /me when no token is provided', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    expect(response.statusCode).toBe(401);
    expect(findUserById).not.toHaveBeenCalled();
  });

  it('returns the current user when a valid token is provided', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(testUser as never);
    vi.mocked(findUserById).mockResolvedValue(testUser as never);

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: TEST_PASSWORD,
      },
    });

    expect(loginResponse.statusCode).toBe(200);

    const { accessToken } = loginResponse.json();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.user.id).toBe(testUser.id);
    expect(body.user.fullName).toBe(testUser.full_name);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.role).toBe('CITIZEN');
    expect(body.user).not.toHaveProperty('password_hash');

    expect(findUserById).toHaveBeenCalledWith(testUser.id);
  });

  
  it('does not allow public registration to assign a privileged role', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null as never);
    vi.mocked(createUser).mockResolvedValue(testUser as never);

    const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
        fullName: 'Test Citizen',
        email: 'citizen.test@example.com',
        password: TEST_PASSWORD,
        role: 'ADMIN',
        },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().user.role).toBe('CITIZEN');

    const createUserInput = vi.mocked(createUser).mock.calls[0][0];
    expect(createUserInput).not.toHaveProperty('role');
  });

});
