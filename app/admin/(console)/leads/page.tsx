import { listAllResponses } from '@/lib/admin/data'
import { getLeadPriority, LeadPriority } from '@/lib/admin/leads'
import { LeadsFilterBar } from '@/components/admin/LeadsFilterBar'
import { PriorityBadge } from '@/components/admin/PriorityBadge'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'

export default async function AdminLeadsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const resolvedParams = await searchParams

  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined
  const priorityFilter = typeof resolvedParams.priority === 'string' ? resolvedParams.priority : undefined

  // We fetch all responses (since leads page doesn't mention pagination, and we need to sort them)
  const allResponses = await listAllResponses({ search })

  let leads = allResponses
    .map(r => ({ response: r, priority: getLeadPriority(r) }))
    .filter(x => x.priority !== 'None')

  if (priorityFilter) {
    leads = leads.filter(x => x.priority === priorityFilter)
  }

  // Sort: Hot, Warm, Later, then newest first
  const priorityScore: Record<LeadPriority, number> = {
    Hot: 3,
    Warm: 2,
    Later: 1,
    None: 0
  }

  leads.sort((a, b) => {
    if (priorityScore[a.priority] !== priorityScore[b.priority]) {
      return priorityScore[b.priority] - priorityScore[a.priority]
    }
    return new Date(b.response.submittedAt).getTime() - new Date(a.response.submittedAt).getTime()
  })

  // build export qs
  const sp = new URLSearchParams()
  if (search) sp.set('search', search)
  if (priorityFilter) sp.set('priority', priorityFilter)
  const qs = sp.toString()

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground mt-1">
            Filtered list of qualified prospects.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/admin/export?format=csv&scope=leads${qs ? '&' + qs : ''}`} className={buttonVariants({ variant: 'outline' })}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </a>
          <a href={`/api/admin/export?format=xlsx&scope=leads${qs ? '&' + qs : ''}`} className={buttonVariants({ variant: 'default' })}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </a>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <LeadsFilterBar />

          {leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No leads match these filters. Clear filters to see more results.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Inv. Status</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>POL Int.</TableHead>
                    <TableHead>Follow-up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(({ response: r, priority }) => {
                    const company = String(r.answers['q1'] || '')
                    const name = String(r.answers['q2'] || '')
                    const title = String(r.answers['q3'] || '')
                    const email = String(r.answers['q4'] || '')
                    const invStatus = String(r.answers['q13'] || '')
                    const timeline = String(r.answers['q17'] || '')
                    const stage = String(r.answers['q18'] || '')
                    const budget = String(r.answers['q19'] || '')
                    const polInt = String(r.answers['q26'] || '')
                    const followUp = String(r.answers['q41'] || '')

                    return (
                      <TableRow key={r.id}>
                        <TableCell><PriorityBadge priority={priority} /></TableCell>
                        <TableCell className="max-w-[150px] truncate" title={company}>
                          <Link href={`/admin/responses/${r.id}`} className="font-medium hover:underline text-primary">
                            {company}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={`${name} - ${title}`}>
                          {name}<br /><span className="text-xs text-muted-foreground">{title}</span>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={email}>{email}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={invStatus}>{invStatus}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={timeline}>{timeline}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={stage}>{stage}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={budget}>{budget}</TableCell>
                        <TableCell className="max-w-[100px] truncate" title={polInt}>{polInt}</TableCell>
                        <TableCell className="max-w-[120px] truncate" title={followUp}>{followUp}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
