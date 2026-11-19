import Link from "next/link";

// "Ready to assess one AI system?" call to action, shared by the public pages.
export function PublicCta() {
  return (
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
  );
}
