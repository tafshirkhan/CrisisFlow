
import argon2 from 'argon2';
import {
  createUser,
  findUserByEmail,
} from '../repositories/user.repository.js';
import type { RegisterInput } from '../validation-schemas/register.schema.js';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function registerCitizen(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await argon2.hash(input.password, {
    type: argon2.argon2id,
  });

  try {
    const user = await createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
    });

    // Never return the password hash to the client.
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };
  } catch (error) {
    // The unique database constraint also protects against concurrent
    // requests attempting to register the same email.
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new AuthError('An account with this email already exists.', 409);
    }

    throw error;
  }
}


export async function loginCitizen(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !user.is_active) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const passwordIsValid = await argon2.verify(
    user.password_hash,
    password,
  );

  if (!passwordIsValid) {
    throw new AuthError('Invalid email or password.', 401);
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
  };
}

