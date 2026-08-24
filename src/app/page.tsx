import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PUBLIC_PROOF_DOWNLOADS } from "@/lib/export/publicProofPdfs";
import styles from "./home.module.css";

export default function Home() {
  return (
    <div className="public-page">
      <PublicHeader />

      <main id="main-content" data-listen-content>
        {/* 1. Hero */}
        <section className="public-hero" aria-labelledby="home-title">
          <div className="public-shell public-hero-grid">
            <div>
              <span className="public-kicker">Evidence-led algorithmic accountability</span>
              <h1 id="home-title">Know what your evidence supports — and what it does not.</h1>
              <p className="public-lead">
                BiasLens helps organisations assess one AI system at a time, separate evidence from assumption,
                identify bias risks, document uncertainty and build an accountable evidence trail.
              </p>
              <div className="public-actions" aria-label="Primary actions">
                <Link href="/enquire" className="public-button public-button-primary">
                  Assess one AI system
                </Link>
                <Link href="/login" className="public-button public-button-secondary">
                  Sign in to BiasLens
                </Link>
              </div>
              <div className="public-tag-row" aria-label="BiasLens principles">
                <span className="public-tag">Evidence, not assumption</span>
                <span className="public-tag">Systems, not people</span>
                <span className="public-tag">Traceable findings</span>
                <span className="public-tag">Uncertainty preserved</span>
              </div>
            </div>

            <aside className="public-panel" aria-labelledby="hero-help-title">
              <h2 id="hero-help-title">What you can expect</h2>
              <ul className="public-check-list">
                <li>One defined AI system or decision process in scope.</li>
                <li>Evidence separated from claims and assumptions.</li>
                <li>Bias pathways and affected groups made visible.</li>
                <li>Unknowns and conflicting evidence documented rather than hidden.</li>
              </ul>
              <div className="public-callout public-callout-note">
                <strong>Important:</strong> BiasLens identifies evidence and signals that may require investigation.
                It does not make legal findings of discrimination.
              </div>
            </aside>
          </div>
        </section>

        {/* 2. Problem */}
        <section id="why" className={`${styles.homeSection} ${styles.homeSectionLight}`}>
          <div className="public-shell">
            <div className={styles.sectionIntro}>
              <h2>The problem: AI assurance needs evidence</h2>
              <p>
                Many organisations can name the AI tools they use. Fewer can show what evidence supports how those
                systems influence decisions, who may be affected, which supplier claims remain unverified and what is
                still unknown.
              </p>
            </div>

            <div className={styles.problemGrid}>
              <article className={styles.card}>
                <span className={styles.capabilityKicker}>The gap</span>
                <h3>Policy is not evidence</h3>
                <p>
                  A policy can describe intent. BiasLens asks what your organisation can actually demonstrate about
                  one real system.
                </p>
              </article>
              <article className={styles.card}>
                <span className={styles.capabilityKicker}>The risk</span>
                <h3>Supplier assurance can remain untested</h3>
                <p>
                  Claims about fairness, accessibility, oversight or testing are recorded as claims until supporting
                  evidence is available.
                </p>
              </article>
              <article className={styles.card}>
                <span className={styles.capabilityKicker}>The outcome</span>
                <h3>Known unknowns become governable</h3>
                <p>
                  Missing or conflicting evidence becomes a documented question with an owner, next action and audit
                  trail.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 3. What BiasLens does */}
        <section id="offers" className={`${styles.homeSection} ${styles.homeSectionWhite}`}>
          <div className="public-shell">
            <div className={styles.sectionIntro}>
              <h2>What BiasLens does</h2>
              <p>
                BiasLens turns a broad AI-governance concern into a structured evidence review for one system, with
                clear outputs that leaders, risk teams and affected-function owners can use.
              </p>
            </div>

            <div className={styles.capabilityGrid}>
              <article className={`${styles.card} ${styles.capabilityCard}`}>
                <span className={styles.capabilityKicker}>1. Evidence</span>
                <h3>Build an evidence inventory</h3>
                <p>Record what exists, what is missing, where it came from and what each item actually supports.</p>
              </article>
              <article className={`${styles.card} ${styles.capabilityCard}`}>
                <span className={styles.capabilityKicker}>2. Bias pathways</span>
                <h3>Identify where bias could enter</h3>
                <p>Surface preexisting, technical and emergent pathways without presenting possibility as proof.</p>
              </article>
              <article className={`${styles.card} ${styles.capabilityCard}`}>
                <span className={styles.capabilityKicker}>3. Fairness</span>
                <h3>Review signals carefully</h3>
                <p>Use fairness indicators as prompts for investigation, with limitations and sample constraints visible.</p>
              </article>
              <article className={`${styles.card} ${styles.capabilityCard}`}>
                <span className={styles.capabilityKicker}>4. Governance record</span>
                <h3>Document findings and next actions</h3>
                <p>Keep rationale, evidence state, unresolved questions and follow-through in an organisation-owned trail.</p>
              </article>
            </div>

            <div className={styles.detailsGroup} aria-label="More about BiasLens capabilities and services">
              <details>
                <summary>What BiasLens can assess</summary>
                <div className={styles.detailsBody}>
                  <p>
                    BiasLens works best when one defined AI-enabled system, workflow or decision process is brought
                    into view. Examples include recruitment and candidate screening, workforce decision support,
                    education and assessment, financial or eligibility systems, public-service workflows and
                    third-party AI tools affecting employees, applicants or customers.
                  </p>
                </div>
              </details>

              <details>
                <summary>Commercial pathway</summary>
                <div className={styles.detailsBody}>
                  <p>The engagement path can scale with the evidence need:</p>
                  <ul>
                    <li><strong>Evidence Readiness Diagnostic:</strong> establish the system, evidence inventory and immediate gaps.</li>
                    <li><strong>System Bias Assessment:</strong> conduct a deeper evidence-led bias-risk review.</li>
                    <li><strong>Algorithm Defence File:</strong> create an organisation-owned governance evidence record.</li>
                    <li><strong>Continuous Assurance:</strong> reassess material changes over time.</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* 4. Audience */}
        <section className={`${styles.homeSection} ${styles.homeSectionLight}`}>
          <div className="public-shell">
            <div className={styles.sectionIntro}>
              <h2>Who BiasLens is for</h2>
              <p>
                The same system often crosses several organisational responsibilities. BiasLens gives those teams a
                shared evidence language without requiring everyone to become a data scientist or AI lawyer.
              </p>
            </div>

            <div className={styles.audienceGrid}>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>AI Governance / Responsible AI</h3>
                <p>Understand what is known, what is assumed and where assurance needs strengthening.</p>
              </article>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>Risk / Compliance</h3>
                <p>Build traceable records rather than relying only on policy language or supplier statements.</p>
              </article>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>HR / People</h3>
                <p>Review AI-assisted workforce systems without turning outcome differences into unsupported conclusions.</p>
              </article>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>Procurement / Vendor Governance</h3>
                <p>Translate supplier claims into evidence requests, unanswered questions and follow-up actions.</p>
              </article>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>Accessibility / Disability Inclusion</h3>
                <p>Ask whether disabled people are visible in testing, interface and outcome evidence.</p>
              </article>
              <article className={`${styles.card} ${styles.audienceCard}`}>
                <h3>Executive / Board Oversight</h3>
                <p>Move from broad reassurance to an evidence-backed view of limitations, controls and unresolved risk.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 5. Process */}
        <section className={`${styles.homeSection} ${styles.homeSectionWhite}`}>
          <div className="public-shell">
            <div className={styles.sectionIntro}>
              <h2>How a BiasLens assessment works</h2>
              <p>
                The workflow is intentionally simple: one system, one evidence trail and an explicit next decision.
              </p>
            </div>

            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <h3>Choose one system</h3>
                <p>Define the AI-enabled system or decision process that matters.</p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <h3>Review evidence and context</h3>
                <p>Examine available records, controls, affected groups, supplier claims and evidence gaps.</p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <h3>Document findings clearly</h3>
                <p>Record what is established, derived, inferred, unknown or conflicted — with rationale.</p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <h3>Act and reassess</h3>
                <p>Strengthen controls, request evidence, deepen assessment or monitor material change.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* 6. Proof, differentiation and CTA */}
        <section id="proof" className={`${styles.homeSection} ${styles.homeSectionBlue}`}>
          <div className="public-shell">
            <div className={styles.sectionIntro}>
              <h2>Proof, boundaries and what makes BiasLens different</h2>
              <p>
                BiasLens is designed to improve the quality and honesty of the evidence an organisation relies on —
                not to manufacture false confidence.
              </p>
            </div>

            <div className={styles.proofGrid}>
              <article className={styles.card}>
                <h3>Proof assets</h3>
                <ul>
                  <li><Link href="/methodology">BiasLens Methodology Note</Link></li>
                  <li><Link href="/demo">Two-minute problem-to-evidence demo</Link></li>
                  <li>
                    <Link href="/case-study/recruitment">Fictional recruitment case study</Link>{" "}
                    (<a href={PUBLIC_PROOF_DOWNLOADS.recruitment.href} download={PUBLIC_PROOF_DOWNLOADS.recruitment.filename}>PDF</a>)
                  </li>
                  <li>
                    <Link href="/algorithm-defence-file">Sample Algorithm Defence File</Link>{" "}
                    (<a href={PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.href} download={PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.filename}>PDF</a>)
                  </li>
                </ul>
              </article>

              <article className={styles.card}>
                <h3>Boundaries stated openly</h3>
                <ul>
                  <li>BiasLens does not prove discrimination.</li>
                  <li>BiasLens does not replace legal advice.</li>
                  <li>BiasLens does not turn missing evidence into reassurance.</li>
                  <li>BiasLens assesses systems and aggregated outcomes, not people as individual risk objects.</li>
                </ul>
              </article>
            </div>

            <div className={styles.detailsGroup}>
              <details>
                <summary>Why BiasLens is different</summary>
                <div className={styles.detailsBody}>
                  <ul>
                    <li>Uncertainty is preserved instead of silently converted into “no risk”.</li>
                    <li>Fairness signals are treated as evidence for investigation, not automatic legal conclusions.</li>
                    <li>Small samples and privacy-sensitive subgroup analysis are handled cautiously.</li>
                    <li>Findings retain rationale, limitations and next actions.</li>
                    <li>Accessibility is treated as an evidence question, not assumed from one successful interaction.</li>
                  </ul>
                </div>
              </details>

              <details id="founder">
                <summary>Why this product exists</summary>
                <div className={styles.detailsBody}>
                  <p>
                    I have lived for more than thirty years with the consequences of institutions making assumptions
                    about disabled people. BiasLens comes from a simple conviction: when a system can affect someone&apos;s
                    opportunity, livelihood, access or participation, assumptions are not enough. Organisations should
                    be able to show what their evidence supports — and what it does not.
                  </p>
                </div>
              </details>
            </div>

            <div className={styles.finalPanel}>
              <h2>Ready to assess one AI system?</h2>
              <p>
                Start with a short qualification form so we can understand the system, decision context and evidence
                question before deciding the most appropriate BiasLens engagement.
              </p>
              <div className={styles.finalActions}>
                <Link href="/enquire" className="public-button public-button-primary">
                  Assess one AI system
                </Link>
                <a
                  href="mailto:hello@beaccessible.co.za?subject=BiasLens%20enquiry"
                  className={styles.finalSecondary}
                >
                  Email hello@beaccessible.co.za
                </a>
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
            <p>
              Designed for keyboard operation, screen-reader navigation, reflow and visible focus, with read-aloud
              support as a convenience rather than a replacement for semantic accessibility.
            </p>
            <p>
              <Link href="/accessibility-statement">Accessibility Statement</Link> ·{" "}
              <Link href="/privacy">Privacy Notice</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
