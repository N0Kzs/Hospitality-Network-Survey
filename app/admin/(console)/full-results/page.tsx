import Link from 'next/link'
import { listResponses } from '@/lib/admin/data'
import { sections } from '@/lib/survey/questions'
import { Pagination } from '@/components/admin/Pagination'

import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'

export default async function FullResultsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const resolvedParams = await searchParams
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1
  
  // Use a large page size for spreadsheet view
  const pageSize = 50
  const filters = { page, pageSize }

  const { rows, total } = await listResponses(filters)

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const allQuestions = sections.flatMap(s => s.questions)

  return (
    <div className="flex flex-col gap-8 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Full Results</h2>
          <p className="text-muted-foreground mt-1">
            Spreadsheet view of every single question and answer.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?format=csv&scope=all" className={buttonVariants({ variant: 'outline' })}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </a>
          <a href="/api/admin/export?format=xlsx&scope=all" className={buttonVariants({ variant: 'default' })}>
            <Download className="mr-2 h-4 w-4" /> Excel
          </a>
        </div>
      </div>

      <Card className="border-0 shadow-none sm:border sm:shadow-sm">
        <CardContent className="p-0 sm:p-6">
          <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
            <div className="text-sm text-muted-foreground">
              {total > 0 ? `Showing ${start} to ${end} of ${total} responses` : '0 responses'}
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto relative max-h-[70vh]">
            <Table className="w-max min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] sticky top-0 left-0 bg-background z-30 shadow-[1px_1px_0_0_var(--border)]">Date</TableHead>
                  <TableHead className="min-w-[200px] sticky top-0 left-[150px] bg-background z-30 shadow-[1px_1px_0_0_var(--border)]">Company</TableHead>
                  {allQuestions.map(q => (
                    // Skip Q1 as it's pinned to the left
                    q.id !== 'q1' && (
                      <TableHead key={q.id} className="min-w-[250px] max-w-[400px] sticky top-0 bg-background z-20 shadow-[0_1px_0_0_var(--border)]">
                        <div className="text-xs text-muted-foreground mb-1">{q.id.toUpperCase()}</div>
                        <div className="font-semibold truncate" title={q.prompt}>{q.prompt}</div>
                      </TableHead>
                    )
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id} className={i % 2 === 0 ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/50"}>
                    <TableCell className="whitespace-nowrap sticky left-0 bg-background/95 z-10 border-r">{new Date(r.submittedAt).toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate sticky left-[150px] bg-background/95 z-10 border-r shadow-[1px_0_0_0_var(--border)] font-medium" title={String(r.answers['q1'] || '')}>
                      <Link href={`/admin/responses/${r.id}`} className="text-primary hover:underline">
                        {String(r.answers['q1'] || '')}
                      </Link>
                    </TableCell>
                    {allQuestions.map(q => {
                      if (q.id === 'q1') return null;
                      
                      const val = r.answers[q.id];
                      let displayVal = '';
                      
                      if (Array.isArray(val)) {
                        displayVal = val.join(', ');
                      } else {
                        displayVal = String(val || '');
                      }
                      
                      return (
                        <TableCell key={q.id} className="max-w-[400px] truncate border-r last:border-r-0" title={displayVal}>
                          {displayVal || <span className="text-muted-foreground/30">-</span>}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {total > pageSize && (
            <div className="mt-6 px-4 sm:px-0">
              <Pagination currentPage={page} total={total} pageSize={pageSize} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
