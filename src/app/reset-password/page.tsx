import Link from "next/link";
import { Logo } from "@/components/Logo";
import { t } from "@/lib/i18n";
import { sendPasswordReset } from "@/lib/actions/auth";

export default async function ResetPasswordPage({
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
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{t.product.name}</h1>
        </div>

        <h2 style={{ fontSize: "1.2rem" }}>{t.auth.resetTitle}</h2>

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

        <form action={sendPasswordReset} className="stack" style={{ marginTop: 0 }}>
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
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            {t.auth.sendReset}
          </button>
        </form>

        <p style={{ marginBottom: 0 }}>
          <Link href="/login">Back to {t.common.signIn.toLowerCase()}</Link>
        </p>
      </div>
    </main>
  );
}
