import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "Fictional Recruitment Case Study | BiasLens",
  description:
    "A fictional-data BiasLens case study showing how an AI-assisted recruitment workflow moves from concern to an evidence-led investigation question.",
};

const evidence = [
  ["Available", "System purpose and shortlisting workflow documented internally."],
  ["Available", "Fictional aggregate applicant and shortlist counts for the demonstration period."],
  ["Unverified", "Vendor statement that the model was 'tested for fairness' without supporting validation evidence."],
  ["Missing", "Clear evidence showing the validation population adequately represents affected disability groups."],
  ["Unverified", "Internal keyboard spot-check suggests a possible upload barrier, but no structured accessibility test report exists."],
  ["Missing", "Reliable evidence explaining disability disclosure patterns and non-disclosure within the applicant pool."],
] as const;

const pathways = [
  {
    title: "Preexisting",
    signal:
      "A representation gap may exist if disabled people or disability-related needs were insufficiently represented in historic or validation data.",
    interpretation:
      "Possible pathway only; this does not establish that it caused the observed outcome difference.",
  },
  {
    title: "Technical",
    signal:
      "A possible keyboard or accessibility barrier in the upload step may affect who can complete the process successfully.",
    interpretation:
      "A spot-check is not comprehensive accessibility testing and is not a WCAG conformance finding.",
  },
  {
    title: "Emergent",
    signal:
      "The applicant population, use context or vendor model may change after deployment.",
    interpretation:
      "Material change can create new risk even when earlier evidence was stronger.",
  },
] as const;

const actions = [
  "Improve denominator and disclosure-quality evidence before drawing stronger conclusions.",
  "Request the vendor's validation methodology, affected-group evidence, fairness testing scope and material limitations.",
  "Conduct structured accessibility testing across the full candidate workflow with representative assistive-technology and keyboard pathways.",
  "Investigate where the outcome difference enters the process rather than assuming the AI model is the sole cause.",
  "Record rationale, evidence status, limitations, owners and due dates in the organisation's governance evidence trail.",
  "Reassess after material model, vendor, workflow or applicant-population change.",
] as const;

export default function RecruitmentCaseStudyPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <span className="public-kicker">Fictional-data recruitment case study</span>
              <h1>From an outcome concern to an evidence-led investigation question.</h1>
              <p className="public-lead">
                This case study uses entirely fictional data and a fictional organisation. It demonstrates how BiasLens separates evidence, assumptions, limitations and next actions. It is not a real client finding, legal conclusion or finding of discrimination.
              </p>
            </div>

            <div className="public-callout public-callout-note">
              <strong>Case reference:</strong> BL-DEMO-RECRUIT-001 · Northstar Services (fictional)
            </div>

            <section className="public-section" aria-labelledby="scope-title">
              <div className="public-panel">
                <h2 id="scope-title">1. System and decision context</h2>
                <p><strong>System:</strong> AI-assisted candidate screening used to support, not independently make, shortlisting decisions.</p>
                <p><strong>Decision context:</strong> recruitment shortlisting for a fictional professional-services role.</p>
                <p><strong>Assessment trigger:</strong> concern that disabled applicants may be under-represented in shortlisted outcomes.</p>
                <p><strong>BiasLens question:</strong> What does the available evidence support, what remains unverified, and what requires investigation?</p>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="evidence-title">
              <div className="public-section-heading">
                <h2 id="evidence-title">2. Evidence inventory</h2>
                <p>BiasLens preserves the distinction between evidence present, evidence absent and evidence that remains unverified.</p>
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

            <section className="public-section" aria-labelledby="pathways-title">
              <div className="public-section-heading">
                <h2 id="pathways-title">3. Possible bias pathways</h2>
                <p>Possible pathways are documented without being presented as proven causes.</p>
              </div>
              <div className="public-grid-3">
                {pathways.map((pathway) => (
                  <article className="public-card" key={pathway.title}>
                    <span className="public-eyebrow">{pathway.title}</span>
                    <p>{pathway.signal}</p>
                    <p><strong>Interpretation:</strong> {pathway.interpretation}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="signal-title">
              <div className="public-panel">
                <h2 id="signal-title">4. Fictional fairness signal</h2>
                <div className="public-grid-2">
                  <article className="public-card">
                    <span className="public-eyebrow">Disability disclosed analysis group</span>
                    <p><strong>40</strong> applications</p>
                    <p><strong>12</strong> shortlisted</p>
                    <p><strong>30%</strong> selection rate</p>
                  </article>
                  <article className="public-card">
                    <span className="public-eyebrow">Comparison group</span>
                    <p><strong>80</strong> applications</p>
                    <p><strong>36</strong> shortlisted</p>
                    <p><strong>45%</strong> selection rate</p>
                  </article>
                </div>
                <p><strong>Selection-rate ratio:</strong> 0.67</p>
                <div className="public-callout public-callout-strong">
                  <p><strong>Interpretation:</strong> this fictional outcome difference is a signal requiring investigation. It does not establish causation or unlawful discrimination.</p>
                </div>
                <p><strong>Critical limitation:</strong> the comparison group must not be described as “non-disabled people”. Disability non-disclosure can occur, and the fictional data does not establish the actual disability status of everyone outside the disclosed group.</p>
              </div>
            </section>

            <section className="public-section" aria-labelledby="limits-title">
              <div className="public-section-heading"><h2 id="limits-title">5. Limitations that remain visible</h2></div>
              <div className="public-grid-2">
                <article className="public-card"><h3>Fictional demonstration</h3><p>The data exists only to demonstrate BiasLens methodology. The group sizes are not statutory thresholds or legal safe harbours.</p></article>
                <article className="public-card"><h3>Cause is not established</h3><p>The outcome difference alone does not explain where or why the difference arose.</p></article>
                <article className="public-card"><h3>Vendor assertion remains unverified</h3><p>A fairness statement is not converted into verified evidence without supporting documentation.</p></article>
                <article className="public-card"><h3>Accessibility evidence is incomplete</h3><p>A keyboard spot-check does not equal structured testing, validation or accessibility conformance.</p></article>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="actions-title">
              <div className="public-panel">
                <h2 id="actions-title">6. Recommended next actions</h2>
                <ul>{actions.map((action) => <li key={action}>{action}</li>)}</ul>
              </div>
            </section>

            <section className="public-section" aria-labelledby="clarified-title">
              <div className="public-panel">
                <h2 id="clarified-title">7. What BiasLens clarified</h2>
                <ul>
                  <li>There is an observable fictional outcome difference, but the current evidence does not establish why it exists.</li>
                  <li>The vendor's fairness statement is not yet verified evidence.</li>
                  <li>Disability visibility in the evidence is incomplete because disclosure status cannot be treated as a complete proxy for disability status.</li>
                  <li>Accessibility evidence is incomplete and requires structured testing.</li>
                  <li>The organisation now has specific evidence questions and next actions rather than a vague question such as “Is the AI biased?”</li>
                </ul>
              </div>
            </section>

            <section className="public-section public-section-alt">
              <div className="public-panel">
                <h2>Continue from the case study</h2>
                <p>Review the sample Algorithm Defence File built from this same fictional case, or bring one real AI-enabled system into the BiasLens qualification flow.</p>
                <div className="public-actions">
                  <Link href="/algorithm-defence-file" className="public-button public-button-secondary">View the sample Algorithm Defence File</Link>
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
