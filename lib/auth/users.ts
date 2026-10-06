import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(crypto.scrypt)

function getUsers() {
  const usersStr = process.env.ADMIN_USERS
  if (!usersStr) return []
  return usersStr.split(',').map(entry => {
    const [username, salt, hash] = entry.split(':')
    return { username, salt, hash }
  }).filter(u => u.username && u.salt && u.hash)
}

export async function verifyLogin(username: string, password: string): Promise<string | null> {
  const users = getUsers()
  const cleanUsername = username.trim().toLowerCase()
  const user = users.find(u => u.username.toLowerCase() === cleanUsername)

  // Dummy salt and hash to prevent timing attacks
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
