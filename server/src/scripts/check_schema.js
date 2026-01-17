import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDb() {
  try {
    const client = await pool.connect();
    
    // Check tasks table columns
    console.log('Checking tasks table columns:');
    const tasksCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks'
    `);
    tasksCols.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));

    // Check admin user status
    console.log('\nChecking admin user status:');
    const userRes = await client.query(`
      SELECT id, email, is_active, user_type 
      FROM users 
      WHERE email = 'gideonekong54@gmail.com'
    `);
    console.log(userRes.rows[0]);

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkDb();
