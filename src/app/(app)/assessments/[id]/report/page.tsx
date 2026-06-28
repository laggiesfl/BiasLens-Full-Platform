import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getReportData } from "@/lib/risk/report";
import { LevelBadge } from "@/components/LevelBadge";
import { generateRiskClassification, saveRiskOverrides } from "@/lib/actions/risk";

const SA_TIERS = ["Unacceptable", "High", "Medium", "Low"];

export default async function ReportPage({
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
    .select("id, title")
    .eq("id", id)
    .single();

  const data = await getReportData(id);

  if (!data) {
    return (
      <div className="stack" style={{ maxWidth: "70ch" }}>
        <p style={{ margin: 0 }}>
          <Link href={`/assessments/${id}`}>← Back to assessment</Link>
        </p>
        <div className="page-header">
          <h1>Bias Risk Report</h1>
          <p>
            No report has been generated yet for{" "}
            <strong>{assessment?.title ?? "this assessment"}</strong>. Generate
            one from your questionnaire answers. You can edit it before exporting.
          </p>
        </div>
        <form action={generateRiskClassification.bind(null, id)}>
          <button type="submit" className="btn btn-primary">
            Generate Bias Risk Report
          </button>
        </form>
        <p className="muted">
          Tip: complete the{" "}
          <Link href={`/assessments/${id}/questionnaire`}>questionnaire</Link>{" "}
          first for the most accurate result.
        </p>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: "80ch" }}>
      <p style={{ margin: 0 }}>
        <Link href={`/assessments/${id}`}>← Back to assessment</Link>
      </p>

      <div className="page-header cluster between" style={{ alignItems: "flex-start" }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Bias Risk Report</h1>
          <p className="muted" style={{ margin: 0 }}>
            {data.title} ·{" "}
            {data.reviewed ? "Reviewed" : "Draft — not yet reviewed"}
          </p>
        </div>
      </div>

      {sp.error ? <p className="form-error" role="alert">{sp.error}</p> : null}
      {sp.message ? <p className="form-success" role="status">{sp.message}</p> : null}

      <div className="cluster">
        <a className="btn btn-primary" href={`/assessments/${id}/report/export?format=docx`}>
          Download Word (.docx)
        </a>
        <a className="btn btn-secondary" href={`/assessments/${id}/report/export?format=pdf`}>
          Download PDF
        </a>
        <a className="btn btn-secondary" href={`/assessments/${id}/report/export?format=csv`}>
          Download CSV summary
        </a>
        <form action={generateRiskClassification.bind(null, id)}>
          <button type="submit" className="btn btn-secondary">
            Regenerate from answers
          </button>
        </form>
      </div>

      <section className="card" aria-labelledby="summary-h">
        <h2 id="summary-h" style={{ fontSize: "1.2rem" }}>Executive summary</h2>
        <p>{data.executiveSummary}</p>
        <div className="cluster" style={{ gap: 24 }}>
          <div>
            <p className="muted" style={{ margin: "0 0 4px" }}>SA Draft AI Policy tier</p>
            <LevelBadge level={data.saTier} />
          </div>
          <div>
            <p className="muted" style={{ margin: "0 0 4px" }}>EU AI Act classification</p>
            <span className="badge">{data.euClassification}</span>
          </div>
        </div>
        {data.euAnnex ? (
          <p style={{ marginTop: 12, marginBottom: 0 }}>
            <strong>Relevant high-risk category:</strong> {data.euAnnex}
          </p>
        ) : null}
      </section>

      <section className="card" aria-labelledby="profile-h">
        <h2 id="profile-h" style={{ fontSize: "1.2rem" }}>System profile</h2>
        <dl style={{ margin: 0 }}>
          <ProfileRow label="System name" value={data.profile.system_name} />
          <ProfileRow label="Provider" value={data.profile.provider} />
          <ProfileRow label="Deployer" value={data.profile.deployer} />
          <ProfileRow label="Decision domain" value={data.profile.decision_domain} />
          <ProfileRow label="Purpose" value={data.profile.purpose} />
          <ProfileRow
            label="Affected groups"
            value={(data.profile.affected_populations ?? []).join(", ")}
          />
        </dl>
      </section>

      <section className="card" aria-labelledby="ibm-h">
        <h2 id="ibm-h" style={{ fontSize: "1.2rem" }}>IBM eight bias types</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption className="sr-only">IBM bias-type scores with notes</caption>
            <thead>
              <tr>
                <th scope="col">Bias type</th>
                <th scope="col">Level</th>
                <th scope="col">What this means</th>
              </tr>
            </thead>
            <tbody>
              {data.biasScores.map((b) => (
                <tr key={b.type}>
                  <th scope="row">{b.type}</th>
                  <td><LevelBadge level={b.level} /></td>
                  <td>{b.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="pillars-h">
        <h2 id="pillars-h" style={{ fontSize: "1.2rem" }}>SA Draft AI Policy — six pillars</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption className="sr-only">Six-pillar alignment</caption>
            <thead>
              <tr>
                <th scope="col">Pillar</th>
                <th scope="col">Status</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {data.pillars.map((p) => (
                <tr key={p.pillar}>
                  <th scope="row">{p.pillar}</th>
                  <td><LevelBadge level={p.status} /></td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="obl-h">
        <h2 id="obl-h" style={{ fontSize: "1.2rem" }}>Triggered obligations</h2>
        {data.obligations.length ? (
          <ul>
            {data.obligations.map((o) => (
              <li key={o.ref}>
                <strong>{o.title}</strong> — {o.why}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No specific obligations triggered.</p>
        )}
      </section>

      <section className="card" aria-labelledby="why-h">
        <h2 id="why-h" style={{ fontSize: "1.2rem" }}>Why these classifications? (plain language)</h2>
        <ol style={{ paddingLeft: 18 }}>
          {data.rationale.map((r, i) => (
            <li key={i} style={{ marginBottom: 14 }}>
              <strong>{r.rule}</strong> <span className="badge" style={{ marginLeft: 6 }}>Confidence: {r.confidence}</span>
              <br />
              <span className="muted">Triggered by:</span> {r.trigger}
              <br />
              <span className="muted">Framework:</span> {r.framework}
              <br />
              {r.explanation}
              <br />
              <span className="muted">Recommendation:</span> {r.recommendation}
            </li>
          ))}
        </ol>
      </section>

      <section className="card" aria-labelledby="rem-h">
        <h2 id="rem-h" style={{ fontSize: "1.2rem" }}>Recommended remediation (IBM three stages)</h2>
        <div className="grid grid-3">
          {data.remediation.map((c) => (
            <div key={c.stage} className="card" style={{ background: "var(--ba-tint-3)" }}>
              <h3 style={{ fontSize: "1rem" }}>{c.stage}</h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {c.actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="review-h">
        <h2 id="review-h" style={{ fontSize: "1.2rem" }}>Reviewer edits</h2>
        <p className="muted">
          An authorised reviewer can adjust the headline classifications and
          summary before exporting. Your edits are saved alongside the original.
        </p>
        <form action={saveRiskOverrides} className="stack">
          <input type="hidden" name="assessment_id" value={id} />
          <div className="field">
            <label htmlFor="sa_tier">SA risk tier</label>
            <select id="sa_tier" name="sa_tier" defaultValue={data.saTier}>
              {SA_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="eu_classification">EU AI Act classification</label>
            <input id="eu_classification" name="eu_classification" type="text" defaultValue={data.euClassification} />
          </div>
          <div className="field">
            <label htmlFor="executive_summary">Executive summary</label>
            <textarea id="executive_summary" name="executive_summary" rows={4} defaultValue={data.executiveSummary} />
          </div>
          <label className="cluster" style={{ gap: 8 }}>
            <input type="checkbox" name="reviewed" defaultChecked={data.reviewed} style={{ width: 22, height: 22 }} />
            <span>Mark this report as reviewed</span>
          </label>
          <button type="submit" className="btn btn-primary">Save reviewer edits</button>
        </form>
      </section>

      <p className="muted">
        Generated {new Date(data.generatedAt).toLocaleString("en-ZA")}. BiasLens by
        BeAccessible. Classifications are decision-support, not legal advice.
      </p>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <dt style={{ fontWeight: 700, color: "var(--ba-deep-blue)" }}>{label}</dt>
      <dd style={{ margin: "0 0 10px" }}>{value || <span className="muted">Not provided</span>}</dd>
    </>
  );
}
