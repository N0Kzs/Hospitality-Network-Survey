import { listAdminUsers } from '@/app/admin/(console)/users/actions'
import { AddUserDialog } from '@/components/admin/AddUserDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Users } from 'lucide-react'

export default async function UsersPage() {
  const users = await listAdminUsers()

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
          <p className="text-muted-foreground mt-1">
            Manage who has access to this admin dashboard.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Admins</CardTitle>
            <CardDescription>
              All users who can log into this admin panel. Note: Adding users currently requires a server restart to take effect (Phase 2).
              In Phase 4, changes will be instant via the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No admin users found. Check your ADMIN_USERS environment variable.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.username}>
                        <TableCell className="font-medium font-mono">{user.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : <span className="italic opacity-50">env.local (no timestamp)</span>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How password hashing works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>When you add a user, the password is <strong>never stored in plain text</strong>. Here is what happens on the server:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>A random 16-byte <strong>salt</strong> is generated.</li>
              <li>The password is run through the <strong>scrypt</strong> algorithm (secure key derivation) combined with the salt.</li>
              <li>Only the resulting <strong>hash</strong> and the salt are stored — never the original password.</li>
            </ol>
            <p className="mt-2">This means that even if someone could read the stored values, they could not reverse-engineer the original password.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
