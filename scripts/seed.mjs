import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  const usersStr = process.env.ADMIN_USERS;
  if (!usersStr) {
    console.log('No ADMIN_USERS found in .env.local to seed.');
    process.exit(0);
  }

  const users = usersStr.split(',').map(entry => {
    const [username, salt, hash] = entry.split(':');
    return { username, salt, hash };
  }).filter(u => u.username && u.salt && u.hash);

  console.log(`Found ${users.length} users to migrate...`);

  for (const user of users) {
    try {
      await sql`
        INSERT INTO admin_users (username, salt, hash)
        VALUES (${user.username}, ${user.salt}, ${user.hash})
        ON CONFLICT (username) DO NOTHING
      `;
      console.log(`Migrated user: ${user.username}`);
    } catch (e) {
      console.error(`Failed to migrate ${user.username}:`, e);
    }
  }
  
  console.log('Done!');
}

main();
