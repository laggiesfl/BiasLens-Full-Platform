import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { BiasLensGuide } from "@/components/guide/BiasLensGuide";

export const metadata: Metadata = {
  title: "BiasLens Guide | Multilingual AI Accountability Guidance",
  description:
    "Ask BiasLens Guide about algorithmic bias, evidence readiness, accessibility, vendor evidence and the BiasLens assessment pathway in six supported languages.",
};

export default function GuidePage() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" className="public-section" data-listen-content>
        <div className="public-shell">
          <div className="public-section-heading">
            <span className="public-kicker">Multilingual · accessible · evidence-led</span>
            <h1>Ask the BiasLens Guide</h1>
            <p>
              Ask about BiasLens, algorithmic bias, evidence readiness, disability and accessibility,
              vendor claims, or how to start an assessment. You can type, speak, or listen to answers.
            </p>
          </div>
          <BiasLensGuide />
        </div>
      </main>
    </div>
  );
}
