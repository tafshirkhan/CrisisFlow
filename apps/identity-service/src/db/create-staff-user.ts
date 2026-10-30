import 'dotenv/config';
import argon2 from 'argon2';
import { pool } from '../config/database.js';
import { findUserByEmail, createUser } from '../repositories/user.repository.js';

const allowedRoles = ['DISPATCHER', 'RESPONDER', 'ADMIN'] as const;

async function createStaffUser() {
  try {
    const fullName = process.argv[2];
    const email = process.argv[3]?.toLowerCase();
    const password = process.argv[4];
    const role = process.argv[5]?.toUpperCase();

    if (!fullName || !email || !password || !role) {
      throw new Error(
        'Usage: npm run create:staff -- "Full Name" email password ROLE',
      );
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      throw new Error('Invalid role. Use DISPATCHER, RESPONDER or ADMIN.');
    }

    if (password.length < 12) {
      throw new Error('Password must contain at least 12 characters.');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await createUser({
      fullName,
      email,
      passwordHash,
      role: role as (typeof allowedRoles)[number],
    });

    console.log('Staff account created successfully.');
    console.log({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Unable to create staff account.',
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void createStaffUser();