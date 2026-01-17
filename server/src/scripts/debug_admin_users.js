import 'dotenv/config';
import { query } from '../db/pool.js';

async function debugAdminUsers() {
  try {
    console.log('Debugging Admin Users Query...');

    // Simulate parameters
    const limit = 50;
    const offset = 0;
    const userType = undefined;
    const isActive = undefined;
    const search = undefined;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (userType) {
      whereClause += ` AND user_type = $${params.length + 1}`;
      params.push(userType);
    }

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${params.length + 1}`;
      params.push(isActive === 'true');
    }

    if (search) {
      whereClause += ` AND (email ILIKE $${params.length + 1} OR username ILIKE $${params.length + 1} OR first_name ILIKE $${params.length + 1} OR last_name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    console.log('Query:', `
      SELECT id, email, username, first_name, last_name, user_type, total_points, 
             sabi_cash_balance, wallet_address, is_active, is_verified, created_at, 
             last_login, driver_status
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `);
    console.log('Params:', [...params, limit, offset]);

    const result = await query(
      `SELECT id, email, username, first_name, last_name, user_type, total_points, 
              sabi_cash_balance, wallet_address, is_active, is_verified, created_at, 
              last_login, driver_status
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    console.log('Query Result Count:', result.rowCount);
    console.log('First User:', result.rows[0]);

  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    process.exit();
  }
}

debugAdminUsers();
