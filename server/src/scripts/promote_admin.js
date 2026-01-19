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
  // Ensure pool.js sees it as NEON_DATABASE_URL
  if (!process.env.NEON_DATABASE_URL && process.env.DATABASE_URL) {
      process.env.NEON_DATABASE_URL = process.env.DATABASE_URL;
  }
}

async function promoteUser() {
  try {
    // Dynamic import AFTER env is loaded
    const { query } = await import('../db/pool.js');

    // Solana wallet address
    const walletAddress = 'So11111111111111111111111111111111111111112'; // Replace with actual admin wallet
    console.log(`Promoting user with wallet ${walletAddress} to admin...`);
    
    const result = await query(
      "UPDATE users SET user_type = 'admin' WHERE wallet_address = $1 RETURNING id, email, user_type",
      [walletAddress]
    );

    if (result.rowCount > 0) {
      console.log('User promoted successfully:', result.rows[0]);
    } else {
      console.log('User not found!');
    }

  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    process.exit();
  }
}

promoteUser();
