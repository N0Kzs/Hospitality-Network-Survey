import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hospitality Network Survey | YFC-BonEagle International',
  description:
    'Share how your hotels, resorts or developments in the Philippines plan, build and run their networks. A survey by YFC-BonEagle International Inc.',
  icons: {
    icon: '/Logo/YFC.webp',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F4F5FA',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}