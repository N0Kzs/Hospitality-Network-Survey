import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Settings } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { listAllResponses } from '@/lib/admin/data'
import { getLeadPriority } from '@/lib/admin/leads'

import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogoutForm } from '@/components/admin/LogoutForm'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/AppSidebar'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }

  // Calculate hot leads count
  const allResponses = await listAllResponses({})
  const hotLeadsCount = allResponses.filter(r => getLeadPriority(r) === 'Hot').length

  return (
    <div className="admin-theme">
      <SidebarProvider>
        <AppSidebar session={session} hotLeadsCount={hotLeadsCount} />
        
        <div className="flex flex-col flex-1 min-h-screen min-w-0">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            
            <div className="flex-1 flex justify-center">
              <form method="get" action="/admin/responses" className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search leads, responses..."
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                />
              </form>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full h-8 w-8 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="@admin" />
                    <AvatarFallback className="bg-primary/10 text-primary">{session.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/admin/settings" className="w-full flex items-center cursor-pointer" />}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <LogoutForm asDropdownItem={true} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 bg-muted/40">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
