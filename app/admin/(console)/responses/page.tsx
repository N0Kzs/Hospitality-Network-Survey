import Link from 'next/link'
import { listResponses } from '@/lib/admin/data'
import { FilterBar } from '@/components/admin/FilterBar'
import { Pagination } from '@/components/admin/Pagination'
import { PriorityBadge } from '@/components/admin/PriorityBadge'
import { getLeadPriority } from '@/lib/admin/leads'

import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'

export default async function ResponsesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const resolvedParams = await searchParams

  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined
  const q13 = typeof resolvedParams.q13 === 'string' ? resolvedParams.q13 : undefined
  const q26 = typeof resolvedParams.q26 === 'string' ? resolvedParams.q26 : undefined
  const q41 = typeof resolvedParams.q41 === 'string' ? resolvedParams.q41 : undefined
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1

  const filters = { search, q13, q26, q41, page, pageSize: 20 }

  const { rows, total } = await listResponses(filters)

  const exportUrl = new URLSearchParams()
  if (search) exportUrl.set('search', search)
  if (q13) exportUrl.set('q13', q13)
  if (q26) exportUrl.set('q26', q26)
  if (q41) exportUrl.set('q41', q41)

  const qs = exportUrl.toString()
  const start = (page - 1) * 20 + 1
  const end = Math.min(page * 20, total)

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Responses</h2>
          <p className="text-muted-foreground mt-1">
            Browse and filter the complete dataset.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/admin/export?format=csv&scope=all${qs ? '&' + qs : ''}`} className={buttonVariants({ variant: 'outline' })}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </a>
          <a href={`/api/admin/export?format=xlsx&scope=all${qs ? '&' + qs : ''}`} className={buttonVariants({ variant: 'default' })}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </a>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FilterBar />

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {total > 0 ? `Showing ${start} to ${end} of ${total} responses` : '0 responses'}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No responses match these filters. <Link href="/admin/responses" className="text-primary hover:underline">Clear filters</Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Inv. Status</TableHead>
                      <TableHead>POL Int.</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(r => {
                      const priority = getLeadPriority(r)
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="whitespace-nowrap">{new Date(r.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={String(r.answers['q1'] || '')}>
                            <Link href={`/admin/responses/${r.id}`} className="font-medium hover:underline text-primary">
                              {String(r.answers['q1'] || '')}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate" title={String(r.answers['q2'] || '')}>{String(r.answers['q2'] || '')}</TableCell>
                          <TableCell className="max-w-[120px] truncate" title={String(r.answers['q5'] || '')}>{String(r.answers['q5'] || '')}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={String(r.answers['q4'] || '')}>{String(r.answers['q4'] || '')}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={String(r.answers['q13'] || '')}>{String(r.answers['q13'] || '')}</TableCell>
                          <TableCell className="max-w-[120px] truncate" title={String(r.answers['q26'] || '')}>{String(r.answers['q26'] || '')}</TableCell>
                          <TableCell className="max-w-[120px] truncate" title={String(r.answers['q41'] || '')}>{String(r.answers['q41'] || '')}</TableCell>
                          <TableCell><PriorityBadge priority={priority} /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {total > 20 && (
                <div className="mt-6">
                  <Pagination currentPage={page} total={total} pageSize={20} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
