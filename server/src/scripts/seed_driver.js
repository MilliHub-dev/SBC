
import 'dotenv/config';
import { query } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function seedDriver() {
  try {
    console.log('Seeding driver...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const driverId = uuidv4();
    
    const result = await query(`
      INSERT INTO users (
        id, email, password_hash, username, first_name, last_name, 
        user_type, is_active, is_verified, 
        license_number, vehicle_info, driver_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        'driver', true, false, 
        'DL12345678', '{"make": "Toyota", "model": "Camry", "year": 2020, "color": "Silver"}', 'offline'
      ) RETURNING *
    `, [
      driverId, 
      'driver@test.com', 
      passwordHash, 
      'driver_test', 
      'John', 
      'Driver'
    ]);
    
    console.log('Driver seeded:', result.rows[0]);
  } catch (error) {
    console.error('Error seeding driver:', error);
  } finally {
    process.exit();
  }
}

seedDriver();
