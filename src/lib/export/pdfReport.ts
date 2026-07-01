import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ReportData } from "@/lib/risk/report";
import { BEACCESSIBLE_LOGO_PNG_BASE64 } from "@/lib/export/logo";

/**
 * Bias Risk Report as a PDF (Brief Section 19). Uses pdf-lib (pure JS, reliable
 * in serverless). Content is written in a logical reading order with clear
 * heading sizes and the SAME structure as the Word (.docx) export — including
 * bordered tables for the system profile, IBM bias types and six pillars — so
 * the two documents match. The Word version is the fully tagged accessible
 * format; this PDF preserves the same structure and reading order.
 */
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 56;
const DEEP = rgb(0.122, 0.247, 0.42);
const TEXT = rgb(0.12, 0.16, 0.22);
const TABLE_HEAD = rgb(0.898, 0.925, 0.953); // #E5ECF3
const TABLE_ROW = rgb(0.965, 0.976, 0.988); // subtle zebra tint
const BORDER = rgb(0.8, 0.83, 0.86);

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
  function wrap(text: string, f: PDFFont, size: number, width: number): string[] {
    const words = (text || "").split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > width && line) {
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
    for (const ln of wrap(text, f, size, maxW)) {
      ensure(lineH);
      page.drawText(ln, { x: MARGIN, y: y - size, size, font: f, color });
      y -= lineH;
    }
    y -= opts.gap ?? 0;
  }
  function h1(text: string) {
    y -= 10;
    ensure(24);
    write(text, { size: 15, f: bold, color: DEEP, gap: 6 });
  }

  /**
   * Draw a bordered table with a shaded header row, matching the Word export.
   * `fractions` are column widths as a share of the content width.
   */
  function table(headers: string[], rows: string[][], fractions: number[]) {
    const padX = 7;
    const padY = 6;
    const size = 10;
    const lineH = size * 1.35;
    const widths = fractions.map((fr) => fr * maxW);

    const rowHeight = (cells: string[], f: PDFFont) =>
      Math.max(
        ...cells.map((c, i) => wrap(c, f, size, widths[i] - padX * 2).length)
      ) *
        lineH +
      padY * 2;

    const drawRow = (
      cells: string[],
      f: PDFFont,
      fill?: ReturnType<typeof rgb>
    ) => {
      const h = rowHeight(cells, f);
      ensure(h);
      const top = y;
      let x = MARGIN;
      cells.forEach((c, i) => {
        const w = widths[i];
        if (fill) {
          page.drawRectangle({ x, y: top - h, width: w, height: h, color: fill });
        }
        page.drawRectangle({
          x,
          y: top - h,
          width: w,
          height: h,
          borderColor: BORDER,
          borderWidth: 0.75,
        });
        let ty = top - padY - size;
        for (const ln of wrap(c, f, size, w - padX * 2)) {
          page.drawText(ln, { x: x + padX, y: ty, size, font: f, color: TEXT });
          ty -= lineH;
        }
        x += w;
      });
      y = top - h;
    };

    ensure(rowHeight(headers, bold) + 4);
    drawRow(headers, bold, TABLE_HEAD);
    rows.forEach((r, idx) => {
      // Repeat the header if a page break lands mid-table.
      if (y - rowHeight(r, font) < MARGIN) {
        newPage();
        drawRow(headers, bold, TABLE_HEAD);
      }
      drawRow(r, font, idx % 2 === 1 ? TABLE_ROW : undefined);
    });
    y -= 8;
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
  write(data.executiveSummary, { gap: 6 });
  write(`SA Draft AI Policy tier: ${data.saTier}`, { f: bold, gap: 2 });
  write(`EU AI Act classification: ${data.euClassification}`, { f: bold, gap: 2 });
  if (data.euAnnex) write(`High-risk category: ${data.euAnnex}`, { f: bold, gap: 2 });

  h1("System profile");
  table(
    ["Field", "Value"],
    [
      ["System name", data.profile.system_name ?? "Not provided"],
      ["Provider", data.profile.provider ?? "Not provided"],
      ["Deployer", data.profile.deployer ?? "Not provided"],
      ["Decision domain", data.profile.decision_domain ?? "Not provided"],
      ["Purpose", data.profile.purpose ?? "Not provided"],
      [
        "Affected groups",
        (data.profile.affected_populations ?? []).join(", ") || "Not provided",
      ],
    ],
    [0.32, 0.68]
  );

  h1("IBM eight bias types");
  table(
    ["Bias type", "Level", "What this means"],
    data.biasScores.map((b) => [b.type, b.level, b.note]),
    [0.26, 0.16, 0.58]
  );

  h1("SA Draft AI Policy — six pillars");
  table(
    ["Pillar", "Status", "Note"],
    data.pillars.map((p) => [p.pillar, p.status, p.note]),
    [0.3, 0.18, 0.52]
  );

  h1("Triggered obligations");
  if (data.obligations.length) {
    data.obligations.forEach((o) => write(`•  ${o.title}: ${o.why}`, { size: 11, gap: 3 }));
  } else {
    write("No specific obligations triggered.");
  }

  h1("Why these classifications?");
  data.rationale.forEach((r) => {
    write(`${r.rule} (Confidence: ${r.confidence})`, { size: 12.5, f: bold, color: DEEP, gap: 3 });
    write(`Triggered by: ${r.trigger}`, { size: 10.5, gap: 2 });
    write(`Framework: ${r.framework}`, { size: 10.5, gap: 2 });
    write(r.explanation, { size: 10.5, gap: 2 });
    write(`Recommendation: ${r.recommendation}`, { size: 10.5, gap: 8 });
  });

  h1("Recommended remediation (IBM three stages)");
  data.remediation.forEach((c) => {
    write(c.stage, { size: 12.5, f: bold, color: DEEP, gap: 3 });
    c.actions.forEach((a) => write(`•  ${a}`, { size: 10.5, gap: 2 }));
    y -= 4;
  });

  h1("Accessibility compliance note");
  write(
    "This report was produced with a logical reading order, clear heading sizes and tables with header rows. The Word (.docx) version is the fully tagged accessible format. WCAG 2.2 AAA is targeted; some legal text may require manual review.",
    { size: 10, gap: 6 }
  );
  write(
    "BiasLens by BeAccessible — hello@beaccessible.co.za. Decision-support, not legal advice.",
    { size: 9, color: DEEP }
  );

  return pdf.save();
}
