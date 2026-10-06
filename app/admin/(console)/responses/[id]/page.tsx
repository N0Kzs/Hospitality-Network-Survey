import { getResponse } from '@/lib/admin/data'
import { getLeadPriority } from '@/lib/admin/leads'
import { sections } from '@/lib/survey/questions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PriorityBadge } from '@/components/admin/PriorityBadge'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Mail, Calendar } from 'lucide-react'

export default async function AdminResponseDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params
  const response = await getResponse(resolvedParams.id)

  if (!response) {
    notFound()
  }

  const company = String(response.answers['q1'] || 'Unknown Company')
  const name = String(response.answers['q2'] || 'Unknown Name')
  const title = String(response.answers['q3'] || '')
  const email = String(response.answers['q4'] || '')
  const dateStr = new Date(response.submittedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  const priority = getLeadPriority(response)

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <Link href="/admin/responses" className={buttonVariants({ variant: 'ghost', className: 'pl-0 text-muted-foreground hover:text-primary' })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to responses
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">{company}</h1>
              <div className="text-lg font-medium text-foreground mb-4">
                {name} {title && <span className="text-muted-foreground font-normal"> — {title}</span>}
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {email ? (
                    <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
                  ) : (
                    'No email provided'
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted: {dateStr}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <PriorityBadge priority={priority} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {sections.map(section => {
          // Only show questions this respondent actually answered
          const answeredQuestions = section.questions.filter(q => {
            const val = response.answers[q.id]
            if (Array.isArray(val)) return val.length > 0
            return val !== undefined && val !== null && val !== ''
          })

          if (answeredQuestions.length === 0) return null

          return (
            <Card key={section.id}>
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6">
                  {answeredQuestions.map(q => {
                    const val = response.answers[q.id]
                    const otherVal = response.answers[`${q.id}_other`]

                    return (
                      <div key={q.id}>
                        <div className="font-medium text-foreground mb-1.5">{q.prompt}</div>
                        <div className="text-muted-foreground text-sm">
                          {Array.isArray(val) ? (
                            <ul className="list-disc pl-5 m-0 space-y-1">
                              {val.map(v => (
                                <li key={v}>
                                  {v} {v === 'Other' && otherVal && <span className="text-muted-foreground/70">— {String(otherVal)}</span>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {String(val)} {val === 'Other' && otherVal && <span className="text-muted-foreground/70">— {String(otherVal)}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
