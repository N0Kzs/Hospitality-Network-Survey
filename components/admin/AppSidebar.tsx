"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Settings, Users } from "lucide-react"

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
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AppSidebar({ session, hotLeadsCount }: { session: string, hotLeadsCount: number }) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="flex h-16 shrink-0 flex-row items-center justify-between border-b border-sidebar-border/50 px-4">
        <div className="flex items-center gap-2">
          <img src="/Logo/YFC.webp" alt="YFC" className="h-6 w-auto object-contain" />
          <img src="/Logo/Lightera.webp" alt="Lightera" className="h-6 w-auto object-contain hidden sm:block" />
        </div>
      </SidebarHeader>
      
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
      
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="text-xs text-sidebar-accent-foreground mb-2">
          Signed in as <strong>{session}</strong>
        </div>
        <LogoutForm />
      </SidebarFooter>
    </Sidebar>
  )
}
