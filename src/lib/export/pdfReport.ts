import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ReportData } from "@/lib/risk/report";
import { BEACCESSIBLE_LOGO_PNG_BASE64 } from "@/lib/export/logo";

/**
 * Bias Risk Report as a PDF (Brief Section 19). Uses pdf-lib (pure JS, reliable
 * in serverless). Content is written in a logical reading order with clear
 * heading sizes. The Word (.docx) export is the fully tagged accessible format;
 * this PDF preserves structure and reading order.
 */
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 56;
const DEEP = rgb(0.122, 0.247, 0.42);
const TEXT = rgb(0.12, 0.16, 0.22);

export async function buildPdfReport(data: ReportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Bias Risk Report — ${data.title}`);
  pdf.setAuthor("BiasLens by BeAccessible");
  pdf.setSubject("Algorithmic bias risk classification");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - MARGIN;
  const maxW = A4.w - MARGIN * 2;

  function newPage() {
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - MARGIN;
  }
  function ensure(space: number) {
    if (y - space < MARGIN) newPage();
  }
  function wrap(text: string, f: PDFFont, size: number): string[] {
    const words = (text || "").split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }
  function write(
    text: string,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}
  ) {
    const size = opts.size ?? 11;
    const f = opts.f ?? font;
    const color = opts.color ?? TEXT;
    const lineH = size * 1.45;
    for (const ln of wrap(text, f, size)) {
      ensure(lineH);
      page.drawText(ln, { x: MARGIN, y: y - size, size, font: f, color });
      y -= lineH;
    }
    y -= opts.gap ?? 0;
  }
  function h1(text: string) {
    y -= 8;
    ensure(22);
    write(text, { size: 15, f: bold, color: DEEP, gap: 4 });
  }
  function h2(text: string) {
    ensure(18);
    write(text, { size: 12.5, f: bold, color: DEEP, gap: 2 });
  }
  function label(l: string, v: string) {
    write(`${l}: ${v || "Not provided"}`, { size: 11, gap: 2 });
  }

  try {
    const logo = await pdf.embedPng(
      Uint8Array.from(Buffer.from(BEACCESSIBLE_LOGO_PNG_BASE64, "base64"))
    );
    page.drawImage(logo, { x: MARGIN, y: y - 50, width: 50, height: 50 });
    y -= 60;
  } catch {
    // continue without logo if it cannot be embedded
  }

  write("Bias Risk Report", { size: 22, f: bold, color: DEEP, gap: 4 });
  write(`${data.title}  ·  BiasLens by BeAccessible`, { size: 10, color: DEEP });
  write(
    `${data.reviewed ? "Reviewed" : "Draft (not yet reviewed)"}  ·  ${new Date(
      data.generatedAt
    ).toLocaleString("en-ZA")}`,
    { size: 9, gap: 6 }
  );

  h1("Executive summary");
  write(data.executiveSummary, { gap: 4 });
  label("SA Draft AI Policy tier", data.saTier);
  label("EU AI Act classification", data.euClassification);
  if (data.euAnnex) label("High-risk category", data.euAnnex);

  h1("System profile");
  label("System name", data.profile.system_name ?? "");
  label("Provider", data.profile.provider ?? "");
  label("Deployer", data.profile.deployer ?? "");
  label("Decision domain", data.profile.decision_domain ?? "");
  label("Purpose", data.profile.purpose ?? "");
  label("Affected groups", (data.profile.affected_populations ?? []).join(", "));

  h1("IBM eight bias types");
  data.biasScores.forEach((b) => {
    h2(`${b.type} — Level: ${b.level}`);
    write(b.note, { size: 10.5, gap: 3 });
  });

  h1("SA Draft AI Policy — six pillars");
  data.pillars.forEach((p) => {
    h2(`${p.pillar} — ${p.status}`);
    write(p.note, { size: 10.5, gap: 3 });
  });

  h1("Triggered obligations");
  if (data.obligations.length) {
    data.obligations.forEach((o) => write(`• ${o.title}: ${o.why}`, { size: 11, gap: 2 }));
  } else {
    write("No specific obligations triggered.");
  }

  h1("Why these classifications?");
  data.rationale.forEach((r) => {
    h2(`${r.rule} (Confidence: ${r.confidence})`);
    write(`Triggered by: ${r.trigger}`, { size: 10.5, gap: 1 });
    write(`Framework: ${r.framework}`, { size: 10.5, gap: 1 });
    write(r.explanation, { size: 10.5, gap: 1 });
    write(`Recommendation: ${r.recommendation}`, { size: 10.5, gap: 4 });
  });

  h1("Recommended remediation (IBM three stages)");
  data.remediation.forEach((c) => {
    h2(c.stage);
    c.actions.forEach((a) => write(`• ${a}`, { size: 10.5, gap: 1 }));
    y -= 3;
  });

  h1("Accessibility compliance note");
  write(
    "This report was produced with a logical reading order and clear heading sizes. The Word (.docx) version is the fully tagged accessible format. WCAG 2.2 AAA is targeted; some legal text may require manual review.",
    { size: 10, gap: 4 }
  );
  write(
    "BiasLens by BeAccessible — hello@beaccessible.co.za. Decision-support, not legal advice.",
    { size: 9, color: DEEP }
  );

  return pdf.save();
}
