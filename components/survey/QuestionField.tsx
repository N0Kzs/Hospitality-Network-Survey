'use client'

import { Check } from 'lucide-react'
import type { Answer, Question } from '@/lib/survey/types'

interface Props {
  q: Question
  value: Answer | undefined
  other: string
  error?: string
  onChange: (value: Answer) => void
  onOtherChange: (value: string) => void
}

export default function QuestionField({ q, value, other, error, onChange, onOtherChange }: Props) {
  const errorId = `error-${q.id}`
  const helpId = `help-${q.id}`

  const prompt = (
    <>
      {q.prompt}
      {q.required && (
        <span className="req" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </>
  )

  const errorEl = error ? (
    <p className="q-error" id={errorId} role="alert">
      {error}
    </p>
  ) : null

  // ── Free text ────────────────────────────────────────────────
  if (q.type === 'text' || q.type === 'email' || q.type === 'textarea') {
    const common = {
      id: `input-${q.id}`,
      name: q.id,
      value: typeof value === 'string' ? value : '',
      placeholder: q.placeholder,
      autoComplete: q.autoComplete,
      'aria-required': q.required || undefined,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': [q.help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined,
      className: `input ${error ? 'has-error' : ''}`,
    }
    return (
      <div className="q" id={`q-${q.id}`} tabIndex={-1}>
        <label className="q-prompt" htmlFor={common.id}>
          {prompt}
        </label>
        {q.help && (
          <p className="q-help" id={helpId}>
            {q.help}
          </p>
        )}
        {q.type === 'textarea' ? (
          <textarea {...common} rows={5} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input {...common} type={q.type === 'email' ? 'email' : 'text'} onChange={(e) => onChange(e.target.value)} />
        )}
        {errorEl}
      </div>
    )
  }

  // ── Choices ──────────────────────────────────────────────────
  const options = q.options ?? []
  const multi = q.type === 'multi'
  const selected: string[] = multi ? (Array.isArray(value) ? value : []) : typeof value === 'string' && value ? [value] : []
  const otherSelected = options.includes('Other') && selected.includes('Other')
  const atMax = multi && q.max !== undefined && selected.length >= q.max

  // Short single-choice answers (1, 2–5, Yes / No ...) read better as chips.
  const chips = !multi && options.length <= 7 && options.every((o) => o.length <= 20)
  const oneColumn = options.some((o) => o.length > 42)
  const layout = chips ? 'chips' : oneColumn ? 'one' : ''

  const help = q.help ?? (multi ? (q.max ? `Choose up to ${q.max}.` : 'Select all that apply.') : undefined)

  function toggle(option: string) {
    if (!multi) return onChange(option)
    if (selected.includes(option)) return onChange(selected.filter((v) => v !== option))
    if (q.exclusive?.includes(option)) return onChange([option])
    const next = [...selected.filter((v) => !q.exclusive?.includes(v)), option]
    if (q.max !== undefined && next.length > q.max) return
    onChange(next)
  }

  return (
    <fieldset
      className="q"
      id={`q-${q.id}`}
      tabIndex={-1}
      aria-required={q.required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={[help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
    >
      <legend className="q-prompt">{prompt}</legend>
      {help && (
        <p className="q-help" id={helpId}>
          {help}
          {multi && q.max !== undefined && (
            <span className="q-count" aria-live="polite">
              {' '}
              {selected.length} of {q.max} selected.
            </span>
          )}
        </p>
      )}

      <div className={`opts ${layout}`}>
        {options.map((option) => {
          const checked = selected.includes(option)
          const disabled = atMax && !checked && !q.exclusive?.includes(option)
          return (
            <label key={option} className={`opt ${multi ? 'multi' : ''}`}>
              <input
                type={multi ? 'checkbox' : 'radio'}
                name={q.id}
                value={option}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(option)}
              />
              <span className="mark" aria-hidden="true">
                <Check />
              </span>
              <span className="opt-text">{option}</span>
            </label>
          )
        })}
      </div>

      {otherSelected && (
        <input
          className="input other"
          type="text"
          aria-label={`Other: please specify (${q.prompt})`}
          placeholder="Please specify"
          value={other}
          onChange={(e) => onOtherChange(e.target.value)}
        />
      )}
      {errorEl}
    </fieldset>
  )
}