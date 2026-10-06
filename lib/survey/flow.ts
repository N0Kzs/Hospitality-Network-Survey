import { Section, Question, Answers, Errors } from './types'
import { sections } from './questions'

export function otherKey(id: string) {
  return `${id}_other`
}

export function sectionPath(answers: Answers): Section[] {
  const path: Section[] = []
  
  // s1 (Section 1) and s2 (Section 2) and s3 (Section 3) are always shown
  path.push(sections.find(s => s.id === 's1')!)
  path.push(sections.find(s => s.id === 's2')!)
  path.push(sections.find(s => s.id === 's3')!)

  const q13 = answers['q13'] as string | undefined

  if (q13 === 'Yes, investment is already approved' || 
      q13 === 'Yes, investment is planned but not yet approved' || 
      q13 === 'Investment is currently being evaluated') {
    path.push(sections.find(s => s.id === 's4')!)
    path.push(sections.find(s => s.id === 's6')!)
  } else if (q13 === 'Possibly, but there are no specific plans yet' || q13 === 'Not sure') {
    path.push(sections.find(s => s.id === 's5')!)
    
    const q21 = answers['q21'] as string | undefined
    if (q21 === 'Yes' || q21 === 'Possibly' || q21 === 'Not sure') {
      path.push(sections.find(s => s.id === 's6')!)
    }
  }

  // Everyone eventually reaches s7, s8, s9, s10
  path.push(sections.find(s => s.id === 's7')!)
  path.push(sections.find(s => s.id === 's8')!)
  path.push(sections.find(s => s.id === 's9')!)
  path.push(sections.find(s => s.id === 's10')!)

  return path
}

export function visibleQuestions(section: Section, answers: Answers): Question[] {
  if (section.id === 's9') {
    const q37 = answers['q37'] as string | undefined
    if (q37 === 'No' || q37 === 'Not sure') {
      // Skips Q38, Q39
      return section.questions.filter(q => q.id === 'q37' || q.id === 'q40')
    }
  }
  return section.questions
}

export function validateSection(section: Section, answers: Answers): Errors {
  const errors: Errors = {}
  for (const q of visibleQuestions(section, answers)) {
    const val = answers[q.id]
    
    // Check required
    if (q.required) {
      if (val === undefined || val === null || val === '') {
        errors[q.id] = 'This question is required.'
      } else if (Array.isArray(val) && val.length === 0) {
        errors[q.id] = 'Please select at least one option.'
      }
    }
    
    // Email validation
    if (q.type === 'email' && typeof val === 'string' && val.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors[q.id] = 'Please enter a valid email address.'
      }
    }
    
    // 'Other' text field validation
    const options = q.options ?? []
    if (options.includes('Other')) {
      const otherVal = answers[otherKey(q.id)]
      const isOtherSelected = Array.isArray(val) ? val.includes('Other') : val === 'Other'
      if (isOtherSelected && (!otherVal || (typeof otherVal === 'string' && otherVal.trim() === ''))) {
        errors[q.id] = 'Please specify your answer.'
      }
    }
  }
  return errors
}

export function visibleAnswers(answers: Answers): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const path = sectionPath(answers)
  
  for (const s of path) {
    for (const q of visibleQuestions(s, answers)) {
      if (answers[q.id] !== undefined) {
        result[q.id] = answers[q.id]
        if (answers[otherKey(q.id)] !== undefined) {
          result[otherKey(q.id)] = answers[otherKey(q.id)]
        }
      }
    }
  }
  return result
}
