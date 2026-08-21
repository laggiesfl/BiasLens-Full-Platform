import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import {
  EvidenceStatusBadge,
  EVIDENCE_STATUSES,
} from "@/components/EvidenceStatusBadge";
import {
  EvidenceStateBadge,
  EVIDENCE_STATES,
} from "@/components/EvidenceStateBadge";
import {
  addEvidence,
  updateEvidenceStatus,
  updateEvidenceState,
  deleteEvidence,
} from "@/lib/actions/evidence";

function fmt(d: string | null) {
  return d
    ? new Date(d).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}

function isOverdue(followUp: string | null, status: string) {
  if (!followUp) return false;
  if (["received", "not_applicable"].includes(status)) return false;
  return new Date(followUp) <= new Date();
}

export default async function EvidencePage({
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
  if (!assessment) notFound();

  const { data: entries } = await supabase
    .from("evidence_log_entries")
    .select("*")
    .eq("assessment_id", id)
    .order("created_at", { ascending: false });

  const signed: Record<string, string> = {};
  for (const e of entries ?? []) {
    if (e.file_path) {
      const { data } = await supabase.storage
        .from("evidence")
        .createSignedUrl(e.file_path, 3600);
      if (data?.signedUrl) signed[e.id] = data.signedUrl;
    }
  }

  return (
    <div className="stack">
      <BackLink href={`/assessments/${id}`} label="Back to assessment" />

      <div className="page-header">
        <h1>Evidence Log</h1>
        <p>
          This is your record of evidence requested and received for{" "}
          <strong>{assessment.title}</strong>. Collection status and evidence
          state are deliberately separate: one tells you whether you have the
          item; the other tells you what the available evidence justifies.
        </p>
        <p className="muted">
          Examples include technical specifications, training-data sources,
          vendor contracts, equality or bias evaluations, oversight reports,
          procurement documents, complaints, appeals, and aggregated outcome
          evidence.
        </p>
      </div>

      <section className="card" aria-labelledby="state-guide-h">
        <h2 id="state-guide-h" style={{ fontSize: "1.2rem" }}>
          Evidence State guide
        </h2>
        <p>
          Use the state that best describes what the evidence can support now.
          A received document is not automatically established evidence.
        </p>
        <dl className="stack" style={{ gap: 10 }}>
          {EVIDENCE_STATES.map((state) => (
            <div key={state.value}>
              <dt style={{ fontWeight: 700 }}>{state.label}</dt>
              <dd style={{ marginInlineStart: 0 }}>{state.description}</dd>
            </div>
          ))}
        </dl>
      </section>

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

      <section className="card" aria-labelledby="add-h">
        <h2 id="add-h" style={{ fontSize: "1.2rem" }}>
          Add an evidence item
        </h2>
        <form action={addEvidence} className="stack" encType="multipart/form-data">
          <input type="hidden" name="assessment_id" value={id} />

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="document_name">Document or evidence name</label>
              <input id="document_name" name="document_name" type="text" required />
            </div>

            <div className="field">
              <label htmlFor="status">Collection status</label>
              <select id="status" name="status" defaultValue="requested">
                {EVIDENCE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="evidence_state">Evidence state</label>
              <select
                id="evidence_state"
                name="evidence_state"
                defaultValue="unknown"
                aria-describedby="evidence-state-hint"
              >
                {EVIDENCE_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="hint" id="evidence-state-hint">
                Choose Unknown when the evidence has not yet been assessed or
                is still missing.
              </p>
            </div>

            <div className="field">
              <label htmlFor="source">Source</label>
              <input
                id="source"
                name="source"
                type="text"
                placeholder="e.g. vendor, regulator, internal audit"
              />
            </div>

            <div className="field">
              <label htmlFor="source_uri">Source link or reference</label>
              <input
                id="source_uri"
                name="source_uri"
                type="url"
                inputMode="url"
                placeholder="https://…"
              />
            </div>

            <div className="field">
              <label htmlFor="requested_from">Requested from</label>
              <input id="requested_from" name="requested_from" type="text" />
            </div>

            <div className="field">
              <label htmlFor="date_requested">Date requested</label>
              <input id="date_requested" name="date_requested" type="date" />
            </div>

            <div className="field">
              <label htmlFor="date_received">Date received</label>
              <input id="date_received" name="date_received" type="date" />
            </div>

            <div className="field">
              <label htmlFor="legal_basis">Legal basis</label>
              <input
                id="legal_basis"
                name="legal_basis"
                type="text"
                placeholder="e.g. PAIA, GDPR Art.15"
              />
            </div>

            <div className="field">
              <label htmlFor="follow_up_date">Follow-up date</label>
              <input id="follow_up_date" name="follow_up_date" type="date" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="evidence_state_rationale">
              Why did you assign this evidence state?
            </label>
            <textarea
              id="evidence_state_rationale"
              name="evidence_state_rationale"
              rows={2}
              aria-describedby="state-rationale-hint"
            />
            <p className="hint" id="state-rationale-hint">
              Briefly record what was checked, what remains uncertain, or why
              sources conflict. Do not use confidence language as a substitute
              for evidence.
            </p>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={2} />
          </div>

          <div className="field">
            <label htmlFor="file">Attach a file (optional)</label>
            <p className="hint" id="file-hint">
              PDF, Word, image, CSV or text. Up to 10 MB. Only enter sensitive
              information that is necessary.
            </p>
            <input
              id="file"
              name="file"
              type="file"
              aria-describedby="file-hint"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Save evidence item
          </button>
        </form>
      </section>

      <section aria-labelledby="list-h">
        <h2 id="list-h" style={{ fontSize: "1.2rem" }}>
          Your evidence items
        </h2>

        {entries && entries.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <caption className="sr-only">
                Evidence log entries with collection status, evidence state,
                provenance, dates, legal basis and actions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Evidence item</th>
                  <th scope="col">Collection status</th>
                  <th scope="col">Evidence state</th>
                  <th scope="col">Source</th>
                  <th scope="col">Requested from</th>
                  <th scope="col">Requested</th>
                  <th scope="col">Received</th>
                  <th scope="col">Follow-up</th>
                  <th scope="col">Legal basis</th>
                  <th scope="col">File</th>
                  <th scope="col">Update</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      {e.document_name}
                      {e.notes ? (
                        <>
                          <br />
                          <span className="muted" style={{ fontWeight: 400 }}>
                            {e.notes}
                          </span>
                        </>
                      ) : null}
                    </th>

                    <td>
                      <EvidenceStatusBadge status={e.status} />
                    </td>

                    <td>
                      <EvidenceStateBadge state={e.evidence_state ?? "unknown"} />
                      {e.evidence_state_rationale ? (
                        <>
                          <br />
                          <span className="muted">
                            {e.evidence_state_rationale}
                          </span>
                        </>
                      ) : null}
                    </td>

                    <td>
                      {e.source ?? "—"}
                      {e.source_uri ? (
                        <>
                          <br />
                          <a
                            href={e.source_uri}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open source reference
                            <span className="sr-only"> for {e.document_name}</span>
                          </a>
                        </>
                      ) : null}
                    </td>

                    <td>{e.requested_from ?? "—"}</td>
                    <td>{fmt(e.date_requested)}</td>
                    <td>{fmt(e.date_received)}</td>
                    <td>
                      {fmt(e.follow_up_date)}
                      {isOverdue(e.follow_up_date, e.status) ? (
                        <>
                          <br />
                          <span className="badge" style={{ borderStyle: "solid" }}>
                            <span aria-hidden="true">!</span>
                            <span>Follow-up due</span>
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td>{e.legal_basis ?? "—"}</td>
                    <td>
                      {signed[e.id] ? (
                        <a
                          href={signed[e.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download<span className="sr-only"> {e.document_name}</span>
                        </a>
                      ) : (
                        <span className="muted">None</span>
                      )}
                    </td>

                    <td>
                      <form
                        action={updateEvidenceStatus}
                        className="stack"
                        style={{ gap: 6 }}
                      >
                        <input type="hidden" name="assessment_id" value={id} />
                        <input type="hidden" name="id" value={e.id} />
                        <label htmlFor={`st-${e.id}`}>
                          Collection status
                        </label>
                        <select
                          id={`st-${e.id}`}
                          name="status"
                          defaultValue={e.status}
                          style={{ minWidth: 170 }}
                        >
                          {EVIDENCE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ minHeight: 44 }}
                        >
                          Save collection status
                        </button>
                      </form>

                      <form
                        action={updateEvidenceState}
                        className="stack"
                        style={{ gap: 6, marginTop: 14 }}
                      >
                        <input type="hidden" name="assessment_id" value={id} />
                        <input type="hidden" name="id" value={e.id} />
                        <label htmlFor={`es-${e.id}`}>Evidence state</label>
                        <select
                          id={`es-${e.id}`}
                          name="evidence_state"
                          defaultValue={e.evidence_state ?? "unknown"}
                          style={{ minWidth: 170 }}
                        >
                          {EVIDENCE_STATES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <label htmlFor={`er-${e.id}`}>State rationale</label>
                        <textarea
                          id={`er-${e.id}`}
                          name="evidence_state_rationale"
                          rows={2}
                          defaultValue={e.evidence_state_rationale ?? ""}
                        />
                        <button
                          type="submit"
                          className="btn btn-secondary"
                          style={{ minHeight: 44 }}
                        >
                          Save evidence state
                        </button>
                      </form>

                      <form action={deleteEvidence} style={{ marginTop: 14 }}>
                        <input type="hidden" name="assessment_id" value={id} />
                        <input type="hidden" name="id" value={e.id} />
                        <ConfirmSubmit
                          style={{ minHeight: 44 }}
                          confirmMessage={`Delete the evidence item "${e.document_name}"? This cannot be undone.`}
                        >
                          Delete<span className="sr-only"> {e.document_name}</span>
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="card muted">No evidence items yet. Add your first one above.</p>
        )}
      </section>

      <BackLink
        href={`/assessments/${id}`}
        label="Back to assessment"
        variant="bottom"
      />
    </div>
  );
}
