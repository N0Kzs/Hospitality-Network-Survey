import type { Answers } from '@/lib/survey/types'

export interface SurveyResponse {
  id: string
  submittedAt: string
  answers: Answers
}

export interface ResponseFilters {
  search?: string
  q13?: string // investment plan
  q26?: string // POL interest
  q41?: string // follow-up
  q5?: string  // organization role
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
