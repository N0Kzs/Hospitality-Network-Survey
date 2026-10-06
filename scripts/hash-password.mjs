import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(crypto.scrypt)

async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = await scryptAsync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "<password>"')
  process.exit(1)
}

hashPassword(password).then(result => {
  console.log(result)
})
