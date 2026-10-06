"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Settings, Users, Sheet, UserCog } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { LogoutForm } from "@/components/admin/LogoutForm"

const items = [
  {
    title: "Overview",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: "/admin/leads",
    icon: Activity,
  },
  {
    title: "Responses",
    url: "/admin/responses",
    icon: Users,
  },
  {
    title: "Full Results",
    url: "/admin/full-results",
    icon: Sheet,
  },
  {
    title: "Admin Users",
    url: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AppSidebar({ session, hotLeadsCount }: { session: string, hotLeadsCount: number }) {
  const pathname = usePathname()

  return (
    <Sidebar className="pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === '/admin' ? pathname === '/admin' : pathname.startsWith(item.url)
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton isActive={isActive} render={<Link href={item.url} aria-current={isActive ? "page" : undefined} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.title === 'Leads' && hotLeadsCount > 0 && (
                      <SidebarMenuBadge>{hotLeadsCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto p-4 pb-6">
        <div className="text-xs text-sidebar-accent-foreground mb-4">
          Signed in as <strong>{session}</strong>
        </div>
        <LogoutForm />
      </SidebarFooter>
    </Sidebar>
  )
}
