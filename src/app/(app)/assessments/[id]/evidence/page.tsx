import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  EvidenceStatusBadge,
  EVIDENCE_STATUSES,
} from "@/components/EvidenceStatusBadge";
import {
  addEvidence,
  updateEvidenceStatus,
  deleteEvidence,
} from "@/lib/actions/evidence";

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" }) : "—";
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

  // Signed download URLs for any attached files.
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
      <p style={{ margin: 0 }}>
        <Link href={`/assessments/${id}`}>← Back to assessment</Link>
      </p>
      <div className="page-header">
        <h1>Evidence Log</h1>
        <p>
          Keep track of records you have asked for and received for{" "}
          <strong>{assessment.title}</strong>. You can attach files and record a
          follow-up date for each item.
        </p>
      </div>

      {sp.error ? <p className="form-error" role="alert">{sp.error}</p> : null}
      {sp.message ? <p className="form-success" role="status">{sp.message}</p> : null}

      <section className="card" aria-labelledby="add-h">
        <h2 id="add-h" style={{ fontSize: "1.2rem" }}>Add an evidence item</h2>
        <form action={addEvidence} className="stack" encType="multipart/form-data">
          <input type="hidden" name="assessment_id" value={id} />
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="document_name">Document name</label>
              <input id="document_name" name="document_name" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="requested">
                {EVIDENCE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="source">Source</label>
              <input id="source" name="source" type="text" />
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
              <input id="legal_basis" name="legal_basis" type="text" placeholder="e.g. PAIA, GDPR Art.15" />
            </div>
            <div className="field">
              <label htmlFor="follow_up_date">Follow-up date</label>
              <input id="follow_up_date" name="follow_up_date" type="date" />
            </div>
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
            <input id="file" name="file" type="file" aria-describedby="file-hint" />
          </div>
          <button type="submit" className="btn btn-primary">Save evidence item</button>
        </form>
      </section>

      <section aria-labelledby="list-h">
        <h2 id="list-h" style={{ fontSize: "1.2rem" }}>Your evidence items</h2>
        {entries && entries.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <caption className="sr-only">Evidence log entries with status, dates, legal basis and actions</caption>
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Status</th>
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
                      {e.notes ? <><br /><span className="muted" style={{ fontWeight: 400 }}>{e.notes}</span></> : null}
                    </th>
                    <td><EvidenceStatusBadge status={e.status} /></td>
                    <td>{e.requested_from ?? "—"}</td>
                    <td>{fmt(e.date_requested)}</td>
                    <td>{fmt(e.date_received)}</td>
                    <td>
                      {fmt(e.follow_up_date)}
                      {isOverdue(e.follow_up_date, e.status) ? (
                        <><br /><span className="badge" style={{ borderStyle: "solid" }}>⏰ Follow-up due</span></>
                      ) : null}
                    </td>
                    <td>{e.legal_basis ?? "—"}</td>
                    <td>
                      {signed[e.id] ? (
                        <a href={signed[e.id]} target="_blank" rel="noopener noreferrer">
                          Download<span className="sr-only"> {e.document_name}</span>
                        </a>
                      ) : (
                        <span className="muted">None</span>
                      )}
                    </td>
                    <td>
                      <form action={updateEvidenceStatus} className="cluster" style={{ gap: 6 }}>
                        <input type="hidden" name="assessment_id" value={id} />
                        <input type="hidden" name="id" value={e.id} />
                        <label htmlFor={`st-${e.id}`} className="sr-only">
                          Change status for {e.document_name}
                        </label>
                        <select id={`st-${e.id}`} name="status" defaultValue={e.status} style={{ minWidth: 150 }}>
                          {EVIDENCE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-secondary" style={{ minHeight: 40 }}>Save</button>
                      </form>
                      <form action={deleteEvidence} style={{ marginTop: 6 }}>
                        <input type="hidden" name="assessment_id" value={id} />
                        <input type="hidden" name="id" value={e.id} />
                        <button type="submit" className="btn btn-danger" style={{ minHeight: 40 }}>
                          Delete<span className="sr-only"> {e.document_name}</span>
                        </button>
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
    </div>
  );
}
