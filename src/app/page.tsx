import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

const offers = [
  {
    eyebrow: "Entry offer",
    title: "Evidence Readiness Diagnostic",
    body: "A focused front-door engagement for one AI-enabled system or decision process.",
    bullets: [
      "System and decision-context summary",
      "Evidence and documentation inventory",
      "Bias-pathway and affected-group visibility review",
      "Known gaps and immediate governance questions",
      "BiasLens Evidence Readiness Brief",
    ],
  },
  {
    eyebrow: "Assessment offer",
    title: "System Bias Assessment",
    body: "A deeper assessment using the BiasLens methodology and traceable evidence discipline.",
    bullets: [
      "Bias-risk findings and evidence strength",
      "Fairness analysis where appropriate",
      "Accessibility and affected-group considerations",
      "Limitations and known unknowns",
      "Recommendations and documented rationale",
    ],
  },
  {
    eyebrow: "Documentation offer",
    title: "Algorithm Defence File",
    body: "An organisation-owned evidence record showing what was assessed, what is known and what action followed.",
    bullets: [
      "Evidence present and evidence absent",
      "Findings, rationale and controls",
      "Limitations and unresolved questions",
      "Actions taken and next steps",
      "Governance evidence — not a promise of legal immunity",
    ],
  },
  {
    eyebrow: "Recurring offer",
    title: "Continuous Assurance",
    body: "Periodic reassessment as models, populations, vendors, evidence and use contexts change.",
    bullets: [
      "Reassess material changes",
      "Track emerging evidence and Bias Drift",
      "Review changes in affected populations",
      "Maintain stronger governance over time",
      "Embed evidence discipline into AI operations",
    ],
  },
];

