'use client'

import { useState, useCallback, useMemo } from 'react'
import { useProfileDefaults } from '@/lib/useProfileDefaults'
import styles from './fairness-metrics.module.css'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type FairnessLevel = 'Fair' | 'Borderline' | 'Concern' | 'Reference' | 'Not assessed'

interface Group {
  id: string
  name: string
  total: string
  positive: string
  isReference: boolean
}

/**
 * How much weight this group's result can bear.
 *
 * Two separate risks are being guarded against, and they are not the same:
 *   1. Statistical unreliability — a ratio computed on a handful of decisions
 *      is noise, not evidence. Presenting it as a finding would be misleading.
 *   2. Re-identification — a small cell in a report can make an individual
 *      indirectly identifiable even with no names or IDs present.
 *
 * Thresholds below follow common practice in official statistics and
 * adverse-impact analysis. They are conventions, not statutory figures, and
 * are stated as such to the user.
 */
type Reliability = 'Reliable' | 'Indicative only' | 'Too small to report'

const MIN_RELIABLE = 30   // below this, a DIR is indicative at best
const MIN_REPORT   = 10   // below this, suppress — re-identification risk

function reliabilityOf(total: number): Reliability {
  if (total < MIN_REPORT)   return 'Too small to report'
  if (total < MIN_RELIABLE) return 'Indicative only'
  return 'Reliable'
}

interface MetricResult {
  group: Group
  selectionRate: number
  dir: number
  spd: number
  level: FairnessLevel
  reliability: Reliability
}

interface SystemContext {
  organisationName: string
  completedBy: string
  date: string
  systemName: string
  decisionType: string
  positiveOutcome: string
  sector: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'System Context',    description: 'What AI system and decision are you analysing?' },
  { id: 2, title: 'Group Outcomes',    description: 'Enter outcome counts for each group.' },
  { id: 3, title: 'Fairness Results',  description: 'Your calculated fairness metrics.' },
  { id: 4, title: 'Download Report',   description: 'Get your full fairness analysis as a Word document.' },
]

const DECISION_TYPES = [
  'Hiring or candidate shortlisting',
  'Promotion or progression decisions',
  'Credit or loan approval',
  'Insurance risk scoring',
  'Benefits or welfare eligibility',
  'Healthcare triage or prioritisation',
  'Educational assessment or placement',
  'Performance management',
  'Other',
]

const PRESET_GROUPS = [
  { name: 'Men', ref: 'Women' },
  { name: 'White / Non-Hispanic', ref: 'Black / African' },
  { name: 'Non-disabled', ref: 'Disabled people' },
  { name: 'Majority group', ref: 'Minority group' },
]

const INITIAL_CONTEXT: SystemContext = {
  organisationName: '',
  completedBy: '',
  date: new Date().toISOString().split('T')[0],
  systemName: '',
  decisionType: '',
  positiveOutcome: 'Selected / Approved',
  sector: '',
}

const makeGroup = (id: string, name = '', isRef = false): Group => ({
  id, name, total: '', positive: '', isReference: isRef,
})

// ─── CALCULATIONS ─────────────────────────────────────────────────────────────

function selRate(g: Group): number {
  const t = parseInt(g.total)
  const p = parseInt(g.positive)
  if (!t || !p || t <= 0) return 0
  return Math.min(p / t, 1)
}

function calcLevel(dir: number, isRef: boolean): FairnessLevel {
  if (isRef) return 'Reference'
  if (dir >= 0.9)  return 'Fair'
  if (dir >= 0.8)  return 'Borderline'
  return 'Concern'
}

function calcMetrics(groups: Group[]): MetricResult[] {
  const ref = groups.find(g => g.isReference)
  const refRate = ref ? selRate(ref) : 0
  return groups.map(g => {
    const rate = selRate(g)
    const dir  = refRate > 0 ? rate / refRate : 0
    const spd  = rate - refRate
    const total = parseInt(g.total) || 0
    const rel = reliabilityOf(total)
    return {
      group: g,
      selectionRate: rate,
      dir: g.isReference ? 1 : dir,
      spd: g.isReference ? 0 : spd,
      // A suppressed group has no fairness finding. Reporting one would state
      // a conclusion the data cannot support.
      level: rel === 'Too small to report'
        ? 'Not assessed'
        : calcLevel(g.isReference ? 1 : dir, g.isReference),
      reliability: rel,
    }
  })
}

