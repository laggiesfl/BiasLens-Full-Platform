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

  // Reached via a recovery link, which establishes a session first. If there
  // is no session, the link has expired or was already used. Send the person
  // back to the reset screen WITH an explanation rather than dropping them on
  // the sign-in page with no idea what happened. (WCAG 3.3.3 Error Suggestion.)
  if (!user) {
    redirect(
      "/reset-password?error=" +
        encodeURIComponent(
          "Your password reset link is no longer active. It may have expired or already been used. Request a new one below."
        )
    );
  }

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
          {/*
            Kept at 8 to match the server check in updatePassword(). Note for
            later: sign-up requires 12, so the two paths disagree. Raising this
            to 12 means changing auth.ts as well — left alone deliberately so
            this change stays limited to the reset fault.
          */}
          <p className="hint" id="pw-hint" style={{ marginBottom: 4 }}>
            Use at least 8 characters. A short phrase you will remember is
            stronger, and far easier to type, than a jumble of symbols.
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
