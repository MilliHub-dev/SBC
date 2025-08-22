import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, query } from '../db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');

    // Read the schema file
    const schemaPath = join(__dirname, '../../../database/neon-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, error.message);
        }
      }
    }

    console.log('✨ Database setup completed!');
    
    // Test the connection
    const testResult = await query('SELECT NOW() as current_time');
    console.log('🔗 Database connection test:', testResult.rows[0].current_time);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };