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
          The examples on this page are prompts to help you get started. Replace
          them with facts that apply to your own AI system and evidence.
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
        <p className="muted">
          You do not need to complete every optional field. Use the examples as
          guidance where a term or field is unfamiliar.
        </p>

        <form action={addEvidence} className="stack" encType="multipart/form-data">
          <input type="hidden" name="assessment_id" value={id} />

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="document_name">Document or evidence name</label>
              <p className="hint" id="document-name-hint">
                Example: Vendor model card, bias evaluation report, procurement
                specification, complaints summary.
              </p>
              <input
                id="document_name"
                name="document_name"
                type="text"
                aria-describedby="document-name-hint"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="status">Collection status</label>
              <p className="hint" id="collection-status-hint">
                Example: choose Received if you already have the document; choose
                Requested if you have asked for it but do not yet have it.
              </p>
              <select
                id="status"
                name="status"
                defaultValue="requested"
                aria-describedby="collection-status-hint"
              >
                {EVIDENCE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card" style={{ background: "var(--ba-surface-soft, #f7f9fc)" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.05rem" }}>
              Evidence state and rationale
            </h3>
            <p className="muted">
              Record the state and the reason together so someone reviewing the
              assessment later can understand what the evidence supports and why.
            </p>

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
                Example: Unknown if the evidence is missing or has not been
                checked; Established if the claim is directly supported by
                verified evidence; Conflicted if credible sources disagree.
              </p>
            </div>

            <div className="field">
              <label htmlFor="evidence_state_rationale">
                Why did you assign this evidence state?
              </label>
              <textarea
                id="evidence_state_rationale"
                name="evidence_state_rationale"
                rows={3}
                aria-describedby="state-rationale-hint"
                placeholder="Example: The vendor supplied a dated evaluation report covering the deployed model, and the reported result matches the version currently in use."
              />
              <p className="hint" id="state-rationale-hint">
                Example for Unknown: “The vendor states that subgroup testing was
                completed, but no test report has been provided.” Example for
                Conflicted: “The vendor reports no material disparity, while our
                internal outcome data shows a different pattern.”
              </p>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="source">Source</label>
              <p className="hint" id="source-hint">
                Example: vendor, regulator, procurement team, internal audit,
                technical team, affected-user feedback.
              </p>
              <input id="source" name="source" type="text" aria-describedby="source-hint" />
            </div>

            <div className="field">
              <label htmlFor="source_uri">Source link or reference</label>
              <p className="hint" id="source-uri-hint">
                Example: a document URL, policy repository link, report reference
                number or internal record location.
              </p>
              <input
                id="source_uri"
                name="source_uri"
                type="url"
                inputMode="url"
                placeholder="https://…"
                aria-describedby="source-uri-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="requested_from">Requested from</label>
              <p className="hint" id="requested-from-hint">
                Example: AI vendor account manager, HR procurement lead, data
                protection officer.
              </p>
              <input
                id="requested_from"
                name="requested_from"
                type="text"
                aria-describedby="requested-from-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="legal_basis">Legal basis or governance basis</label>
              <p className="hint" id="legal-basis-hint">
                Example: procurement requirement, internal AI policy, PAIA,
                GDPR Article 15, contractual audit right. Leave blank if none is
                relevant.
              </p>
              <input
                id="legal_basis"
                name="legal_basis"
                type="text"
                aria-describedby="legal-basis-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="date_requested">Date requested</label>
              <p className="hint" id="date-requested-hint">
                Example: the date you first asked for this evidence.
              </p>
              <input
                id="date_requested"
                name="date_requested"
                type="date"
                aria-describedby="date-requested-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="date_received">Date received</label>
              <p className="hint" id="date-received-hint">
                Example: the date the document, file or response reached you.
              </p>
              <input
                id="date_received"
                name="date_received"
                type="date"
                aria-describedby="date-received-hint"
              />
            </div>

            <div className="field">
              <label htmlFor="follow_up_date">Follow-up date</label>
              <p className="hint" id="follow-up-hint">
                Example: when you plan to chase missing evidence or review an
                incomplete response again.
              </p>
              <input
                id="follow_up_date"
                name="follow_up_date"
                type="date"
                aria-describedby="follow-up-hint"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <p className="hint" id="notes-hint">
              Example: “Report covers the previous model version only; current
              deployment still needs confirmation.”
            </p>
            <textarea id="notes" name="notes" rows={3} aria-describedby="notes-hint" />
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

          <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
            Save evidence item
          </button>
        </form>
      </section>

      <section aria-labelledby="list-h">
        <h2 id="list-h" style={{ fontSize: "1.2rem" }}>
          Your evidence items
        </h2>

        {entries && entries.length > 0 ? (
          <div className="stack">
            {entries.map((e) => (
              <article className="card stack" key={e.id} aria-labelledby={`evidence-${e.id}`}>
                <div className="cluster between" style={{ alignItems: "flex-start" }}>
                  <div>
                    <h3 id={`evidence-${e.id}`} style={{ margin: 0 }}>
                      {e.document_name}
                    </h3>
                    {e.notes ? <p className="muted">{e.notes}</p> : null}
                  </div>
                  <div className="cluster" aria-label="Current evidence status">
                    <EvidenceStatusBadge status={e.status} />
                    <EvidenceStateBadge state={e.evidence_state ?? "unknown"} />
                  </div>
                </div>

                {e.evidence_state_rationale ? (
                  <div>
                    <strong>State rationale</strong>
                    <p style={{ marginBottom: 0 }}>{e.evidence_state_rationale}</p>
                  </div>
                ) : (
                  <p className="muted" style={{ marginBottom: 0 }}>
                    No state rationale recorded yet.
                  </p>
                )}

                <dl className="grid grid-2" style={{ margin: 0 }}>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Source</dt>
                    <dd style={{ marginInlineStart: 0 }}>
                      {e.source ?? "—"}
                      {e.source_uri ? (
                        <>
                          {" "}
                          <a href={e.source_uri} target="_blank" rel="noopener noreferrer">
                            Open source reference
                            <span className="sr-only"> for {e.document_name}</span>
                          </a>
                        </>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Requested from</dt>
                    <dd style={{ marginInlineStart: 0 }}>{e.requested_from ?? "—"}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Date requested</dt>
                    <dd style={{ marginInlineStart: 0 }}>{fmt(e.date_requested)}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Date received</dt>
                    <dd style={{ marginInlineStart: 0 }}>{fmt(e.date_received)}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Follow-up</dt>
                    <dd style={{ marginInlineStart: 0 }}>
                      {fmt(e.follow_up_date)}
                      {isOverdue(e.follow_up_date, e.status) ? (
                        <span className="badge" style={{ marginInlineStart: 8 }}>
                          <span aria-hidden="true">!</span> Follow-up due
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Legal or governance basis</dt>
                    <dd style={{ marginInlineStart: 0 }}>{e.legal_basis ?? "—"}</dd>
                  </div>
                  <div>
                    <dt style={{ fontWeight: 700 }}>Attachment</dt>
                    <dd style={{ marginInlineStart: 0 }}>
                      {signed[e.id] ? (
                        <a href={signed[e.id]} target="_blank" rel="noopener noreferrer">
                          Download<span className="sr-only"> {e.document_name}</span>
                        </a>
                      ) : (
                        "None"
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="grid grid-2" style={{ alignItems: "start" }}>
                  <form action={updateEvidenceStatus} className="card stack" style={{ margin: 0 }}>
                    <input type="hidden" name="assessment_id" value={id} />
                    <input type="hidden" name="id" value={e.id} />
                    <h4 style={{ margin: 0 }}>Update collection status</h4>
                    <label htmlFor={`st-${e.id}`}>Collection status</label>
                    <select id={`st-${e.id}`} name="status" defaultValue={e.status}>
                      {EVIDENCE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-secondary" style={{ minHeight: 44 }}>
                      Save collection status
                    </button>
                  </form>

                  <form action={updateEvidenceState} className="card stack" style={{ margin: 0 }}>
                    <input type="hidden" name="assessment_id" value={id} />
                    <input type="hidden" name="id" value={e.id} />
                    <h4 style={{ margin: 0 }}>Update evidence state</h4>
                    <label htmlFor={`es-${e.id}`}>Evidence state</label>
                    <select
                      id={`es-${e.id}`}
                      name="evidence_state"
                      defaultValue={e.evidence_state ?? "unknown"}
                    >
                      {EVIDENCE_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor={`er-${e.id}`}>State rationale</label>
                    <p className="hint" id={`er-hint-${e.id}`}>
                      Example: “The report covers the deployed model version and
                      provides dated subgroup results, so this claim is directly supported.”
                    </p>
                    <textarea
                      id={`er-${e.id}`}
                      name="evidence_state_rationale"
                      rows={3}
                      defaultValue={e.evidence_state_rationale ?? ""}
                      aria-describedby={`er-hint-${e.id}`}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ minHeight: 44 }}>
                      Save evidence state
                    </button>
                  </form>
                </div>

                <form action={deleteEvidence}>
                  <input type="hidden" name="assessment_id" value={id} />
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmSubmit
                    style={{ minHeight: 44 }}
                    confirmMessage={`Delete the evidence item "${e.document_name}"? This cannot be undone.`}
                  >
                    Delete<span className="sr-only"> {e.document_name}</span>
                  </ConfirmSubmit>
                </form>
              </article>
            ))}
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
