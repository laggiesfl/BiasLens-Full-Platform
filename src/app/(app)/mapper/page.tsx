'use client'

import { useState, useCallback, useMemo } from 'react'
import styles from './compliance-mapper.module.css'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | 'Not Applicable'

interface SystemInfo {
  organisationName: string
  completedBy: string
  date: string
  name: string
  description: string
  sector: string
  makesAutomatedDecisions: boolean
  affectsDisabledPeople: boolean
  euJurisdiction: boolean
  saJurisdiction: boolean
  ukJurisdiction: boolean
}

interface ComplianceItem {
  id: string
  framework: string
  article: string
  title: string
  summary: string
  requirement: string
  note?: string
  applies: (i: SystemInfo) => boolean
  priority: (i: SystemInfo) => Priority
}

// ─── COMPLIANCE DATABASE ──────────────────────────────────────────────────────

const RULES: ComplianceItem[] = [
  {
    id: 'euaia-annex3',
    framework: 'EU AI Act',
    article: 'Annex III + Articles 6–16',
    title: 'High-Risk AI System Classification',
    summary: 'Confirm whether your system falls under one of the eight Annex III categories.',
    requirement: 'Annex III lists eight categories of high-risk AI systems (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, justice). If your system falls into any category, Articles 6–16 apply in full — including conformity assessment, technical documentation, human oversight, accuracy, robustness, and cybersecurity requirements. You must register the system in the EU database before deployment.',
    applies: (i) => i.euJurisdiction,
    priority: (i) => i.euJurisdiction ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'euaia-9',
    framework: 'EU AI Act',
    article: 'Article 9',
    title: 'Risk Management System',
    summary: 'Establish and maintain a documented AI risk management system.',
    requirement: 'Implement a continuous, iterative risk management process that identifies, analyses, and estimates known and reasonably foreseeable risks to health, safety, and fundamental rights. The system must be reviewed and updated throughout the AI lifecycle.',
    applies: (i) => i.euJurisdiction,
    priority: (i) => i.euJurisdiction ? 'High' : 'Not Applicable',
  },
  {
    id: 'euaia-13',
    framework: 'EU AI Act',
    article: 'Article 13',
    title: 'Transparency and Information Provision',
    summary: 'AI systems must be sufficiently transparent for deployers and users to interpret outputs.',
    requirement: 'Ensure the AI system provides clear, accessible documentation about its capabilities, limitations, and intended purpose. Users must be able to interpret outputs appropriately. Plain-language technical documentation is required.',
    applies: (i) => i.euJurisdiction,
    priority: (i) => i.euJurisdiction ? 'High' : 'Not Applicable',
  },
  {
    id: 'euaia-14',
    framework: 'EU AI Act',
    article: 'Article 14',
    title: 'Human Oversight',
    summary: 'Deployers must enable effective human oversight of high-risk AI systems.',
    requirement: 'Implement measures enabling humans to monitor, pause, override, or shut down the AI system. Assign qualified persons to oversight roles. Document oversight procedures and maintain audit logs. Oversight must be proportionate to the risk level of the system.',
    applies: (i) => i.euJurisdiction && i.makesAutomatedDecisions,
    priority: (i) => i.euJurisdiction && i.makesAutomatedDecisions ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'euaia-27',
    framework: 'EU AI Act',
    article: 'Article 27',
    title: 'Fundamental Rights Impact Assessment (FRIA)',
    summary: 'Deployers of high-risk AI systems must complete a FRIA before deployment.',
    requirement: 'Complete a Fundamental Rights Impact Assessment covering: purpose and foreseeable uses, rights at risk, probability and severity of impact, existing safeguards, and affected groups. Retain the FRIA for at least 10 years. Make it available to national supervisory authority on request.',
    applies: (i) => i.euJurisdiction && i.makesAutomatedDecisions,
    priority: (i) => i.euJurisdiction && i.makesAutomatedDecisions ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'euaia-86',
    framework: 'EU AI Act',
    article: 'Article 86',
    title: 'Right to Explanation of AI Decisions',
    summary: 'Individuals affected by high-risk AI decisions have the right to an explanation.',
    requirement: 'Provide meaningful, plain-language explanations to natural persons when an AI-assisted decision significantly affects them. Explanations must cover the decision logic, data used, and the decision\'s consequences. A human review option must be available.',
    applies: (i) => i.euJurisdiction && i.makesAutomatedDecisions,
    priority: (i) => i.euJurisdiction && i.makesAutomatedDecisions ? 'High' : 'Not Applicable',
  },
  {
    id: 'gdpr-22',
    framework: 'GDPR',
    article: 'Article 22',
    title: 'Automated Individual Decision-Making',
    summary: 'Individuals have the right not to be subject to solely automated decisions with significant effects.',
    requirement: 'Obtain explicit consent, or demonstrate legal basis, for automated decisions with significant effects on individuals. Provide the right to request human review. Inform individuals clearly when decisions are made by automated means. Document the legal basis for each automated decision process.',
    applies: (i) => i.euJurisdiction && i.makesAutomatedDecisions,
    priority: (i) => i.euJurisdiction && i.makesAutomatedDecisions ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'gdpr-35',
    framework: 'GDPR',
    article: 'Article 35',
    title: 'Data Protection Impact Assessment (DPIA)',
    summary: 'A DPIA is required before deploying AI systems that involve high-risk personal data processing.',
    requirement: 'Conduct a DPIA before deploying any AI system that processes personal data in a manner likely to result in high risk to individuals. If the DPIA identifies residual high risks, consult the supervisory authority before proceeding. The DPIA must be documented and reviewed regularly.',
    applies: (i) => i.euJurisdiction,
    priority: (i) => i.euJurisdiction ? 'High' : 'Not Applicable',
  },
  {
    id: 'popia-71',
    framework: 'POPIA',
    article: 'Section 71',
    title: 'Automated Decision-Making (South Africa)',
    summary: 'Data subjects in South Africa have the right to object to solely automated decisions.',
    requirement: 'Notify data subjects when decisions affecting them are made solely by automated means. Provide the right to request human review of automated decisions. Document all automated decision-making processes. Ensure data subjects can object and have their objection meaningfully considered.',
    applies: (i) => i.saJurisdiction && i.makesAutomatedDecisions,
    priority: (i) => i.saJurisdiction && i.makesAutomatedDecisions ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'popia-general',
    framework: 'POPIA',
    article: 'Chapters 2–3',
    title: 'Lawful Processing Conditions',
    summary: 'All personal data processed by the AI system must meet POPIA\'s eight conditions.',
    requirement: 'Ensure the AI system processes personal data lawfully: accountably (appoint an Information Officer), purposefully (defined purpose), minimally (only necessary data), accurately (keep data current), with transparency (inform data subjects), securely (appropriate safeguards), and with data subject participation rights. Register with the Information Regulator if required.',
    applies: (i) => i.saJurisdiction,
    priority: (i) => i.saJurisdiction ? 'High' : 'Not Applicable',
  },
  {
    id: 'eea-sa',
    framework: 'EEA (South Africa)',
    article: 'Sections 6 + 20',
    title: 'Unfair Discrimination in Employment',
    summary: 'AI-assisted employment decisions must not unfairly discriminate under the Employment Equity Act.',
    requirement: 'Ensure AI systems used in hiring, promotion, termination, or performance management do not unfairly discriminate on the grounds of race, gender, sex, pregnancy, marital status, family responsibility, ethnic origin, colour, sexual orientation, age, disability, religion, conscience, belief, political opinion, culture, language, or birth. Employment Equity Plans must account for algorithmic bias. Conduct an annual bias audit of any AI tool used in employment decisions.',
    applies: (i) => i.saJurisdiction && i.sector === 'Human Resources & Recruitment',
    priority: (i) => i.saJurisdiction && i.sector === 'Human Resources & Recruitment' ? 'Critical' : 'Not Applicable',
  },
  {
    id: 'sa-ai-policy',
    framework: 'SA AI Policy Framework',
    article: 'Core Principles',
    title: 'Responsible AI Principles (South Africa)',
    summary: 'South Africa\'s national AI framework sets out responsible AI principles for organisations operating in SA.',
    requirement: 'Align the AI system with South Africa\'s responsible AI principles: human-centred design, inclusivity and accessibility, accountability and governance, transparency, safety and security, and privacy. Adopt a responsible AI policy and document how each principle is addressed.',
    note: 'The SA National AI Policy Framework is in draft form. Verify current status with the Department of Communications and Digital Technologies before final compliance documentation.',
    applies: (i) => i.saJurisdiction,
    priority: (i) => i.saJurisdiction ? 'Medium' : 'Not Applicable',
  },
  {
    id: 'uncrpd-5',
    framework: 'UNCRPD',
    article: 'Article 5',
    title: 'Non-Discrimination for Disabled People',
    summary: 'AI systems must not discriminate against disabled people.',
    requirement: 'Test AI system outputs for disparate impact on disabled people before and during deployment. Document bias testing results. Provide reasonable accommodation in all AI-mediated processes. Ensure appeals and redress mechanisms are accessible to disabled people.',
    applies: (i) => i.affectsDisabledPeople,
    priority: (i) => i.affectsDisabledPeople ? 'High' : 'Not Applicable',
  },
  {
    id: 'uncrpd-9',
    framework: 'UNCRPD',
    article: 'Article 9',
    title: 'Accessibility of AI Interfaces',
    summary: 'All AI system interfaces must be accessible to disabled people.',
    requirement: 'Ensure AI system user interfaces meet WCAG 2.1 AA as a minimum (AAA recommended). Provide alternative formats and accessible communication channels for all outputs and notifications. Document accessibility compliance and audit annually.',
    applies: (i) => i.affectsDisabledPeople,
    priority: (i) => i.affectsDisabledPeople ? 'High' : 'Not Applicable',
  },
  {
    id: 'uk-ai',
    framework: 'UK AI Governance',
    article: 'ICO Guidance + AI Principles',
    title: 'UK Responsible AI Framework',
    summary: 'UK organisations must apply ICO guidance and UK AI principles to AI systems affecting UK residents.',
    requirement: 'Apply the ICO\'s Accountability Framework for AI, including documentation of data flows, algorithmic impact assessments, and transparency notices. Align with the UK AI Principles: safety, security and robustness; appropriate transparency and explainability; fairness; accountability and governance; contestability and redress.',
    note: 'The UK AI regulatory framework is evolving and does not yet have a single AI Act equivalent. Verify current ICO and DSIT guidance before relying on this mapping.',
    applies: (i) => i.ukJurisdiction,
    priority: (i) => i.ukJurisdiction ? 'Medium' : 'Not Applicable',
  },
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

const STEPS = [
  { id: 1, title: 'System Overview',       description: 'Who are you and what AI system are you mapping?' },
  { id: 2, title: 'Jurisdiction & Impact', description: 'Where does this system operate and who does it affect?' },
  { id: 3, title: 'Compliance Map',        description: 'Your regulatory obligations, mapped and prioritised.' },
  { id: 4, title: 'Download Report',       description: 'Get your full compliance mapping as a Word document.' },
]

const INITIAL: SystemInfo = {
  organisationName: '',
  completedBy: '',
  date: new Date().toISOString().split('T')[0],
  name: '',
  description: '',
  sector: '',
  makesAutomatedDecisions: false,
  affectsDisabledPeople: false,
  euJurisdiction: false,
  saJurisdiction: false,
  ukJurisdiction: false,
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Priority[] = ['Critical', 'High', 'Medium', 'Low', 'Not Applicable']

function priorityClass(p: Priority): string {
  if (p === 'Critical')       return styles.critical
  if (p === 'High')           return styles.high
  if (p === 'Medium')         return styles.medium
  if (p === 'Low')            return styles.low
  return styles.na
}

function priorityHex(p: Priority): string {
  if (p === 'Critical') return 'C0392B'
  if (p === 'High')     return 'E67E22'
  if (p === 'Medium')   return 'D4AC0D'
  if (p === 'Low')      return '1E8449'
  return '95A5A6'
}

// ─── DOCUMENT GENERATION ─────────────────────────────────────────────────────

async function generateReport(info: SystemInfo, applicable: ComplianceItem[]): Promise<void> {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, Table, TableRow, TableCell, WidthType } = await import('docx')

  const h = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) =>
    new Paragraph({ text, heading: level, spacing: { before: 320, after: 160 } })

  const p = (text: string) =>
    new Paragraph({ text, spacing: { after: 120 } })

  const bold = (label: string, value: string) =>
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true }), new TextRun({ text: value })] })

  const criticalCount = applicable.filter(r => r.priority(info) === 'Critical').length
  const highCount     = applicable.filter(r => r.priority(info) === 'High').length

  // Sort by priority
  const sorted = [...applicable].sort((a, b) =>
    PRIORITY_ORDER.indexOf(a.priority(info)) - PRIORITY_ORDER.indexOf(b.priority(info))
  )

  const matrixRows = sorted.map(rule => {
    const pri = rule.priority(info)
    return new TableRow({
      children: [
        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: rule.framework })] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: rule.article })] }),
        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: rule.title })] }),
        new TableCell({ width: { size: 37, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: rule.summary })] }),
        new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: pri, bold: true, color: priorityHex(pri) })] })] }),
      ],
    })
  })

  const doc = new Document({
    creator: info.completedBy,
    title: `Compliance Map — ${info.name}`,
    description: 'AI System Regulatory Compliance Mapping — BiasLens by BeAccessible',
    sections: [{
      children: [
        // Cover
        new Paragraph({ text: 'AI System Compliance Map', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 }, children: [new TextRun({ text: 'EU AI Act · GDPR · POPIA · EEA · UNCRPD · UK AI Governance', color: '1F3F6B', size: 22 })] }),
        bold('AI System: ',     info.name             || '—'),
        bold('Organisation: ',  info.organisationName || '—'),
        bold('Completed by: ',  info.completedBy      || '—'),
        bold('Date: ',          info.date             || '—'),
        bold('Sector: ',        info.sector           || '—'),
        bold('Jurisdictions: ', [
          info.euJurisdiction ? 'EU/EEA' : '',
          info.saJurisdiction ? 'South Africa' : '',
          info.ukJurisdiction ? 'UK' : '',
        ].filter(Boolean).join(', ') || 'Not specified'),

        // Executive summary
        h('Executive Summary', HeadingLevel.HEADING_1),
        p(`This compliance mapping identifies the regulatory obligations applicable to the AI system "${info.name || '[unnamed system]'}" operated by ${info.organisationName || '[organisation]'}. The mapping covers ${applicable.length} applicable regulatory requirement${applicable.length !== 1 ? 's' : ''} across ${[...new Set(applicable.map(r => r.framework))].length} frameworks.`),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: `Critical obligations: `, bold: true }),
            new TextRun({ text: `${criticalCount}`, bold: true, color: 'C0392B' }),
            new TextRun({ text: `   High-priority obligations: ` }),
            new TextRun({ text: `${highCount}`, bold: true, color: 'E67E22' }),
          ],
        }),
        p('Critical obligations must be addressed before or immediately after deployment. High-priority obligations should be addressed within 30 days of deployment.'),

        // Compliance matrix
        h('Regulatory Compliance Matrix', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Framework', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 18, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Article', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 15, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Requirement', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 30, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Summary', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 37, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 12, type: WidthType.PERCENTAGE } }),
              ],
            }),
            ...matrixRows,
          ],
        }),

        // Detailed requirements
        h('Detailed Requirements', HeadingLevel.HEADING_1),
        ...sorted.flatMap(rule => {
          const pri = rule.priority(info)
          return [
            new Paragraph({
              spacing: { before: 240, after: 80 },
              children: [
                new TextRun({ text: `${rule.framework} — ${rule.article}: `, bold: true, color: '1F3F6B' }),
                new TextRun({ text: rule.title, bold: true }),
              ],
            }),
            new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Priority: ', bold: true }), new TextRun({ text: pri, bold: true, color: priorityHex(pri) })] }),
            p(rule.requirement),
            ...(rule.note ? [new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '⚠ Note: ', bold: true }), new TextRun({ text: rule.note, italics: true })] })] : []),
          ]
        }),

        // Priority actions
        h('Priority Action Plan', HeadingLevel.HEADING_1),
        p('Address obligations in the following order:'),
        ...sorted.filter(r => r.priority(info) !== 'Not Applicable').map((rule, i) =>
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true }),
              new TextRun({ text: `[${rule.priority(info)}] `, bold: true, color: priorityHex(rule.priority(info)) }),
              new TextRun({ text: `${rule.framework} ${rule.article} — `, bold: true }),
              new TextRun({ text: rule.title }),
            ],
          })
        ),

        // References
        h('Legal References', HeadingLevel.HEADING_1),
        p('• EU AI Act (Regulation 2024/1689)'),
        p('• General Data Protection Regulation (Regulation 2016/679) — GDPR'),
        p('• Protection of Personal Information Act 4 of 2013 (POPIA) — South Africa'),
        p('• Employment Equity Act 55 of 1998 (EEA) — South Africa'),
        p('• South Africa National AI Policy Framework (draft) — Department of Communications and Digital Technologies'),
        p('• UN Convention on the Rights of Persons with Disabilities (UNCRPD)'),
        p('• UK ICO AI Guidance and UK AI Principles'),
        p('• WCAG 2.1 / 2.2 — Web Content Accessibility Guidelines'),
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
  a.download = `ComplianceMap-${(info.name || 'system').replace(/\s+/g, '-')}-${info.date}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────

function Step1({ info, update }: { info: SystemInfo; update: (k: keyof SystemInfo, v: unknown) => void }) {
  return (
    <div className={styles.fieldGroup}>
      <div className={styles.field}>
        <label htmlFor="orgName" className={styles.label}>Organisation name <span className={styles.req} aria-hidden="true">*</span></label>
        <input id="orgName" type="text" className={styles.input} value={info.organisationName} onChange={e => update('organisationName', e.target.value)} placeholder="e.g. Acme Financial Services Ltd" />
      </div>
      <div className={styles.field}>
        <label htmlFor="completedBy" className={styles.label}>Completed by</label>
        <input id="completedBy" type="text" className={styles.input} value={info.completedBy} onChange={e => update('completedBy', e.target.value)} placeholder="Name and role" />
      </div>
      <div className={styles.field}>
        <label htmlFor="date" className={styles.label}>Date</label>
        <input id="date" type="date" className={styles.input} value={info.date} onChange={e => update('date', e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor="sysName" className={styles.label}>AI system name <span className={styles.req} aria-hidden="true">*</span></label>
        <input id="sysName" type="text" className={styles.input} value={info.name} onChange={e => update('name', e.target.value)} placeholder="e.g. HireAI Resume Screening System" />
      </div>
      <div className={styles.field}>
        <label htmlFor="sysDesc" className={styles.label}>What does this AI system do?</label>
        <textarea id="sysDesc" className={styles.textarea} rows={3} value={info.description} onChange={e => update('description', e.target.value)} placeholder="Briefly describe what the system does and what decisions it supports or makes…" />
      </div>
      <div className={styles.field}>
        <label htmlFor="sector" className={styles.label}>Sector</label>
        <select id="sector" className={styles.select} value={info.sector} onChange={e => update('sector', e.target.value)}>
          <option value="">Select a sector…</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}

function Step2({ info, update }: { info: SystemInfo; update: (k: keyof SystemInfo, v: unknown) => void }) {
  return (
    <div className={styles.fieldGroup}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Jurisdictions — where does this system operate?</legend>
        <label className={styles.checkLabel}><input type="checkbox" checked={info.euJurisdiction} onChange={e => update('euJurisdiction', e.target.checked)} /> EU / EEA — the system affects people in EU or EEA member states</label>
        <label className={styles.checkLabel}><input type="checkbox" checked={info.saJurisdiction} onChange={e => update('saJurisdiction', e.target.checked)} /> South Africa — the system operates in or affects people in South Africa</label>
        <label className={styles.checkLabel}><input type="checkbox" checked={info.ukJurisdiction} onChange={e => update('ukJurisdiction', e.target.checked)} /> United Kingdom — the system affects people in the UK</label>
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>System characteristics</legend>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={info.makesAutomatedDecisions} onChange={e => update('makesAutomatedDecisions', e.target.checked)} />
          This system makes or significantly influences decisions about individuals (hiring, credit, access to services, benefits eligibility, etc.)
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={info.affectsDisabledPeople} onChange={e => update('affectsDisabledPeople', e.target.checked)} />
          Disabled people are among the groups affected by this system's decisions
        </label>
      </fieldset>
      <div className={styles.infoBox} role="note">
        <strong>Why this matters:</strong> The regulations that apply to your system depend heavily on where it operates and what kind of decisions it makes. For example, a hiring AI used in the EU and SA activates six different compliance obligations simultaneously.
      </div>
    </div>
  )
}

function Step3({ info, applicable }: { info: SystemInfo; applicable: ComplianceItem[] }) {
  const critical = applicable.filter(r => r.priority(info) === 'Critical')
  const high     = applicable.filter(r => r.priority(info) === 'High')
  const medium   = applicable.filter(r => r.priority(info) === 'Medium')
  const sorted   = [...applicable].sort((a, b) => PRIORITY_ORDER.indexOf(a.priority(info)) - PRIORITY_ORDER.indexOf(b.priority(info)))
  const frameworks = [...new Set(applicable.map(r => r.framework))]

  if (applicable.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <p>No jurisdictions or decision types selected. Go back to Step 2 and select at least one jurisdiction.</p>
      </div>
    )
  }

  return (
    <div className={styles.mapContainer}>
      {/* Summary cards */}
      <div className={styles.summaryCards} aria-label="Compliance summary">
        <div className={`${styles.card} ${styles.cardCritical}`}>
          <span className={styles.cardCount} aria-label={`${critical.length} critical obligations`}>{critical.length}</span>
          <span className={styles.cardLabel}>Critical</span>
        </div>
        <div className={`${styles.card} ${styles.cardHigh}`}>
          <span className={styles.cardCount} aria-label={`${high.length} high priority obligations`}>{high.length}</span>
          <span className={styles.cardLabel}>High</span>
        </div>
        <div className={`${styles.card} ${styles.cardMedium}`}>
          <span className={styles.cardCount} aria-label={`${medium.length} medium priority obligations`}>{medium.length}</span>
          <span className={styles.cardLabel}>Medium</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardCount}>{frameworks.length}</span>
          <span className={styles.cardLabel}>Frameworks</span>
        </div>
      </div>

      {/* Compliance table */}
      <div className={styles.tableWrap} role="region" aria-label="Compliance obligations table">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Framework</th>
              <th scope="col">Article</th>
              <th scope="col">Requirement</th>
              <th scope="col">Priority</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(rule => {
              const pri = rule.priority(info)
              return (
                <tr key={rule.id}>
                  <td><strong>{rule.framework}</strong></td>
                  <td>{rule.article}</td>
                  <td>
                    <strong>{rule.title}</strong>
                    <p className={styles.ruleSummary}>{rule.summary}</p>
                    {rule.note && <p className={styles.ruleNote}>⚠ {rule.note}</p>}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${priorityClass(pri)}`}>{pri}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Step4({ info, applicable, isGenerating, isComplete, onGenerate }: {
  info: SystemInfo
  applicable: ComplianceItem[]
  isGenerating: boolean
  isComplete: boolean
  onGenerate: () => void
}) {
  const critical = applicable.filter(r => r.priority(info) === 'Critical').length
  return (
    <div className={styles.generatePanel}>
      <div className={styles.docPreview} aria-label="Document preview">
        <div className={styles.docIcon} aria-hidden="true">📄</div>
        <div>
          <strong>ComplianceMap-{(info.name || 'system').replace(/\s+/g, '-')}-{info.date}.docx</strong>
          <p className={styles.docMeta}>
            {applicable.length} obligations across {[...new Set(applicable.map(r => r.framework))].length} frameworks
            {critical > 0 && <> · <span className={styles.criticalText}>{critical} critical</span></>}
          </p>
        </div>
      </div>
      <p className={styles.generateNote}>
        Your compliance map will be generated as a Word document containing the full regulatory matrix, detailed requirements for each framework, and a prioritised action plan.
      </p>
      {isComplete ? (
        <div className={styles.successBox} role="status">
          <p>✅ Your compliance map has been downloaded.</p>
          <p className={styles.credit}>Generated by BiasLens™ — BeAccessible</p>
        </div>
      ) : (
        <button className={styles.btnGenerate} onClick={onGenerate} disabled={isGenerating || applicable.length === 0} type="button" aria-busy={isGenerating}>
          {isGenerating ? 'Generating your compliance map…' : '⬇ Download Compliance Map as Word Document'}
        </button>
      )}
      {applicable.length === 0 && (
        <p className={styles.hint}>Go back to Step 2 and select at least one jurisdiction to generate a report.</p>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ComplianceMapperPage() {
  const [step, setStep]         = useState(1)
  const [info, setInfo]         = useState<SystemInfo>(INITIAL)
  const [generating, setGen]    = useState(false)
  const [complete, setComplete] = useState(false)

  const update = useCallback(<K extends keyof SystemInfo>(key: K, value: SystemInfo[K]) => {
    setInfo(prev => ({ ...prev, [key]: value }))
  }, [])

  const applicable = useMemo(
    () => RULES.filter(r => r.applies(info) && r.priority(info) !== 'Not Applicable'),
    [info]
  )

  const handleGenerate = async () => {
    setGen(true)
    try {
      await generateReport(info, applicable)
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
          <h1 className={styles.pageTitle}>Compliance Mapper</h1>
          <p className={styles.pageSubtitle}>EU AI Act · GDPR · POPIA · EEA · UNCRPD · UK AI Governance</p>
        </div>
        <span className={styles.badge} aria-label="Maps to 6 regulatory frameworks">6 Frameworks</span>
      </header>

      <nav className={styles.stepper} aria-label="Mapper steps">
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
          {step === 1 && <Step1 info={info} update={update} />}
          {step === 2 && <Step2 info={info} update={update} />}
          {step === 3 && <Step3 info={info} applicable={applicable} />}
          {step === 4 && <Step4 info={info} applicable={applicable} isGenerating={generating} isComplete={complete} onGenerate={handleGenerate} />}
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
