import type { SurveyResponse } from './types'

export function isActiveInvestment(response: SurveyResponse): boolean {
  const q13 = response.answers['q13']
  if (typeof q13 !== 'string') return false
  return [
    'Yes, investment is already approved',
    'Yes, investment is planned but not yet approved',
    'Investment is currently being evaluated'
  ].includes(q13)
}

export type LeadPriority = 'Hot' | 'Warm' | 'Later' | 'None'

export function getLeadPriority(response: SurveyResponse): LeadPriority {
  const active = isActiveInvestment(response)
  const q41 = response.answers['q41'] as string | undefined

  if (q41 === 'Yes, please contact me') {
    return active ? 'Hot' : 'Warm'
  }
  
  if (q41 === 'I would first like to receive more information') {
    return active ? 'Warm' : 'Later'
  }
  
  if (q41 === 'Yes, but at a later stage') {
    return 'Later'
  }
  
  return 'None'
}

export function isLead(response: SurveyResponse): boolean {
  return getLeadPriority(response) !== 'None'
}
