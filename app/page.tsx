'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Hotel,
  Info,
  LockKeyhole,
  Network,
  Sparkles,
} from 'lucide-react'

const sections = [
  { number: '01', label: 'About you' },
  { number: '02', label: 'Current network' },
  { number: '03', label: 'Plans & priorities' },
  { number: '04', label: 'Technology' },
  { number: '05', label: 'Next steps' },
]

const roles = ['Hotel group / operator', 'Property owner', 'Property developer', 'System integrator', 'Consultant', 'Other']
const propertyTypes = ['City hotel', 'Resort', 'Serviced residence', 'Boutique hotel', 'Mixed-use development']
const challenges = ['Slow or unreliable Wi-Fi', 'Network outages', 'High operating costs', 'Limited visibility', 'Aging cabling', 'Security concerns']

function ChoiceCard({ label, selected, onClick, multiple = false }: { label: string; selected: boolean; onClick: () => void; multiple?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`choice-card ${selected ? 'is-selected' : ''}`} aria-pressed={selected}>
      <span className={`choice-mark ${selected ? 'is-selected' : ''} ${multiple ? 'is-square' : ''}`}>{selected && <Check />}</span>
      <span>{label}</span>
    </button>
  )
}

export default function Page() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [role, setRole] = useState('')
  const [properties, setProperties] = useState('')
  const [types, setTypes] = useState<string[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [investment, setInvestment] = useState('')
  const [polInterest, setPolInterest] = useState(0)

  const progress = useMemo(() => ((step + 1) / sections.length) * 100, [step])
  const toggle = (value: string, values: string[], setValues: (v: string[]) => void) => setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])

  if (submitted) {
    return (
      <main className="survey-shell success-shell">
        <div className="success-card">
          <div className="success-icon"><Check /></div>
          <p className="eyebrow">Survey complete</p>
          <h1>Thank you for sharing your perspective.</h1>
          <p className="success-copy">Your responses will help us shape practical, future-ready network solutions for hospitality in the Philippines.</p>
          <div className="success-actions">
            <button className="primary-button" type="button"><ClipboardCheck data-icon="inline-start" /> Download my summary</button>
            <button className="secondary-button" type="button">Schedule a call <ArrowRight data-icon="inline-end" /></button>
          </div>
          <p className="privacy-note"><LockKeyhole /> Your data is confidential and used only for this survey.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="survey-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Network /></span><span>Hospitality<br /><strong>Network Study</strong></span></div>
        <div className="topbar-meta"><LockKeyhole /> Confidential research <span className="topbar-divider" /> <span>5–10 min</span></div>
      </header>

      <div className="survey-layout">
        <aside className="progress-panel">
          <div className="aside-intro"><span className="mini-label">2025 Hospitality Network Study</span><p>Help us understand how hospitality leaders are building the next generation of connected properties.</p></div>
          <nav aria-label="Survey progress">
            {sections.map((item, index) => <div className={`progress-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-complete' : ''}`} key={item.number}><span className="step-number">{index < step ? <Check /> : item.number}</span><span>{item.label}</span></div>)}
          </nav>
          <div className="aside-help"><CircleHelp /><div><strong>Need help?</strong><p>We’re happy to clarify any question.</p><button type="button">Contact our team <ArrowRight /></button></div></div>
        </aside>

        <section className="form-area">
          <div className="mobile-progress"><div className="mobile-progress-top"><span>Section {String(step + 1).padStart(2, '0')} of 05</span><span>{Math.round(progress)}%</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>

          {step === 0 && <div className="step-content">
            <div className="step-heading"><p className="eyebrow">Section 01 <span>·</span> About you</p><h1>Let’s start with<br /><em>your perspective.</em></h1><p className="lede">Tell us a little about your organization so we can make the rest of this conversation relevant to you.</p></div>
            <div className="form-stack">
              <div className="field-grid"><label className="field"><span>Company name</span><input placeholder="e.g. The Peninsula Manila" /></label><label className="field"><span>Your name</span><input placeholder="e.g. Maria Santos" /></label></div>
              <div className="field-grid"><label className="field"><span>Job title</span><input placeholder="e.g. Director of IT" /></label><label className="field"><span>Work email</span><input type="email" placeholder="you@company.com" /></label></div>
              <div className="question-block"><div className="question-label"><span>01</span><div><strong>What role does your organization play in hospitality?</strong><small>Select the option that best describes you.</small></div><Info /></div><div className="choice-grid">{roles.map((item) => <ChoiceCard key={item} label={item} selected={role === item} onClick={() => setRole(item)} />)}</div></div>
              <div className="question-block"><div className="question-label"><span>02</span><div><strong>How many properties do you operate in the Philippines?</strong></div></div><div className="choice-grid compact">{['1 property', '2–5 properties', '6–20 properties', '21+ properties'].map((item) => <ChoiceCard key={item} label={item} selected={properties === item} onClick={() => setProperties(item)} />)}</div></div>
            </div>
          </div>}

          {step === 1 && <div className="step-content"><div className="step-heading"><p className="eyebrow">Section 02 <span>·</span> Current network</p><h1>What’s happening<br /><em>under the hood?</em></h1><p className="lede">A quick snapshot of your current environment helps us understand where the greatest opportunities are.</p></div><div className="form-stack"><div className="question-block"><div className="question-label"><span>03</span><div><strong>Which property types do you manage?</strong><small>Select all that apply.</small></div></div><div className="choice-grid">{propertyTypes.map((item) => <ChoiceCard key={item} label={item} multiple selected={types.includes(item)} onClick={() => toggle(item, types, setTypes)} />)}</div></div><div className="question-block"><div className="question-label"><span>04</span><div><strong>What are the biggest challenges with your current network?</strong><small>Select all that apply.</small></div></div><div className="choice-grid">{challenges.map((item) => <ChoiceCard key={item} label={item} multiple selected={selectedChallenges.includes(item)} onClick={() => toggle(item, selectedChallenges, setSelectedChallenges)} />)}</div></div><div className="field"><span>Anything else you’d like us to know? <small>(Optional)</small></span><textarea placeholder="Tell us about a recent challenge or opportunity..." rows={4} /></div></div></div>}

          {step === 2 && <div className="step-content"><div className="step-heading"><p className="eyebrow">Section 03 <span>·</span> Plans & priorities</p><h1>Where are you<br /><em>headed next?</em></h1><p className="lede">Whether you’re actively investing or still exploring, your direction matters.</p></div><div className="form-stack"><div className="question-block"><div className="question-label"><span>05</span><div><strong>What best describes your network investment plans?</strong></div></div><div className="choice-grid single">{['Actively planning an upgrade', 'Exploring options this year', 'No investment planned yet', 'Not sure'].map((item) => <ChoiceCard key={item} label={item} selected={investment === item} onClick={() => setInvestment(item)} />)}</div></div><div className="question-block"><div className="question-label"><span>06</span><div><strong>What would trigger your next investment?</strong><small>Select up to three priorities.</small></div></div><div className="choice-grid">{['A property renovation', 'New construction', 'Guest experience goals', 'Operational efficiency', 'Security requirements', 'Cost reduction'].map((item) => <ChoiceCard key={item} label={item} multiple selected={selectedChallenges.includes(item)} onClick={() => toggle(item, selectedChallenges, setSelectedChallenges)} />)}</div></div></div></div>}

          {step === 3 && <div className="step-content"><div className="step-heading"><p className="eyebrow">Section 04 <span>·</span> Technology</p><h1>Let’s talk about<br /><em>what’s possible.</em></h1><p className="lede">Modern architectures can balance performance, cost, and sustainability. How does Passive Optical LAN fit into your thinking?</p></div><div className="form-stack"><div className="pol-callout"><div className="pol-icon"><Sparkles /></div><div><strong>Passive Optical LAN (POL)</strong><p>A fiber-based network architecture that uses less space, energy, and active hardware—without compromising performance.</p><button type="button">Learn more about POL <ArrowRight /></button></div></div><div className="question-block rating-block"><div className="question-label"><span>07</span><div><strong>How interested are you in learning more about POL?</strong></div></div><div className="rating-row">{[1,2,3,4,5].map((value) => <button type="button" key={value} className={polInterest === value ? 'is-selected' : ''} onClick={() => setPolInterest(value)}><span>{value}</span><small>{value === 1 ? 'Not familiar' : value === 5 ? 'Very interested' : ''}</small></button>)}</div></div><div className="field"><span>What would make a new solution compelling for you?</span><textarea placeholder="Performance, sustainability, simplicity, total cost of ownership..." rows={4} /></div></div></div>}

          {step === 4 && <div className="step-content"><div className="step-heading"><p className="eyebrow">Section 05 <span>·</span> Next steps</p><h1>Last question:<br /><em>how can we help?</em></h1><p className="lede">We’ll use your responses to share relevant insights—not a generic sales pitch.</p></div><div className="form-stack"><div className="question-block"><div className="question-label"><span>08</span><div><strong>Would you like to receive a tailored summary?</strong></div></div><div className="choice-grid single"><ChoiceCard label="Yes, please send it to me" selected={true} onClick={() => {}} /><ChoiceCard label="No thanks, just submit my response" selected={false} onClick={() => {}} /></div></div><div className="field-grid"><label className="field"><span>Best phone number <small>(Optional)</small></span><input placeholder="+63 917 123 4567" /></label><label className="field"><span>Preferred follow-up</span><div className="select-wrap"><select defaultValue="Email"><option>Email</option><option>Phone call</option><option>Either is fine</option></select><ChevronDown /></div></label></div></div></div>}

          <div className="form-footer"><button type="button" className="back-button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft data-icon="inline-start" /> Back</button><div className="footer-right"><span className="save-note">Your progress is saved automatically</span><button type="button" className="primary-button" onClick={() => step === sections.length - 1 ? setSubmitted(true) : setStep(step + 1)}>{step === sections.length - 1 ? 'Submit survey' : 'Continue'} <ArrowRight data-icon="inline-end" /></button></div></div>
        </section>
      </div>
    </main>
  )
}
