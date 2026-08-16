import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "BiasLens Methodology Note | Evidence-Led Algorithmic Accountability",
  description:
    "The public BiasLens methodology note: evidence discipline, bias taxonomy, fairness signals, sample-size guardrails, traceability and limitations.",
};

export default function MethodologyPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <span className="public-kicker">BiasLens Methodology Note</span>
              <h1>Evidence before conclusion.</h1>
              <p className="public-lead">
                BiasLens is designed to help organisations distinguish what their evidence demonstrates, what represents a credible risk, what remains emerging, and what has not been established.
              </p>
              <p>
                This note explains the public methodology principles behind BiasLens. It is not legal advice, a conformity assessment, or a substitute for formal sector-specific or jurisdiction-specific review.
              </p>
            </div>

            <div className="public-grid-2">
              <article className="public-card">
                <h2>1. Unit of assessment</h2>
                <p>
                  BiasLens assesses a defined AI-enabled system, workflow or decision process. The assessment boundary includes the purpose of the system, the decision context, available evidence, affected groups, controls, oversight and material unknowns.
                </p>
                <p><strong>Architectural principle:</strong> systems, not people. BiasLens is not designed as employee monitoring, productivity surveillance or individual scoring.</p>
              </article>

              <article className="public-card">
                <h2>2. Bias taxonomy</h2>
                <p>
                  The BiasLens bias taxonomy is grounded in Friedman and Nissenbaum’s peer-reviewed, vendor-independent academic work on bias in computer systems. BiasLens uses the categories <strong>preexisting bias</strong>, <strong>technical bias</strong> and <strong>emergent bias</strong> as a transparent foundation for examining where bias pathways may arise.
                </p>
                <p>
                  BiasLens also uses the operational term <strong>Bias Drift</strong> for material change over time. That term is BiasLens terminology aligned to the problem of emergent bias; it is not presented as wording from the 1996 paper.
                </p>
              </article>

              <article className="public-card">
                <h2>3. Evidence strength is separate from severity</h2>
                <p>
                  A serious potential harm does not automatically mean the available evidence is strong. BiasLens keeps those concepts separate so that concern is not mistaken for proof.
                </p>
                <ul>
                  <li><strong>Demonstrated:</strong> supported by available evidence.</li>
                  <li><strong>Credible risk:</strong> a substantiated concern that warrants attention.</li>
                  <li><strong>Emerging evidence:</strong> a signal that is not yet sufficiently established.</li>
                  <li><strong>Not established:</strong> the current evidence does not support the conclusion.</li>
                </ul>
              </article>

              <article className="public-card">
                <h2>4. Uncertainty is preserved</h2>
                <p>
                  “Not sure” is kept distinct from “No”. Missing documentation, unclear vendor claims and unknown affected-group evidence remain visible as uncertainty rather than being converted into reassurance.
                </p>
                <p>
                  This is deliberate: a known unknown is a governance question that can be assigned, investigated and tracked.
                </p>
              </article>

              <article className="public-card">
                <h2>5. Fairness signals are not legal findings</h2>
                <p>
                  BiasLens may use outcome comparisons and fairness measures where the underlying data is appropriate. A disparity or disparate-impact ratio is treated as a <strong>signal for investigation</strong>, not a determination of causation or unlawful discrimination.
                </p>
                <p>
                  The determination ladder is: outcome difference → evidence; possible concern → finding; cause → requires investigation; unlawful discrimination → legal determination.
                </p>
              </article>

              <article className="public-card">
                <h2>6. Small-sample guardrails</h2>
                <p>
                  BiasLens applies conservative minimum-sample guardrails to reduce false certainty and privacy risk. Current product methodology uses approximately <strong>30+</strong> observations for more reliable interpretation, treats smaller samples as indicative, and avoids reporting very small groups where privacy or statistical validity is compromised.
                </p>
                <p>
                  These are platform methodology thresholds, not statutory thresholds or legal safe harbours.
                </p>
              </article>

              <article className="public-card">
                <h2>7. Traceability</h2>
                <p>
                  BiasLens is designed as a rule-based, traceable assessment engine. Where a classification is generated, the intended evidence trail records the triggering rule, rationale, framework reference where applicable, confidence or evidence status, limitations and recommended next action.
                </p>
                <p>
                  Traceability improves reviewability; it does not guarantee that every regulator, court or external reviewer will accept a conclusion.
                </p>
              </article>

              <article className="public-card">
                <h2>8. Accessibility evidence</h2>
                <p>
                  BiasLens treats accessibility as an evidence question. A demonstration of one keyboard or screen-reader pathway is not the same as comprehensive accessibility testing, validation or WCAG conformance.
                </p>
                <p>
                  Assessments should distinguish implemented features from independently tested evidence and formal conformance claims.
                </p>
              </article>
            </div>

            <section className="public-section" aria-labelledby="limits-title">
              <div className="public-panel">
                <h2 id="limits-title">What BiasLens does not claim</h2>
                <ul>
                  <li>BiasLens does not prove unlawful discrimination.</li>
                  <li>BiasLens does not replace legal advice or formal legal classification.</li>
                  <li>BiasLens does not convert a vendor assertion into verified evidence without support.</li>
                  <li>BiasLens does not treat counts as risk without considering exposure, population and reporting context.</li>
                  <li>BiasLens does not claim that an accessibility demonstration equals conformance.</li>
                  <li>BiasLens does not treat its sample-size guardrails as legal thresholds.</li>
                </ul>
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="engagement-title">
              <div className="public-panel">
                <h2 id="engagement-title">How this methodology is used in practice</h2>
                <p>
                  A BiasLens engagement starts with one system. Evidence is inventoried, claims and unknowns are separated, possible bias pathways are examined, fairness analysis is used only where appropriate, and findings are documented with limitations and next actions.
                </p>
                <div className="public-actions">
                  <Link href="/demo" className="public-button public-button-secondary">View the two-minute demo</Link>
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
