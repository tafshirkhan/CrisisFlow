
import { pool } from '../config/database.js';
import type {
  CreateUserInput,
  ResponderRecord,
  UserRecord,
} from '../types/user.types.js';


// export interface CreateUserInput {
//   fullName: string;
//   email: string;
//   passwordHash: string;
// }

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
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, password_hash, role, is_active, created_at`,
    [
      input.fullName,
      input.email,
      input.passwordHash,
      input.role ?? 'CITIZEN',
    ],
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

export async function findActiveResponders(): Promise<ResponderRecord[]> {
  const result = await pool.query<ResponderRecord>(
    `SELECT
        u.id,
        u.full_name,
        json_build_object(
          'latitude', rp.latitude,
          'longitude', rp.longitude,
          'is_available', COALESCE(rp.is_available, FALSE)
        ) AS profile,
        COALESCE(
          json_agg(rs.skill) FILTER (WHERE rs.skill IS NOT NULL),
          '[]'::json
        ) AS skills
     FROM users u
     LEFT JOIN responder_profiles rp
       ON rp.user_id = u.id
     LEFT JOIN responder_skills rs
       ON rs.responder_id = u.id
     WHERE u.role = 'RESPONDER'
       AND u.is_active = TRUE
     GROUP BY
       u.id,
       u.full_name,
       rp.latitude,
       rp.longitude,
       rp.is_available
     ORDER BY u.full_name ASC, u.id ASC`,
  );

  return result.rows;
}
