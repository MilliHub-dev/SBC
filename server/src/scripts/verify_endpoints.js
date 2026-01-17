import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const API_URL = `http://localhost:${process.env.PORT || 8787}/api`;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = 'gideonekong54@gmail.com';

async function runTests() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    
    // 1. Get Admin User
    console.log(`Fetching admin user: ${ADMIN_EMAIL}`);
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [ADMIN_EMAIL]);
    
    if (userRes.rowCount === 0) {
      console.error('Admin user not found in DB!');
      process.exit(1);
    }
    
    const user = userRes.rows[0];
    console.log(`Found user: ${user.id} (${user.user_type})`);

    // 2. Generate Token
    const token = jwt.sign(
      { userId: user.id, type: user.user_type, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Generated JWT token');

    // 3. Test /api/tasks (Authorized)
    console.log('\nTesting GET /api/tasks...');
    try {
      const tasksRes = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Success! Retrieved ${tasksRes.data.count} tasks.`);
    } catch (err) {
      console.error('❌ Failed to get tasks:', err.response?.data || err.message);
    }

    // 4. Test /api/admin/analytics (Admin Only)
    console.log('\nTesting GET /api/admin/analytics...');
    try {
      await axios.get(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Success! Retrieved analytics data.');
      // console.log(adminRes.data);
    } catch (err) {
      console.error('❌ Failed to get analytics:', err.response?.data || err.message);
    }

    // 5. Test /api/admin/config (Admin Only) - Checking if this endpoint exists/works
    // Based on previous search, I didn't explicitly see /api/admin/config in admin.js, but let's check if it was mentioned in the user's issue or implied.
    // The user mentioned "/api/admin/config" in the summary.
    // Let's check admin.js content again if needed, but I'll try it.
    console.log('\nTesting GET /api/admin/config...');
    try {
      await axios.get(`${API_URL}/admin/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Success! Retrieved admin config.');
    } catch (err) {
      console.log('⚠️ /api/admin/config might not exist or failed:', err.response?.status, err.response?.data?.error || err.message);
    }

  } catch (err) {
    console.error('Test script error:', err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runTests();
