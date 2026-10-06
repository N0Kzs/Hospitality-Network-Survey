import { sql } from './index'

export async function checkEmailExists(email: string): Promise<string | null> {
  const result = await sql`SELECT id FROM survey_responses WHERE email = ${email} LIMIT 1`
  return result.length > 0 ? result[0].id as string : null
}

export async function getSurveyResponseById(id: string) {
  const result = await sql`SELECT * FROM survey_responses WHERE id = ${id} LIMIT 1`
  if (result.length === 0) return null
  return {
    id: result[0].id,
    answers: result[0].answers,
    submittedAt: result[0].submitted_at,
  }
}

function extractFields(answers: Record<string, unknown>) {
  return {
    company: (answers.q1 as string) || '',
    respondentName: (answers.q2 as string) || '',
    jobTitle: (answers.q3 as string) || '',
    email: (answers.q4 as string) || '',
    orgRole: (answers.q5 as string) || null,
    investmentPlan: (answers.q13 as string) || null,
    polInterest: (answers.q26 as string) || null,
    followUp: (answers.q41 as string) || null,
  }
}

export async function insertSurveyResponse(answers: Record<string, unknown>) {
  const id = crypto.randomUUID()
  const { company, respondentName, jobTitle, email, orgRole, investmentPlan, polInterest, followUp } = extractFields(answers)

  await sql`
    INSERT INTO survey_responses (
      id, company, respondent_name, job_title, email, org_role, 
      investment_plan, pol_interest, follow_up, answers
    ) VALUES (
      ${id}, ${company}, ${respondentName}, ${jobTitle}, ${email}, ${orgRole},
      ${investmentPlan}, ${polInterest}, ${followUp}, ${JSON.stringify(answers)}::jsonb
    )
  `
  return id
}

export async function updateSurveyResponse(id: string, answers: Record<string, unknown>) {
  const { company, respondentName, jobTitle, email, orgRole, investmentPlan, polInterest, followUp } = extractFields(answers)

  await sql`
    UPDATE survey_responses 
    SET 
      company = ${company},
      respondent_name = ${respondentName},
      job_title = ${jobTitle},
      email = ${email},
      org_role = ${orgRole},
      investment_plan = ${investmentPlan},
      pol_interest = ${polInterest},
      follow_up = ${followUp},
      answers = ${JSON.stringify(answers)}::jsonb,
      submitted_at = now()
    WHERE id = ${id}
  `
  return id
}

export async function updateEmailStatus(id: string, status: string, messageId?: string | null, error?: string | null) {
  await sql`
    UPDATE survey_responses
    SET 
      email_status = ${status},
      email_message_id = ${messageId || null},
      email_error = ${error || null},
      email_sent_at = ${status === 'sent' ? sql`now()` : null}
    WHERE id = ${id}
  `
}
