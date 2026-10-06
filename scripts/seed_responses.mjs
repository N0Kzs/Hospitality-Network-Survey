import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const rng = mulberry32(12345);

function randomItem(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randomItems(arr, max) {
  const count = Math.floor(rng() * max) + 1;
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

function randomDateInLast30Days() {
  const now = new Date('2026-10-06T00:00:00Z').getTime();
  const past = now - Math.floor(rng() * 30 * 24 * 60 * 60 * 1000);
  return new Date(past).toISOString();
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

function generateMockResponses(count) {
  const responses = [];
  
  for (let i = 0; i < count; i++) {
    const rawAnswers = {};
    
    rawAnswers['q1'] = randomItem(COMPANIES);
    rawAnswers['q2'] = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    rawAnswers['q3'] = randomItem(['Director of IT', 'General Manager', 'Chief Technology Officer', 'Operations Manager', 'Owner']);
    rawAnswers['q4'] = `${rawAnswers['q2'].toString().split(' ')[0].toLowerCase()}@${rawAnswers['q1'].toString().toLowerCase().replace(/\s+/g, '')}.com`;
    
    const role = randomItem(ROLES);
    rawAnswers['q5'] = role;
    if (role === 'Other') {
      rawAnswers['q5_other'] = 'Freelance Consultant';
    }

    rawAnswers['q6'] = randomItem(PROPERTY_COUNTS);
    rawAnswers['q7'] = randomItems(PROPERTY_TYPES, 3);
    rawAnswers['q12'] = randomItems(CHALLENGES, 4);
    
    const randPlan = rng();
    if (randPlan < 0.25) rawAnswers['q13'] = 'Yes, investment is already approved';
    else if (randPlan < 0.5) rawAnswers['q13'] = 'Investment is currently being evaluated';
    else if (randPlan < 0.75) rawAnswers['q13'] = 'Possibly, but there are no specific plans yet';
    else rawAnswers['q13'] = 'No investment currently planned';

    if (rawAnswers['q13'] === 'Yes, investment is already approved' || rawAnswers['q13'] === 'Investment is currently being evaluated') {
      rawAnswers['q14'] = randomItems(TRIGGERS, 3);
      rawAnswers['q17'] = randomItem(TIMING);
      rawAnswers['q18'] = randomItem(STAGES);
      rawAnswers['q19'] = randomItem(BUDGETS);
    }

    rawAnswers['q26'] = randomItem(POL_INTEREST);
    rawAnswers['q27'] = randomItems(BENEFITS, 5);

    const randFollow = rng();
    if (randFollow < 0.3) {
      rawAnswers['q41'] = 'Yes, please contact me';
    } else if (randFollow < 0.5) {
      rawAnswers['q41'] = 'I would first like to receive more information';
    } else {
      rawAnswers['q41'] = 'No, not at this time';
    }

    responses.push({
      id: crypto.randomUUID(),
      submittedAt: randomDateInLast30Days(),
      answers: rawAnswers
    });
  }

  return responses;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Generating mock data...');
  const responses = generateMockResponses(40);
  
  console.log('Inserting into database...');
  for (const r of responses) {
    const company = r.answers.q1 || '';
    const respondentName = r.answers.q2 || '';
    const jobTitle = r.answers.q3 || '';
    const email = r.answers.q4 || '';
    const orgRole = r.answers.q5 || null;
    const investmentPlan = r.answers.q13 || null;
    const polInterest = r.answers.q26 || null;
    const followUp = r.answers.q41 || null;

    try {
      await sql`
        INSERT INTO survey_responses (
          id, submitted_at, company, respondent_name, job_title, email, org_role, 
          investment_plan, pol_interest, follow_up, answers
        ) VALUES (
          ${r.id}, ${r.submittedAt}, ${company}, ${respondentName}, ${jobTitle}, ${email}, ${orgRole},
          ${investmentPlan}, ${polInterest}, ${followUp}, ${JSON.stringify(r.answers)}::jsonb
        )
      `;
    } catch (e) {
      console.error(`Failed to insert ${r.id}:`, e);
    }
  }

  console.log('Successfully seeded survey_responses!');
}

main();
