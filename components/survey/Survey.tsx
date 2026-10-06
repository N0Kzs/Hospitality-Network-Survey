'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock, GitBranch, Save } from 'lucide-react'
import { sections } from '@/lib/survey/questions'
import { otherKey, sectionPath, validateSection, visibleAnswers, visibleQuestions } from '@/lib/survey/flow'
import type { Answer, Answers, Errors } from '@/lib/survey/types'
import BrandBar from './BrandBar'
import { FiberRail, MobileProgress } from './FiberProgress'
import QuestionField from './QuestionField'

const STORAGE_KEY = 'yfc-lightera-survey-v1'

type Phase = 'welcome' | 'survey' | 'done'
interface Saved {
  answers: Answers
  sectionId: string
}

export default function Survey({ initialAnswers }: { initialAnswers?: any }) {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [sectionId, setSectionId] = useState(sections[0].id)
  const [answers, setAnswers] = useState<Answers>(initialAnswers || {})
  const [errors, setErrors] = useState<Errors>({})
  const [saved, setSaved] = useState<Saved | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [overwritePrompt, setOverwritePrompt] = useState(false)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const firstRender = useRef(true)

  const path = useMemo(() => sectionPath(answers), [answers])
  const index = Math.max(0, path.findIndex((s) => s.id === sectionId))
  const section = path[index] ?? sections[0]
  const isLast = index === path.length - 1

  // Load any saved progress (this device only).
  useEffect(() => {
    if (initialAnswers) {
      setPhase('survey')
      return
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Saved
      if (parsed?.answers && Object.keys(parsed.answers).length > 0 && sections.some((s) => s.id === parsed.sectionId)) {
        setSaved(parsed)
      }
    } catch {
      /* storage unavailable or corrupted: start fresh */
    }
  }, [initialAnswers])

  // Save progress while the survey is in progress.
  useEffect(() => {
    if (phase !== 'survey') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, sectionId } satisfies Saved))
    } catch {
      /* ignore */
    }
  }, [answers, sectionId, phase])

  // On each new page: scroll up and move focus to the heading for screen-reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus({ preventScroll: true })
  }, [sectionId, phase])

  function setAnswer(id: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => {
      if (!prev[id]) return prev
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }

  function start(fresh: boolean) {
    if (fresh) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      setAnswers({})
      setSectionId(sections[0].id)
      setSaved(null)
    } else if (saved) {
      setAnswers(saved.answers)
      setSectionId(saved.sectionId)
    }
    setErrors({})
    setPhase('survey')
  }

  function back() {
    const prev = path[index - 1]
    if (prev) {
      setErrors({})
      setSectionId(prev.id)
    } else {
      setPhase('welcome')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateSection(section, answers)
    setErrors(found)
    const firstId = Object.keys(found)[0]
    if (firstId) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`input-${firstId}`) ?? document.getElementById(`q-${firstId}`)
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        el?.focus({ preventScroll: true })
      })
      return
    }
    const next = path[index + 1]
    if (next) setSectionId(next.id)
    else void submit()
  }

  async function submit(overwrite = false) {
    if (honeypotRef.current?.value) {
      finish()
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          submittedAt: new Date().toISOString(), 
          answers: visibleAnswers(answers),
          overwrite
        }),
      })
      
      if (res.status === 409) {
        setOverwritePrompt(true)
        return
      }
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      finish()
    } catch {
      setSubmitError('We could not send your response. Check your connection and try again. Your answers are still saved.')
    } finally {
      setSubmitting(false)
    }
  }

  function finish() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setSaved(null)
    setPhase('done')
  }

  function restart() {
    setAnswers({})
    setErrors({})
    setSectionId(sections[0].id)
    setPhase('welcome')
  }

  // ───────────────────────── Welcome ─────────────────────────
  if (phase === 'welcome') {
    return (
      <div className="shell">
        <BrandBar />
        <main className="welcome">
          <svg className="stripes" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <linearGradient id="stripe-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#1B2A73" />
                <stop offset="1" stopColor="#6A1FD0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={40 + i * 80} y1={400} x2={400} y2={40 + i * 80} stroke="url(#stripe-grad)" strokeWidth={22} strokeLinecap="round" />
            ))}
          </svg>

          <div className="welcome-body">
            <h1 className="display" ref={headingRef} tabIndex={-1}>
              How are Philippine hotels building their networks?
            </h1>
            <p className="lede">
              Share how your properties plan, build and run their networks. Your answers help YFC-BonEagle International understand what hotels, resorts and
              developers need, so our conversations about Lightera Passive Optical LAN stay relevant.
            </p>

            <div className="welcome-actions">
              <button type="button" className="btn-primary" onClick={() => start(!saved)}>
                {saved ? 'Resume survey' : 'Start survey'}
                <ArrowRight aria-hidden="true" />
              </button>
              {saved && (
                <button type="button" className="btn-ghost" onClick={() => start(true)}>
                  Start over
                </button>
              )}
              {initialAnswers && (
                <button type="button" className="btn-ghost" onClick={() => {
                  setAnswers({})
                  setPhase('welcome')
                }}>
                  Discard edits
                </button>
              )}
              <a href="/admin" className="btn-ghost" style={{ border: '1px solid var(--line-strong)', padding: '12px 20px', borderRadius: '10px' }}>
                Admin Login
              </a>
            </div>

            <ul className="facts">
              <li>
                <Clock aria-hidden="true" />
                <span>
                  <strong>About 10 minutes</strong>
                  Most questions are multiple choice.
                </span>
              </li>
              <li>
                <GitBranch aria-hidden="true" />
                <span>
                  <strong>Only what applies to you</strong>
                  Questions adapt to your answers.
                </span>
              </li>
              <li>
                <Save aria-hidden="true" />
                <span>
                  <strong>Pick up where you left off</strong>
                  Progress is saved on this device.
                </span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    )
  }

  // ───────────────────────── Thank you ─────────────────────────
  if (phase === 'done') {
    const email = typeof answers.q4 === 'string' ? answers.q4.trim() : ''
    const followUp = answers.q41
    const message =
      followUp === 'Yes, please contact me'
        ? `Our team will contact you at ${email}.`
        : followUp === 'I would first like to receive more information'
          ? `We will send more information to ${email}.`
          : 'Your responses have been recorded.'

    return (
      <div className="shell">
        <BrandBar />
        <main className="done">
          <div className="done-icon" aria-hidden="true">
            <Check />
          </div>
          <h1 className="display" ref={headingRef} tabIndex={-1}>
            Thank you. Your responses are in.
          </h1>
          <p className="lede">
            {message} Your answers help YFC-BonEagle International understand what hotels and resorts in the Philippines need from their networks.
          </p>
          <button type="button" className="btn-ghost" onClick={restart}>
            Submit another response
          </button>
        </main>
      </div>
    )
  }

  // ───────────────────────── Survey ─────────────────────────
  const questions = visibleQuestions(section, answers)
  const hasRequired = questions.some((q) => q.required)
  const errorCount = Object.keys(errors).length

  return (
    <div className="shell">
      <BrandBar />
      <div className="layout">
        <FiberRail path={path} index={index} />

        <main className="content">
          <MobileProgress path={path} index={index} />

          <h1 className="section-title" ref={headingRef} tabIndex={-1}>
            {section.title}
          </h1>
          <p className="section-intro">{section.intro}</p>
          {hasRequired && <p className="required-note">Questions marked * are required.</p>}

          <form onSubmit={handleSubmit} noValidate>
            {errorCount > 0 && (
              <p className="form-alert" role="alert">
                {errorCount === 1 ? 'One question needs your attention.' : `${errorCount} questions need your attention.`}
              </p>
            )}

            {questions.map((q) => (
              <QuestionField
                key={q.id}
                q={q}
                value={answers[q.id]}
                other={typeof answers[otherKey(q.id)] === 'string' ? (answers[otherKey(q.id)] as string) : ''}
                error={errors[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
                onOtherChange={(v) => setAnswer(otherKey(q.id), v)}
              />
            ))}

            {/* Honeypot for bots. Hidden from people and assistive tech. */}
            <input ref={honeypotRef} className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            {submitError && (
              <p className="form-alert" role="alert">
                {submitError}
              </p>
            )}

            <div className="nav">
              <button type="button" className="btn-ghost" onClick={back}>
                <ArrowLeft aria-hidden="true" />
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : isLast ? 'Submit survey' : 'Continue'}
                {!submitting && <ArrowRight aria-hidden="true" />}
              </button>
            </div>
            <p className="save-note">Progress is saved on this device.</p>
          </form>

          {overwritePrompt && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '12px',
                maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 600, color: '#1B2A73' }}>Overwrite Existing Response?</h3>
                <p style={{ color: '#444', lineHeight: 1.5, marginBottom: '24px' }}>
                  An existing survey response was found for this email address. Would you like to overwrite it with your new answers?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setOverwritePrompt(false)}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setOverwritePrompt(false)
                      submit(true)
                    }}
                    style={{ padding: '8px 16px', background: '#6A1FD0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Yes, Overwrite
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}