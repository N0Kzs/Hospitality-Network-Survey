import { NextResponse } from 'next/server'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REQUIRED = ['q1', 'q2', 'q3', 'q4', 'q13', 'q37']

/**
 * Receives a completed survey.
 *
 * PHASE 1: validates the payload and logs it to the server console.
 * PHASE 4: replace the console.log below with an INSERT into Neon / PostgreSQL.
 * PHASE 5: after the insert succeeds, send the confirmation email to answers.q4.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const payload = body as { submittedAt?: unknown; answers?: Record<string, unknown> }
  const answers = payload?.answers
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Missing answers.' }, { status: 400 })
  }

  const missing = REQUIRED.filter((id) => {
    const v = answers[id]
    return v === undefined || (typeof v === 'string' && v.trim() === '')
  })
  if (missing.length > 0) {
    return NextResponse.json({ error: 'Missing required answers.', missing }, { status: 422 })
  }
  if (typeof answers.q4 !== 'string' || !EMAIL.test(answers.q4)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 422 })
  }

  const id = crypto.randomUUID()
  console.log('[survey] new response', id, JSON.stringify(payload, null, 2))

  return NextResponse.json({ ok: true, id }, { status: 201 })
}