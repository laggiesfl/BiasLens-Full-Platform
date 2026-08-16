import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "Sample Algorithm Defence File | BiasLens",
  description:
    "A fictional sample Algorithm Defence File showing how BiasLens documents evidence, findings, limitations, controls, unresolved questions and next actions.",
};

const evidence = [
  ["Available", "Documented system purpose and role of human review."],
  ["Available", "Fictional aggregate shortlisting counts for the demonstration period."],
  ["Unverified", "Vendor assertion that the model was tested for fairness."],
  ["Missing", "Supporting vendor validation report and affected-group evidence."],
  ["Unverified", "Keyboard spot-check indicating a possible upload barrier."],
  ["Missing", "Structured accessibility test evidence covering the candidate workflow."],
  ["Missing", "Evidence that disability disclosure data is sufficiently complete for stronger inference."],
] as const;

const findings = [
  {
    title: "Outcome difference requires investigation",
    evidenceStatus: "Credible signal",
    rationale:
      "Fictional selection rates differ between the disability-disclosed analysis group and the comparison group.",
    limitation:
      "The difference does not establish cause or unlawful discrimination.",
  },
  {
    title: "Vendor fairness assertion remains unverified",
    evidenceStatus: "Unverified evidence",
    rationale:
      "The vendor claims fairness testing, but supporting methodology and validation evidence are absent from the file.",
    limitation:
      "An assertion is not converted into verified evidence.",
  },
  {
    title: "Accessibility evidence is incomplete",
    evidenceStatus: "Emerging / incomplete evidence",
    rationale:
      "A keyboard spot-check suggests a possible barrier in the upload workflow.",
    limitation:
      "A spot-check is not comprehensive accessibility testing and does not establish WCAG conformance status.",
  },
] as const;

