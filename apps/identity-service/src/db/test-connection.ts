
import { pool } from '../config/database.js';

const testConnection = async (): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        (
          SELECT COUNT(*)
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'users'
        ) AS users_table_count
    `);

    console.log('Identity Service database connection successful!');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Identity Service database connection failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void testConnection();
