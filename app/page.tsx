import Survey from '@/components/survey/Survey'
import { getSurveyResponseById } from '@/lib/db/survey'

interface PageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  let existingResponse = null
  const params = await searchParams

  if (params.edit) {
    try {
      const resp = await getSurveyResponseById(params.edit)
      if (resp) {
        existingResponse = resp.answers
      }
    } catch (e) {
      console.error('Failed to load edit response:', e)
    }
  }

  return <Survey initialAnswers={existingResponse} />
}