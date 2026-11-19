import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCta } from "@/components/public/PublicCta";
import { PublicPageIntro } from "@/components/public/PublicPageIntro";

export const metadata = {
  title: "Who BiasLens is for | BiasLens by BeAccessible",
  description: "Who BiasLens is designed for, and the AI systems and questions it can assess.",
};

export default function WhoItsForPage() {
  return (
    <div className="public-page">
      <PublicHeader current="/who-its-for" />
      <main id="main-content" data-listen-content>
        <PublicPageIntro kicker="Who it is for" title="Who BiasLens is for" lead="For organisations where AI influences decisions, opportunities, access, eligibility or participation." />
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
        <PublicCta />
      </main>
      <PublicFooter />
    </div>
  );
}
