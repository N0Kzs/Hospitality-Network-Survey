import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'

import { listAllResponses } from '@/lib/admin/data'
import { isActiveInvestment, getLeadPriority } from '@/lib/admin/leads'
import { StatCard } from '@/components/admin/StatCard'
import { BarChart } from '@/components/admin/BarChart'
import { PriorityBadge } from '@/components/admin/PriorityBadge'
import type { SurveyResponse } from '@/lib/admin/types'

function aggregateSingle(responses: SurveyResponse[], key: string) {
  const counts: Record<string, number> = {}
  for (const r of responses) {
    const val = r.answers[key]
    if (typeof val === 'string') {
      counts[val] = (counts[val] || 0) + 1
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }))
}

function aggregateMultiple(responses: SurveyResponse[], key: string) {
  const counts: Record<string, number> = {}
  for (const r of responses) {
    const val = r.answers[key]
    if (Array.isArray(val)) {
      for (const v of val) {
        counts[v] = (counts[v] || 0) + 1
      }
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }))
}

export default async function AdminDashboardPage() {
  const responses = await listAllResponses({})
  const total = responses.length

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const newIn7Days = responses.filter(r => new Date(r.submittedAt) > sevenDaysAgo).length

  const activeInvestment = responses.filter(isActiveInvestment)
  const activeInvestmentPct = total > 0 ? Math.round((activeInvestment.length / total) * 100) : 0

  const wantContact = responses.filter(r => r.answers['q41'] === 'Yes, please contact me').length
  const interestedInPOL = responses.filter(r => ['Very interested', 'Interested and would like more information', 'Open to evaluating it'].includes(r.answers['q26'] as string)).length

  // Aggregations for charts
  const plans = aggregateSingle(responses, 'q13')
  const timing = aggregateSingle(activeInvestment, 'q17')
  const stage = aggregateSingle(activeInvestment, 'q18')
  const budget = aggregateSingle(activeInvestment, 'q19')
  const pol = aggregateSingle(responses, 'q26')
  const challenges = aggregateMultiple(responses, 'q12').slice(0, 8)
  const benefits = aggregateMultiple(responses, 'q27').slice(0, 5)

  // Hot leads list (top 5)
  const hotLeads = responses
    .filter(r => getLeadPriority(r) === 'Hot')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

  // 30 days strip (naive timeline)
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })

  const dailyCounts = days.map(d => ({
    date: d,
    count: responses.filter(r => r.submittedAt.startsWith(d)).length
  }))

  const maxDaily = Math.max(...dailyCounts.map(d => d.count), 1)

  return (
    <div className="flex flex-col gap-8 max-w-[1600px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">
            Dashboard summary of all {total} responses.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?format=csv&scope=all" className={buttonVariants({ variant: 'outline' })}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </a>
          <a href="/api/admin/export?format=xlsx&scope=all" className={buttonVariants({ variant: 'default' })}>
            <Download className="mr-2 h-4 w-4" /> Excel (.xlsx)
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Responses" value={total} />
        <StatCard title="New (Last 7 Days)" value={newIn7Days} />
        <StatCard title="Active Investment" value={activeInvestment.length} subvalue={`${activeInvestmentPct}% of total`} />
        <StatCard title="Want Contact" value={wantContact} />
        <StatCard title="Interested in POL" value={interestedInPOL} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Responses over last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {dailyCounts.map((day, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                style={{ height: `${Math.max((day.count / maxDaily) * 100, 4)}%` }}
                title={`${day.date}: ${day.count}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BarChart title="Investment Plans (q13)" data={plans} total={total} />
        <BarChart title="POL Interest (q26)" data={pol} total={total} />
        <BarChart title="Top Challenges (q12)" data={challenges} total={total} />
        <BarChart title="Top POL Benefits (q27)" data={benefits} total={total} />

        {activeInvestment.length > 0 && (
          <>
            <BarChart title="Investment Timing (q17)" data={timing} total={activeInvestment.length} />
            <BarChart title="Investment Stage (q18)" data={stage} total={activeInvestment.length} />
            <BarChart title="Budget (q19)" data={budget} total={activeInvestment.length} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Hot Leads</CardTitle>
              <CardDescription>The 5 most recent highly qualified leads.</CardDescription>
            </div>
            <Link href="/admin/leads" className={buttonVariants({ variant: 'outline' })}>
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {hotLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell><PriorityBadge priority="Hot" /></TableCell>
                      <TableCell className="font-medium">{lead.answers['q1'] as string}</TableCell>
                      <TableCell>{lead.answers['q2'] as string}</TableCell>
                      <TableCell>{lead.answers['q17'] as string || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/responses/${lead.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No hot leads found yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
