import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { createAssessment, deleteAssessment } from "@/lib/actions/assessments";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, title, status, assessment_type, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="stack">
      <div className="page-header">
        <h1>My Assessments</h1>
        <p>
          Create, open and manage your saved assessments. Everything you enter is
          saved to your account.
        </p>
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

      <section className="card" aria-labelledby="new-h">
        <h2 id="new-h" style={{ fontSize: "1.2rem" }}>
          Start a new assessment
        </h2>
        <form action={createAssessment} className="cluster" style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ flex: "1 1 280px", marginBottom: 0 }}>
            <label htmlFor="title">Give it a name</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Review of municipal hiring tool"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create assessment
          </button>
        </form>
      </section>

      <section aria-labelledby="list-h">
        <h2 id="list-h" style={{ fontSize: "1.2rem" }}>
          Your assessments
        </h2>
        {assessments && assessments.length > 0 ? (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <caption className="sr-only">
                List of your saved assessments with status and actions
              </caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last updated</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id}>
                    <th scope="row" style={{ fontWeight: 600 }}>
                      <Link href={`/assessments/${a.id}`}>{a.title}</Link>
                    </th>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{formatDate(a.updated_at)}</td>
                    <td>
                      <div className="cluster" style={{ gap: 8 }}>
                        <Link
                          href={`/assessments/${a.id}`}
                          className="btn btn-secondary"
                          style={{ minHeight: 40 }}
                        >
                          Open
                        </Link>
                        <form action={deleteAssessment}>
                          <input type="hidden" name="id" value={a.id} />
                          <ConfirmSubmit
                            style={{ minHeight: 40 }}
                            confirmMessage={`Delete the assessment "${a.title}"? This permanently removes it and everything in it. This cannot be undone.`}
                          >
                            Delete
                            <span className="sr-only"> {a.title}</span>
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="card muted">
            You have no assessments yet. Create your first one above.
          </p>
        )}
      </section>
    </div>
  );
}
