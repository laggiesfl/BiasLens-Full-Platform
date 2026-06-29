import Link from "next/link";
import { Logo } from "@/components/Logo";
import { t } from "@/lib/i18n";
import { signUp } from "@/lib/actions/auth";
import { PasswordField } from "@/components/PasswordField";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const sp = await searchParams;
  const showCheckEmail = sp.message === "check-email";

  return (
    <main className="auth-wrap" id="main-content">
      <div className="card auth-card stack">
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{t.product.name}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {t.product.tagline} {t.product.by}
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: "1.2rem" }}>{t.auth.signupTitle}</h2>

        {sp.error ? (
          <p className="form-error" role="alert">
            {sp.error}
          </p>
        ) : null}
        {showCheckEmail ? (
          <p className="form-success" role="status">
            {t.auth.checkEmail}
          </p>
        ) : null}

        {!showCheckEmail ? (
          <form action={signUp} className="stack" style={{ marginTop: 0 }}>
            <div className="field">
              <label htmlFor="full_name">{t.auth.nameLabel}</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">{t.auth.emailLabel}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <p className="hint" id="pw-hint" style={{ marginBottom: 4 }}>
              Use at least 8 characters.
            </p>
            <PasswordField
              id="password"
              name="password"
              label={t.auth.passwordLabel}
              autoComplete="new-password"
              minLength={8}
              describedBy="pw-hint"
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {t.common.signUp}
            </button>
          </form>
        ) : null}

        <p style={{ marginBottom: 0 }}>
          {t.auth.haveAccount} <Link href="/login">{t.common.signIn}</Link>
        </p>
      </div>
    </main>
  );
}
