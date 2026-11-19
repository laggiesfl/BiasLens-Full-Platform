import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCta } from "@/components/public/PublicCta";
import { createClient } from "@/lib/supabase/server";


export default async function Home() {
  let signedIn = false;
  try {
    const { data } = await (await createClient()).auth.getUser();
    signedIn = Boolean(data.user);
  } catch {
    signedIn = false;
  }
  return (
    <div className="public-page">
      <PublicHeader current="/" />
      <main id="main-content" data-listen-content>
        <section className="public-hero">
          <div className="public-shell public-hero-grid">
            <div>
              <span className="public-kicker">Evidence-led AI accountability</span>
              <h1>Can your organisation defend the decisions its AI makes?</h1>
              <p className="public-lead">
                AI is influencing decisions. But can you demonstrate that those decisions are fair,
                accountable and supported by evidence?
              </p>
              <p className="public-lead">
                BiasLens helps organisations examine AI-enabled systems, identify potential bias risks,
                document what the evidence actually supports, and build stronger accountability before
                problems become regulatory, legal or reputational risks. Start with one AI system:
                understand what you know, what remains uncertain and what requires further investigation.
              </p>
              <div className="public-actions" aria-label="Primary actions">
                <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
                {signedIn ? <Link href="/dashboard" className="public-button public-button-secondary">Go to your dashboard</Link> : <Link href="/login" className="public-button public-button-secondary">Sign in to BiasLens</Link>}
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
              <h2>Why AI accountability cannot rely on assumptions</h2>
              <p>
                Many organisations know which AI systems they use. Fewer can demonstrate how those systems
                influence decisions, which people may be affected, what evidence supports their assurances
                and which risks remain unresolved. BiasLens helps turn those unanswered questions into
                a structured, evidence-led assessment.
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
              <h2>Explore BiasLens</h2>
              <p>Each topic has its own short page.</p>
            </div>
            <ul className="public-grid-2 public-explore" role="list">
              <li className="public-card"><h3><Link href="/who-its-for">Who BiasLens is for</Link></h3><p>The teams it serves, and the AI systems and questions it can assess.</p></li>
              <li className="public-card"><h3><Link href="/offers">Offers and how it works</Link></h3><p>From a diagnostic of one system to continuous assurance, step by step.</p></li>
              <li className="public-card"><h3><Link href="/why-biaslens">Why BiasLens is different</Link></h3><p>How uncertainty, fairness signals and small samples are handled honestly.</p></li>
              <li className="public-card"><h3><Link href="/proof">Proof and trust</Link></h3><p>Methodology, worked examples, stated boundaries and why this product exists.</p></li>
            </ul>
          </div>
        </section>

        <PublicCta />
      </main>

      <PublicFooter />
    </div>
  );
}
