export default function PrivacyNoticePage() {
  return (
    <div className="stack" style={{ maxWidth: "75ch" }}>
      <div className="page-header">
        <h1>Privacy Notice</h1>
        <p>
          BiasLens is built with privacy in mind, in line with the Protection of
          Personal Information Act (POPIA) and good data-protection practice.
        </p>
      </div>

      <section className="card stack">
        <h2 style={{ fontSize: "1.2rem" }}>What we collect</h2>
        <p>
          We collect only what we need to run the service: your account email,
          your name if you provide it, the role you choose, and the assessment
          content you create. We follow data minimisation and purpose
          limitation.
        </p>

        <h2 style={{ fontSize: "1.2rem" }}>Sensitive information</h2>
        <p>
          Assessments may involve sensitive topics such as disability, race,
          gender, language, age, migration status, health and socio-economic
          context. Only enter sensitive details that are necessary, and tell
          people how their information will be used. You can delete an assessment
          at any time.
        </p>

        <h2 style={{ fontSize: "1.2rem" }}>How your data is protected</h2>
        <ul>
          <li>All traffic is encrypted in transit (HTTPS).</li>
          <li>
            Row-level security keeps your data separate from other users and
            organisations.
          </li>
          <li>Sensitive actions such as deletion and role changes are logged.</li>
          <li>You control your own exports.</li>
        </ul>

        <h2 style={{ fontSize: "1.2rem" }}>Your choices</h2>
        <p>
          You can change your role, edit or delete your assessments, and request
          deletion of your account. For privacy questions, contact{" "}
          <a href="mailto:hello@beaccessible.co.za">hello@beaccessible.co.za</a>.
        </p>

        <p className="muted">
          This notice will be expanded and legally reviewed before public
          release, as required by the build brief.
        </p>
      </section>
    </div>
  );
}
