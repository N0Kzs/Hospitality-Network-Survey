import { getSession } from '@/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { LogoutForm } from '@/components/admin/LogoutForm'
import { Separator } from '@/components/ui/separator'

export default async function SettingsPage() {
  const session = await getSession()

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your account and download data exports.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              User accounts are managed by the environment variable `ADMIN_USERS`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Signed in as</span>
              <span className="text-lg font-semibold">{session}</span>
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <LogoutForm />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>
              Download a complete export of all survey responses and leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <a href="/api/admin/export?format=xlsx&scope=all" className={buttonVariants({ variant: 'default' })}>
              <Download className="mr-2 h-4 w-4" />
              Download Excel (.xlsx)
            </a>
            <a href="/api/admin/export?format=csv&scope=all" className={buttonVariants({ variant: 'outline' })}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
