import Link from "next/link";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "Assess one AI system | BiasLens",
  description: "Start a BiasLens qualification enquiry for one AI-enabled system or decision process.",
};

export default function EnquirePage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-form-wrap">
          <div className="public-shell">
            <div className="public-form-card">
              <div className="public-form-back">
                <Link href="/">← Back to BiasLens overview</Link>
              </div>
              <div className="public-form-intro">
                <span className="public-kicker">BiasLens qualification</span>
                <h1>Assess one AI system</h1>
                <p className="public-lead">
                  Tell us about one AI-enabled system or decision process. This is a qualification enquiry, not the assessment itself.
                </p>
                <div className="public-callout public-callout-note">
                  <strong>Do not submit sensitive person-level information.</strong> Please describe the system and decision context only. BiasLens assesses systems, processes and aggregated outcomes — not individual people.
                </div>
              </div>
              <EnquiryForm />
              <p style={{ marginTop: 24 }}><Link href="/">← Back to BiasLens overview</Link></p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
