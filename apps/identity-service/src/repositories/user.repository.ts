
import { pool } from '../config/database.js';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'CITIZEN' | 'DISPATCHER' | 'RESPONDER' | 'ADMIN';
  is_active: boolean;
  created_at: Date;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
}

export async function findUserByEmail(
  email: string,
): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRecord>(
    `SELECT id, full_name, email, password_hash, role, is_active, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0];
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserRecord> {
  const result = await pool.query<UserRecord>(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, full_name, email, password_hash, role, is_active, created_at`,
    [input.fullName, input.email, input.passwordHash],
  );

  return result.rows[0];
}


export async function findUserById(
  id: string,
): Promise<UserRecord | undefined> {
  const result = await pool.query<UserRecord>(
    `SELECT id, full_name, email, password_hash, role, is_active, created_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0];
}
