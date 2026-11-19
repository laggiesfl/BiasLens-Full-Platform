import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCta } from "@/components/public/PublicCta";
import { PublicPageIntro } from "@/components/public/PublicPageIntro";
import { offers } from "@/lib/public/offers";

export const metadata = {
  title: "Offers and how an engagement works | BiasLens by BeAccessible",
  description: "The BiasLens offers, from a diagnostic to continuous assurance, and how an engagement works.",
};

export default function OffersPage() {
  return (
    <div className="public-page">
      <PublicHeader current="/offers" />
      <main id="main-content" data-listen-content>
        <PublicPageIntro kicker="Offers" title="Start with one system" lead="Diagnose the evidence gap first, then build stronger assurance over time." />
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
        <PublicCta />
      </main>
      <PublicFooter />
    </div>
  );
}
