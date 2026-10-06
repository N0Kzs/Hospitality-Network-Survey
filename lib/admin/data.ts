import type { SurveyResponse, ResponseFilters } from './types'
import { mockResponses } from './mock'
import { isActiveInvestment, getLeadPriority } from './leads'
import { sections } from '@/lib/survey/questions'

function applyFilters(responses: SurveyResponse[], filters: ResponseFilters): SurveyResponse[] {
  return responses.filter(r => {
    if (filters.search) {
      const s = filters.search.toLowerCase()
      const c = (r.answers['q1'] as string || '').toLowerCase()
      const n = (r.answers['q2'] as string || '').toLowerCase()
      const e = (r.answers['q4'] as string || '').toLowerCase()
      if (!c.includes(s) && !n.includes(s) && !e.includes(s)) return false
    }
    
    if (filters.q13) {
      if (filters.q13 === 'active') {
        if (!isActiveInvestment(r)) return false
      } else {
        if (r.answers['q13'] !== filters.q13) return false
      }
    }
    
    if (filters.q26 && r.answers['q26'] !== filters.q26) return false
    if (filters.q41 && r.answers['q41'] !== filters.q41) return false
    if (filters.q5 && r.answers['q5'] !== filters.q5) return false
    
    if (filters.from) {
      if (new Date(r.submittedAt) < new Date(filters.from)) return false
    }
    if (filters.to) {
      const toDate = new Date(filters.to)
      toDate.setHours(23, 59, 59, 999)
      if (new Date(r.submittedAt) > toDate) return false
    }
    
    return true
  })
}

export async function listResponses(filters: ResponseFilters): Promise<{ rows: SurveyResponse[]; total: number }> {
  const filtered = applyFilters(mockResponses, filters)
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    rows: filtered.slice(start, end),
    total: filtered.length
  }
}

export async function listAllResponses(filters: ResponseFilters): Promise<SurveyResponse[]> {
  return applyFilters(mockResponses, filters)
}

export async function getResponse(id: string): Promise<SurveyResponse | null> {
  const r = mockResponses.find(x => x.id === id)
  return r || null
}

export async function getStats() {
  const total = mockResponses.length
  const now = new Date('2026-10-06T00:00:00Z').getTime()
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
  
  let last7Days = 0
  let activeInvestment = 0
  let wantContact = 0
  let interestedPOL = 0
  
  mockResponses.forEach(r => {
    if (new Date(r.submittedAt).getTime() >= sevenDaysAgo) last7Days++
    if (isActiveInvestment(r)) activeInvestment++
    if (r.answers['q41'] === 'Yes, please contact me') wantContact++
    
    const pol = r.answers['q26'] as string
    if (pol === 'Very interested' || pol === 'Interested and would like more information' || pol === 'Open to evaluating it') interestedPOL++
  })

  // daily bar strip
  const daily: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(now - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    daily[d] = 0
  }
  
  mockResponses.forEach(r => {
    const d = r.submittedAt.split('T')[0]
    if (daily[d] !== undefined) {
      daily[d]++
    }
  })

  const dailyCounts = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0])).map(x => ({ date: x[0], count: x[1] }))
  
  const activePercent = total > 0 ? Math.round((activeInvestment / total) * 100) : 0
  
  const leads = mockResponses.filter(r => getLeadPriority(r) !== 'None')
  const hotLeads = leads.filter(r => getLeadPriority(r) === 'Hot').slice(0, 5)

  return {
    total,
    last7Days,
    activeInvestment,
    activePercent,
    wantContact,
    interestedPOL,
    dailyCounts,
    hotLeads
  }
}

export async function countBy(questionId: string, filters?: ResponseFilters): Promise<{ label: string; count: number }[]> {
  const baseResponses = filters ? applyFilters(mockResponses, filters) : mockResponses
  
  // Find the question options to preserve order and show 0s
  let options: string[] = []
  for (const s of sections) {
    const q = s.questions.find(x => x.id === questionId)
    if (q && q.options) {
      options = q.options
      break
    }
  }

  const counts: Record<string, number> = {}
  options.forEach(o => counts[o] = 0)

  baseResponses.forEach(r => {
    const val = r.answers[questionId]
    if (Array.isArray(val)) {
      val.forEach(v => {
        if (counts[v] === undefined && options.length === 0) counts[v] = 0
        if (counts[v] !== undefined) counts[v]++
      })
    } else if (typeof val === 'string') {
      if (counts[val] === undefined && options.length === 0) counts[val] = 0
      if (counts[val] !== undefined) counts[val]++
    }
  })

  if (options.length > 0) {
    return options.map(o => ({ label: o, count: counts[o] }))
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(x => ({ label: x[0], count: x[1] }))
}
