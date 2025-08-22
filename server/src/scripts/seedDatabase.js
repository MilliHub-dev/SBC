import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool, query } from '../db/pool.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await query(
      `INSERT INTO users (id, email, password_hash, username, first_name, last_name, user_type, total_points, sabi_cash_balance, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email) DO NOTHING`,
      [adminId, 'admin@sabicash.com', adminPassword, 'admin', 'Admin', 'User', 'admin', 0, 0, true, true]
    );
    console.log('✅ Admin user created');

    // Create test driver
    const driverId = uuidv4();
    const driverPassword = await bcrypt.hash('driver123', 12);
    
    await query(
      `INSERT INTO users (id, email, password_hash, username, first_name, last_name, user_type, total_points, sabi_cash_balance, is_active, is_verified, driver_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (email) DO NOTHING`,
      [driverId, 'driver@sabicash.com', driverPassword, 'testdriver', 'Test', 'Driver', 'driver', 1500, 75.5, true, true, 'available']
    );
    console.log('✅ Test driver created');

    // Create test passenger
    const passengerId = uuidv4();
    const passengerPassword = await bcrypt.hash('passenger123', 12);
    
    await query(
      `INSERT INTO users (id, email, password_hash, username, first_name, last_name, user_type, total_points, sabi_cash_balance, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (email) DO NOTHING`,
      [passengerId, 'passenger@sabicash.com', passengerPassword, 'testpassenger', 'Test', 'Passenger', 'passenger', 2500, 125.75, true, true]
    );
    console.log('✅ Test passenger created');

    // Create sample tasks
    const tasks = [
      {
        slug: 'follow-twitter',
        title: 'Follow Sabi Ride on X (Twitter)',
        description: 'Follow our official Twitter account @SabiRide',
        taskType: 'social_media',
        category: 'follow',
        rewardPoints: 7,
        rewardSabiCash: 7.0,
        externalUrl: 'https://twitter.com/sabiride',
        verificationMethod: 'manual'
      },
      {
        slug: 'like-post',
        title: 'Like our latest post',
        description: 'Like our latest announcement post on social media',
        taskType: 'social_media',
        category: 'like',
        rewardPoints: 5,
        rewardSabiCash: 5.0,
        externalUrl: 'https://twitter.com/sabiride',
        verificationMethod: 'manual'
      },
      {
        slug: 'refer-friend',
        title: 'Refer a friend',
        description: 'Invite a friend to join Sabi Ride and earn rewards',
        taskType: 'referral',
        category: 'referral',
        rewardPoints: 15,
        rewardSabiCash: 15.0,
        verificationMethod: 'automatic'
      },
      {
        slug: 'complete-profile',
        title: 'Complete your profile',
        description: 'Fill out all required information in your profile',
        taskType: 'app_usage',
        category: 'profile',
        rewardPoints: 10,
        rewardSabiCash: 10.0,
        verificationMethod: 'automatic'
      }
    ];

    for (const task of tasks) {
      const taskId = uuidv4();
      await query(
        `INSERT INTO tasks (id, slug, title, description, task_type, category, reward_points, reward_sabi_cash, verification_method, external_url, is_active, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO NOTHING`,
        [taskId, task.slug, task.title, task.description, task.taskType, task.category, task.rewardPoints, task.rewardSabiCash, task.verificationMethod, task.externalUrl || null, true, adminId]
      );
    }
    console.log('✅ Sample tasks created');

    // Add some points history for test users
    await query(
      `INSERT INTO points_history (user_id, points_earned, points_type, description)
       VALUES ($1, $2, 'trip', 'Completed trip from Airport to Downtown'),
              ($1, $3, 'bonus', 'Welcome bonus'),
              ($2, $4, 'trip', 'Completed trip from Mall to Home'),
              ($2, $5, 'task', 'Completed social media task')
       ON CONFLICT DO NOTHING`,
      [driverId, 10, 50, passengerId, 8, 7]
    );
    console.log('✅ Sample points history created');

    // Add sample mining stakes
    const basicStakeId = uuidv4();
    const premiumStakeId = uuidv4();
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 25); // 25 days remaining
    
    await query(
      `INSERT INTO mining_stakes (id, user_id, plan_type, amount_staked, daily_reward, start_date, end_date, is_active, auto_claim, total_claimed)
       VALUES ($1, $2, 'basic', 100, 15, $3, $4, true, false, 75),
              ($5, $6, 'premium', 1000, 170, $3, $4, true, true, 850)
       ON CONFLICT DO NOTHING`,
      [basicStakeId, passengerId, startDate, endDate, premiumStakeId, driverId]
    );
    console.log('✅ Sample mining stakes created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@sabicash.com / admin123');
    console.log('Driver: driver@sabicash.com / driver123');
    console.log('Passenger: passenger@sabicash.com / passenger123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };