import 'dotenv/config';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Check if schema is already applied
    const { rows: existingMigrations } = await client.query(
      'SELECT filename FROM migrations ORDER BY executed_at'
    );
    
    const executedMigrations = existingMigrations.map(row => row.filename);
    
    // Read schema files
    const schemaPath = path.join(__dirname, '../../../database');
    const schemaFiles = [
      'neon-minimal-schema.sql',
      'neon-schema.sql'
    ];
    
    for (const filename of schemaFiles) {
      if (executedMigrations.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }
      
      try {
        const filePath = path.join(schemaPath, filename);
        const sql = await fs.readFile(filePath, 'utf8');
        
        console.log(`📄 Executing ${filename}...`);
        
        // Execute the schema
        await client.query('BEGIN');
        await client.query(sql);
        
        // Record the migration
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        await client.query('COMMIT');
        console.log(`✅ Successfully executed ${filename}`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error executing ${filename}:`, error.message);
        throw error;
      }
    }
    
    // Create production-specific indexes
    console.log('🔧 Creating production indexes...');
    
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_is_active ON tasks(is_active) WHERE is_active = true;',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_task_completions_user_id ON task_completions(user_id);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mining_stakes_user_id ON mining_stakes(user_id);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);',
    ];
    
    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
        console.log(`✅ Index created: ${indexSQL.split(' ')[5]}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Index already exists: ${indexSQL.split(' ')[5]}`);
        } else {
          console.error(`❌ Error creating index:`, error.message);
        }
      }
    }
    
    // Create production-specific functions and triggers
    console.log('🔧 Creating production functions...');
    
    // Update timestamp function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create triggers for updated_at
    const tablesWithUpdatedAt = ['users', 'tasks', 'mining_stakes', 'transactions'];
    
    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log(`✅ Trigger created for ${table}`);
    }
    
    // Create default admin user if none exists
    console.log('👤 Creating default admin user...');
    
    const { rows: adminUsers } = await client.query(
      "SELECT id FROM users WHERE user_type = 'admin' LIMIT 1"
    );
    
    if (adminUsers.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123!@#', 12);
      
      await client.query(`
        INSERT INTO users (email, password_hash, username, first_name, last_name, user_type, is_active, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `, [
        'admin@sabicash.com',
        hashedPassword,
        'admin',
        'System',
        'Administrator',
        'admin',
        true,
        true
      ]);
      
      console.log('✅ Default admin user created (admin@sabicash.com / admin123!@#)');
    } else {
      console.log('⏭️  Admin user already exists');
    }
    
    // Set up database maintenance tasks
    console.log('🧹 Setting up maintenance tasks...');
    
    // Clean up old sessions
    await client.query(`
      DELETE FROM user_sessions 
      WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
    `);
    
    // Update database statistics
    await client.query('ANALYZE;');
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(console.error);