export default function Home() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-hero">
          <div className="public-shell public-hero-grid">
            <div>
              <span className="public-kicker">Evidence-led algorithmic accountability</span>
              <h1>Know what your evidence supports — and what it does not.</h1>
              <p className="public-lead">
                BiasLens helps organisations assess one AI system at a time, separate evidence from assumption,
                identify bias risks, document uncertainty and build an accountable evidence trail.
              </p>
              <p className="public-lead">
                If AI is influencing decisions about people, opportunities, access, recruitment, learning,
                financial services or essential services, confident claims are not enough. Your organisation
                needs evidence it can explain.
              </p>
              <div className="public-actions" aria-label="Primary actions">
                <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
                <Link href="/login" className="public-button public-button-secondary">Sign in to BiasLens</Link>
              </div>
              <div className="public-tag-row" aria-label="BiasLens principles">
                <span className="public-tag">Evidence, not assumption</span>
                <span className="public-tag">Systems, not people</span>
                <span className="public-tag">Traceable findings</span>
                <span className="public-tag">Uncertainty preserved</span>
              </div>
            </div>

            <aside className="public-panel" aria-labelledby="helps-title">
              <h2 id="helps-title">What BiasLens helps you do</h2>
              <ul className="public-check-list">
                <li>See where evidence exists, where it is incomplete and where assumptions are carrying too much weight.</li>
                <li>Identify possible preexisting, technical and emergent bias pathways.</li>
                <li>Review fairness signals without overstating what the data proves.</li>
                <li>Document findings, limitations and next actions in language leaders can use.</li>
                <li>Build an organisation-owned evidence trail for accountability and follow-through.</li>
              </ul>
              <div className="public-callout public-callout-note">
                <strong>Important:</strong> BiasLens identifies evidence and signals that may require investigation. It does not make legal findings of discrimination.
              </div>
            </aside>
          </div>
        </section>

        <section id="why" className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-section-heading">
              <h2>The market problem BiasLens is built to solve</h2>
              <p>
                Many organisations can name the AI tools they have purchased. Fewer can show what evidence supports
                how those systems influence decisions, which groups may be affected, what remains unknown or whether
                vendor assurances have actually been substantiated.
              </p>
            </div>
            <div className="public-grid-3">
              <article className="public-card">
                <span className="public-eyebrow">The gap</span>
                <h3>Policy is not evidence</h3>
                <p>A policy may describe intent. BiasLens asks what the organisation can actually demonstrate about one real system.</p>
              </article>
              <article className="public-card">
                <span className="public-eyebrow">The discipline</span>
                <h3>Evidence is separated from severity</h3>
                <p>A serious concern with weak evidence is not presented as a proven outcome. The distinction stays visible.</p>
              </article>
              <article className="public-card">
                <span className="public-eyebrow">The outcome</span>
                <h3>Known unknowns become governable</h3>
                <p>BiasLens helps turn uncertainty into a documented question that can be investigated, owned and acted on.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <h2>Who BiasLens is for</h2>
              <p>BiasLens is designed for organisations where AI influences decisions, opportunities, access, eligibility or participation.</p>
            </div>
            <div className="public-grid-3">
              <article className="public-card"><h3>AI Governance / Responsible AI</h3><p>Understand what systems are in use, what evidence exists and where your governance position is strong or weak.</p></article>
              <article className="public-card"><h3>Risk / Compliance</h3><p>Build traceable documentation rather than relying only on policy language or supplier assurances.</p></article>
              <article className="public-card"><h3>HR / People</h3><p>Examine AI-assisted recruitment or workforce systems without confusing outcome differences with legal conclusions.</p></article>
              <article className="public-card"><h3>Procurement / Vendor Governance</h3><p>Turn vendor claims about fairness, accessibility and oversight into questions your organisation can document.</p></article>
              <article className="public-card"><h3>Accessibility / Disability Inclusion</h3><p>Ask whether disabled people are visible in the training, testing, interface and outcome evidence that supports a system.</p></article>
              <article className="public-card"><h3>Executive / Board Oversight</h3><p>Move from high-level assurance to a clearer record of evidence, limitations, controls and unresolved risk.</p></article>
            </div>
          </div>
        </section>

        <section className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-section-heading">
              <h2>What BiasLens can assess</h2>
              <p>BiasLens works best when an organisation brings one defined AI-enabled system, workflow or decision process into view. Scope is confirmed during qualification.</p>
            </div>
            <div className="public-grid-2">
              <article className="public-card">
                <h3>Example systems and workflows</h3>
                <ul>
                  <li>AI-assisted recruitment and candidate screening</li>
                  <li>Workforce decision support</li>
                  <li>Education, learning and assessment systems</li>
                  <li>Financial, insurance or eligibility systems</li>
                  <li>Public-sector or essential-service decision workflows</li>
                  <li>Third-party AI tools affecting customers, employees or applicants</li>
                </ul>
              </article>
              <article className="public-card">
                <h3>Questions BiasLens helps surface</h3>
                <ul>
                  <li>What evidence do we actually have about this system?</li>
                  <li>Which affected groups are visible in the evidence?</li>
                  <li>What vendor claims remain unverified?</li>
                  <li>Where could preexisting, technical or emergent bias arise?</li>
                  <li>Which outcome differences need further investigation?</li>
                  <li>What should be documented for governance and oversight?</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="offers" className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <h2>Start with one system. Build stronger assurance over time.</h2>
              <p>The commercial pathway is deliberately clear: diagnose the evidence gap, assess where needed, document what the organisation owns and reassess when the system changes.</p>
            </div>
            <div className="public-grid-2">
              {offers.map((offer) => (
                <article key={offer.title} className="public-offer">
                  <span className="public-eyebrow">{offer.eyebrow}</span>
                  <h3>{offer.title}</h3>
                  <p>{offer.body}</p>
                  <ul>{offer.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-section-heading"><h2>Why BiasLens is different</h2><p>BiasLens is designed to improve the quality and honesty of the evidence an organisation relies on — not to manufacture false confidence.</p></div>
            <div className="public-grid-3">
              <article className="public-card"><h3>Uncertainty is preserved</h3><p>“Not sure” is not silently converted into “No risk”. Missing evidence remains visible.</p></article>
              <article className="public-card"><h3>Fairness signals are handled carefully</h3><p>An outcome difference can justify investigation. It does not automatically establish causation or unlawful discrimination.</p></article>
              <article className="public-card"><h3>Small samples are guarded</h3><p>BiasLens uses cautious methodology guardrails to reduce false certainty and privacy risk. They are not legal safe harbours.</p></article>
              <article className="public-card"><h3>Findings are traceable</h3><p>Classifications are designed to record rationale, confidence, limitations and recommended next steps.</p></article>
              <article className="public-card"><h3>Accessibility is an evidence question</h3><p>A successful demonstration of one accessible interaction path is not the same as formal accessibility conformance.</p></article>
              <article className="public-card"><h3>Systems, not people</h3><p>BiasLens assesses systems, processes and aggregated outcomes. It is not employee monitoring, productivity surveillance or individual scoring.</p></article>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading"><h2>How a BiasLens engagement works</h2><p>The aim is to move one real system from vague concern toward documented evidence and an explicit next decision.</p></div>
            <div className="public-flow">
              <article className="public-card"><div className="public-step-number">1</div><h3>Choose one system</h3><p>Identify one AI-enabled system or decision process that matters.</p></article>
              <article className="public-card"><div className="public-step-number">2</div><h3>Review evidence and context</h3><p>Examine available documentation, controls, affected groups and known gaps.</p></article>
              <article className="public-card"><div className="public-step-number">3</div><h3>Document findings clearly</h3><p>Record what is supported, what is uncertain and what requires investigation.</p></article>
              <article className="public-card"><div className="public-step-number">4</div><h3>Act and reassess</h3><p>Strengthen controls, deepen assessment or monitor material change over time.</p></article>
            </div>
          </div>
        </section>

        <section id="proof" className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-section-heading"><h2>Proof and trust</h2><p>BiasLens is being taken to market with the same evidence discipline it asks of clients.</p></div>
            <div className="public-grid-2">
              <article className="public-card">
                <h3>Proof assets</h3>
                <ul>
                  <li><Link href="/methodology">BiasLens Methodology Note</Link> — public methodology and claims boundaries.</li>
                  <li><Link href="/demo">Two-minute problem-to-evidence demo</Link> — fictional-data walkthrough and narration.</li>
                  <li>Fictional-data recruitment case study — coming soon</li>
                  <li>Sample Algorithm Defence File — coming soon</li>
                </ul>
              </article>
              <article className="public-card">
                <h3>Boundaries stated openly</h3>
                <ul>
                  <li>BiasLens does not prove discrimination.</li>
                  <li>BiasLens does not replace legal advice.</li>
                  <li>BiasLens does not turn incomplete evidence into reassurance.</li>
                  <li>BiasLens does not assess people as individual risk objects.</li>
                </ul>
                <p><Link href="/privacy">Read the Privacy Notice</Link> · <Link href="/accessibility-statement">Read the Accessibility Statement</Link></p>
              </article>
            </div>
          </div>
        </section>

        <section id="founder" className="public-section">
          <div className="public-shell">
            <div className="public-section-heading"><h2>Why this product exists</h2></div>
            <div className="public-callout public-callout-strong">
              <p>
                I have lived for more than thirty years with the consequences of institutions making assumptions about disabled people.
                BiasLens comes from a simple conviction: when a system can affect someone&apos;s opportunity, livelihood, access or participation,
                assumptions are not enough. Organisations should be able to show what their evidence supports — and what it does not.
              </p>
            </div>
          </div>
        </section>

        <section className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-panel">
              <h2>Ready to assess one AI system?</h2>
              <p>Complete a short qualification form first. We will use it to understand the system, decision context and evidence question before deciding the most appropriate BiasLens engagement.</p>
              <div className="public-actions">
                <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
                <a href="mailto:hello@beaccessible.co.za?subject=BiasLens%20enquiry" className="public-button public-button-secondary">Email hello@beaccessible.co.za</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-shell public-footer-grid">
          <div>
            <h2>BiasLens by BeAccessible</h2>
            <p>Evidence-led algorithmic accountability and bias-risk assessment.</p>
            <p><a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a></p>
          </div>
          <div>
            <h2>Accessibility and privacy</h2>
            <p>This public experience is designed for keyboard operation, screen-reader navigation, reflow and visible focus, with a read-aloud convenience control that does not replace semantic accessibility.</p>
            <p><Link href="/accessibility-statement">Accessibility Statement</Link> · <Link href="/privacy">Privacy Notice</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
