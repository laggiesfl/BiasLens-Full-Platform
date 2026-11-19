import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicCta } from "@/components/public/PublicCta";
import { PublicPageIntro } from "@/components/public/PublicPageIntro";
import { PUBLIC_PROOF_DOWNLOADS } from "@/lib/export/publicProofPdfs";

export const metadata = {
  title: "Proof, trust and why BiasLens exists | BiasLens by BeAccessible",
  description: "BiasLens proof assets, the boundaries it states openly, and why the product exists.",
};

export default function ProofPage() {
  return (
    <div className="public-page">
      <PublicHeader current="/proof" />
      <main id="main-content" data-listen-content>
        <PublicPageIntro kicker="Proof" title="Proof and trust" lead="See the methodology, worked examples and the boundaries BiasLens states openly." />
        <section id="proof" className="public-section public-section-alt">
          <div className="public-shell">
            <div className="public-section-heading"><h2>Proof and trust</h2><p>BiasLens is being taken to market with the same evidence discipline it asks of clients.</p></div>
            <div className="public-grid-2">
              <article className="public-card">
                <h3>Proof assets</h3>
                <ul>
                  <li><Link href="/methodology">BiasLens Methodology Note</Link> — public methodology and claims boundaries.</li>
                  <li><Link href="/demo">Two-minute problem-to-evidence demo</Link> — fictional-data walkthrough and narration.</li>
                  <li>
                    <Link href="/case-study/recruitment">Fictional-data recruitment case study</Link> — end-to-end evidence walkthrough using a fictional AI-assisted recruitment scenario. <a href={PUBLIC_PROOF_DOWNLOADS.recruitment.href} download={PUBLIC_PROOF_DOWNLOADS.recruitment.filename}>Download PDF</a>.
                  </li>
                  <li>
                    <Link href="/algorithm-defence-file">Sample Algorithm Defence File</Link> — fictional organisation-owned governance evidence record. <a href={PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.href} download={PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.filename}>Download PDF</a>.
                  </li>
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
                <p><Link href="/ai-transparency">AI Transparency Statement</Link> · <Link href="/privacy">Read the Privacy Notice</Link> · <Link href="/accessibility-statement">Read the Accessibility Statement</Link></p>
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
        <PublicCta />
      </main>
      <PublicFooter />
    </div>
  );
}
