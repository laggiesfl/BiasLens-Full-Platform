import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "BiasLens Runtime Governance Integration Demo",
  description:
    "A fictional demonstration of how BiasLens evidence and bias-intelligence signals can inform, but not replace, an external runtime governance decision.",
};

const evidence = [
  {
    item: "Vendor fairness assurance",
    state: "Inferred",
    reason:
      "The assurance states that the system is fair, but the underlying disability-specific validation evidence is not supplied.",
  },
  {
    item: "Overall validation report",
    state: "Established",
    reason:
      "The report is available, version-matched and directly supports the overall performance figures it contains.",
  },
  {
    item: "Disabled-applicant outcome analysis",
    state: "Unknown",
    reason:
      "No sufficiently granular, privacy-protected outcome analysis is available for disabled applicants.",
  },
  {
    item: "Accessibility testing evidence",
    state: "Conflicted",
    reason:
      "The vendor describes the interface as accessible, while an internal review identifies unresolved keyboard and screen-reader barriers.",
  },
];

const steps = [
  {
    number: "1",
    title: "A consequential AI-assisted action is proposed",
    body:
      "A fictional recruitment system recommends that a candidate should not move to the next shortlisting stage.",
  },
  {
    number: "2",
    title: "BiasLens supplies the evidence posture",
    body:
      "BiasLens does not decide whether the action may execute. It exports the current evidence state, material bias-risk signals, unresolved unknowns, conflicts, limitations and provenance references.",
  },
  {
    number: "3",
    title: "BiasLens recommends meaningful human review",
    body:
      "Because the recruitment use is consequential and disability outcome evidence remains Unknown while accessibility evidence is Conflicted, the BiasLens advisory disposition is Human review required.",
  },
  {
    number: "4",
    title: "An external governance layer applies its own rules",
    body:
      "A separate policy or execution-control system evaluates authority, policy and the BiasLens evidence signal. In this fictional example it routes the proposed action to a human reviewer before the recruitment decision can proceed.",
  },
  {
    number: "5",
    title: "The resulting receipt becomes new evidence",
    body:
      "The downstream system records what happened, which policy was applied and whether a human reviewer changed the outcome. BiasLens can later ingest that receipt as operational evidence without rewriting the original evidence record.",
  },
];

export default function RuntimeGovernanceDemoPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <span className="public-kicker">Fictional integration demonstration</span>
              <h1>From evidence to a governed decision boundary.</h1>
              <p className="public-lead">
                This demonstration shows how BiasLens could provide evidence and
                bias-intelligence to another governance system. It is not an
                implementation of Samirac, Daisy, Enterprise AI Shield or any
                other external execution architecture.
              </p>
            </div>

            <div className="public-callout public-callout-note">
              <strong>Critical boundary:</strong> BiasLens reports what the
              evidence supports and where uncertainty remains. It does not grant
              runtime execution authority.
            </div>

            <section className="public-section" aria-labelledby="scenario-title">
              <div className="public-section-heading">
                <h2 id="scenario-title">Scenario</h2>
                <p>
                  A fictional AI-assisted recruitment system influences
                  shortlisting. Before a consequential recommendation is relied
                  on, the organisation wants evidence about disability-related
                  outcomes, accessibility and human oversight.
                </p>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="evidence-title">
              <div className="public-panel">
                <h2 id="evidence-title">BiasLens evidence snapshot</h2>
                <p>
                  Collection status is not shown here. The table focuses on the
                  separate question: what does each piece of evidence justify?
                </p>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <caption className="sr-only">
                      Fictional BiasLens evidence states and reasons
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Evidence item</th>
                        <th scope="col">Evidence state</th>
                        <th scope="col">Why</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidence.map((row) => (
                        <tr key={row.item}>
                          <th scope="row">{row.item}</th>
                          <td><strong>{row.state}</strong></td>
                          <td>{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="public-section" aria-labelledby="signal-title">
              <div className="public-section-heading">
                <h2 id="signal-title">BiasLens advisory signal</h2>
              </div>
              <div className="public-grid-2">
                <article className="public-card">
                  <span className="public-eyebrow">Material unknown</span>
                  <h3>Disability outcome performance</h3>
                  <p>
                    The available material does not establish whether disabled
                    applicants experience comparable outcomes.
                  </p>
                </article>
                <article className="public-card">
                  <span className="public-eyebrow">Material conflict</span>
                  <h3>Accessibility evidence</h3>
                  <p>
                    Vendor assurance and internal accessibility evidence do not
                    currently agree.
                  </p>
                </article>
                <article className="public-card">
                  <span className="public-eyebrow">Governance condition</span>
                  <h3>Human review required</h3>
                  <p>
                    Meaningful human review is required before the consequential
                    recruitment recommendation is relied on in this fictional
                    scenario.
                  </p>
                </article>
                <article className="public-card">
                  <span className="public-eyebrow">Next evidence action</span>
                  <h3>Obtain stronger subgroup evidence</h3>
                  <p>
                    Generate or obtain privacy-protected disability outcome
                    evidence and resolve the accessibility conflict.
                  </p>
                </article>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="flow-title">
              <div className="public-panel">
                <h2 id="flow-title">How the integration works</h2>
                <ol>
                  {steps.map((step) => (
                    <li key={step.number} style={{ marginBottom: "1rem" }}>
                      <strong>{step.title}.</strong> {step.body}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="public-section" aria-labelledby="boundary-title">
              <div className="public-panel">
                <h2 id="boundary-title">What this demo proves — and what it does not</h2>
                <p><strong>It demonstrates:</strong></p>
                <ul>
                  <li>machine-readable Evidence States can be useful outside BiasLens;</li>
                  <li>Unknown and Conflicted evidence can trigger a governance condition;</li>
                  <li>BiasLens can inform a runtime boundary without becoming the runtime authority;</li>
                  <li>downstream receipts can return to BiasLens as new operational evidence.</li>
                </ul>
                <p><strong>It does not demonstrate:</strong></p>
                <ul>
                  <li>a production integration with an external execution-control product;</li>
                  <li>a legal determination that discrimination occurred;</li>
                  <li>a claim that BiasLens independently authorises or blocks execution;</li>
                  <li>real applicant or employee data.</li>
                </ul>
              </div>
            </section>

            <section className="public-section public-section-alt">
              <div className="public-panel">
                <h2>Explore the BiasLens evidence method</h2>
                <p>
                  The core product remains evidence-led bias and governance
                  intelligence: define one system, separate evidence from
                  assumption, document uncertainty and preserve a traceable
                  evidence record.
                </p>
                <div className="public-actions">
                  <Link href="/methodology" className="public-button public-button-secondary">
                    Read the Methodology Note
                  </Link>
                  <Link href="/demo" className="public-button public-button-secondary">
                    View the two-minute demo
                  </Link>
                  <Link href="/enquire" className="public-button public-button-primary">
                    Assess one AI system
                  </Link>
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
