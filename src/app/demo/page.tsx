import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "BiasLens Two-Minute Demo | From Concern to Evidence",
  description:
    "A fictional-data walkthrough showing how BiasLens moves one AI-assisted decision process from concern to documented evidence, uncertainty and next action.",
};

const steps = [
  {
    time: "0:00–0:20",
    title: "Start with one defined system",
    body: "A fictional organisation uses an AI-assisted recruitment tool to support candidate shortlisting. The organisation is concerned about whether disabled applicants could experience different outcomes.",
    evidence: "System purpose and decision context are defined before any bias conclusion is attempted.",
  },
  {
    time: "0:20–0:45",
    title: "Separate evidence from assumption",
    body: "The vendor says the model is fair, but the organisation has no accessible test report, no clear affected-group breakdown and incomplete documentation about the population used for validation.",
    evidence: "Vendor assurance is recorded as an assertion. Missing validation evidence remains an explicit unknown.",
  },
  {
    time: "0:45–1:10",
    title: "Identify possible bias pathways",
    body: "BiasLens examines preexisting, technical and emergent pathways. In this fictional case, representation gaps may indicate preexisting risk, interface barriers may create technical risk, and population or use changes may create emergent risk.",
    evidence: "Possible pathways are documented without presenting them as proven causes.",
  },
  {
    time: "1:10–1:35",
    title: "Handle fairness signals carefully",
    body: "A fictional outcome comparison suggests a difference between groups, but the available sample is limited. BiasLens treats the result as a signal requiring investigation rather than proof of discrimination.",
    evidence: "Evidence strength, sample limitation and the need for further investigation remain visible together.",
  },
  {
    time: "1:35–1:55",
    title: "Create a traceable finding",
    body: "The output records what was observed, the evidence status, the rationale, limitations and a recommended next action — for example, obtaining better denominator data, testing accessibility and requesting stronger vendor evidence.",
    evidence: "The organisation gains a documented evidence trail rather than a binary pass/fail label.",
  },
  {
    time: "1:55–2:00",
    title: "Move to action",
    body: "The question changes from ‘Is this AI biased?’ to ‘What does our evidence support, what remains unverified and what must we investigate next?’",
    evidence: "That is the operating discipline BiasLens is built to support.",
  },
];

export default function DemoPage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-section">
          <div className="public-shell">
            <div className="public-section-heading">
              <span className="public-kicker">Two-minute problem-to-evidence demo</span>
              <h1>From concern to a defensible evidence question.</h1>
              <p className="public-lead">
                This walkthrough uses entirely fictional recruitment data and a fictional organisation. It demonstrates the BiasLens evidence discipline; it does not represent a real client finding or legal conclusion.
              </p>
            </div>

            <div className="public-callout public-callout-note">
              <strong>Demo scenario:</strong> an AI-assisted candidate-screening workflow influences shortlisting. The organisation wants to understand whether disabled applicants are visible in the evidence and whether any outcome difference warrants investigation.
            </div>

            <section className="public-section" aria-labelledby="walkthrough-title">
              <div className="public-section-heading">
                <h2 id="walkthrough-title">The two-minute walkthrough</h2>
                <p>Use the sequence below as the narration and visual storyboard for the production demo video.</p>
              </div>
              <div className="public-grid-2">
                {steps.map((step) => (
                  <article key={step.time} className="public-card">
                    <span className="public-eyebrow">{step.time}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    <p><strong>What BiasLens preserves:</strong> {step.evidence}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="public-section public-section-alt" aria-labelledby="screen-title">
              <div className="public-panel">
                <h2 id="screen-title">Recommended on-screen sequence</h2>
                <ol>
                  <li><strong>System card:</strong> purpose, decision influenced and affected population.</li>
                  <li><strong>Evidence inventory:</strong> available, missing and unverified evidence.</li>
                  <li><strong>Bias pathway view:</strong> preexisting, technical and emergent pathways.</li>
                  <li><strong>Fairness signal:</strong> fictional outcome difference with sample-size caveat.</li>
                  <li><strong>Finding card:</strong> evidence status, rationale, limitation and next action.</li>
                  <li><strong>Closing frame:</strong> “Know what your evidence supports — and what it does not.”</li>
                </ol>
              </div>
            </section>

            <section className="public-section" aria-labelledby="script-title">
              <div className="public-panel">
                <h2 id="script-title">Narration script</h2>
                <p>
                  “This fictional organisation uses AI to support recruitment shortlisting. The concern is simple: could disabled applicants experience different outcomes? BiasLens does not begin by declaring the system biased. It begins by defining the system, the decision it influences and the evidence available.”
                </p>
                <p>
                  “The vendor says the model is fair. But an assurance is not the same as verified evidence. BiasLens records what is documented, what is missing and what remains unverified. It then examines possible preexisting, technical and emergent bias pathways without presenting a possible pathway as a proven cause.”
                </p>
                <p>
                  “Where outcome data is available, BiasLens can surface a fairness signal. In this fictional example the sample is limited, so the result is not treated as proof of discrimination. The limitation stays visible. The finding records the evidence status, rationale and next action.”
                </p>
                <p>
                  “The result is not a false green light or a dramatic red flag. It is a traceable evidence question: what do we know, what do we not know, and what must we investigate next? That is BiasLens — evidence-led algorithmic accountability by BeAccessible.”
                </p>
              </div>
            </section>

            <section className="public-section public-section-alt">
              <div className="public-panel">
                <h2>Continue from the demo</h2>
                <p>Read the public methodology note for the principles behind the workflow, or bring one real AI system into the qualification process.</p>
                <div className="public-actions">
                  <Link href="/methodology" className="public-button public-button-secondary">Read the Methodology Note</Link>
                  <Link href="/enquire" className="public-button public-button-primary">Assess one AI system</Link>
                </div>
              </div>
            </section>

            <p><Link href="/">Return to the BiasLens overview</Link></p>
          </div>
        </section>
      </main>
    </div>
  );
}
