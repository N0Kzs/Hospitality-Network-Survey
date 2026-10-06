import { neon } from '@neondatabase/serverless'

let dbUrl = process.env.DATABASE_URL
// If undefined during Vercel build, provide a dummy URL so the build doesn't crash
if (!dbUrl) {
  dbUrl = 'postgresql://dummy:dummy@dummy/dummy'
} else {
  dbUrl = dbUrl.replace(/^["']|["']$/g, '').trim()
}

// Create the neon SQL client
export const sql = neon(dbUrl)
