import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReportData } from "@/lib/risk/report";
import { buildDocxReport } from "@/lib/export/docxReport";
import { buildPdfReport } from "@/lib/export/pdfReport";

export const runtime = "nodejs";

function safeName(title: string) {
  return (title || "bias-risk-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function csvCell(v: string) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

/**
 * The CSV carries an Evidence column so that a bias finding's level is never
 * read in isolation. Level is how serious the risk would be if present;
 * Evidence is how much is actually known. Rows that are not bias findings
 * leave the column empty rather than filling it with a value that would look
 * like a judgement.
 */
function buildCsv(data: Awaited<ReturnType<typeof getReportData>>): string {
  if (!data) return "";
  const rows: string[][] = [
    ["Section", "Item", "Value", "Evidence"],
    ["Summary", "Assessment", data.title, ""],
    ["Summary", "SA tier", data.saTier, ""],
    ["Summary", "EU classification", data.euClassification, ""],
    ["Summary", "High-risk category", data.euAnnex ?? "", ""],
    ["Summary", "Reviewed", data.reviewed ? "Yes" : "No", ""],
    ["Profile", "System name", data.profile.system_name ?? "", ""],
    ["Profile", "Decision domain", data.profile.decision_domain ?? "", ""],
    ...data.biasScores.map((b) => [
      "Bias finding",
      b.type,
      b.level,
      b.evidence ?? "Not recorded",
    ]),
    ...data.pillars.map((p) => ["SA pillar", p.pillar, p.status, ""]),
    ...data.obligations.map((o) => ["Obligation", o.ref, o.title, ""]),
  ];
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "docx";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const data = await getReportData(id);
  if (!data) {
    return NextResponse.json({ error: "No report to export yet" }, { status: 404 });
  }

  const base = `bias-risk-report-${safeName(data.title)}`;

  await supabase.from("generated_documents").insert({
    assessment_id: id,
    doc_type: "bias_risk_report",
    format,
    created_by: user.id,
  });
  await supabase.from("activity_log").insert({
    actor_id: user.id,
    action: "report_exported",
    entity_type: "assessment",
    entity_id: id,
    metadata: { format },
  });

  if (format === "csv") {
    return new NextResponse(buildCsv(data), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const bytes = await buildPdfReport(data);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${base}.pdf"`,
      },
    });
  }

  const buffer = await buildDocxReport(data);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${base}.docx"`,
    },
  });
}
