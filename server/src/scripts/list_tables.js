import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server root (two levels up from scripts)
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function listTables() {
  const { pool } = await import('../db/pool.js');
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', result.rows.map(r => r.table_name));
    
    // Check columns for staking_records
    const stakingColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'staking_records'
    `);
    console.log('Staking Records Columns:', stakingColumns.rows.map(r => r.column_name));

    // Check columns for tasks
    const tasksColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'tasks'
    `);
    console.log('Tasks Columns:', tasksColumns.rows.map(r => r.column_name));

    // Check columns for web3_transactions
    const web3Columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'web3_transactions'
    `);
    console.log('Web3 Transactions Columns:', web3Columns.rows.map(r => r.column_name));

    // Check columns for points_history
    const pointsColumns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'points_history'
    `);
    console.log('Points History Columns:', pointsColumns.rows.map(r => r.column_name));

    process.exit(0);
  } catch (error) {
    console.error('Error listing tables:', error);
    process.exit(1);
  }
}

listTables();