export default function AlgorithmDefenceFilePage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <span className="public-kicker">Sample Algorithm Defence File</span>
              <h1>A governance evidence record that shows what was assessed, what is known and what action follows.</h1>
              <p className="public-lead">
                This sample is built from the same entirely fictional recruitment scenario used in the BiasLens case study. It demonstrates organisation-owned governance evidence. It is not legal immunity, certification, legal advice or a formal conformity assessment.
              </p>
            </div>

            <div className="public-callout public-callout-note">
              <strong>Case reference:</strong> BL-DEMO-RECRUIT-001 · Northstar Services (fictional)
            </div>

            <section className="public-section" aria-labelledby="overview-title">
              <div className="public-panel">
                <h2 id="overview-title">1. System overview and scope</h2>
                <p><strong>System:</strong> AI-assisted candidate screening used to support recruitment shortlisting.</p>
                <p><strong>Business owner:</strong> People / Recruitment function (fictional).</p>
                <p><strong>Assessment scope:</strong> evidence and bias-risk review of one defined candidate-screening workflow.</p>
                <p><strong>Decision influenced:</strong> candidate shortlisting; human review remains in the workflow.</p>
                <p><strong>Affected population:</strong> applicants to the fictional role, including applicants who disclose disability.</p>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="inventory-title">
              <div className="public-section-heading">
                <h2 id="inventory-title">2. Evidence inventory</h2>
                <p>The file records evidence status rather than treating absent or unverified documentation as reassurance.</p>
              </div>
              <div className="public-grid-2">
                {evidence.map(([status, detail]) => (
                  <article className="public-card" key={detail}>
                    <span className="public-eyebrow">{status}</span>
                    <p>{detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="public-section" aria-labelledby="findings-title">
              <div className="public-section-heading">
                <h2 id="findings-title">3. Findings summary</h2>
                <p>Each finding carries its evidence status, rationale and limitation.</p>
              </div>
              <div className="public-grid-3">
                {findings.map((finding) => (
                  <article className="public-card" key={finding.title}>
                    <span className="public-eyebrow">{finding.evidenceStatus}</span>
                    <h3>{finding.title}</h3>
                    <p><strong>Rationale:</strong> {finding.rationale}</p>
                    <p><strong>Limitation:</strong> {finding.limitation}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="controls-title">
              <div className="public-grid-2">
                <article className="public-panel">
                  <h2 id="controls-title">4. Controls currently in place</h2>
                  <ul>
                    <li>Human review remains part of the fictional shortlisting workflow.</li>
                    <li>A named governance owner is assigned to evidence escalation.</li>
                    <li>A formal request for stronger vendor validation evidence is recorded.</li>
                    <li>Outcome monitoring is separated from individual employee or applicant surveillance.</li>
                  </ul>
                </article>
                <article className="public-panel">
                  <h2>5. Unresolved questions</h2>
                  <ul>
                    <li>Was the validation population sufficiently representative of disability-related needs and relevant affected groups?</li>
                    <li>How complete and reliable is disability disclosure information in the applicant population?</li>
                    <li>At which stage of the workflow does the observed outcome difference arise?</li>
                    <li>What is the full accessibility test position across keyboard, screen reader, reflow and other relevant user needs?</li>
                    <li>What material model, vendor or workflow changes occurred after the last available evidence was produced?</li>
                  </ul>
                </article>
              </div>
            </section>

            <section className="public-section" aria-labelledby="actions-title">
              <div className="public-panel">
                <h2 id="actions-title">6. Required actions</h2>
                <div className="public-grid-2">
                  <article className="public-card"><span className="public-eyebrow">A1 · High</span><h3>Improve denominator evidence</h3><p>Obtain stronger denominator and disclosure-quality evidence. Owner: People Analytics.</p></article>
                  <article className="public-card"><span className="public-eyebrow">A2 · High</span><h3>Strengthen vendor evidence</h3><p>Request validation methodology, fairness evidence and known limitations. Owner: Procurement / AI Governance.</p></article>
                  <article className="public-card"><span className="public-eyebrow">A3 · High</span><h3>Test accessibility properly</h3><p>Conduct structured accessibility testing of the end-to-end candidate journey. Owner: Accessibility Owner.</p></article>
                  <article className="public-card"><span className="public-eyebrow">A4 · High</span><h3>Investigate the outcome difference</h3><p>Identify where the selection-rate difference enters the process. Owner: AI Governance / HR.</p></article>
                  <article className="public-card"><span className="public-eyebrow">A5 · Medium</span><h3>Reassess after better evidence</h3><p>Re-run the evidence review after material new evidence or system change. Owner: AI Governance.</p></article>
                </div>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="review-title">
              <div className="public-panel">
                <h2 id="review-title">7. Governance and review record</h2>
                <p><strong>Assessment basis:</strong> fictional demonstration case using aggregated outcome counts and fictional documentation status.</p>
                <p><strong>Current determination:</strong> evidence supports further investigation; it does not support a legal finding of discrimination.</p>
                <p><strong>Decision:</strong> do not issue a binary “safe” or “biased” label. Improve evidence, investigate causes and reassess.</p>
                <p><strong>Evidence owner:</strong> fictional AI Governance / Risk owner.</p>
                <p><strong>Next review checkpoint:</strong> after material model, vendor or workflow change, or within 90 days of completing the recommended evidence actions, whichever occurs first.</p>
                <div className="public-callout public-callout-strong">
                  <p><strong>Governance evidence, not legal immunity.</strong> Traceability improves reviewability; it does not guarantee regulatory or legal acceptance.</p>
                </div>
              </div>
            </section>

            <section className="public-section">
              <div className="public-panel">
                <h2>Continue from the sample file</h2>
                <p>Read the fictional recruitment case study that produced this evidence record, review the BiasLens methodology, or bring one real AI system into qualification.</p>
                <div className="public-actions">
                  <Link href="/case-study/recruitment" className="public-button public-button-secondary">Read the recruitment case study</Link>
                  <Link href="/methodology" className="public-button public-button-secondary">Read the Methodology Note</Link>
                  <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
                </div>
              </div>
            </section>

            <p><Link href="/">Return to the BiasLens overview</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
