import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Skip if not an admin route or if it's the login route
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get('lightera_admin_session')?.value
  let secretHex = process.env.SESSION_SECRET
  if (secretHex) secretHex = secretHex.replace(/^["']|["']$/g, '').trim()

  let isValid = false

  if (token && secretHex) {
    try {
      // Decode hex manually for strict Edge runtime compatibility
      const secret = new Uint8Array(secretHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
      await jwtVerify(token, secret)
      isValid = true
    } catch {
      isValid = false
    }
  }

  if (!isValid) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
