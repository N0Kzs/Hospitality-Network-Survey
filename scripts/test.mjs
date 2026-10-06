import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
async function test() {
  try {
    const res = await sql.query("SELECT * FROM survey_responses LIMIT 1");
    console.log("SUCCESS! Got rows:", res.length);
  } catch (e) {
    console.error("FAIL:", e.message);
  }
}
test();
