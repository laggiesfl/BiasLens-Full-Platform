import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLES, roleLabel, type Role } from "@/lib/roles";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const role = (profile?.role ?? "civil_society") as Role;
  const config = role !== "admin" ? ROLES[role] : null;

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, title, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  const greetingName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Welcome back, {greetingName}</h1>
        <p>
          You are using BiasLens as: <strong>{roleLabel(role)}</strong>.{" "}
          {config?.primaryNeed}
        </p>
      </div>

      <div className="grid grid-2">
        <section className="card" aria-labelledby="next-steps-h">
          <h2 id="next-steps-h" style={{ fontSize: "1.2rem" }}>
            Suggested next steps
          </h2>
          {config ? (
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              {config.nextSteps.map((step) => (
                <li key={step} style={{ marginBottom: 8 }}>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <p>Use the Admin Console to manage legal references and platform data.</p>
          )}
          <p style={{ marginTop: 16, marginBottom: 0 }}>
            <Link href="/assessments" className="btn btn-primary">
              Go to My Assessments
            </Link>
          </p>
        </section>

        <section className="card" aria-labelledby="recent-h">
          <h2 id="recent-h" style={{ fontSize: "1.2rem" }}>
            Recent assessments
          </h2>
          {assessments && assessments.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {assessments.map((a) => (
                <li
                  key={a.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--ba-border)",
                  }}
                >
                  <div className="cluster between">
                    <Link href={`/assessments/${a.id}`}>{a.title}</Link>
                    <StatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              You have not created any assessments yet. Start one from My
              Assessments.
            </p>
          )}
        </section>
      </div>

      <section className="card" aria-labelledby="modules-h">
        <h2 id="modules-h" style={{ fontSize: "1.2rem" }}>
          What you can do now, and what is coming
        </h2>
        <p className="muted">Available today in every assessment:</p>
        <ul>
          <li>Guided Bias Risk Questionnaire (plain language, saves as you go)</li>
          <li>Risk classification and Bias Risk Report, with Word, PDF and CSV export</li>
          <li>Evidence Log with file attachments and follow-up dates</li>
            <li>Fairness Metrics Calculator — disparate impact and 4/5 rule analysis</li>
            <li>Compliance Mapper — EU AI Act, GDPR, POPIA, EEA, UNCRPD and UK AI framework</li>
            <li>Access Request Generator — formal rights request letters</li>
            <li>AIA / FRIA Builder — Article 27 Fundamental Rights Impact Assessment</li>
        </ul>
        <!-- All features now live — placeholder removed -->
      </section>
    </div>
  );
}
