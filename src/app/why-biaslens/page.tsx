import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCta } from "@/components/public/PublicCta";
import { PublicPageIntro } from "@/components/public/PublicPageIntro";

export const metadata = {
  title: "Why BiasLens is different | BiasLens by BeAccessible",
  description: "How BiasLens protects the honesty of the evidence an organisation relies on.",
};

export default function WhyBiasLensPage() {
  return (
    <div className="public-page">
      <PublicHeader current="/why-biaslens" />
      <main id="main-content" data-listen-content>
        <PublicPageIntro kicker="Why BiasLens" title="Why BiasLens is different" lead="BiasLens improves the quality and honesty of your evidence. It does not manufacture false confidence." />
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
        <PublicCta />
      </main>
      <PublicFooter />
    </div>
  );
}
