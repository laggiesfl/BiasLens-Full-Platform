'use client'

import { useState, useCallback } from 'react'
import styles from './fria-builder.module.css'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Not Assessed'

interface RightAssessment {
  risk: RiskLevel
  notes: string
}

interface FRIAFormData {
  // Step 1 — Organisation
  organisationName: string
  completedBy: string
  completionDate: string
  reviewDate: string
  // Step 2 — System
  systemName: string
  systemDescription: string
  vendor: string
  deploymentDate: string
  // Step 3 — Jurisdiction
  sector: string
  euJurisdiction: boolean
  saJurisdiction: boolean
  estimatedAffected: string
  annexIIICategory: string
  // Step 4 — Groups
  affectedGroups: string
  vulnerableGroups: string[]
  // Step 5 — Rights
  rights: {
    nonDiscrimination: RightAssessment
    privacy: RightAssessment
    humanOversight: RightAssessment
    explanation: RightAssessment
    disabilityAccommodation: RightAssessment
    appealAndRedress: RightAssessment
    equalTreatment: RightAssessment
  }
  // Step 6 — Safeguards
  existingSafeguards: string
  identifiedGaps: string
  plannedMitigations: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Organisation & Assessor', description: 'Who is completing this assessment?' },
  { id: 2, title: 'System Identification', description: 'Which AI system are you assessing?' },
  { id: 3, title: 'Jurisdiction & Classification', description: 'Where and how does this system operate?' },
  { id: 4, title: 'Affected Groups', description: 'Who is impacted by this system?' },
  { id: 5, title: 'Rights Assessment', description: 'What fundamental rights are at risk?' },
  { id: 6, title: 'Safeguards & Mitigations', description: 'What protections exist or are planned?' },
  { id: 7, title: 'Review & Generate', description: 'Download your completed FRIA document' },
]

const SECTORS = [
  'Human Resources & Recruitment',
  'Financial Services & Insurance',
  'Healthcare & Medical',
  'Education & Vocational Training',
  'Public Services & Benefits',
  'Law Enforcement & Justice',
  'Migration & Asylum',
  'Critical Infrastructure',
  'Other',
]

const ANNEX_III_CATEGORIES = [
  'Biometric identification and categorisation of natural persons',
  'Management and operation of critical infrastructure',
  'Education and vocational training',
  'Employment, workers management and access to self-employment',
  'Access to and enjoyment of essential private and public services and benefits',
  'Law enforcement',
  'Migration, asylum and border control management',
  'Administration of justice and democratic processes',
]

const VULNERABLE_GROUPS = [
  'Disabled people',
  'Older persons',
  'Children and young people',
  'Racial and ethnic minorities',
  'Women and gender minorities',
  'Low-income groups',
  'Refugees and asylum seekers',
  'LGBTQ+ individuals',
  'Rural and remote communities',
  'Other',
]

const RIGHTS = [
  { key: 'nonDiscrimination',     label: 'Right to Non-Discrimination',                  ref: 'EU Charter Art. 21; UNCRPD Art. 5' },
  { key: 'privacy',               label: 'Right to Privacy and Data Protection',          ref: 'EU Charter Art. 7–8; GDPR; POPIA' },
  { key: 'humanOversight',        label: 'Right to Human Oversight',                      ref: 'EU AI Act Art. 14; UNCRPD Art. 12' },
  { key: 'explanation',           label: 'Right to Explanation of Automated Decisions',   ref: 'GDPR Art. 22; EU AI Act Art. 86' },
  { key: 'disabilityAccommodation', label: 'Right to Reasonable Accommodation',           ref: 'UNCRPD Art. 5(3); EU Equality Directive' },
  { key: 'appealAndRedress',      label: 'Right to Appeal and Redress',                   ref: 'EU AI Act Art. 85; POPIA Ch. 3' },
  { key: 'equalTreatment',        label: 'Right to Equal Treatment',                      ref: 'EU Charter Art. 20; SA Constitution Sec. 9' },
]

