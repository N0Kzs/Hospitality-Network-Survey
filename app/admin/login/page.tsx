import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Sign In - YFC Survey',
  robots: {
    index: false,
    follow: false,
  }
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession()
  const resolvedParams = await searchParams
  const nextPath = typeof resolvedParams.next === 'string' ? resolvedParams.next : undefined
  
  if (session) {
    if (nextPath && nextPath.startsWith('/admin') && !nextPath.startsWith('//') && !nextPath.includes('://')) {
      redirect(nextPath)
    } else {
      redirect('/admin')
    }
  }

  return <LoginForm nextPath={nextPath} />
}
