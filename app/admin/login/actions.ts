'use server'

import { verifyLogin } from '@/lib/auth/users'
import { checkThrottle, recordFailedAttempt, recordSuccessfulLogin } from '@/lib/auth/throttle'
import { createSession } from '@/lib/auth/session'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const nextPath = formData.get('nextPath') as string
  
  if (!username || !password) {
    return { error: 'Incorrect username or password.' }
  }

  const h = await headers()
  const ip = h.get('x-forwarded-for') || '127.0.0.1'

  if (!checkThrottle(username, ip)) {
    return { error: 'Too many attempts. Try again in 15 minutes.' }
  }

  const verifiedUser = await verifyLogin(username, password)
  
  if (verifiedUser) {
    recordSuccessfulLogin(username, ip)
    await createSession(verifiedUser)
    
    let destination = '/admin'
    if (nextPath && nextPath.startsWith('/admin') && !nextPath.startsWith('//') && !nextPath.includes('://')) {
      destination = nextPath
    }
    
    redirect(destination)
  } else {
    recordFailedAttempt(username, ip)
    return { error: 'Incorrect username or password.' }
  }
}
