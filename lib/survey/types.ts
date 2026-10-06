export type Answer = string | string[]

export interface Question {
  id: string
  type: 'text' | 'email' | 'textarea' | 'single' | 'multi'
  prompt: string
  help?: string
  options?: string[]
  max?: number
  exclusive?: string[]
  required?: boolean
  placeholder?: string
  autoComplete?: string
}

export interface Section {
  id: string
  title: string
  short: string
  intro?: string
  questions: Question[]
}

export type Answers = Record<string, Answer | undefined>
export type Errors = Record<string, string>
