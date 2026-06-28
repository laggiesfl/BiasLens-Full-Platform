import { createClient } from "@/lib/supabase/server";
import { ROLE_OPTIONS, type Role } from "@/lib/roles";
import { updateRole } from "@/lib/actions/profile";

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
    .select("full_name, role")
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
          Your account
        </h2>
        <dl style={{ margin: 0 }}>
          <dt style={{ fontWeight: 700 }}>Name</dt>
          <dd style={{ margin: "0 0 12px" }}>{profile?.full_name ?? "Not set"}</dd>
          <dt style={{ fontWeight: 700 }}>Email</dt>
          <dd style={{ margin: 0 }}>{user?.email}</dd>
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
