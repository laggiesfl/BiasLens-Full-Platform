import { signOut } from "@/lib/actions/auth";
import { t } from "@/lib/i18n";

export function Topbar({
  email,
  roleLabel,
  organisation,
}: {
  email: string;
  roleLabel: string;
  organisation: string;
}) {
  return (
    <header className="topbar">
      <p style={{ margin: 0, fontWeight: 800, color: "var(--ba-deep-blue)" }}>
        {t.product.name}{" "}
        <span className="muted" style={{ fontWeight: 400 }}>
          — {t.product.tagline}
        </span>
      </p>
      <div className="topbar-meta">
        <span>
          {t.common.organisation}: <strong>{organisation}</strong>
        </span>
        <span>
          {t.common.role}: <strong>{roleLabel}</strong>
        </span>
        <span className="sr-only">Signed in as {email}</span>
        <form action={signOut}>
          <button type="submit" className="btn btn-secondary" style={{ minHeight: 40 }}>
            {t.common.signOut}
          </button>
        </form>
      </div>
    </header>
  );
}
