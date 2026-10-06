import type { SurveyResponse, ResponseFilters } from './types'
import { isActiveInvestment, getLeadPriority } from './leads'
import { sections } from '@/lib/survey/questions'
import { sql } from '@/lib/db'

function buildWhereClause(filters: ResponseFilters) {
  const conditions = []
  const params = []

  if (filters.search) {
    const s = `%${filters.search}%`
    conditions.push(`(company ILIKE $${params.length + 1} OR respondent_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`)
    params.push(s)
  }
  
  if (filters.q13) {
    if (filters.q13 === 'active') {
      conditions.push(`investment_plan IN ('Yes, investment is already approved', 'Yes, investment is planned but not yet approved', 'Investment is currently being evaluated')`)
    } else {
      conditions.push(`investment_plan = $${params.length + 1}`)
      params.push(filters.q13)
    }
  }
  
  if (filters.q26) {
    conditions.push(`pol_interest = $${params.length + 1}`)
    params.push(filters.q26)
  }
  
  if (filters.q41) {
    conditions.push(`follow_up = $${params.length + 1}`)
    params.push(filters.q41)
  }
  
  if (filters.q5) {
    conditions.push(`org_role = $${params.length + 1}`)
    params.push(filters.q5)
  }
  
  if (filters.from) {
    conditions.push(`submitted_at >= $${params.length + 1}`)
    params.push(filters.from)
  }
  
  if (filters.to) {
    const toDate = new Date(filters.to)
    toDate.setHours(23, 59, 59, 999)
    conditions.push(`submitted_at <= $${params.length + 1}`)
    params.push(toDate.toISOString())
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  return { where, params }
}

function mapRow(row: any): SurveyResponse {
  return {
    id: row.id,
    submittedAt: new Date(row.submitted_at).toISOString(),
    answers: row.answers || {}
  }
}

export async function listResponses(filters: ResponseFilters): Promise<{ rows: SurveyResponse[]; total: number }> {
  const { where, params } = buildWhereClause(filters)
  
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const offset = (page - 1) * pageSize

  // The neon client allows template tags, but for dynamic WHERE clauses we can use sql(query, params)
  const countQuery = `SELECT count(*) as count FROM survey_responses ${where}`
  const dataQuery = `SELECT * FROM survey_responses ${where} ORDER BY submitted_at DESC LIMIT ${pageSize} OFFSET ${offset}`

  const [countRes, dataRes] = await Promise.all([
    sql.query(countQuery, params),
    sql.query(dataQuery, params)
  ])

  return {
    rows: dataRes.map(mapRow),
    total: parseInt(countRes[0].count, 10)
  }
}

export async function listAllResponses(filters: ResponseFilters): Promise<SurveyResponse[]> {
  const { where, params } = buildWhereClause(filters)
  const query = `SELECT * FROM survey_responses ${where} ORDER BY submitted_at DESC`
  const dataRes = await sql.query(query, params)
  return dataRes.map(mapRow)
}

export async function getResponse(id: string): Promise<SurveyResponse | null> {
  const res = await sql`SELECT * FROM survey_responses WHERE id = ${id}`
  if (res.length === 0) return null
  return mapRow(res[0])
}

export async function getStats() {
  const allResponses = await sql`SELECT * FROM survey_responses`
  const mapped = allResponses.map(mapRow)
  
  const total = mapped.length
  const now = new Date('2026-10-06T00:00:00Z').getTime()
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
  
  let last7Days = 0
  let activeInvestment = 0
  let wantContact = 0
  let interestedPOL = 0
  
  mapped.forEach(r => {
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
  
  mapped.forEach(r => {
    const d = r.submittedAt.split('T')[0]
    if (daily[d] !== undefined) {
      daily[d]++
    }
  })

  const dailyCounts = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0])).map(x => ({ date: x[0], count: x[1] }))
  
  const activePercent = total > 0 ? Math.round((activeInvestment / total) * 100) : 0
  
  const leads = mapped.filter(r => getLeadPriority(r) !== 'None')
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
  const mapped = filters ? await listAllResponses(filters) : (await sql`SELECT * FROM survey_responses`).map(mapRow)
  
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

  mapped.forEach(r => {
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
