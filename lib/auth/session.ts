import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const getSecret = () => {
  let secret = process.env.SESSION_SECRET
  if (!secret) return null
  secret = secret.replace(/^["']|["']$/g, '').trim()
  try {
    return Buffer.from(secret, 'hex')
  } catch {
    return null
  }
}

export async function createSession(username: string) {
  const secret = getSecret()
  if (!secret) throw new Error('Auth configuration is invalid')

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('lightera_admin_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60 // 8 hours
  })
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('lightera_admin_session')?.value
  if (!token) return null

  const secret = getSecret()
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.sub || null
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('lightera_admin_session')
}
