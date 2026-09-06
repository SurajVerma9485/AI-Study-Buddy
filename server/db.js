import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || 'postgres',
  password: process.env.POSTGRESQL_KEY || process.env.PG_PASSWORD || '1234',
  database: process.env.PG_DATABASE || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Initializes the required database tables if they do not exist.
 * Ensures the student registration table with UUID, unique email, and hashed password.
 */
export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Try to enable uuid-ossp extension
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (extErr) {
      console.warn('Note: uuid-ossp extension could not be auto-created (requires superuser or already available):', extErr.message);
    }

    // Create students registration table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on email for ultra-fast lookup
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    `);

    console.log('✅ PostgreSQL database tables initialized successfully.');
  } finally {
    client.release();
  }
}

export default pool;
