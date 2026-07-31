import { createClient } from "@/lib/supabase/server";
import { ROLE_OPTIONS, type Role } from "@/lib/roles";
import { updateRole, updateAccountDetails } from "@/lib/actions/profile";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, organisation_name, role")
    .eq("id", user!.id)
    .single();

  const currentRole = profile?.role as Role | null;

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account details and how BiasLens adapts to you.</p>
      </div>

      {sp.error ? (
        <p className="form-error" role="alert">
          {sp.error}
        </p>
      ) : null}
      {sp.message ? (
        <p className="form-success" role="status">
          {sp.message}
        </p>
      ) : null}

      <section className="card" aria-labelledby="acct-h">
        <h2 id="acct-h" style={{ fontSize: "1.2rem" }}>
          Your details
        </h2>
        <p className="muted">
          BiasLens fills these in for you at the start of every assessment tool,
          so you do not have to type them again each time. You can always change
          them on any individual assessment.
        </p>

        <form action={updateAccountDetails} className="stack">
          <div className="field">
            {/*
              The word "required" is written into the label rather than shown as
              an asterisk. An asterisk hidden from screen readers tells sighted
              users something that other users never hear. (WCAG 3.3.2.)
            */}
            <label htmlFor="full_name">Your name (required)</label>
            <p className="hint" id="name-hint" style={{ marginBottom: 4 }}>
              How BiasLens greets you, and what appears as “Completed by” on the
              documents you generate.
            </p>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              defaultValue={profile?.full_name ?? ""}
              maxLength={120}
              required
              aria-describedby="name-hint"
            />
          </div>

          <div className="field">
            <label htmlFor="organisation_name">Your organisation</label>
            <p className="hint" id="org-hint" style={{ marginBottom: 4 }}>
              The organisation you carry out assessments for. Leave this blank if
              you are working on your own behalf.
            </p>
            <input
              id="organisation_name"
              name="organisation_name"
              type="text"
              autoComplete="organization"
              defaultValue={profile?.organisation_name ?? ""}
              maxLength={160}
              aria-describedby="org-hint"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save your details
          </button>
        </form>

        <dl style={{ margin: "20px 0 0" }}>
          <dt style={{ fontWeight: 700 }}>Email</dt>
          <dd style={{ margin: 0 }}>
            {user?.email}
            <span className="muted"> — contact us if you need this changed.</span>
          </dd>
        </dl>
      </section>

      <section className="card" aria-labelledby="role-h">
        <h2 id="role-h" style={{ fontSize: "1.2rem" }}>
          Your role
        </h2>
        <p className="muted">
          Changing your role changes the guidance and suggested next steps you
          see. It does not delete any of your assessments.
        </p>
        <form action={updateRole}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">Choose your role</legend>
            <div className="stack">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "8px 0",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    defaultChecked={currentRole === r.value}
                    style={{ width: 22, height: 22, marginTop: 4, flexShrink: 0 }}
                    required
                  />
                  <span>
                    <strong style={{ display: "block" }}>{r.label}</strong>
                    <span className="muted">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>
            Save role
          </button>
        </form>
      </section>
    </div>
  );
}
