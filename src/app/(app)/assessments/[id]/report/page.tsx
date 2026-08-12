import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
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
        <BackLink href={`/assessments/${id}`} label="Back to assessment" />
        <div className="page-header">
          <h1>Bias Risk Report</h1>
          <p>
            No report has been generated yet for{" "}
            <strong>{assessment?.title ?? "this assessment"}</strong>. Generate
            one from your questionnaire answers. You can edit it before exporting.
          </p>
        </div>
        {sp.message ? (
          <p className="form-success" role="status">{sp.message}</p>
        ) : null}
        <form action={generateRiskClassification.bind(null, id)}>
          <button type="submit" className="btn btn-primary">
            Generate Bias Risk Report
          </button>
        </form>
        <p className="muted">
          Tip: after generating, you can review and edit the result, then
          download it as Word, PDF or CSV. The Evidence Log (back on the
          assessment page) is a separate place for you to track documents you
          request and receive.
        </p>
        <p className="muted">
          Tip: complete the{" "}
          <Link href={`/assessments/${id}/questionnaire`}>questionnaire</Link>{" "}
          first for the most accurate result.
        </p>
        <BackLink href={`/assessments/${id}`} label="Back to assessment" variant="bottom" />
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: "80ch" }}>
      <BackLink href={`/assessments/${id}`} label="Back to assessment" />

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

      {/*
        Heading is deliberately "Bias findings" rather than naming a vendor.
        The taxonomy is grounded in Friedman & Nissenbaum, Bias in Computer
        Systems, ACM TOIS 14(3), 1996 — preexisting, technical and emergent —
        which is cited in the engine. The heading also carries no count, so it
        does not go stale when the engine gains or loses a finding.

        "Level" and "Evidence" are separate columns on purpose. Level is how
        serious the risk would be if present. Evidence is how much is actually
        known. Collapsing the two would let a High level read as a proven
        problem, or a Not established evidence read as a clean bill of health.
      */}
      <section className="card" aria-labelledby="findings-h">
        <h2 id="findings-h" style={{ fontSize: "1.2rem" }}>Bias findings</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <caption className="sr-only">
              Bias findings, showing the risk level if present, the strength of
              evidence actually available, and what each finding means
            </caption>
            <thead>
              <tr>
                <th scope="col">Bias type</th>
                <th scope="col">Level</th>
                <th scope="col">Evidence</th>
                <th scope="col">What this means</th>
              </tr>
            </thead>
            <tbody>
              {data.biasScores.map((b) => (
                <tr key={b.type}>
                  <th scope="row">{b.type}</th>
                  <td><LevelBadge level={b.level} /></td>
                  <td>{b.evidence ?? "Not recorded"}</td>
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

      {/*
        Each rationale entry is a description list, not text separated by <br />.
        Line breaks are visual only: a screen reader reads a <br /> run as one
        continuous sentence, so "Triggered by" was not attached to the value
        that followed it and the explanation had no label at all. A <dl> binds
        each label to its own value (WCAG 2.2 — 1.3.1 Info and Relationships).
      */}
      <section className="card" aria-labelledby="why-h">
        <h2 id="why-h" style={{ fontSize: "1.2rem" }}>Why these classifications? (plain language)</h2>
        <ol style={{ paddingLeft: 18 }}>
          {data.rationale.map((r, i) => (
            <li key={i} style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 8px" }}>
                <strong>{r.rule}</strong>{" "}
                <span className="badge" style={{ marginLeft: 6 }}>
                  Confidence: {r.confidence}
                </span>
              </p>
              <dl style={{ margin: 0 }}>
                <dt className="muted" style={{ fontWeight: 400 }}>Triggered by</dt>
                <dd style={{ margin: "0 0 8px" }}>{r.trigger}</dd>

                <dt className="muted" style={{ fontWeight: 400 }}>Framework</dt>
                <dd style={{ margin: "0 0 8px" }}>{r.framework}</dd>

                <dt className="muted" style={{ fontWeight: 400 }}>What this means</dt>
                <dd style={{ margin: "0 0 8px" }}>{r.explanation}</dd>

                <dt className="muted" style={{ fontWeight: 400 }}>Recommendation</dt>
                <dd style={{ margin: 0 }}>{r.recommendation}</dd>
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section className="card" aria-labelledby="rem-h">
        <h2 id="rem-h" style={{ fontSize: "1.2rem" }}>Recommended remediation</h2>
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
          <label className="check-option">
            <input type="checkbox" name="reviewed" defaultChecked={data.reviewed} />
            <span>Mark this report as reviewed</span>
          </label>
          <button type="submit" className="btn btn-primary">Save reviewer edits</button>
        </form>
      </section>

      <p className="muted">
        Generated {new Date(data.generatedAt).toLocaleString("en-ZA")}. BiasLens by
        BeAccessible. Classifications are decision-support, not legal advice.
      </p>

      <BackLink href={`/assessments/${id}`} label="Back to assessment" variant="bottom" />
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
