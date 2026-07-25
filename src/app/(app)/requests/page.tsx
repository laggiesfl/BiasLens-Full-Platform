'use client'

import { useState, useCallback } from 'react'
import styles from './access-request.module.css'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface RequestData {
  yourName: string
  yourEmail: string
  decisionDate: string
  organisationName: string
  decisionType: string
  decisionDescription: string
  impactDescription: string
  referenceNumber: string
  euJurisdiction: boolean
  saJurisdiction: boolean
  ukJurisdiction: boolean
  requestExplanation: boolean
  requestHumanReview: boolean
  requestDataAccess: boolean
  requestObjection: boolean
  isDisabled: boolean
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'The Decision',       description: 'Tell us about the AI decision that affected you.' },
  { id: 2, title: 'What You Want',      description: 'Choose what you are requesting.' },
  { id: 3, title: 'Your Letter',        description: 'Download your formal rights request letter.' },
]

const DECISION_TYPES = [
  'Job application rejection',
  'Loan or credit refusal',
  'Insurance denial or increased premium',
  'Benefits or welfare denial',
  'Healthcare prioritisation decision',
  'Educational placement or rejection',
  'Housing application denial',
  'Performance management outcome',
  'Other automated decision',
]

const INITIAL: RequestData = {
  yourName: '',
  yourEmail: '',
  decisionDate: '',
  organisationName: '',
  decisionType: '',
  decisionDescription: '',
  impactDescription: '',
  referenceNumber: '',
  euJurisdiction: false,
  saJurisdiction: false,
  ukJurisdiction: false,
  requestExplanation: true,
  requestHumanReview: true,
  requestDataAccess: false,
  requestObjection: false,
  isDisabled: false,
}

// ─── LETTER GENERATION ────────────────────────────────────────────────────────

function buildLetter(d: RequestData): string {
  const today   = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const laws: string[] = []
  if (d.euJurisdiction) laws.push('Article 22, General Data Protection Regulation (GDPR)', 'Article 86, EU AI Act (Regulation 2024/1689)')
  if (d.saJurisdiction) laws.push('Section 71, Protection of Personal Information Act 4 of 2013 (POPIA)')
  if (d.ukJurisdiction) laws.push('Article 22, UK GDPR', 'ICO AI Guidance on Automated Decision-Making')
  if (d.isDisabled)     laws.push('Article 5, UN Convention on the Rights of Persons with Disabilities (UNCRPD)')
  if (!laws.length)      laws.push('applicable data protection and AI governance legislation')

  const requests: string[] = []
  if (d.requestExplanation) requests.push(
    `1. A clear and plain-language explanation of how the AI system reached the decision, including the factors, data, and logic used.`
  )
  if (d.requestHumanReview) requests.push(
    `${requests.length + 1}. A review of the decision by a qualified human being, with the authority to override or alter the outcome.`
  )
  if (d.requestDataAccess) requests.push(
    `${requests.length + 1}. A copy of all personal data held about me that was used as input to this AI system or decision.`
  )
  if (d.requestObjection) requests.push(
    `${requests.length + 1}. Formal registration of my objection to the use of automated decision-making in this case, and confirmation that this objection has been noted.`
  )

  return `${today}

${d.organisationName || '[Organisation Name]'}
[Department / Data Controller]

Dear Sir or Madam,

Re: Formal Request for Explanation and Review of Automated Decision${d.referenceNumber ? ` — Reference: ${d.referenceNumber}` : ''}

I write to formally exercise my rights under ${laws.join('; ')} regarding an automated or AI-assisted decision made about me${d.decisionDate ? ` on ${d.decisionDate}` : ''}.

THE DECISION

${d.decisionType ? `Decision type: ${d.decisionType}.` : ''}
${d.decisionDescription || '[Please describe the decision that was made about you.]'}

HOW THIS HAS AFFECTED ME

${d.impactDescription || '[Please describe the impact of this decision on you.]'}

MY REQUESTS

I respectfully request the following:

${requests.length > 0 ? requests.join('\n\n') : '1. A full explanation of the automated decision made about me.'}

LEGAL BASIS

I understand that the above rights are established under ${laws.join('; ')}. I expect a response within 30 days of receipt of this letter, as required by applicable legislation.

If you are unable to fulfil any of my requests, please provide written reasons for any refusal, together with information about how I may escalate this matter to the relevant supervisory authority.

Yours faithfully,

${d.yourName || '[Your Full Name]'}
${d.yourEmail ? `Email: ${d.yourEmail}` : ''}

—
This letter was generated using BiasLens™ by BeAccessible (beaccessible.co.za). It is provided as a template and does not constitute legal advice. You should verify the applicable legislation for your jurisdiction before sending.`
}

