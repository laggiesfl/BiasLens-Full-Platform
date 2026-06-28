import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { ROLE_OPTIONS } from "@/lib/roles";
import { completeOnboarding } from "@/lib/actions/profile";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="auth-wrap" id="main-content">
      <div className="card stack" style={{ maxWidth: 720, width: "100%" }}>
        <div className="cluster" style={{ gap: 12 }}>
          <Logo />
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Welcome to BiasLens</h1>
        </div>
        <p>
          BiasLens adapts to how you work. Choose the option that best describes
          you. You can change this later in Account Settings.
        </p>

        {sp.error ? (
          <p className="form-error" role="alert">
            {sp.error}
          </p>
        ) : null}

        <form action={completeOnboarding}>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">Choose your role</legend>
            <div className="stack" role="radiogroup" aria-label="Choose your role">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r.value}
                  className="card"
                  style={{ display: "flex", gap: 14, cursor: "pointer", alignItems: "flex-start" }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    style={{ width: 22, height: 22, marginTop: 4, flexShrink: 0 }}
                    required
                  />
                  <span>
                    <strong style={{ display: "block", color: "var(--ba-deep-blue)" }}>
                      {r.label}
                    </strong>
                    <span className="muted">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 20, width: "100%" }}
          >
            Continue to my dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
