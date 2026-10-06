import { NextRequest, NextResponse } from 'next/server'
import { listAllResponses } from '@/lib/admin/data'
import { generateCsv, generateExcel } from '@/lib/admin/export'
import { getLeadPriority } from '@/lib/admin/leads'

import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { searchParams } = new URL(request.url)
  
  const format = searchParams.get('format') || 'csv' // 'csv' | 'xlsx'
  const scope = searchParams.get('scope') === 'leads' ? 'leads' : 'all'
  
  const filters = {
    search: searchParams.get('search') || undefined,
    q13: searchParams.get('q13') || undefined,
    q26: searchParams.get('q26') || undefined,
    q41: searchParams.get('q41') || undefined,
    q5: searchParams.get('q5') || undefined,
    from: searchParams.get('from') || undefined,
    to: searchParams.get('to') || undefined,
  }
  
  let responses = await listAllResponses(filters)
  
  if (scope === 'leads') {
    const priorityFilter = searchParams.get('priority')
    responses = responses.filter(r => {
      const p = getLeadPriority(r)
      if (p === 'None') return false
      if (priorityFilter && p !== priorityFilter) return false
      return true
    })
    
    // Sort leads: Hot, Warm, Later, newest first
    const priorityScore = { Hot: 3, Warm: 2, Later: 1, None: 0 }
    responses.sort((a, b) => {
      const pa = getLeadPriority(a)
      const pb = getLeadPriority(b)
      if (priorityScore[pa] !== priorityScore[pb]) {
        return priorityScore[pb] - priorityScore[pa]
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    })
  }

  const dateStr = new Date().toISOString().split('T')[0]
  
  if (format === 'xlsx') {
    const buffer = await generateExcel(responses, scope)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="lightera-survey-responses-${dateStr}.xlsx"`
      }
    })
  } else {
    const csv = await generateCsv(responses, scope)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lightera-survey-responses-${dateStr}.csv"`
      }
    })
  }
}
