import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Privacy notice — BiasLens",
  description:
    "What BiasLens collects, why, where it is stored, how long it is kept, and your rights.",
};

/**
 * Public on purpose. POPIA and the GDPR both expect a person to be able to read
 * how their information will be handled BEFORE they hand any of it over.
 * Behind sign-in, this could only be read by people who had already decided.
 * The path is listed in PUBLIC_PATHS in src/lib/supabase/middleware.ts.
 */
export default function PrivacyNoticePage() {
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
        <h1>Privacy notice</h1>
        <p>
          This explains what BiasLens collects about you, why, where it is kept,
          how long for, and what you can ask us to do about it. It is written to
          be read before you decide whether to use the platform, not after.
        </p>
        <p className="muted">Last updated 1 August 2026.</p>
      </div>

      <section className="card stack" aria-labelledby="who-h">
        <h2>What BiasLens assesses — and what it does not</h2>
        <p>
          BiasLens assesses <strong>systems, not people</strong>. It is a tool for
          examining whether an AI or automated decision-making system produces
          unfair outcomes. It is not, and will not become, a tool for monitoring,
          profiling, scoring or evaluating individual employees.
        </p>
        <p>Specifically, BiasLens does not:</p>
        <ul>
          <li>ingest employee-level records, prompts, messages or activity logs;</li>
          <li>build behavioural profiles of individual workers;</li>
          <li>produce risk scores attached to a named or identifiable person;</li>
          <li>support productivity surveillance or performance monitoring.</li>
        </ul>
        <p>
          Where BiasLens analyses group outcomes, it applies minimum-population
          thresholds: results for very small groups are marked as indicative only
          or suppressed entirely. This is because small groups produce statistically
          unreliable results, and because a small cell in a report can make an
          individual indirectly identifiable even when no names or identifiers are
          held. Removing identifiers does not, by itself, remove re-identification
          risk.
        </p>
        <p>
          This is a deliberate design boundary rather than a current limitation. If
          BiasLens later receives governance data from other enterprise systems, it
          will request the least identifiable data capable of answering the question,
          and this boundary will continue to apply.
        </p>

        <h2 id="who-h" style={{ fontSize: "1.2rem" }}>1. Who is responsible</h2>
        <p>
          <strong>BeAccessible</strong> is the responsible party for personal
          information collected through BiasLens. Under the Protection of Personal
          Information Act, the head of a private body is its Information Officer.
          For BeAccessible that is <strong>Fadila Lagadien</strong>.
        </p>
        <p>
          <strong>All privacy matters:</strong>{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>
        </p>
        <p>
          You do not need an account to contact us, and you do not need an account
          to read this page.
        </p>
      </section>

      <section className="card stack" aria-labelledby="collect-h">
        <h2 id="collect-h" style={{ fontSize: "1.2rem" }}>2. What we collect</h2>
        <p>Only what is needed to run the service.</p>

        <h3 style={{ fontSize: "1.05rem" }}>Your account</h3>
        <ul>
          <li>Email address</li>
          <li>Your name, as you enter it</li>
          <li>The role you choose, which changes the guidance you see</li>
          <li>Your organisation name, if you provide one</li>
        </ul>

        <h3 style={{ fontSize: "1.05rem" }}>What you create</h3>
        <ul>
          <li>Your answers to the assessment questions</li>
          <li>The AI system profiles and risk classifications you build</li>
          <li>Anything you add to an evidence log, including files you attach</li>
          <li>The documents BiasLens generates for you</li>
        </ul>

        <h3 style={{ fontSize: "1.05rem" }}>Technical</h3>
        <ul>
          <li>
            A sign-in cookie, so the platform knows it is still you as you move
            between pages
          </li>
          <li>
            A record of sensitive actions such as deletions and role changes, kept
            so that changes to an assessment can be accounted for
          </li>
        </ul>
      </section>

      <section className="card stack" aria-labelledby="why-h">
        <h2 id="why-h" style={{ fontSize: "1.2rem" }}>3. Why we collect it</h2>
        <ul>
          <li>
            <strong>To provide the service you asked for.</strong> We cannot run an
            assessment without the answers to it.
          </li>
          <li>
            <strong>To support you when something goes wrong.</strong> See section
            10 on who at BeAccessible can see your work.
          </li>
          <li>
            <strong>To keep the platform secure and accountable.</strong> Access is
            by invitation only, and significant changes are logged.
          </li>
        </ul>
        <p>
          That is the whole of it. We do not profile you, we do not advertise to
          you, and we do not sell or share your information for anyone else&apos;s
          commercial purposes.
        </p>
      </section>

      <section className="card stack" aria-labelledby="sensitive-h">
        <h2 id="sensitive-h" style={{ fontSize: "1.2rem" }}>
          4. Sensitive information, and information about other people
        </h2>
        <p>
          Bias assessments touch subjects POPIA calls special personal
          information: disability, race, health, religion, sex, and similar. This
          is unavoidable — you cannot test a system for discrimination without
          naming the grounds it might discriminate on.
        </p>
        <p>
          <strong>Most of the platform does not need identifiable data.</strong>{" "}
          The Fairness Metrics Calculator works on counts — how many people in a
          group, how many received a positive outcome. It never needs to know who
          they were. Please keep it that way wherever you can.
        </p>
        <p>
          <strong>If you upload information about other people</strong> — for
          example records attached to an evidence log — you remain the responsible
          party for that information. BeAccessible processes it on your behalf and
          for no other purpose. Only upload what you genuinely need, and remove it
          when you no longer need it.
        </p>
      </section>

      <section className="card stack" aria-labelledby="where-h">
        <h2 id="where-h" style={{ fontSize: "1.2rem" }}>
          5. Where your information is stored
        </h2>
        <p>
          <strong>
            Your data is stored in the United Kingdom, not in South Africa.
          </strong>{" "}
          Our database is hosted in London.
        </p>
        <p>
          POPIA treats this as a transfer of personal information outside the
          Republic, so we are telling you plainly rather than leaving it to be
          discovered. The transfer happens because it is necessary to provide the
          service you have asked for, and our agreements with our providers require
          them to protect the information.
        </p>
        <p>
          For anyone in the EU or EEA: the United Kingdom holds a European
          Commission adequacy decision, renewed in December 2025, so information
          may move there without additional safeguards for the period it runs.
        </p>
      </section>

      <section className="card stack" aria-labelledby="processors-h">
        <h2 id="processors-h" style={{ fontSize: "1.2rem" }}>
          6. Who else handles it
        </h2>
        <p>Three companies process information on our behalf:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — accounts, sign-in and the database. This is
            where your assessments live.
          </li>
          <li>
            <strong>Vercel</strong> — hosting. This is what serves the pages to
            your browser.
          </li>
          <li>
            <strong>Resend</strong> — sending the emails we send you, such as
            invitations and sign-in links.
          </li>
        </ul>
        <p>
          These are the only three. Each operates internationally, which means
          information may be handled outside South Africa. We have not
          independently audited their internal practices and we will not claim
          otherwise.
        </p>
      </section>

      <section className="card stack" aria-labelledby="notdo-h">
        <h2 id="notdo-h" style={{ fontSize: "1.2rem" }}>7. What we do not do</h2>
        <p>
          <strong>
            Nothing you enter into BiasLens is sent to an artificial intelligence
            model.
          </strong>{" "}
          There is no AI inside this platform. The fairness calculations are
          arithmetic. The compliance mapping is a fixed set of rules. Your
          documents are assembled from what you typed. Your assessment content is
          never used to train anything, by us or by anyone else.
        </p>
        <p>We also do not:</p>
        <ul>
          <li>Run advertising or marketing trackers on the platform</li>
          <li>Use analytics that follow you across the web</li>
          <li>Sell, rent or share your information for commercial purposes</li>
          <li>Make automated decisions about you</li>
        </ul>

        <h3 style={{ fontSize: "1rem", marginTop: "1.25rem" }}>
          BiasLens assesses systems, not people
        </h3>
        <p>
          This one matters enough to state on its own.{" "}
          <strong>
            BiasLens is not, and will not become, a tool for monitoring, profiling
            or scoring individual employees.
          </strong>{" "}
          It examines whether a system produces unfair outcomes. It does not
          examine the people using that system.
        </p>
        <p>That means BiasLens does not:</p>
        <ul>
          <li>Take in employee-level records, prompts, messages or activity logs</li>
          <li>Build behavioural profiles of individual workers</li>
          <li>Produce a risk score attached to a named or identifiable person</li>
          <li>Support productivity surveillance or performance monitoring</li>
        </ul>
        <p>
          Where BiasLens compares outcomes between groups, it applies minimum
          population thresholds. Results for very small groups are marked{" "}
          <strong>indicative only</strong>, and groups below the reporting
          threshold are <strong>suppressed entirely</strong>. Two reasons, both
          important: small numbers produce unreliable results, and a small group in
          a report can make an individual indirectly identifiable even when we hold
          no names. Removing names does not, by itself, remove the risk of someone
          being recognised.
        </p>
        <p>
          This is a design boundary, not a temporary limitation. If BiasLens ever
          receives governance data from other systems in your organisation, it will
          ask for the least identifiable information capable of answering the
          question — and this boundary will still apply.
        </p>
      </section>

      <section className="card stack" aria-labelledby="keep-h">
        <h2 id="keep-h" style={{ fontSize: "1.2rem" }}>8. How long we keep it</h2>
        <ul>
          <li>
            <strong>While your account is open</strong> — your account details and
            your assessments are kept so you can carry on using them.
          </li>
          <li>
            <strong>When you ask us to delete</strong> — your account, your
            assessments and any files you uploaded are removed{" "}
            <strong>within 30 days</strong>.
          </li>
          <li>
            <strong>You can delete individual assessments yourself</strong> at any
            time, without asking us.
          </li>
          <li>
            <strong>Our audit record survives, without you in it.</strong> The log
            of significant actions is kept, but the entry no longer identifies who
            performed them. What happened remains accountable; who did it does not
            stay attached to a deleted person.
          </li>
        </ul>
      </section>

      <section className="card stack" aria-labelledby="secure-h">
        <h2 id="secure-h" style={{ fontSize: "1.2rem" }}>9. How it is protected</h2>
        <ul>
          <li>All traffic is encrypted in transit using HTTPS.</li>
          <li>
            Row-level security is enforced in the database itself, not only in the
            application. One ordinary user cannot read another ordinary
            user&apos;s records, and this is enforced below the application rather
            than by it.
          </li>
          <li>
            Accounts are created by invitation only. Public sign-up is switched off
            at the database, not merely hidden in the interface.
          </li>
          <li>Sensitive actions such as deletions and role changes are logged.</li>
          <li>You control your own exports.</li>
        </ul>
      </section>

      <section className="card stack" aria-labelledby="admin-h">
        <h2 id="admin-h" style={{ fontSize: "1.2rem" }}>
          10. Who at BeAccessible can see your work
        </h2>
        <p>
          <strong>
            Administrator accounts at BeAccessible can read the assessments held on
            the platform, including yours.
          </strong>{" "}
          We are telling you this plainly because a privacy notice that implied
          nobody could would be untrue.
        </p>
        <p>This access exists so that we can:</p>
        <ul>
          <li>Help you when something has gone wrong with an assessment</li>
          <li>Investigate a fault or a security concern</li>
          <li>Respond to a request or a complaint you have made</li>
        </ul>
        <p>
          It is limited to named administrator accounts, not to anyone who happens
          to work with us. It is not used to review your work, to judge it, or for
          any commercial purpose. If you would prefer we did not look at a
          particular assessment while helping you, say so and we will work around
          it.
        </p>
        <p>
          You can ask us at any time whether an administrator has accessed your
          records, and we will tell you.
        </p>
      </section>

      <section className="card stack" aria-labelledby="rights-h">
        <h2 id="rights-h" style={{ fontSize: "1.2rem" }}>11. Your rights</h2>
        <p>You can ask us to:</p>
        <ul>
          <li>Tell you what personal information we hold about you</li>
          <li>Correct anything that is wrong</li>
          <li>Delete your account and everything in it</li>
          <li>Give you a copy of your data in a usable format</li>
          <li>Stop processing your information, or object to how we are doing it</li>
        </ul>
        <p>
          Email{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>.
          We will reply within two working days and act within 30 days. There is no
          charge, and you do not have to explain why you are asking.
        </p>
        <p>
          <strong>If you cannot use email,</strong> or need this notice in large
          print, plain text, audio, or read aloud to you, tell us through any
          channel that works for you and we will arrange it at no cost.
        </p>
      </section>

      <section className="card stack" aria-labelledby="cookies-h">
        <h2 id="cookies-h" style={{ fontSize: "1.2rem" }}>12. Cookies</h2>
        <p>
          BiasLens sets a cookie so that you stay signed in as you move between
          pages. That is what it is for and that is all it does.
        </p>
        <p>
          There are no advertising cookies and no cross-site tracking. Because the
          cookie is strictly necessary to provide a service you have asked for, we
          do not interrupt you with a consent banner for it.
        </p>
      </section>

      <section className="card stack" aria-labelledby="complain-h">
        <h2 id="complain-h" style={{ fontSize: "1.2rem" }}>
          13. If you want to complain
        </h2>
        <p>
          Please raise it with us first at{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>,
          but you are not obliged to.
        </p>
        <ul>
          <li>
            <strong>South Africa —</strong> the Information Regulator. Complaints
            go on Form 5 through the{" "}
            <a href="https://eservices.inforegulator.org.za/">
              Regulator&apos;s eServices portal
            </a>
            , or by email to{" "}
            <a href="mailto:POPIAComplaints@inforegulator.org.za">
              POPIAComplaints@inforegulator.org.za
            </a>
            . Offices at Woodmead North Office Park, 54 Maxwell Drive, Woodmead,
            Johannesburg, 2191.
          </li>
          <li>
            <strong>United Kingdom —</strong> the Information Commissioner&apos;s
            Office.
          </li>
          <li>
            <strong>European Union or EEA —</strong> the data protection
            supervisory authority for your country. We will help you identify the
            right one if you ask.
          </li>
        </ul>
      </section>

      <section className="card stack" aria-labelledby="changes-h">
        <h2 id="changes-h" style={{ fontSize: "1.2rem" }}>
          14. Changes to this notice
        </h2>
        <p>
          We update this notice whenever what we do with your information changes,
          and we review it at least every six months. The date at the top of the
          page tells you when it last changed. If a change materially affects you,
          we will tell you rather than rely on you noticing.
        </p>
      </section>

      <p style={{ marginTop: 32 }}>
        <Link href="/accessibility-statement">Accessibility statement</Link>
        {"  ·  "}
        <Link href="/login">Go to BiasLens</Link>
      </p>
    </main>
  );
}
