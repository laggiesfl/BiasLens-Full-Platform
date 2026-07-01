import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { StatusBadge } from "@/components/StatusBadge";
import {
  updateSystemBasics,
  setAssessmentStatus,
} from "@/lib/actions/assessments";

const DOMAINS = [
  "welfare",
  "policing",
  "healthcare",
  "financial services",
  "employment",
  "education",
  "migration",
  "justice",
  "other",
];

export default async function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, title, status, assessment_type, created_at")
    .eq("id", id)
    .single();

  if (!assessment) notFound();

  const { data: sysProfile } = await supabase
    .from("ai_system_profiles")
    .select("system_name, provider, deployer, purpose, decision_domain")
    .eq("assessment_id", id)
    .single();

  return (
    <div className="stack">
      <BackLink href="/assessments" label="Back to My Assessments" />

      <div className="page-header cluster between" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>{assessment.title}</h1>
          <StatusBadge status={assessment.status} />
        </div>
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

      <section className="card" aria-labelledby="basics-h">
        <h2 id="basics-h" style={{ fontSize: "1.2rem" }}>
          AI system basics
        </h2>
        <p className="muted">
          Capture the essentials here, or use the guided questionnaire below for
          the full set of questions. Short explanations are under each field.
        </p>
        <form action={updateSystemBasics} className="stack">
          <input type="hidden" name="assessment_id" value={id} />
          <div className="field">
            <label htmlFor="title">Assessment name</label>
            <p className="hint">A name for this piece of work, so you can find it later.</p>
            <input id="title" name="title" type="text" defaultValue={assessment.title} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="system_name">AI system name</label>
              <p className="hint">The name of the AI tool or system you are looking at.</p>
              <input
                id="system_name"
                name="system_name"
                type="text"
                defaultValue={sysProfile?.system_name ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="decision_domain">Decision domain</label>
              <p className="hint">The area of life it affects — e.g. welfare, policing, healthcare, employment, finance.</p>
              <select
                id="decision_domain"
                name="decision_domain"
                defaultValue={sysProfile?.decision_domain ?? ""}
              >
                <option value="">Choose a domain…</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="provider">System owner or provider</label>
              <p className="hint">The organisation that built or supplies the system.</p>
              <input
                id="provider"
                name="provider"
                type="text"
                defaultValue={sysProfile?.provider ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="deployer">Deployer</label>
              <p className="hint">The organisation that uses the system to make or support decisions.</p>
              <input
                id="deployer"
                name="deployer"
                type="text"
                defaultValue={sysProfile?.deployer ?? ""}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="purpose">What is the system used for?</label>
            <p className="hint">In your own words, what does it decide or help to decide?</p>
            <textarea
              id="purpose"
              name="purpose"
              rows={3}
              defaultValue={sysProfile?.purpose ?? ""}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Save details
          </button>
        </form>
      </section>

      <section className="card" aria-labelledby="status-h">
        <h2 id="status-h" style={{ fontSize: "1.2rem" }}>
          Assessment status
        </h2>
        <p className="muted">Move this assessment through its lifecycle.</p>
        <div className="cluster">
          {["draft", "in_review", "completed", "archived"].map((s) => (
            <form action={setAssessmentStatus} key={s}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value={s} />
              <button
                type="submit"
                className="btn btn-secondary"
                aria-pressed={assessment.status === s}
                disabled={assessment.status === s}
              >
                {s.replace("_", " ")}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="next-h">
        <h2 id="next-h" style={{ fontSize: "1.2rem" }}>
          Guided Bias Risk Questionnaire
        </h2>
        <p className="muted">
          Answer a short, plain-language set of questions to capture how this
          system works and who it affects. Your answers save automatically.
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link href={`/assessments/${id}/questionnaire`} className="btn btn-primary">
            Start or continue the questionnaire
          </Link>
        </p>
      </section>

      <section className="card" aria-labelledby="report-h">
        <h2 id="report-h" style={{ fontSize: "1.2rem" }}>
          Bias Risk Report
        </h2>
        <p className="muted">
          Generate a transparent risk classification (SA tier, EU AI Act, IBM
          bias types, six pillars, obligations and remediation) and export it as
          Word, PDF or CSV. You can edit it before exporting.
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link href={`/assessments/${id}/report`} className="btn btn-primary">
            Open the Bias Risk Report
          </Link>
        </p>
      </section>

      <section className="card" aria-labelledby="evidence-h">
        <h2 id="evidence-h" style={{ fontSize: "1.2rem" }}>
          Evidence Log
        </h2>
        <p className="muted">
          Track records you have requested and received, attach files, record the
          legal basis and set follow-up dates.
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link href={`/assessments/${id}/evidence`} className="btn btn-primary">
            Open the Evidence Log
          </Link>
        </p>
      </section>

      <BackLink href="/assessments" label="Back to My Assessments" variant="bottom" />
    </div>
  );
}