function levelColor(l: FairnessLevel) {
  if (l === 'Fair')      return { bg: '#EAFAF1', text: '#1E8449', hex: '1E8449' }
  if (l === 'Borderline') return { bg: '#FEF9E7', text: '#7D6608', hex: 'D4AC0D' }
  if (l === 'Concern')    return { bg: '#FDEDEC', text: '#C0392B', hex: 'C0392B' }
  if (l === 'Not assessed') return { bg: '#F2F3F4', text: '#595959', hex: '595959' }
  return { bg: '#EBF5FB', text: '#1F3F6B', hex: '1F3F6B' }
}

function pct(n: number) { return `${(n * 100).toFixed(1)}%` }
function fmt(n: number)  { return n.toFixed(3) }

// ─── DOCUMENT GENERATION ─────────────────────────────────────────────────────

async function generateReport(ctx: SystemContext, groups: Group[], results: MetricResult[]): Promise<void> {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType, Table, TableRow, TableCell, WidthType } = await import('docx')

  const h = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) =>
    new Paragraph({ text, heading: level, spacing: { before: 320, after: 160 } })
  const p  = (text: string) => new Paragraph({ text, spacing: { after: 120 } })
  const b  = (label: string, val: string) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true }), new TextRun({ text: val })] })

  const concerns    = results.filter(r => r.level === 'Concern')
  const borderlines = results.filter(r => r.level === 'Borderline')

  const overallStatus = concerns.length > 0 ? 'Bias Concern Identified'
    : borderlines.length > 0 ? 'Borderline — Monitor Closely'
    : 'No Significant Bias Detected'

  const outcomeRows = results.map(r => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ text: r.group.name })], width: { size: 28, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: r.group.isReference ? 'Reference' : 'Comparison' })], width: { size: 16, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: r.group.total })], width: { size: 14, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: r.group.positive })], width: { size: 14, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: pct(r.selectionRate) })], width: { size: 14, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.level, bold: true, color: levelColor(r.level).hex })] })], width: { size: 14, type: WidthType.PERCENTAGE } }),
    ],
  }))

  const metricsRows = results.filter(r => !r.group.isReference).map(r => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ text: r.group.name })], width: { size: 25, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: fmt(r.dir) })], width: { size: 20, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: r.dir >= 0.8 ? 'Passes (≥ 0.8)' : 'Fails (< 0.8)' })], width: { size: 20, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: `${r.spd >= 0 ? '+' : ''}${pct(r.spd)}` })], width: { size: 20, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.level, bold: true, color: levelColor(r.level).hex })] })], width: { size: 15, type: WidthType.PERCENTAGE } }),
    ],
  }))

  const doc = new Document({
    creator: ctx.completedBy,
    title: `Fairness Metrics — ${ctx.systemName}`,
    sections: [{
      children: [
        new Paragraph({ text: 'Fairness Metrics Analysis', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 320 }, children: [new TextRun({ text: 'Disparate Impact Analysis · 4/5 Rule · Statistical Parity', color: '1F3F6B', size: 22 })] }),
        b('AI System: ',        ctx.systemName        || '—'),
        b('Organisation: ',     ctx.organisationName  || '—'),
        b('Completed by: ',     ctx.completedBy       || '—'),
        b('Date: ',             ctx.date              || '—'),
        b('Decision type: ',    ctx.decisionType      || '—'),
        b('Positive outcome: ', ctx.positiveOutcome   || '—'),

        h('Executive Summary', HeadingLevel.HEADING_1),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: 'Overall finding: ', bold: true }),
            new TextRun({
              text: overallStatus, bold: true,
              color: concerns.length > 0 ? 'C0392B' : borderlines.length > 0 ? 'D4AC0D' : '1E8449',
            }),
          ],
        }),
        p(`This analysis covers ${results.length} group${results.length !== 1 ? 's' : ''} across ${parseInt(groups[0]?.total) || 0} total decisions. The primary fairness metric used is the Disparate Impact Ratio (DIR), assessed against the industry-standard 4/5 Rule (80% threshold) as used in EEOC guidelines and the South African Employment Equity Act.`),
        ...(concerns.length > 0 ? [
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: `⚠ Bias concern identified for: ${concerns.map(c => c.group.name).join(', ')}. Immediate review recommended.`, color: 'C0392B' })] }),
        ] : []),

        h('1. Group Outcome Data', HeadingLevel.HEADING_1),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Group', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 28, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Role', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 16, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 14, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Positive', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 14, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Selection Rate', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 14, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Finding', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 14, type: WidthType.PERCENTAGE } }),
            ]}),
            ...outcomeRows,
          ],
        }),

        h('2. Disparate Impact Analysis', HeadingLevel.HEADING_1),
        p('The Disparate Impact Ratio (DIR) measures whether a group receives positive outcomes at a rate proportional to the reference group. A DIR below 0.80 indicates potential adverse impact under the EEOC 4/5 Rule and South African EEA guidance.'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Group', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 25, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DIR', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 20, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '4/5 Rule', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 20, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Stat. Parity Diff.', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 20, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Finding', bold: true, color: 'FFFFFF' })] })], shading: { fill: '1F3F6B' }, width: { size: 15, type: WidthType.PERCENTAGE } }),
            ]}),
            ...metricsRows,
          ],
        }),

        h('3. Interpretation Guide', HeadingLevel.HEADING_1),
        p('Fair (DIR ≥ 0.90): The comparison group receives positive outcomes at 90% or more of the reference group rate. No significant disparity detected.'),
        p('Borderline (DIR 0.80–0.89): The comparison group receives positive outcomes at 80–89% of the reference group rate. Falls within legal thresholds but warrants monitoring and investigation.'),
        p('Concern (DIR < 0.80): The comparison group receives positive outcomes at less than 80% of the reference group rate. This triggers the 4/5 Rule and requires documented justification or corrective action.'),

        h('4. Recommended Actions', HeadingLevel.HEADING_1),
        ...(concerns.length > 0 ? [
          p(`URGENT — Bias concern for: ${concerns.map(c => c.group.name).join(', ')}`),
          p('1. Pause or review the AI system before further deployment.'),
          p('2. Investigate the root cause of the disparity (training data, feature selection, proxy variables).'),
          p('3. Document the investigation and remediation steps.'),
          p('4. Re-run this analysis after any system changes.'),
          p('5. Consult legal counsel regarding EEA / EEOC compliance obligations.'),
        ] : borderlines.length > 0 ? [
          p('Monitor closely. While results pass the 4/5 threshold, the disparity is non-trivial.'),
          p('1. Set a quarterly review cadence for this metric.'),
          p('2. Investigate whether the disparity is widening over time.'),
          p('3. Document monitoring procedures in your AI Fairness Playbook.'),
        ] : [
          p('No significant disparities detected in this analysis. Maintain regular monitoring.'),
          p('1. Re-run this analysis quarterly or when the AI system is updated.'),
          p('2. Expand the analysis to include additional demographic groups over time.'),
        ]),

        h('Legal References', HeadingLevel.HEADING_1),
        p('• EEOC Uniform Guidelines on Employee Selection Procedures (1978) — 4/5 (80%) Rule for adverse impact'),
        p('• South Africa Employment Equity Act 55 of 1998, Section 6 — Prohibition of unfair discrimination'),
        p('• EU AI Act (Regulation 2024/1689), Articles 9–10 — Risk management and data governance for high-risk AI'),
        p('• UNCRPD Article 5 — Non-discrimination for disabled people'),
        p('• IBM AI Fairness 360 — Disparate Impact Ratio and Statistical Parity Difference definitions'),
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
  a.download = `FairnessMetrics-${(ctx.systemName || 'system').replace(/\s+/g, '-')}-${ctx.date}.docx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────

function Step1({ ctx, setCtx }: { ctx: SystemContext; setCtx: (c: SystemContext) => void }) {
  const u = (k: keyof SystemContext, v: string) => setCtx({ ...ctx, [k]: v })
  return (
    <div className={styles.fieldGroup}>
      {/*
        Tell people where these values came from. Filling fields in silently
        satisfies the letter of WCAG 3.3.7, but someone who cannot see the form
        at a glance deserves to know why text is already there.
      */}
      <div className={styles.infoBox}>
        Your organisation and name are filled in from your Account Settings where
        you have set them. Changing them here applies only to this assessment.
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="org" className={styles.label}>Organisation</label>
          <input id="org" type="text" className={styles.input} autoComplete="organization" value={ctx.organisationName} onChange={e => u('organisationName', e.target.value)} placeholder="Organisation name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="by" className={styles.label}>Completed by</label>
          <input id="by" type="text" className={styles.input} autoComplete="name" value={ctx.completedBy} onChange={e => u('completedBy', e.target.value)} placeholder="Name and role" />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="date" className={styles.label}>Date</label>
          <input id="date" type="date" className={styles.input} value={ctx.date} onChange={e => u('date', e.target.value)} />
        </div>
        <div className={styles.field}>
          {/*
            "required" is written into the label. It used to be a red asterisk
            marked aria-hidden, which told sighted users something screen reader
            users never heard. (WCAG 3.3.2 Labels or Instructions.)
          */}
          <label htmlFor="sys" className={styles.label}>AI system name (required)</label>
          <input id="sys" type="text" className={styles.input} required value={ctx.systemName} onChange={e => u('systemName', e.target.value)} placeholder="e.g. HireAI Screening System" />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="dec" className={styles.label}>Type of decision being analysed</label>
        <select id="dec" className={styles.select} value={ctx.decisionType} onChange={e => u('decisionType', e.target.value)}>
          <option value="">Select a decision type…</option>
          {DECISION_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="pos" className={styles.label}>What does a positive outcome mean in this context?</label>
        <input id="pos" type="text" className={styles.input} value={ctx.positiveOutcome} onChange={e => u('positiveOutcome', e.target.value)} placeholder="e.g. Hired, Approved, Selected, Accepted" />
      </div>
    </div>
  )
}

/*
  GroupRow MUST stay outside Step2.

  It used to be declared inside Step2. That meant React saw a brand new kind of
  component on every single render, threw the old one away, and built a fresh
  one — taking the cursor with it. Typing one character into a group name moved
  focus out of the field, so the next character went nowhere.

  Losing focus while typing is a change of context under WCAG 2.2, so this was
  a failure of 3.2.2 On Input (Level A). It also made the tool close to unusable
  for anyone typing one-handed, using a switch device, or using speech input.

  Declared here at the top level, the component type is stable, React keeps the
  existing input element, and focus stays where the person put it.
*/
function GroupRow({ g, removable, onUpdate, onRemove }: {
  g: Group
  removable: boolean
  onUpdate: (id: string, field: keyof Group, value: string | boolean) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className={`${styles.groupCard} ${g.isReference ? styles.refCard : ''}`}>
      <div className={styles.groupHeader}>
        <span className={`${styles.groupTag} ${g.isReference ? styles.refTag : styles.compTag}`}>
          {g.isReference ? 'Reference group' : 'Comparison group'}
        </span>
        {removable && (
          <button className={styles.removeBtn} onClick={() => onRemove(g.id)} type="button" aria-label={`Remove ${g.name || 'group'}`}>Remove</button>
        )}
      </div>
      <div className={styles.groupFields}>
        <div className={styles.field}>
          <label htmlFor={`name-${g.id}`} className={styles.label}>Group name</label>
          <input id={`name-${g.id}`} type="text" className={styles.input} value={g.name} onChange={e => onUpdate(g.id, 'name', e.target.value)} placeholder={g.isReference ? 'e.g. Non-disabled, Men, White' : 'e.g. Disabled people, Women, Black'} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`total-${g.id}`} className={styles.label}>Total decisions</label>
          <input id={`total-${g.id}`} type="number" min="1" className={styles.input} value={g.total} onChange={e => onUpdate(g.id, 'total', e.target.value)} placeholder="e.g. 500" />
        </div>
        <div className={styles.field}>
          <label htmlFor={`pos-${g.id}`} className={styles.label}>Positive outcomes</label>
          <input id={`pos-${g.id}`} type="number" min="0" className={styles.input} value={g.positive} onChange={e => onUpdate(g.id, 'positive', e.target.value)} placeholder="e.g. 120" />
        </div>
      </div>
    </div>
  )
}

function Step2({ groups, setGroups }: { groups: Group[]; setGroups: (g: Group[]) => void }) {
  const ref   = groups.find(g => g.isReference)!
  const comps = groups.filter(g => !g.isReference)

  const updateGroup = (id: string, field: keyof Group, value: string | boolean) => {
    setGroups(groups.map(g => g.id === id ? { ...g, [field]: value } : g))
  }

  const addGroup = () => {
    if (groups.length < 6) setGroups([...groups, makeGroup(`g${Date.now()}`)])
  }

  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id))
  }

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.infoBox}>
        Enter the number of people in each group who went through the AI-assisted decision, and how many received a positive outcome (hired, approved, selected, etc.).
      </div>
      <GroupRow g={ref} removable={false} onUpdate={updateGroup} onRemove={removeGroup} />
      {comps.map(g => (
        <GroupRow key={g.id} g={g} removable={comps.length > 1} onUpdate={updateGroup} onRemove={removeGroup} />
      ))}
      {groups.length < 6 && (
        <button className={styles.addBtn} onClick={addGroup} type="button">
          + Add another comparison group
        </button>
      )}
    </div>
  )
}

function Step3({ results, ctx }: { results: MetricResult[]; ctx: SystemContext }) {
  const ref    = results.find(r => r.group.isReference)
  const comps  = results.filter(r => !r.group.isReference)
  const hasEnoughData = ref && ref.group.total && ref.group.positive

  if (!hasEnoughData) {
    return (
      <div className={styles.emptyState} role="status">
        <p>No data to show yet. Go back to Step 2 and fill in group outcome counts.</p>
      </div>
    )
  }

  const concerns    = comps.filter(r => r.level === 'Concern')
  const borderlines = comps.filter(r => r.level === 'Borderline')
  const overall     = concerns.length > 0 ? 'Concern' : borderlines.length > 0 ? 'Borderline' : 'Fair'

  return (
    <div className={styles.results}>
      {/* Overall banner */}
      <div className={`${styles.banner} ${styles[`banner${overall}`]}`} role="status" aria-live="polite">
        <span className={styles.bannerIcon} aria-hidden="true">
          {overall === 'Fair' ? '✅' : overall === 'Borderline' ? '⚠' : '🔴'}
        </span>
        <div>
          <strong>{overall === 'Fair' ? 'No significant bias detected' : overall === 'Borderline' ? 'Borderline — monitor closely' : 'Bias concern identified'}</strong>
          <p className={styles.bannerSub}>
            {concerns.length > 0 && `${concerns.length} group${concerns.length > 1 ? 's' : ''} below the 80% threshold: ${concerns.map(c => c.group.name).join(', ')}.`}
            {concerns.length === 0 && borderlines.length > 0 && `${borderlines.length} group${borderlines.length > 1 ? 's' : ''} in the borderline range.`}
            {concerns.length === 0 && borderlines.length === 0 && 'All comparison groups pass the 4/5 Rule.'}
          </p>
        </div>
      </div>

      {/* Reference baseline */}
      {ref && (
        <div className={styles.refBaseline}>
          <strong>Reference group:</strong> {ref.group.name} — Selection rate: <strong>{pct(ref.selectionRate)}</strong> ({ref.group.positive} of {ref.group.total})
        </div>
      )}

      {/* Metrics table */}
      <div className={styles.tableWrap} role="region" aria-label="Fairness metrics results">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Comparison group</th>
              <th scope="col">Selection rate</th>
              <th scope="col">Disparate Impact Ratio</th>
              <th scope="col">4/5 Rule</th>
              <th scope="col">Stat. Parity Diff.</th>
              <th scope="col">Finding</th>
            </tr>
          </thead>
          <tbody>
            {comps.map(r => {
              const c = levelColor(r.level)
              return (
                <tr key={r.group.id}>
                  <td><strong>{r.group.name}</strong></td>
                  <td>{pct(r.selectionRate)}<br /><span className={styles.subtext}>({r.group.positive} of {r.group.total})</span></td>
                  <td><strong>{fmt(r.dir)}</strong></td>
                  <td>{r.dir >= 0.8 ? <span className={styles.pass}>Passes ✓</span> : <span className={styles.fail}>Fails ✗</span>}</td>
                  <td className={r.spd < 0 ? styles.negative : styles.positive}>{r.spd >= 0 ? '+' : ''}{pct(r.spd)}</td>
                  <td><span className={styles.badge} style={{ background: c.bg, color: c.text }}>{r.level}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Key */}
      <div className={styles.key} aria-label="Key">
        <span className={styles.keyItem}><span className={styles.badge} style={{ background: '#EAFAF1', color: '#1E8449' }}>Fair</span> DIR ≥ 0.90</span>
        <span className={styles.keyItem}><span className={styles.badge} style={{ background: '#FEF9E7', color: '#7D6608' }}>Borderline</span> DIR 0.80–0.89</span>
        <span className={styles.keyItem}><span className={styles.badge} style={{ background: '#FDEDEC', color: '#C0392B' }}>Concern</span> DIR &lt; 0.80</span>
      </div>
    </div>
  )
}

function Step4({ ctx, groups, results, isGenerating, isComplete, onGenerate }: {
  ctx: SystemContext; groups: Group[]; results: MetricResult[];
  isGenerating: boolean; isComplete: boolean; onGenerate: () => void
}) {
  const concerns = results.filter(r => r.level === 'Concern').length
  const canGenerate = results.some(r => !r.group.isReference && r.group.total && r.group.positive)
  return (
    <div className={styles.generatePanel}>
      <div className={styles.docPreview}>
        <div className={styles.docIcon} aria-hidden="true">📊</div>
        <div>
          <strong>FairnessMetrics-{(ctx.systemName || 'system').replace(/\s+/g, '-')}-{ctx.date}.docx</strong>
          <p className={styles.docMeta}>
            {results.length} group{results.length !== 1 ? 's' : ''} analysed
            {concerns > 0 && <> · <span className={styles.concernText}>{concerns} concern{concerns > 1 ? 's' : ''}</span></>}
          </p>
        </div>
      </div>
      <p className={styles.generateNote}>
        Your report includes the full outcome data table, disparate impact ratios, 4/5 Rule assessment, statistical parity differences, recommended actions, and legal references.
      </p>
      {isComplete ? (
        <div className={styles.successBox} role="status">
          <p>✅ Your Fairness Metrics report has been downloaded.</p>
          <p className={styles.credit}>Generated by BiasLens™ — BeAccessible</p>
        </div>
      ) : (
        <button className={styles.btnGenerate} onClick={onGenerate} disabled={isGenerating || !canGenerate} type="button" aria-busy={isGenerating}>
          {isGenerating ? 'Generating your report…' : '⬇ Download Fairness Metrics Report'}
        </button>
      )}
      {!canGenerate && <p className={styles.hint}>Go back to Step 2 and enter outcome data to generate a report.</p>}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const INIT_GROUPS: Group[] = [
  makeGroup('ref',  '', true),
  makeGroup('comp', '', false),
]

export default function FairnessMetricsPage() {
  const [step, setStep]         = useState(1)
  const [ctx, setCtx]           = useState<SystemContext>(INITIAL_CONTEXT)
  const [groups, setGroups]     = useState<Group[]>(INIT_GROUPS)
  const [generating, setGen]    = useState(false)
  const [complete, setComplete] = useState(false)

  /*
    Fill in the details we already hold, so they are not typed again in every
    tool. This is WCAG 2.2 SC 3.3.7 Redundant Entry.

    Anything already typed wins: the `prev.x || …` guards mean a value the
    person has entered is never overwritten by the stored one.
  */
  useProfileDefaults(({ fullName, organisationName }) => {
    setCtx(prev => ({
      ...prev,
      organisationName: prev.organisationName || organisationName,
      completedBy: prev.completedBy || fullName,
    }))
  })

  const results = useMemo(() => calcMetrics(groups), [groups])

  const handleGenerate = async () => {
    setGen(true)
    try {
      await generateReport(ctx, groups, results)
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
          <h1 className={styles.pageTitle}>Fairness Metrics Calculator</h1>
          <p className={styles.pageSubtitle}>Disparate Impact Ratio · 4/5 Rule · Statistical Parity · IBM AI Fairness 360</p>
        </div>
        <span className={styles.headerBadge}>4/5 Rule</span>
      </header>

      <nav className={styles.stepper} aria-label="Calculator steps">
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
          {step === 1 && <Step1 ctx={ctx} setCtx={setCtx} />}
          {step === 2 && <Step2 groups={groups} setGroups={setGroups} />}
          {step === 3 && <Step3 results={results} ctx={ctx} />}
          {step === 4 && <Step4 ctx={ctx} groups={groups} results={results} isGenerating={generating} isComplete={complete} onGenerate={handleGenerate} />}
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
