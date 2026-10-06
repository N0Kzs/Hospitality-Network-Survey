import { Answers } from '@/lib/survey/types'

// The guide recommended using Resend for email sending
// Note: To use this in production, you must set RESEND_API_KEY in .env.local
// and install the 'resend' package: npm install resend

export async function sendConfirmationEmail(responseId: string, answers: Answers) {
  const email = answers.q4 as string
  const name = answers.q2 as string
  
  if (!email) return

  // In development or if no API key is provided, just log to the console
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.log(`[Email Mock] Would have sent confirmation to ${email}`)
    console.log(`[Email Mock] Edit link: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?edit=${responseId}`)
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    // Ensure NEXT_PUBLIC_BASE_URL is set in your environment variables for production
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const editUrl = `${baseUrl}?edit=${responseId}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'YFC-BonEagle Survey <survey@yfcboneagle.com>', // Verified custom domain
      to: [email],
      subject: 'Thank you for completing the Hospitality Network Survey',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Thank you, ${name}!</h2>
          <p>We have successfully received your responses to the Hospitality Network Survey.</p>
          <p>Your answers help us understand what hotels and resorts in the Philippines need from their networks.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
            <p style="margin-top: 0;"><strong>Need to update your answers?</strong></p>
            <p>You can review and edit your response at any time by clicking the link below:</p>
            <a href="${editUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6A1FD0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review or Edit My Response
            </a>
          </div>
          
          <p style="font-size: 0.9em; color: #666;">If you have any questions, please reply to this email.</p>
        </div>
      `,
    })
    console.log(`[Email] Successfully sent confirmation to ${email}`)

    // --- PHASE 5: Send Internal Company Alert ---
    const notifyTo = process.env.LEAD_NOTIFY_TO
    if (notifyTo) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'YFC-BonEagle Survey <survey@yfcboneagle.com>',
        to: [notifyTo],
        subject: `New Survey Response from ${name} (${answers.q1 || 'Unknown Company'})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>New Survey Submitted</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${answers.q1 || 'N/A'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>View full response in Dashboard:</strong></p>
            <a href="${baseUrl}/admin/responses/${responseId}" style="display: inline-block; padding: 8px 16px; background-color: #1B2A73; color: white; text-decoration: none; border-radius: 4px;">
              Open in Admin Dashboard
            </a>
          </div>
        `,
      })
      console.log(`[Email] Successfully sent internal alert to ${notifyTo}`)
    }

  } catch (error) {
    console.error(`[Email] Failed to send email(s):`, error)
  }
}
