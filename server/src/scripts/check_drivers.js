import 'dotenv/config';
import { query } from '../db/pool.js';

async function checkDrivers() {
  try {
    console.log('Querying drivers...');
    const result = await query(`
      SELECT id, email, username, user_type, is_active, is_verified, 
             license_number, vehicle_info, driver_status 
      FROM users 
      WHERE user_type = 'driver'
    `);
    console.log('Driver count:', result.rowCount);
    console.log('Drivers:', result.rows);
  } catch (error) {
    console.error('Error querying drivers:', error);
  } finally {
    process.exit();
  }
}

checkDrivers();
