// Note: This throttle is in-memory and resets on server restart. 
// It is per-server-instance. In Phase 4, if the site runs on multiple instances, 
// this should be moved to a database or Redis.

interface AttemptRecord {
  count: number
  lockUntil: number | null
}

const attempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

export function checkThrottle(username: string, ip: string): boolean {
  const key = `${username.toLowerCase()}:${ip}`
  const record = attempts.get(key)
  
  if (!record) return true
  
  if (record.lockUntil && Date.now() < record.lockUntil) {
    return false // Locked out
  }
  
  return true // Allowed
}

export function recordFailedAttempt(username: string, ip: string) {
  const key = `${username.toLowerCase()}:${ip}`
  const record = attempts.get(key) || { count: 0, lockUntil: null }
  
  // If lock expired, reset count
  if (record.lockUntil && Date.now() >= record.lockUntil) {
    record.count = 0
    record.lockUntil = null
  }
  
  record.count++
  
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCKOUT_MS
  }
  
  attempts.set(key, record)
}

export function recordSuccessfulLogin(username: string, ip: string) {
  const key = `${username.toLowerCase()}:${ip}`
  attempts.delete(key)
}
