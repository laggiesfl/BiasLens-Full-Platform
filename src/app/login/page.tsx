import Link from "next/link";
import { Logo } from "@/components/Logo";
import { t } from "@/lib/i18n";
import { signIn } from "@/lib/actions/auth";
import { PasswordField } from "@/components/PasswordField";
import { MagicLinkButton } from "@/components/MagicLinkButton";

export default async function LoginPage({
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

        <h2 style={{ fontSize: "1.2rem" }}>{t.auth.loginTitle}</h2>

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

        <form action={signIn} className="stack" style={{ marginTop: 0 }}>
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
          <PasswordField
            id="password"
            name="password"
            label={t.auth.passwordLabel}
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {t.common.signIn}
          </button>
          <MagicLinkButton
            label={t.auth.magicLink}
            hint="The sign-in link uses the email address typed above. No password needed. Open the link in this browser."
          />
        </form>

        <p style={{ marginBottom: 0 }}>
          <Link href="/reset-password">{t.auth.forgotPassword}</Link>
        </p>
        <p style={{ marginBottom: 0 }}>
          {t.auth.noAccount} <Link href="/signup">{t.common.signUp}</Link>
        </p>
      </div>
    </main>
  );
}
