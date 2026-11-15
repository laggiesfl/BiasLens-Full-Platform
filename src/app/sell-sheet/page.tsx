import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "BiasLens commercial sell sheet | BeAccessible",
  description: "A concise overview of BiasLens evidence-led AI governance and accessibility intelligence, commercial options, and how to request a demonstration.",
};

const engagements = [
  { title: "Evidence Readiness Diagnostic", detail: "Understand one AI system, the documentation available, evidence gaps and immediate questions." },
  { title: "System Bias Assessment", detail: "Review potential bias and accessibility risks, the strength of supporting evidence, and recommended next steps." },
  { title: "Algorithm Defence File", detail: "Create an organisation-owned record of evidence, rationale, limitations, controls and follow-up." },
  { title: "Continuous Assurance", detail: "Reassess significant changes to AI systems, affected groups and supporting evidence over time." },
];

export default function SellSheetPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell" style={{ maxWidth: 920 }}>
            <p className="public-kicker">BeAccessible | Commercial overview</p>
            <h1>BiasLens: evidence-led AI governance and accessibility intelligence</h1>
            <p className="public-lead">Can your organisation demonstrate what its AI systems do, who may be affected, and which claims are supported by evidence?</p>
            <p>BiasLens supports structured examination of AI-enabled decision processes. It helps organisations identify potential bias, accessibility and disability-exclusion risk signals, distinguish evidence from assumptions, and document uncertainties requiring human review.</p>
            <h2>Who it is for</h2>
            <p>Organisations deploying or developing consequential AI systems, including recruitment technology providers, AI implementation teams, risk and compliance functions, and governance advisers.</p>
            <h2>Four ways to engage</h2>
            <ul>
              {engagements.map(({ title, detail }) => <li key={title}><strong>{title}:</strong> {detail}</li>)}
            </ul>
            <h2>What you receive</h2>
            <p>A defined scope for one system or decision process, documented evidence and limitations, clearly separated signals and findings, and practical follow-up recommendations appropriate to the engagement selected.</p>
            <h2>Why BiasLens</h2>
            <p>BiasLens combines an evidence-first governance method with accessibility, disability inclusion and Universal Design considerations. It supports accountable human decisions rather than claiming to automate legal conclusions.</p>
            <div className="public-callout public-callout-note" style={{ marginBlock: 24 }}>
              <strong>Assurance boundary:</strong> BiasLens is governance decision support. It does not certify regulatory compliance, establish legal discrimination findings, or replace independent audits. Blind screen-reader user testing remains outstanding; other Firefox accessibility tests have been completed as reported.
            </div>
            <div className="public-actions">
              <Link href="/enquire" className="public-button public-button-primary">Request a BiasLens discussion</Link>
              <Link href="/demo" className="public-button public-button-secondary">Explore the demonstration</Link>
            </div>
            <p style={{ marginTop: 24 }}>BeAccessible | <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a> | <a href="https://beaccessible.co.za/">beaccessible.co.za</a></p>
            <p><Link href="/accessibility-statement">Accessibility statement</Link> · <Link href="/ai-transparency">AI transparency</Link> · <Link href="/methodology">Methodology</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
