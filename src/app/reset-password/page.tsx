import Link from "next/link";
import { Logo } from "@/components/Logo";
import { t } from "@/lib/i18n";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main className="auth-wrap" id="main-content">
      <div className="card auth-card stack">
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{t.product.name}</h1>
        </div>

        <h2 style={{ fontSize: "1.2rem" }}>{t.auth.resetTitle}</h2>

        {/*
          Errors arriving back from /auth/callback — for example a reset link
          that has expired or already been used — are shown here.
        */}
        {sp.error ? (
          <p className="form-error" role="alert">
            {sp.error}
          </p>
        ) : null}

        {/*
          The form itself runs in the browser. It has to: see the comment at
          the top of ResetPasswordForm.tsx.
        */}
        <ResetPasswordForm
          emailLabel={t.auth.emailLabel}
          submitLabel={t.auth.sendReset}
        />

        <p style={{ marginBottom: 0 }}>
          <Link href="/login">Back to {t.common.signIn.toLowerCase()}</Link>
        </p>
      </div>
    </main>
  );
}
