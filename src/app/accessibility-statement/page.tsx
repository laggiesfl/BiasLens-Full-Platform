import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Accessibility statement — BiasLens",
  description:
    "How accessible BiasLens is, what is not yet accessible, and how to tell us about a barrier.",
};

/**
 * This page sits OUTSIDE the (app) route group on purpose.
 *
 * An accessibility statement exists for people who are hitting a barrier —
 * which includes people who cannot get past the sign-in screen. Behind sign-in
 * it is unreachable by exactly the people it is written for. The path is also
 * listed in PUBLIC_PATHS in src/lib/supabase/middleware.ts.
 *
 * No skip link is needed here: the page has no navigation blocks to skip past.
 */
export default function AccessibilityStatementPage() {
  return (
    <main
      id="main-content"
      style={{ maxWidth: "75ch", margin: "0 auto", padding: "32px 20px 64px" }}
    >
      <div className="cluster" style={{ gap: 12, marginBottom: 24 }}>
        <Logo />
        <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>BiasLens</span>
      </div>

      <div className="page-header">
        <h1>Accessibility statement for BiasLens</h1>
        <p>
          We build tools that help organisations find and remove barriers. It
          would be inconsistent to build those tools with barriers in them. So we
          hold BiasLens to the standard we ask of our clients, and we publish what
          we find — including when we find it in our own work.
        </p>
      </div>

      <section className="card stack" aria-labelledby="status-h">
        <h2 id="status-h" style={{ fontSize: "1.2rem" }}>1. Compliance status</h2>
        <p>
          <strong>
            BiasLens is partially compliant with WCAG 2.2 Level AA.
          </strong>
        </p>
        <p>
          Partially compliant means the platform meets most of the standard, and
          some parts have not been verified. We are not aware of any outstanding
          failure at Level A or Level AA in the areas we have examined. We are also
          clear that we have not yet examined everything, and section 4 says
          exactly what we have and have not tested.
        </p>
        <p>
          This statement applies to the BiasLens platform at{" "}
          <strong>biaslens.beaccessible.co.za</strong>, including the assessment
          tools, the documents it generates, and the emails it sends.
        </p>
      </section>

      <section className="card stack" aria-labelledby="verified-h">
        <h2 id="verified-h" style={{ fontSize: "1.2rem" }}>
          2. What we have verified
        </h2>
        <p>Each of these has been checked against the code, page by page:</p>
        <ul>
          <li>A skip link to the main content on every assessment tool.</li>
          <li>Semantic landmarks and a logical heading order.</li>
          <li>
            Every form field has a label that is programmatically joined to it.
          </li>
          <li>
            Required fields are announced to screen reader users, not marked with
            a symbol that only sighted users can perceive.
          </li>
          <li>
            Status, risk and findings are conveyed with words as well as colour.
            No meaning depends on colour alone.
          </li>
          <li>
            Results and confirmations are announced to assistive technology as
            they appear, using live regions.
          </li>
          <li>
            Lists of options use standard browser controls rather than custom
            widgets, so they behave the way people already expect.
          </li>
          <li>
            Generated Word documents use real heading styles and table headers, so
            they can be navigated with assistive technology.
          </li>
          <li>
            Your organisation and name are carried across the tools, so you do not
            have to type them again in each one.
          </li>
        </ul>
      </section>

      <section className="card stack" aria-labelledby="found-h">
        <h2 id="found-h" style={{ fontSize: "1.2rem" }}>
          3. What we found and fixed
        </h2>
        <p>
          We are recording these after fixing them, because they were real
          barriers that affected real people. We would rather say so than quietly
          remove them from the record.
        </p>

        <h3 style={{ fontSize: "1.05rem" }}>
          Typing moved the cursor out of the field (fixed 31 July 2026)
        </h3>
        <p>
          In the Fairness Metrics Calculator, entering a group name moved focus
          away from the field after each character. Anyone affected had to click
          back in repeatedly. This did not meet{" "}
          <strong>3.2.2 On Input (Level A)</strong>. It affected people typing with
          one hand, using switch devices or using speech input most of all.
        </p>

        <h3 style={{ fontSize: "1.05rem" }}>
          Required fields were not announced (fixed 31 July 2026)
        </h3>
        <p>
          Required fields were marked with a red asterisk that was deliberately
          hidden from screen readers, and carried no other indication. Sighted
          users were told a field was required; screen reader users were not. This
          did not meet <strong>3.3.2 Labels or Instructions (Level A)</strong>.
        </p>

        <h3 style={{ fontSize: "1.05rem" }}>
          The same details had to be typed in every tool (fixed 31 July 2026)
        </h3>
        <p>
          Organisation and name were not carried between tools. This did not meet{" "}
          <strong>3.3.7 Redundant Entry (Level A)</strong> and related to{" "}
          <strong>1.3.5 Identify Input Purpose (Level AA)</strong>. Both are now
          addressed.
        </p>

        <h3 style={{ fontSize: "1.05rem" }}>
          Signing in without a password did not work (fixed 29 July 2026)
        </h3>
        <p>
          The emailed sign-in link failed, and the error told people to try again
          — which could not have worked. This mattered because signing in without
          a password is the more accessible route for people who find passwords
          hard to remember, manage or type. This did not meet{" "}
          <strong>3.3.8 Accessible Authentication (Level AA)</strong> or{" "}
          <strong>3.3.3 Error Suggestion (Level AA)</strong>.
        </p>

        <h3 style={{ fontSize: "1.05rem" }}>
          Resetting a forgotten password did not work (fixed 31 July 2026)
        </h3>
        <p>
          The same fault affected password reset. It was confirmed by completing a
          real reset, not by reading the code, and then fixed and re-tested. Error
          messages now explain whether a link has expired, has already been used,
          or was opened in a different browser, and return you to the screen where
          you can request a new one.
        </p>
      </section>

      <section className="card stack" aria-labelledby="notyet-h">
        <h2 id="notyet-h" style={{ fontSize: "1.2rem" }}>
          4. What we have not tested
        </h2>
        <p>
          This is the honest limit of our assessment. An accessibility statement
          that implies more testing than actually happened is worth less than no
          statement at all.
        </p>
        <ul>
          <li>
            <strong>No screen reader testing has been carried out.</strong>
          </li>
          <li>
            <strong>No keyboard-only walkthrough has been carried out.</strong> We
            have not verified that every function can be reached and operated
            without a mouse.
          </li>
          <li>
            <strong>
              No testing at 200% zoom or at 320 pixels width has been carried out.
            </strong>
          </li>
          <li>
            <strong>Touch target sizes have not been measured.</strong>
          </li>
          <li>
            <strong>Reduced-motion behaviour has not been verified.</strong>
          </li>
          <li>
            Colour contrast has been measured on the sign-in and reset screens, but
            not systematically across the assessment tools.
          </li>
          <li>
            The platform is used regularly by a member of our team who types with
            one hand. That is real lived experience of one kind of access need. It
            is not a substitute for structured testing with people who use screen
            readers, magnification or switch devices, and we have not yet done that
            testing.
          </li>
        </ul>
        <p>
          Until that work is done, we will not claim more than partial compliance,
          however well the platform performs in the areas we have checked.
        </p>
      </section>

      <section className="card stack" aria-labelledby="third-h">
        <h2 id="third-h" style={{ fontSize: "1.2rem" }}>
          5. Content outside our control
        </h2>
        <p>BiasLens is built on services provided by other companies:</p>
        <ul>
          <li><strong>Supabase</strong> — accounts, sign-in and data storage</li>
          <li><strong>Vercel</strong> — hosting</li>
          <li><strong>Resend</strong> — email delivery</li>
        </ul>
        <p>
          We have configured these services and we are responsible for how we use
          them. We cannot change how they are built internally. We have not
          assessed their own conformance and have not yet requested their
          conformance reports. We will do so.
        </p>
        <p>
          We can only vouch for what we built ourselves. Where a barrier comes from
          one of these services, we will say so and help you work around it.
        </p>
      </section>

      <section className="card stack" aria-labelledby="prep-h">
        <h2 id="prep-h" style={{ fontSize: "1.2rem" }}>
          6. How this statement was prepared
        </h2>
        <p>
          This statement was prepared on <strong>31 July 2026</strong> and last
          reviewed on <strong>1 August 2026</strong>.
        </p>
        <p>
          It is based on an accessibility audit carried out between 29 and 31 July
          2026, covering the sign-in and authentication paths and a code-level
          review of the assessment tools.
        </p>
        <p>
          <strong>Method: self-assessment by BeAccessible.</strong> No independent
          evaluation has been carried out. When we commission one, we will say so
          here and publish the outcome.
        </p>
        <p>
          We review this statement whenever we release a significant change, and at
          least every six months. The next scheduled review is{" "}
          <strong>31 January 2027</strong>.
        </p>
      </section>

      <section className="card stack" aria-labelledby="feedback-h">
        <h2 id="feedback-h" style={{ fontSize: "1.2rem" }}>
          7. Tell us about a barrier
        </h2>
        <p>
          If you find a barrier in BiasLens, please tell us. We would much rather
          hear about a problem than have someone quietly give up on the tool.
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>
        </p>
        <p>
          Tell us what you were trying to do and what got in the way. You do not
          need to know the technical name for the problem, and you do not need to
          explain your disability to us.
        </p>
        <p>
          <strong>What happens next:</strong> we will acknowledge your message
          within two working days and tell you what we intend to do and by when. If
          we cannot fix something quickly, we will offer you a way around it in the
          meantime.
        </p>
        <p>
          <strong>If you cannot sign in,</strong> tell us that too. You do not need
          an account to contact us, and you do not need an account to read this
          page.
        </p>
        <p>
          <strong>Alternative formats:</strong> if you need this statement, or
          anything else in BiasLens, in large print, plain text, audio, or read
          aloud to you, ask and we will arrange it at no cost.
        </p>
      </section>

      <section className="card stack" aria-labelledby="enforce-h">
        <h2 id="enforce-h" style={{ fontSize: "1.2rem" }}>
          8. If you are not satisfied with our response
        </h2>
        <p>
          We would ask you to raise the matter with us first, but you are not
          obliged to.
        </p>
        <ul>
          <li>
            <strong>South Africa —</strong> the South African Human Rights
            Commission, which investigates complaints of human rights violations
            including unfair discrimination on the grounds of disability. You can
            lodge a complaint at{" "}
            <a href="https://www.sahrc.org.za/index.php/lodge-complaints">
              sahrc.org.za/index.php/lodge-complaints
            </a>
            , where complaint forms are provided in eleven languages.
          </li>
          <li>
            <strong>United Kingdom —</strong> the Equality Advisory and Support
            Service. Freephone 0808 800 0082, textphone 0808 800 0084, or{" "}
            <a href="https://www.equalityadvisoryservice.com/">
              equalityadvisoryservice.com
            </a>
            .
          </li>
          <li>
            <strong>European Union —</strong> the national accessibility
            enforcement body or equality body for your country. These differ by
            member state, and we will help you identify the right one if you ask.
          </li>
        </ul>
      </section>

      <p style={{ marginTop: 32 }}>
        <Link href="/login">Go to BiasLens</Link>
      </p>
    </main>
  );
}
