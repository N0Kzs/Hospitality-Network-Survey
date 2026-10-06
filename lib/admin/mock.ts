import type { SurveyResponse } from './types'
import { visibleAnswers } from '@/lib/survey/flow'
import type { Answers } from '@/lib/survey/types'

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const rng = mulberry32(12345) 

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function randomItems<T>(arr: T[], max: number): T[] {
  const count = Math.floor(rng() * max) + 1
  const shuffled = [...arr].sort(() => rng() - 0.5)
  return shuffled.slice(0, count)
}

function randomDateInLast30Days(): string {
  const now = new Date('2026-10-06T00:00:00Z').getTime() 
  const past = now - Math.floor(rng() * 30 * 24 * 60 * 60 * 1000)
  return new Date(past).toISOString()
}

const FIRST_NAMES = ['Maria', 'Juan', 'Jose', 'Ana', 'Pedro', 'Luis', 'Carmen', 'Teresa', 'Antonio', 'Rosa', 'Carlos', 'Elena', 'Francisco', 'Isabel', 'Manuel', 'Miguel', 'Ricardo', 'Sofia']
const LAST_NAMES = ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Aquino', 'Navarro', 'Torres', 'Ramos', 'Castillo', 'Villanueva', 'Diaz', 'Castro']
const COMPANIES = ['Palawan Coast Resorts', 'Manila Grand Hotel', 'Cebu Seaside Suites', 'Boracay Sun Villas', 'Davao Business Inn', 'Makati Executive Lodgings', 'Baguio Pine Retreat', 'Iloilo Heritage Hotel', 'Bohol Nature Resort', 'Tagaytay Skyline Hotel', 'Vigan Colonial Inn', 'Siargao Surf Haven', 'Coron Island Resort', 'El Nido Eco Lodges']
const ROLES = ['Hotel owner', 'Hotel operator / management company', 'Property developer', 'Real estate / property group', 'System integrator', 'Other']
const PROPERTY_COUNTS = ['1', '2–5', '6–10', '11–20', 'More than 20']
const PROPERTY_TYPES = ['Luxury / 5-star hotels', 'Upscale hotels', 'Midscale hotels', 'Economy / budget hotels', 'Resorts', 'Serviced apartments', 'Condominiums / mixed-use developments']
const CHALLENGES = ['Limited network capacity / bandwidth', 'Wi-Fi performance', 'Aging infrastructure', 'High power consumption', 'High maintenance requirements', 'High cabling density', 'Limited telecom room / rack space', 'Difficulty expanding the network', 'High CAPEX', 'High OPEX', 'Reliability / redundancy', 'Cybersecurity', 'Difficult integration with new technologies', 'Insufficient support / service', 'No major challenges currently']
const INVESTMENT_PLANS = ['Yes, investment is already approved', 'Yes, investment is planned but not yet approved', 'Investment is currently being evaluated', 'Possibly, but there are no specific plans yet', 'No investment currently planned', 'Not sure']
const TRIGGERS = ['Hotel renovation / refurbishment', 'New hotel / resort development', 'Network modernization', 'Wi-Fi upgrade', 'Increased bandwidth requirements', 'Digital transformation', 'Smart hotel initiatives', 'Guest experience improvements', 'Replacement of aging infrastructure', 'Cybersecurity requirements', 'Energy efficiency / sustainability', 'Operational cost reduction', 'Expansion of IP-based systems', 'Corporate / brand standards']
const TIMING = ['Already in progress', 'Within the next 6 months', '6–12 months', '12–24 months', '2–3 years', 'More than 3 years', 'Not yet defined']
const STAGES = ['Concept / initial planning', 'Feasibility study', 'Technology evaluation', 'Budgeting', 'Design', 'Tender / RFP preparation', 'Vendor selection', 'Procurement', 'Installation / deployment', 'Not yet started']
const BUDGETS = ['Less than PHP 1 million', 'PHP 1–3 million', 'PHP 3–5 million', 'PHP 5–10 million', 'PHP 10–25 million', 'More than PHP 25 million', 'Budget not yet defined', 'Prefer not to disclose']
const POL_INTEREST = ['Very interested', 'Interested and would like more information', 'Open to evaluating it', 'Prefer traditional Ethernet LAN', 'Not familiar with POL', 'Not relevant to our projects']
const BENEFITS = ['Lower CAPEX', 'Lower OPEX', 'Lower energy consumption', 'Reduced cabling', 'Reduced telecom room / rack space', 'Easier installation', 'Easier maintenance', 'Higher bandwidth', 'Scalability', 'Network reliability', 'Redundancy', 'Cybersecurity', 'Longer infrastructure lifetime', 'Simplified network management', 'Sustainability / ESG']

export function generateMockResponses(count: number): SurveyResponse[] {
  const responses: SurveyResponse[] = []
  
  for (let i = 0; i < count; i++) {
    const rawAnswers: Answers = {}
    
    rawAnswers['q1'] = randomItem(COMPANIES)
    rawAnswers['q2'] = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`
    rawAnswers['q3'] = randomItem(['Director of IT', 'General Manager', 'Chief Technology Officer', 'Operations Manager', 'Owner'])
    rawAnswers['q4'] = `${rawAnswers['q2'].toString().split(' ')[0].toLowerCase()}@${rawAnswers['q1'].toString().toLowerCase().replace(/\s+/g, '')}.com`
    
    const role = randomItem(ROLES)
    rawAnswers['q5'] = role
    if (role === 'Other') {
      rawAnswers['q5_other'] = 'Freelance Consultant'
    }

    rawAnswers['q6'] = randomItem(PROPERTY_COUNTS)
    rawAnswers['q7'] = randomItems(PROPERTY_TYPES, 3)
    rawAnswers['q12'] = randomItems(CHALLENGES, 4) // Was q8, now q12
    
    // Investment plan
    const randPlan = rng()
    if (randPlan < 0.25) rawAnswers['q13'] = 'Yes, investment is already approved'
    else if (randPlan < 0.5) rawAnswers['q13'] = 'Investment is currently being evaluated'
    else if (randPlan < 0.75) rawAnswers['q13'] = 'Possibly, but there are no specific plans yet'
    else rawAnswers['q13'] = 'No investment currently planned'

    // q14-q20 are in section 4 (active investment)
    rawAnswers['q14'] = randomItems(TRIGGERS, 3)
    rawAnswers['q17'] = randomItem(TIMING)
    rawAnswers['q18'] = randomItem(STAGES)
    rawAnswers['q19'] = randomItem(BUDGETS)

    // Section 6 tech
    rawAnswers['q26'] = randomItem(POL_INTEREST)
    rawAnswers['q27'] = randomItems(BENEFITS, 5)

    // Follow-up
    const randFollow = rng()
    if (randFollow < 0.3) {
      rawAnswers['q41'] = 'Yes, please contact me'
    } else if (randFollow < 0.5) {
      rawAnswers['q41'] = 'I would first like to receive more information'
    } else {
      rawAnswers['q41'] = 'No, not at this time'
    }

    // visibleAnswers will now strip out q14-q20 if q13 is "No investment currently planned"
    const finalAnswers = visibleAnswers(rawAnswers) as Answers

    responses.push({
      id: `resp_${1000 + i}`,
      submittedAt: randomDateInLast30Days(),
      answers: finalAnswers
    })
  }

  // Sort by newest first
  return responses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export const mockResponses = generateMockResponses(40)
