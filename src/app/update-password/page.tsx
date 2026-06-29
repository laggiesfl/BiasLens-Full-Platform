import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "@/lib/actions/auth";
import { PasswordField } from "@/components/PasswordField";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Reached via a recovery link, which establishes a session first.
  if (!user) redirect("/login");

  return (
    <main className="auth-wrap" id="main-content">
      <div className="card auth-card stack">
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Set a new password</h1>
        </div>
        <p className="muted">Choose a new password for your account.</p>

        {sp.error ? (
          <p className="form-error" role="alert">
            {sp.error}
          </p>
        ) : null}

        <form action={updatePassword} className="stack" style={{ marginTop: 0 }}>
          <p className="hint" id="pw-hint" style={{ marginBottom: 4 }}>
            Use at least 8 characters.
          </p>
          <PasswordField
            id="password"
            name="password"
            label="New password"
            autoComplete="new-password"
            minLength={8}
            describedBy="pw-hint"
          />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Save new password
          </button>
        </form>
      </div>
    </main>
  );
}
