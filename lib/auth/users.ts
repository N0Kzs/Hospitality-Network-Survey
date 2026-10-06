import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(crypto.scrypt)

import { sql } from '@/lib/db'

export async function verifyLogin(username: string, password: string): Promise<string | null> {
  const cleanUsername = username.trim().toLowerCase()
  let user: { username: string; salt: string; hash: string } | undefined

  try {
    const result = await sql`
      SELECT username, salt, hash 
      FROM admin_users 
      WHERE username = ${cleanUsername}
    `
    if (result.length > 0) {
      user = result[0] as { username: string; salt: string; hash: string }
    }
  } catch (error) {
    console.error('Failed to query user:', error)
    return null
  }

  // Dummy salt and hash to prevent timing attacks if user doesn't exist
  const saltHex = user ? user.salt : '00000000000000000000000000000000'
  const targetHashHex = user ? user.hash : '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  
  try {
    const saltBuffer = Buffer.from(saltHex, 'hex')
    const targetHashBuffer = Buffer.from(targetHashHex, 'hex')
    
    // Hash the given password
    const derivedHash = await scryptAsync(password, saltBuffer, 64) as Buffer
    
    // Constant time comparison
    let match = false
    try {
      match = crypto.timingSafeEqual(derivedHash, targetHashBuffer)
    } catch {
      match = false
    }
    
    if (user && match) {
      return user.username
    }
  } catch (e) {
    console.error('Password verification error', e)
  }
  
  return null
}
