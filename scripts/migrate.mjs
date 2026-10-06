import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Neon database...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    const schemaPath = join(__dirname, '../db/schema.sql');
    console.log(`Reading schema from ${schemaPath}`);
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    console.log('Executing schema...');
    // We split by semicolon to run statements sequentially if needed, 
    // but the neon serverless driver can also handle multiple statements in one call.
    // However, some versions prefer single statements. We'll just run it as one big query 
    // as neon supports multiple statements.
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      await sql.query(statement);
    }
    
    console.log('✅ Database migration successful!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