const INITIAL_DATA: FRIAFormData = {
  organisationName: '',
  completedBy: '',
  completionDate: new Date().toISOString().split('T')[0],
  reviewDate: '',
  systemName: '',
  systemDescription: '',
  vendor: '',
  deploymentDate: '',
  sector: '',
  euJurisdiction: false,
  saJurisdiction: false,
  estimatedAffected: '',
  annexIIICategory: '',
  affectedGroups: '',
  vulnerableGroups: [],
  rights: {
    nonDiscrimination:      { risk: 'Not Assessed', notes: '' },
    privacy:                { risk: 'Not Assessed', notes: '' },
    humanOversight:         { risk: 'Not Assessed', notes: '' },
    explanation:            { risk: 'Not Assessed', notes: '' },
    disabilityAccommodation:{ risk: 'Not Assessed', notes: '' },
    appealAndRedress:       { risk: 'Not Assessed', notes: '' },
    equalTreatment:         { risk: 'Not Assessed', notes: '' },
  },
  existingSafeguards: '',
  identifiedGaps: '',
  plannedMitigations: '',
}

// ─── DOCUMENT GENERATION ─────────────────────────────────────────────────────

async function generateFRIA(data: FRIAFormData): Promise<void> {
  const {
    Document, Paragraph, TextRun, HeadingLevel, Packer,
    AlignmentType, Table, TableRow, TableCell, WidthType,
  } = await import('docx')

  const riskHex = (r: RiskLevel) =>
    r === 'High' ? 'C0392B' : r === 'Medium' ? 'E67E22' : r === 'Low' ? '27AE60' : '7F8C8D'

  const h = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) =>
    new Paragraph({ text, heading: level, spacing: { before: 320, after: 160 } })

  const p = (text: string) =>
    new Paragraph({ text, spacing: { after: 160 } })

  const bold = (label: string, value: string) =>
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: label, bold: true }), new TextRun({ text: value })],
    })

  const rightsRows = RIGHTS.map(right => {
    const a = data.rights[right.key as keyof typeof data.rights]
    return new TableRow({
      children: [
        new TableCell({ width: { size: 32, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: right.label })] }),
        new TableCell({ width: { size: 22, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: right.ref })] }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: a.risk, bold: true, color: riskHex(a.risk) })] })],
        }),
        new TableCell({ width: { size: 32, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: a.notes || '—' })] }),
      ],
    })
  })

  const doc = new Document({
    creator: data.completedBy,
    title: `FRIA — ${data.systemName}`,
    description: 'Fundamental Rights Impact Assessment — EU AI Act Article 27',
    sections: [{
      children: [
        // Cover
        new Paragraph({ text: 'Fundamental Rights Impact Assessment', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 }, children: [new TextRun({ text: 'EU AI Act Article 27 — Deployer Assessment', color: '1F3F6B', size: 24 })] }),
        bold('AI System: ',        data.systemName       || '—'),
        bold('Organisation: ',     data.organisationName || '—'),
        bold('Completed by: ',     data.completedBy      || '—'),
        bold('Date of assessment: ', data.completionDate || '—'),
        bold('Next review date: ', data.reviewDate       || '—'),

        // 1. Legal basis
        h('1. Legal Basis and Purpose', HeadingLevel.HEADING_1),
        p('This Fundamental Rights Impact Assessment (FRIA) is completed pursuant to Article 27 of Regulation (EU) 2024/1689 (EU AI Act). Deployers of high-risk AI systems listed in Annex III must assess the impact on fundamental rights before the system is put into service.'),
        p('This document must be retained for at least 10 years and made available to the relevant national supervisory authority on request.'),

        // 2. System
        h('2. System Identification', HeadingLevel.HEADING_1),
        bold('2.1 System name: ',        data.systemName        || '—'),
        bold('2.2 Vendor / developer: ', data.vendor            || '—'),
        bold('2.3 Deployment date: ',    data.deploymentDate    || '—'),
        p('2.4 Description and intended purpose:'),
        p(data.systemDescription || 'Not provided.'),

        // 3. Jurisdiction
        h('3. Jurisdiction and Classification', HeadingLevel.HEADING_1),
        bold('3.1 Sector: ',           data.sector            || '—'),
        bold('3.2 EU / EEA affected: ', data.euJurisdiction ? 'Yes' : 'No'),
        bold('3.3 South Africa affected: ', data.saJurisdiction ? 'Yes' : 'No'),
        bold('3.4 Estimated people affected per year: ', data.estimatedAffected || '—'),
        bold('3.5 Annex III category: ', data.annexIIICategory  || '—'),

        // 4. Affected groups
        h('4. Affected Groups', HeadingLevel.HEADING_1),
        p('4.1 Description of affected groups:'),
        p(data.affectedGroups || 'Not provided.'),
        bold('4.2 Vulnerable groups identified: ', data.vulnerableGroups.length > 0 ? data.vulnerableGroups.join(', ') : 'None specified'),

        // 5. Rights table
        h('5. Fundamental Rights Assessment', HeadingLevel.HEADING_1),
        p('Risk levels: Low = minimal, mitigated impact; Medium = moderate, partially mitigated; High = significant, requires urgent action; Not Assessed = pending.'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fundamental Right', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 32, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Legal Reference', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 22, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Risk', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 14, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Assessment Notes', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 32, type: WidthType.PERCENTAGE } }),
              ],
            }),
            ...rightsRows,
          ],
        }),

        // 6. Safeguards
        h('6. Safeguards and Mitigations', HeadingLevel.HEADING_1),
        p('6.1 Existing safeguards:'),
        p(data.existingSafeguards || 'Not provided.'),
        p('6.2 Identified gaps:'),
        p(data.identifiedGaps || 'Not provided.'),
        p('6.3 Planned mitigations:'),
        p(data.plannedMitigations || 'Not provided.'),

        // 7. Conclusion
        h('7. Conclusion and Certification', HeadingLevel.HEADING_1),
        p('The assessor certifies that the information provided is accurate and complete to the best of their knowledge, and that this assessment was completed in accordance with EU AI Act Article 27.'),
        bold('Completed by: ', data.completedBy      || '—'),
        bold('Organisation: ', data.organisationName || '—'),
        bold('Date: ',         data.completionDate   || '—'),
        bold('Next review: ', data.reviewDate        || '—'),

        // Appendix
        h('Appendix: Legal References', HeadingLevel.HEADING_1),
        p('• EU AI Act (Regulation 2024/1689), Article 27 — Fundamental Rights Impact Assessment'),
        p('• EU AI Act, Annex III — High-Risk AI System Categories'),
        p('• EU Charter of Fundamental Rights, Articles 7, 8, 20, 21'),
        p('• GDPR (Regulation 2016/679), Article 22 — Automated Individual Decision-Making'),
        p('• UNCRPD (UN Convention on the Rights of Persons with Disabilities), Articles 5, 12, 13'),
        p('• South Africa: POPIA (Protection of Personal Information Act 4 of 2013), Section 71'),
        p('• South Africa: Constitution, Section 9 (Equality) and Section 14 (Privacy)'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480 },
          children: [new TextRun({ text: 'Generated by BiasLens™ — algorithmic bias testing and accountability by BeAccessible (beaccessible.co.za)', color: '1F3F6B', italics: true })],
        }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `FRIA-${(data.systemName || 'assessment').replace(/\s+/g, '-')}-${data.completionDate}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className={styles.fieldGroup}>{children}</div>
}

function Field({ id, label, hint, required, children }: { id: string; label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}{required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
    </div>
  )
}

function Step1({ data, update }: { data: FRIAFormData; update: (k: keyof FRIAFormData, v: unknown) => void }) {
  return (
    <FieldGroup>
      <Field id="orgName" label="Organisation name" required>
        <input id="orgName" type="text" className={styles.input} value={data.organisationName} onChange={e => update('organisationName', e.target.value)} aria-required="true" placeholder="e.g. Acme Financial Services Ltd" />
      </Field>
      <Field id="completedBy" label="Completed by" required hint="Include name and role, e.g. Jane Smith, Chief Compliance Officer">
        <input id="completedBy" type="text" className={styles.input} value={data.completedBy} onChange={e => update('completedBy', e.target.value)} aria-required="true" aria-describedby="completedBy-hint" placeholder="Name and role" />
      </Field>
      <Field id="completionDate" label="Date of assessment">
        <input id="completionDate" type="date" className={styles.input} value={data.completionDate} onChange={e => update('completionDate', e.target.value)} />
      </Field>
      <Field id="reviewDate" label="Next scheduled review date" hint="EU AI Act requires periodic review. We recommend annually or on any significant system change.">
        <input id="reviewDate" type="date" className={styles.input} value={data.reviewDate} onChange={e => update('reviewDate', e.target.value)} aria-describedby="reviewDate-hint" />
      </Field>
    </FieldGroup>
  )
}

function Step2({ data, update }: { data: FRIAFormData; update: (k: keyof FRIAFormData, v: unknown) => void }) {
  return (
    <FieldGroup>
      <Field id="systemName" label="AI system name" required>
        <input id="systemName" type="text" className={styles.input} value={data.systemName} onChange={e => update('systemName', e.target.value)} aria-required="true" placeholder="e.g. HireAI Resume Screening System" />
      </Field>
      <Field id="systemDesc" label="Description and intended purpose">
        <textarea id="systemDesc" className={styles.textarea} rows={4} value={data.systemDescription} onChange={e => update('systemDescription', e.target.value)} placeholder="Describe what this AI system does and what decisions it supports or makes..." />
      </Field>
      <Field id="vendor" label="Vendor / Developer">
        <input id="vendor" type="text" className={styles.input} value={data.vendor} onChange={e => update('vendor', e.target.value)} placeholder="Name of the company that developed or supplies this system" />
      </Field>
      <Field id="deployDate" label="Date of deployment (or planned deployment)">
        <input id="deployDate" type="date" className={styles.input} value={data.deploymentDate} onChange={e => update('deploymentDate', e.target.value)} />
      </Field>
    </FieldGroup>
  )
}

function Step3({ data, update }: { data: FRIAFormData; update: (k: keyof FRIAFormData, v: unknown) => void }) {
  return (
    <FieldGroup>
      <Field id="sector" label="Sector">
        <select id="sector" className={styles.select} value={data.sector} onChange={e => update('sector', e.target.value)}>
          <option value="">Select a sector…</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Jurisdictions affected</legend>
        <label className={styles.checkboxLabel}><input type="checkbox" checked={data.euJurisdiction} onChange={e => update('euJurisdiction', e.target.checked)} /> EU / EEA — EU AI Act applies</label>
        <label className={styles.checkboxLabel}><input type="checkbox" checked={data.saJurisdiction} onChange={e => update('saJurisdiction', e.target.checked)} /> South Africa — POPIA applies</label>
      </fieldset>
      <Field id="affected" label="Estimated number of people affected per year">
        <input id="affected" type="text" className={styles.input} value={data.estimatedAffected} onChange={e => update('estimatedAffected', e.target.value)} placeholder="e.g. 5,000 job applicants" />
      </Field>
      <Field id="annexIII" label="EU AI Act Annex III category" hint="Select the category that best describes where this system is deployed.">
        <select id="annexIII" className={styles.select} value={data.annexIIICategory} onChange={e => update('annexIIICategory', e.target.value)} aria-describedby="annexIII-hint">
          <option value="">Select an Annex III category…</option>
          {ANNEX_III_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
    </FieldGroup>
  )
}

function Step4({ data, update, toggleGroup }: { data: FRIAFormData; update: (k: keyof FRIAFormData, v: unknown) => void; toggleGroup: (g: string) => void }) {
  return (
    <FieldGroup>
      <Field id="affectedGroups" label="Description of all groups affected by this system">
        <textarea id="affectedGroups" className={styles.textarea} rows={4} value={data.affectedGroups} onChange={e => update('affectedGroups', e.target.value)} placeholder="e.g. All individuals who submit job applications to our organisation — approximately 5,000 per year…" />
      </Field>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Vulnerable groups at heightened risk</legend>
        <p className={styles.hint}>Select all groups who may face a higher risk of harm from this AI system.</p>
        <div className={styles.checkboxGrid}>
          {VULNERABLE_GROUPS.map(g => (
            <label key={g} className={styles.checkboxLabel}>
              <input type="checkbox" checked={data.vulnerableGroups.includes(g)} onChange={() => toggleGroup(g)} />
              {g}
            </label>
          ))}
        </div>
      </fieldset>
    </FieldGroup>
  )
}

function Step5({ data, updateRight }: { data: FRIAFormData; updateRight: (key: string, field: 'risk' | 'notes', value: string) => void }) {
  return (
    <FieldGroup>
      <p className={styles.sectionNote}>For each fundamental right, assess the risk this AI system poses and add justification notes. This is the core of your Article 27 FRIA.</p>
      {RIGHTS.map(right => {
        const a = data.rights[right.key as keyof typeof data.rights]
        return (
          <div key={right.key} className={styles.rightCard} aria-label={right.label}>
            <div className={styles.rightHeader}>
              <h3 className={styles.rightTitle}>{right.label}</h3>
              <span className={styles.rightRef}>{right.ref}</span>
            </div>
            <div className={styles.rightFields}>
              <div className={styles.field}>
                <label htmlFor={`risk-${right.key}`} className={styles.label}>Risk level</label>
                <select id={`risk-${right.key}`} className={`${styles.select} ${styles[`risk${a.risk.replace(' ', '')}`]}`} value={a.risk} onChange={e => updateRight(right.key, 'risk', e.target.value)}>
                  <option value="Not Assessed">Not Assessed</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor={`notes-${right.key}`} className={styles.label}>Assessment notes</label>
                <textarea id={`notes-${right.key}`} className={styles.textarea} rows={2} value={a.notes} onChange={e => updateRight(right.key, 'notes', e.target.value)} placeholder="Explain the risk level, or note why it is low or not applicable…" />
              </div>
            </div>
          </div>
        )
      })}
    </FieldGroup>
  )
}

function Step6({ data, update }: { data: FRIAFormData; update: (k: keyof FRIAFormData, v: unknown) => void }) {
  return (
    <FieldGroup>
      <Field id="safeguards" label="Existing safeguards">
        <textarea id="safeguards" className={styles.textarea} rows={4} value={data.existingSafeguards} onChange={e => update('existingSafeguards', e.target.value)} placeholder="Describe safeguards already in place — human oversight, audit trails, appeal mechanisms, accessibility accommodations…" />
      </Field>
      <Field id="gaps" label="Identified gaps">
        <textarea id="gaps" className={styles.textarea} rows={4} value={data.identifiedGaps} onChange={e => update('identifiedGaps', e.target.value)} placeholder="Describe areas where safeguards are insufficient or absent…" />
      </Field>
      <Field id="mitigations" label="Planned mitigations">
        <textarea id="mitigations" className={styles.textarea} rows={4} value={data.plannedMitigations} onChange={e => update('plannedMitigations', e.target.value)} placeholder="Describe what actions will be taken to address identified gaps, with timelines…" />
      </Field>
    </FieldGroup>
  )
}

function Step7({ data, isGenerating, isComplete, onGenerate }: { data: FRIAFormData; isGenerating: boolean; isComplete: boolean; onGenerate: () => void }) {
  const highRiskRights = RIGHTS.filter(r => data.rights[r.key as keyof typeof data.rights].risk === 'High').map(r => r.label)
  return (
    <div className={styles.reviewPanel}>
      <div className={styles.summary} aria-label="Assessment summary">
        <h3 className={styles.summaryTitle}>Assessment Summary</h3>
        <dl className={styles.summaryList}>
          {[
            ['Organisation', data.organisationName],
            ['AI System',    data.systemName],
            ['Sector',       data.sector],
            ['Date',         data.completionDate],
            ['EU Jurisdiction', data.euJurisdiction ? 'Yes' : 'No'],
            ['SA Jurisdiction', data.saJurisdiction ? 'Yes' : 'No'],
            ['Vulnerable groups', data.vulnerableGroups.length > 0 ? data.vulnerableGroups.join(', ') : 'None selected'],
            ['High-risk rights', highRiskRights.length > 0 ? highRiskRights.join(', ') : 'None identified'],
          ].map(([dt, dd]) => (
            <div key={dt} className={styles.summaryRow}>
              <dt>{dt}</dt>
              <dd>{dd || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
      {highRiskRights.length > 0 && (
        <div className={styles.alert} role="alert">
          <strong>⚠ Attention required:</strong> You have identified {highRiskRights.length} high-risk fundamental right{highRiskRights.length > 1 ? 's' : ''}. These must be addressed before or immediately after deployment.
        </div>
      )}
      <div className={styles.generateArea}>
        <p className={styles.generateNote}>
          Your completed FRIA will be generated as a Word document and downloaded immediately. Retain this document for at least 10 years as required by EU AI Act Article 27.
        </p>
        {isComplete ? (
          <div className={styles.successBox} role="status">
            <p>✅ Your FRIA document has been downloaded.</p>
            <p className={styles.credit}>Generated by BiasLens™ — BeAccessible</p>
          </div>
        ) : (
          <button className={styles.btnGenerate} onClick={onGenerate} disabled={isGenerating} type="button" aria-busy={isGenerating}>
            {isGenerating ? 'Generating your FRIA document…' : '⬇ Download FRIA as Word Document'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FRIABuilderPage() {
  const [step, setStep]         = useState(1)
  const [data, setData]         = useState<FRIAFormData>(INITIAL_DATA)
  const [generating, setGen]    = useState(false)
  const [complete, setComplete] = useState(false)

  const update = useCallback((key: keyof FRIAFormData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }))
  
  }, [])

  const updateRight = useCallback((rightKey: string, field: 'risk' | 'notes', value: string) => {
    setData(prev => ({
      ...prev,
      rights: {
        ...prev.rights,
        [rightKey]: { ...prev.rights[rightKey as keyof typeof prev.rights], [field]: value },
      },
    }))
  }, [])

  const toggleGroup = useCallback((group: string) => {
    setData(prev => ({
      ...prev,
      vulnerableGroups: prev.vulnerableGroups.includes(group)
        ? prev.vulnerableGroups.filter(g => g !== group)
        : [...prev.vulnerableGroups, group],
    }))
  }, [])

  const handleGenerate = async () => {
    setGen(true)
    try {
      await generateFRIA(data)
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
      {/* Skip link */}
      <a href="#step-content" className={styles.skipLink}>Skip to form</a>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>AIA / FRIA Builder</h1>
          <p className={styles.pageSubtitle}>Article 27, EU AI Act — Fundamental Rights Impact Assessment</p>
        </div>
        <span className={styles.legalBadge} aria-label="EU AI Act Article 27 compliant tool">EU AI Act · Art. 27</span>
      </header>

      {/* Progress */}
      <nav className={styles.stepper} aria-label="Assessment steps">
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={`Step ${step} of ${STEPS.length}: ${STEPS[step - 1].title}`}
          />
        </div>
        <ol className={styles.stepList} aria-label="Step list">
          {STEPS.map(s => (
            <li
              key={s.id}
              className={`${styles.stepItem} ${step === s.id ? styles.stepCurrent : ''} ${step > s.id ? styles.stepDone : ''}`}
              aria-current={step === s.id ? 'step' : undefined}
            >
              <span className={styles.stepDot} aria-hidden="true">{step > s.id ? '✓' : s.id}</span>
              <span className={styles.stepName}>{s.title}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <main id="step-content" className={styles.main}>
        <div className={styles.stepHeading}>
          <h2 className={styles.stepTitle}>{STEPS[step - 1].title}</h2>
          <p className={styles.stepDesc}>{STEPS[step - 1].description}</p>
        </div>

        <section aria-label={`Step ${step}: ${STEPS[step - 1].title}`}>
          {step === 1 && <Step1 data={data} update={update} />}
          {step === 2 && <Step2 data={data} update={update} />}
          {step === 3 && <Step3 data={data} update={update} />}
          {step === 4 && <Step4 data={data} update={update} toggleGroup={toggleGroup} />}
          {step === 5 && <Step5 data={data} updateRight={updateRight} />}
          {step === 6 && <Step6 data={data} update={update} />}
          {step === 7 && <Step7 data={data} isGenerating={generating} isComplete={complete} onGenerate={handleGenerate} />}
        </section>

        {/* Navigation */}
        <div className={styles.navBar}>
          {step > 1 && (
            <button className={styles.btnBack} onClick={() => setStep(s => s - 1)} type="button">
              ← Previous
            </button>
          )}
          <span className={styles.stepCount} aria-hidden="true">Step {step} of {STEPS.length}</span>
          {step < STEPS.length && (
            <button className={styles.btnNext} onClick={() => setStep(s => s + 1)} type="button">
              Continue →
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
