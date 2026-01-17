import { Pool } from 'pg';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Database connection string is not configured (NEON_DATABASE_URL or DATABASE_URL)');
}

export const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX || 10),
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG) console.log('db', { text, duration, rows: res.rowCount });
  return res;
}


