import { NextResponse } from 'next/server'
import { insertSurveyResponse } from '@/lib/db/survey'
import { sendConfirmationEmail } from '@/lib/email/send'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Expecting payload to match exactly what Google Apps Script sends
    const answers = body.answers
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Missing answers array.' }, { status: 400 })
    }

    // Insert directly into the Neon Database
    const id = await insertSurveyResponse(answers)
    console.log('[Google Forms Webhook] Saved to Neon database:', id)

    // Trigger emails (Respondent + Company Alert)
    const origin = new URL(request.url).origin
    try {
      await sendConfirmationEmail(id, answers as any, origin)
    } catch (err) {
      console.error('[Google Forms Webhook] Failed to send emails:', err)
    }

    return NextResponse.json({ ok: true, id }, { status: 201 })
  } catch (error) {
    console.error('[Google Forms Webhook] Error processing submission:', error)
    return NextResponse.json({ error: 'Failed to process webhook.' }, { status: 500 })
  }
}
