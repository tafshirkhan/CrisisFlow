
import { pool } from '../config/database.js';

const testConnection = async (): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user
    `);

    console.log('Assignment Service database connection successful!');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Assignment Service database connection failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void testConnection();
