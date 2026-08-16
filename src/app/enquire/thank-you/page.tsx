import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";

export const metadata = {
  title: "Enquiry received | BiasLens",
  description: "Confirmation that a BiasLens qualification enquiry was received.",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="public-page">
      <PublicHeader />
      <main id="main-content" data-listen-content>
        <section className="public-form-wrap">
          <div className="public-shell public-thank-you">
            <div className="public-form-card">
              <span className="public-kicker">Enquiry received</span>
              <h1>Thank you. Your BiasLens enquiry has been received.</h1>
              <p className="public-lead">
                BeAccessible will review the system and decision context you described. If the enquiry is a fit, the next step is a short 10-minute qualification conversation.
              </p>
              {ref && (
                <p>
                  Your enquiry reference is <span className="public-reference">{ref}</span>.
                </p>
              )}
              <div className="public-callout public-callout-note">
                <strong>Please keep sensitive person-level information out of email follow-ups.</strong> We will tell you what evidence is appropriate to share if the enquiry moves into a BiasLens engagement.
              </div>
              <div className="public-actions">
                <Link href="/" className="public-button public-button-primary">Return to BiasLens</Link>
                <Link href="/login" className="public-button public-button-secondary">Sign in to BiasLens</Link>
                <a href="mailto:hello@beaccessible.co.za?subject=BiasLens%20enquiry%20follow-up" className="public-button public-button-secondary">Email BeAccessible</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
