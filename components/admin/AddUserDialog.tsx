'use client'

import { useActionState, useState } from 'react'
import { addAdminUserAction } from '@/app/admin/(console)/users/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'

export function AddUserDialog() {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [state, formAction, isPending] = useActionState(addAdminUserAction, null)

  function handleCopy() {
    if (state?.success) {
      // Extract just the entry line (between the \n\n blocks)
      const match = state.success.match(/ADMIN_USERS in \.env\.local:\n\n(.+)\n\n/)
      if (match) {
        navigator.clipboard.writeText(match[1])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="!text-white" style={{ color: 'white' }}>
          <UserPlus className="mr-2 h-4 w-4" style={{ color: 'white' }} />
          Add Admin User
        </Button>
      } />
      <DialogContent className="sm:max-w-md admin-theme bg-white shadow-lg border">
        <DialogHeader>
          <DialogTitle>Add Admin User</DialogTitle>
          <DialogDescription>
            The password is securely hashed on the server — it is never stored in plain text.
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300">
              <p className="font-semibold mb-2">✓ User created successfully!</p>
              <p className="mb-3 text-xs whitespace-pre-line">{state.success.split('\n\n')[0]}</p>
              <div className="relative">
                <code className="block bg-black/10 dark:bg-white/10 rounded p-2 pr-10 text-xs font-mono break-all">
                  {state.success.match(/ADMIN_USERS in \.env\.local:\n\n(.+)\n\n/)?.[1] ?? ''}
                </code>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-green-700 dark:text-green-400 hover:opacity-70 transition"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 text-xs opacity-75">
                Copy the line above and append it to ADMIN_USERS in your <code>.env.local</code>, then restart the server.
                In Phase 4 (database), this will be instant — no restart needed.
              </p>
            </div>
            <DialogFooter showCloseButton>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <Card className="border bg-muted/60 shadow-none">
              <CardContent className="pt-4 flex flex-col gap-4">

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-username" className="text-sm font-medium">Username</label>
                  <Input
                    id="add-username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. maria"
                    required
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      id="add-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      required
                      disabled={isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="add-confirm" className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Input
                      id="add-confirm"
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      required
                      disabled={isPending}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide confirm' : 'Show confirm'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {state?.error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2" role="alert">
                {state.error}
              </p>
            )}

            <DialogFooter showCloseButton>
              <Button type="submit" className="!text-white" style={{ color: 'white' }} disabled={isPending}>
                {isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
