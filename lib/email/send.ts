import { Answers } from '@/lib/survey/types'
import { sql } from '@/lib/db'
import { sections } from '@/lib/survey/questions'
// The guide recommended using Resend for email sending
// Note: To use this in production, you must set RESEND_API_KEY in .env.local
// and install the 'resend' package: npm install resend

export async function sendConfirmationEmail(responseId: string, answers: Answers) {
  const email = answers.q4 as string
  const name = answers.q2 as string
  
  if (!email) return

  // In development or if no API key is provided, just log to the console
  let resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) resendApiKey = resendApiKey.replace(/^["']|["']$/g, '').trim()
  
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
    let notifyTo = process.env.LEAD_NOTIFY_TO
    if (notifyTo) notifyTo = notifyTo.replace(/^["']|["']$/g, '').trim()
    
    if (notifyTo) {
      // 1. Get total number of respondents
      let totalCount = 0
      try {
        const res = await sql`SELECT COUNT(*) as count FROM survey_responses`
        totalCount = parseInt(res[0].count, 10)
      } catch (e) {
        console.error('Failed to get total responses:', e)
      }

      // 2. Format all answers dynamically based on the survey structure
      let answersHtml = ''
      sections.forEach(section => {
        let sectionHasAnswers = false
        let sectionHtml = `<h3 style="margin-top: 25px; color: #1B2A73; border-bottom: 2px solid #eaeaea; padding-bottom: 5px; font-size: 16px;">${section.title}</h3>`
        
        section.questions.forEach(q => {
          const val = (answers as any)[q.id]
          if (val !== undefined && val !== '' && (Array.isArray(val) ? val.length > 0 : true)) {
            sectionHasAnswers = true
            let displayVal = val
            if (Array.isArray(val)) {
              displayVal = val.join(', ')
            }
            // Format newlines for textareas
            if (typeof displayVal === 'string') {
              displayVal = displayVal.replace(/\n/g, '<br/>')
            }
            sectionHtml += `
              <div style="margin-bottom: 12px; background: #fdfdfd; padding: 10px; border-left: 4px solid #6A1FD0; border-radius: 4px;">
                <div style="font-size: 13px; color: #555; margin-bottom: 4px;">${q.prompt}</div>
                <div style="font-size: 15px; font-weight: 600; color: #111;">${displayVal}</div>
              </div>
            `
          }
        })
        
        if (sectionHasAnswers) {
          answersHtml += sectionHtml
        }
      })

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'YFC-BonEagle Survey <survey@yfcboneagle.com>',
        to: [notifyTo],
        subject: `New Survey Response from ${name} (${answers.q1 || 'Unknown Company'})`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.5;">
            <div style="background-color: #1B2A73; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
              <h2 style="margin: 0; font-size: 20px;">New Survey Submitted</h2>
            </div>
            
            <div style="padding: 20px; border: 1px solid #eaeaea; border-top: none; border-radius: 0 0 8px 8px; background: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f0f4ff; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
                <div>
                  <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;">Total Respondents to Date</p>
                  <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1B2A73;">${totalCount}</p>
                </div>
                <div style="text-align: right;">
                  <a href="${baseUrl}/admin/responses/${responseId}" style="display: inline-block; padding: 10px 20px; background-color: #6A1FD0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                    Open in Admin Dashboard
                  </a>
                </div>
              </div>

              <h2 style="font-size: 18px; color: #333; margin-top: 0;">Respondent Details</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 120px; color: #666;">Name</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${name}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Company</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${answers.q1 || 'N/A'}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${email}</td></tr>
              </table>

              <h2 style="font-size: 18px; color: #333; margin-bottom: 5px;">Full Questionnaire Answers</h2>
              <div style="background: #fafafa; padding: 1px 20px 20px 20px; border-radius: 8px; border: 1px solid #eaeaea;">
                ${answersHtml}
              </div>
            </div>
          </div>
        `,
      })
      console.log(`[Email] Successfully sent internal alert to ${notifyTo}`)
    }

  } catch (error) {
    console.error(`[Email] Failed to send email(s):`, error)
  }
}
