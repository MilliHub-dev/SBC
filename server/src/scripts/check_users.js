import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to find .env file
const possiblePaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(process.cwd(), '.env')
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('Could not find .env file!');
  process.exit(1);
}

// Log loaded DB URL (masked)
const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (dbUrl) {
  console.log(`Database URL found: ${dbUrl.substring(0, 15)}...`);
  // Ensure pool.js sees it as NEON_DATABASE_URL
  if (!process.env.NEON_DATABASE_URL && process.env.DATABASE_URL) {
      process.env.NEON_DATABASE_URL = process.env.DATABASE_URL;
  }
} else {
  console.error('DATABASE_URL or NEON_DATABASE_URL not found in .env');
}

async function checkUsers() {
  try {
    // Dynamic import AFTER env is loaded
    const { query } = await import('../db/pool.js');

    console.log('Querying users...');
    const result = await query('SELECT * FROM users');
    console.log('Users:', result.rows);
    
    // Check wallet addresses specifically
    const walletUsers = result.rows.filter(u => u.wallet_address);
    console.log('\nUsers with wallet addresses:', walletUsers.map(u => ({ 
      email: u.email, 
      user_type: u.user_type, 
      wallet_address: u.wallet_address 
    })));

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
