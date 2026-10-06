import { neon } from '@neondatabase/serverless'

let dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in the environment variables')
}
dbUrl = dbUrl.replace(/^["']|["']$/g, '').trim()

// Create the neon SQL client
export const sql = neon(dbUrl)
