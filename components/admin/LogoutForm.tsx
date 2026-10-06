'use client'

import { logoutAction } from '@/app/admin/login/logoutAction'
import { LogOut } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function LogoutForm({ asDropdownItem = false }: { asDropdownItem?: boolean }) {
  const content = (
    <div className="flex items-center w-full cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign out</span>
    </div>
  )

  return (
    <form action={logoutAction} className="w-full">
      {asDropdownItem ? (
        <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
          {content}
        </DropdownMenuItem>
      ) : (
        <button type="submit" className="flex items-center w-full rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
          {content}
        </button>
      )}
    </form>
  )
}