async function generateLetter(d: RequestData): Promise<void> {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = await import('docx')

  const body = buildLetter(d)
  const lines = body.split('\n')

  const children = lines.map(line => {
    const isHeading = line === line.toUpperCase() && line.trim().length > 3 && !line.includes('@') && !line.startsWith('Re:') && !line.startsWith('1.') && !line.startsWith('2.') && !line.startsWith('3.') && !line.startsWith('4.')
    if (isHeading && line.trim()) {
      return new Paragraph({ text: line.trim(), heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 } })
    }
    return new Paragraph({
      spacing: { after: line.trim() ? 120 : 60 },
      children: [new TextRun({ text: line || ' ' })],
    })
  })

  const doc = new Document({
    creator: d.yourName,
    title: `Access Request — ${d.organisationName}`,
    sections: [{
      children: [
        new Paragraph({ text: 'Formal Rights Request', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'AI Decision — Explanation, Review & Data Access', color: '1F3F6B', size: 22 })] }),
        ...children,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `AccessRequest-${(d.organisationName || 'organisation').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────

function Step1({ d, set }: { d: RequestData; set: (k: keyof RequestData, v: unknown) => void }) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.infoBox}>
        This tool helps you write a formal letter to an organisation requesting an explanation of an AI or automated decision that affected you — and asking for a human being to review it.
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>About you</h3>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Your full name <span className={styles.req} aria-hidden="true">*</span></label>
            <input id="name" type="text" className={styles.input} value={d.yourName} onChange={e => set('yourName', e.target.value)} placeholder="Your full name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Your email address</label>
            <input id="email" type="email" className={styles.input} value={d.yourEmail} onChange={e => set('yourEmail', e.target.value)} placeholder="your@email.com" />
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>The organisation and decision</h3>
        <div className={styles.field}>
          <label htmlFor="org" className={styles.label}>Organisation name <span className={styles.req} aria-hidden="true">*</span></label>
          <input id="org" type="text" className={styles.input} value={d.organisationName} onChange={e => set('organisationName', e.target.value)} placeholder="e.g. Acme Bank, City Council, XYZ Employer" />
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="dtype" className={styles.label}>Type of decision</label>
            <select id="dtype" className={styles.select} value={d.decisionType} onChange={e => set('decisionType', e.target.value)}>
              <option value="">Select a decision type…</option>
              {DECISION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="ddate" className={styles.label}>Date of the decision</label>
            <input id="ddate" type="date" className={styles.input} value={d.decisionDate} onChange={e => set('decisionDate', e.target.value)} />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="ref" className={styles.label}>Reference number (if you have one)</label>
          <input id="ref" type="text" className={styles.input} value={d.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} placeholder="Application ref, case number, etc." />
        </div>
        <div className={styles.field}>
          <label htmlFor="desc" className={styles.label}>Describe the decision that was made about you</label>
          <textarea id="desc" className={styles.textarea} rows={3} value={d.decisionDescription} onChange={e => set('decisionDescription', e.target.value)} placeholder="e.g. My loan application was rejected. I was told a credit scoring system was used but received no further explanation…" />
        </div>
        <div className={styles.field}>
          <label htmlFor="impact" className={styles.label}>How has this decision affected you?</label>
          <textarea id="impact" className={styles.textarea} rows={3} value={d.impactDescription} onChange={e => set('impactDescription', e.target.value)} placeholder="e.g. I have been unable to access housing finance and believe I was treated unfairly because the system did not account for my disability…" />
        </div>
      </div>
    </div>
  )
}

function Step2({ d, set }: { d: RequestData; set: (k: keyof RequestData, v: unknown) => void }) {
  return (
    <div className={styles.fieldGroup}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>What do you want to request?</legend>
        <p className={styles.hint}>Select everything that applies. These will be included in your letter.</p>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={d.requestExplanation} onChange={e => set('requestExplanation', e.target.checked)} />
          <span>
            <strong>Explanation of the decision</strong>
            <span className={styles.checkDesc}>Ask the organisation to explain how the AI reached this decision — what data it used and why.</span>
          </span>
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={d.requestHumanReview} onChange={e => set('requestHumanReview', e.target.checked)} />
          <span>
            <strong>Human review</strong>
            <span className={styles.checkDesc}>Ask for a qualified person (not an AI) to review and reconsider the decision.</span>
          </span>
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={d.requestDataAccess} onChange={e => set('requestDataAccess', e.target.checked)} />
          <span>
            <strong>Access to your personal data</strong>
            <span className={styles.checkDesc}>Request a copy of all personal data about you that was used as input to the AI system.</span>
          </span>
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={d.requestObjection} onChange={e => set('requestObjection', e.target.checked)} />
          <span>
            <strong>Formal objection to automated processing</strong>
            <span className={styles.checkDesc}>Object to the use of automated decision-making in your case and ask it to be noted on record.</span>
          </span>
        </label>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Which country are you in?</legend>
        <p className={styles.hint}>This determines which laws are cited in your letter.</p>
        <label className={styles.checkLabel}><input type="checkbox" checked={d.euJurisdiction} onChange={e => set('euJurisdiction', e.target.checked)} /> EU or EEA member state</label>
        <label className={styles.checkLabel}><input type="checkbox" checked={d.saJurisdiction} onChange={e => set('saJurisdiction', e.target.checked)} /> South Africa</label>
        <label className={styles.checkLabel}><input type="checkbox" checked={d.ukJurisdiction} onChange={e => set('ukJurisdiction', e.target.checked)} /> United Kingdom</label>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Are you a disabled person?</legend>
        <p className={styles.hint}>If yes, we will also cite the UN Convention on the Rights of Persons with Disabilities (UNCRPD) in your letter, which provides additional non-discrimination protections.</p>
        <label className={styles.checkLabel}><input type="checkbox" checked={d.isDisabled} onChange={e => set('isDisabled', e.target.checked)} /> Yes, I am a disabled person</label>
      </fieldset>
    </div>
  )
}

function Step3({ d, isGenerating, isComplete, onGenerate }: {
  d: RequestData; isGenerating: boolean; isComplete: boolean; onGenerate: () => void
}) {
  const preview = buildLetter(d)
  const canGenerate = d.yourName && d.organisationName && (d.requestExplanation || d.requestHumanReview || d.requestDataAccess || d.requestObjection)

  return (
    <div className={styles.generatePanel}>
      <div className={styles.previewCard} aria-label="Letter preview">
        <div className={styles.previewHeader}>
          <h3 className={styles.previewTitle}>Letter Preview</h3>
          <span className={styles.previewNote}>Your Word document will match this content</span>
        </div>
        <pre className={styles.previewBody}>{preview}</pre>
      </div>
      <div className={styles.actions}>
        {isComplete ? (
          <div className={styles.successBox} role="status">
            <p>✅ Your access request letter has been downloaded.</p>
            <p className={styles.credit}>Generated by BiasLens™ — BeAccessible</p>
            <p className={styles.legalNote}>This letter is a template and does not constitute legal advice. If your request is refused or ignored, you may escalate to your national supervisory authority (e.g. ICO in the UK, Information Regulator in SA, your national DPA in the EU).</p>
          </div>
        ) : (
          <>
            {!canGenerate && (
              <p className={styles.warning} role="alert">Please go back and fill in your name, the organisation name, and select at least one request type.</p>
            )}
            <button className={styles.btnGenerate} onClick={onGenerate} disabled={isGenerating || !canGenerate} type="button" aria-busy={isGenerating}>
              {isGenerating ? 'Generating your letter…' : '⬇ Download Letter as Word Document'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AccessRequestPage() {
  const [step, setStep]         = useState(1)
  const [data, setData]         = useState<RequestData>(INITIAL)
  const [generating, setGen]    = useState(false)
  const [complete, setComplete] = useState(false)

  const set = useCallback((key: keyof RequestData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }))
  
  }, [])

  const handleGenerate = async () => {
    setGen(true)
    try {
      await generateLetter(data)
      setComplete(true)
    } catch (err) {
      console.error(err)
      alert('An error occurred generating the document. Please try again.')
    } finally {
      setGen(false)
    }
  }

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100)

  return (
    <div className={styles.page}>
      <a href="#step-content" className={styles.skipLink}>Skip to form</a>

      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Access Request Generator</h1>
          <p className={styles.pageSubtitle}>Generate a formal letter requesting explanation and human review of an AI decision</p>
        </div>
        <span className={styles.headerBadge} aria-label="Your rights tool">Your Rights</span>
      </header>

      <nav className={styles.stepper} aria-label="Request steps">
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Step ${step} of ${STEPS.length}`} />
        </div>
        <ol className={styles.stepList}>
          {STEPS.map(s => (
            <li key={s.id} className={`${styles.stepItem} ${step === s.id ? styles.stepCurrent : ''} ${step > s.id ? styles.stepDone : ''}`} aria-current={step === s.id ? 'step' : undefined}>
              <span className={styles.stepDot} aria-hidden="true">{step > s.id ? '✓' : s.id}</span>
              <span className={styles.stepName}>{s.title}</span>
            </li>
          ))}
        </ol>
      </nav>

      <main id="step-content" className={styles.main}>
        <div className={styles.stepHeading}>
          <h2 className={styles.stepTitle}>{STEPS[step - 1].title}</h2>
          <p className={styles.stepDesc}>{STEPS[step - 1].description}</p>
        </div>

        <section aria-label={`Step ${step}: ${STEPS[step - 1].title}`}>
          {step === 1 && <Step1 d={data} set={set} />}
          {step === 2 && <Step2 d={data} set={set} />}
          {step === 3 && <Step3 d={data} isGenerating={generating} isComplete={complete} onGenerate={handleGenerate} />}
        </section>

        <div className={styles.navBar}>
          {step > 1 && <button className={styles.btnBack} onClick={() => setStep(s => s - 1)} type="button">← Previous</button>}
          <span className={styles.stepCount} aria-hidden="true">Step {step} of {STEPS.length}</span>
          {step < STEPS.length && <button className={styles.btnNext} onClick={() => setStep(s => s + 1)} type="button">Continue →</button>}
        </div>
      </main>
    </div>
  )
}
