import { NextResponse } from 'next/server'
import { insertSurveyResponse, checkEmailExists, updateSurveyResponse, getSurveyResponseById } from '@/lib/db/survey'
import { sendConfirmationEmail } from '@/lib/email/send'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REQUIRED = ['q1', 'q2', 'q3', 'q4', 'q13', 'q37']

/**
 * Receives a completed survey.
 *
 * PHASE 4: Inserts into Neon / PostgreSQL.
 * PHASE 5: After the insert succeeds, send the confirmation email.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  try {
    const response = await getSurveyResponseById(id)
    if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(response)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

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

  const overwrite = (payload as any).overwrite === true

  try {
    const existingId = await checkEmailExists(answers.q4 as string)
    let id: string

    if (existingId && !overwrite) {
      return NextResponse.json({ exists: true, existingId }, { status: 409 })
    }

    if (existingId && overwrite) {
      id = await updateSurveyResponse(existingId, answers)
      console.log('[survey] updated in database', id)
    } else {
      id = await insertSurveyResponse(answers)
      console.log('[survey] saved to database', id)
    }

    // Phase 5: Send confirmation email
    // This is fired asynchronously so it doesn't block the UI response
    import('@/lib/survey/types').then(({ Answers }) => {
      sendConfirmationEmail(id, answers as any).catch((err) => {
        console.error('[survey] Failed to send email:', err)
      })
    })

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (error) {
    console.error('[survey] database error:', error)
    return NextResponse.json({ error: 'Failed to save survey.' }, { status: 500 })
  }
}