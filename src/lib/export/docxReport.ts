import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
} from "docx";
import type { ReportData } from "@/lib/risk/report";
import { BEACCESSIBLE_LOGO_PNG_BASE64 } from "@/lib/export/logo";

/**
 * Accessible Bias Risk Report as a Word document (Brief Section 19.3):
 * document title, real heading styles, table header rows, logical reading
 * order and a plain-language executive summary.
 */
function headerRow(cells: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    children: cells.map(
      (c) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: c, bold: true })] })],
        })
    ),
  });
}

function bodyRow(cells: string[]): TableRow {
  return new TableRow({
    children: cells.map(
      (c) => new TableCell({ children: [new Paragraph(c || "")] })
    ),
  });
}

export async function buildDocxReport(data: ReportData): Promise<Buffer> {
  const children: Paragraph[] | (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      children: [
        new ImageRun({
          type: "png",
          data: Buffer.from(BEACCESSIBLE_LOGO_PNG_BASE64, "base64"),
          transformation: { width: 64, height: 64 },
          altText: {
            title: "BeAccessible logo",
            description:
              "BeAccessible circular badge logo — Creating Access for All",
            name: "BeAccessible logo",
          },
        }),
      ],
    }),
    new Paragraph({ text: "Bias Risk Report", heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [
        new TextRun({ text: data.title, bold: true }),
        new TextRun({
          text: `  ·  BiasLens by BeAccessible  ·  ${new Date(
            data.generatedAt
          ).toLocaleString("en-ZA")}`,
        }),
      ],
    }),
    new Paragraph({
      text: data.reviewed ? "Status: Reviewed" : "Status: Draft (not yet reviewed)",
    }),

    new Paragraph({ text: "Executive summary", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(data.executiveSummary),
    new Paragraph({
      children: [
        new TextRun({ text: "SA Draft AI Policy tier: ", bold: true }),
        new TextRun(data.saTier),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "EU AI Act classification: ", bold: true }),
        new TextRun(data.euClassification),
      ],
    })
  );
  if (data.euAnnex) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "High-risk category: ", bold: true }),
          new TextRun(data.euAnnex),
        ],
      })
    );
  }

  children.push(
    new Paragraph({ text: "System profile", heading: HeadingLevel.HEADING_1 })
  );
  const profileTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Field", "Value"]),
      bodyRow(["System name", data.profile.system_name ?? "Not provided"]),
      bodyRow(["Provider", data.profile.provider ?? "Not provided"]),
      bodyRow(["Deployer", data.profile.deployer ?? "Not provided"]),
      bodyRow(["Decision domain", data.profile.decision_domain ?? "Not provided"]),
      bodyRow(["Purpose", data.profile.purpose ?? "Not provided"]),
      bodyRow([
        "Affected groups",
        (data.profile.affected_populations ?? []).join(", ") || "Not provided",
      ]),
    ],
  });

  const ibmTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Bias type", "Level", "What this means"]),
      ...data.biasScores.map((b) => bodyRow([b.type, b.level, b.note])),
    ],
  });

  const pillarsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow(["Pillar", "Status", "Note"]),
      ...data.pillars.map((p) => bodyRow([p.pillar, p.status, p.note])),
    ],
  });

  const sections: (Paragraph | Table)[] = [
    ...(children as (Paragraph | Table)[]),
    profileTable,
    new Paragraph({ text: "IBM eight bias types", heading: HeadingLevel.HEADING_1 }),
    ibmTable,
    new Paragraph({ text: "SA Draft AI Policy — six pillars", heading: HeadingLevel.HEADING_1 }),
    pillarsTable,
    new Paragraph({ text: "Triggered obligations", heading: HeadingLevel.HEADING_1 }),
    ...(data.obligations.length
      ? data.obligations.map(
          (o) =>
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: `${o.title}: `, bold: true }),
                new TextRun(o.why),
              ],
            })
        )
      : [new Paragraph("No specific obligations triggered.")]),
    new Paragraph({ text: "Why these classifications?", heading: HeadingLevel.HEADING_1 }),
  ];

  data.rationale.forEach((r) => {
    sections.push(
      new Paragraph({ text: `${r.rule} (Confidence: ${r.confidence})`, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun({ text: "Triggered by: ", bold: true }), new TextRun(r.trigger)] }),
      new Paragraph({ children: [new TextRun({ text: "Framework: ", bold: true }), new TextRun(r.framework)] }),
      new Paragraph(r.explanation),
      new Paragraph({ children: [new TextRun({ text: "Recommendation: ", bold: true }), new TextRun(r.recommendation)] })
    );
  });

  sections.push(
    new Paragraph({ text: "Recommended remediation (IBM three stages)", heading: HeadingLevel.HEADING_1 })
  );
  data.remediation.forEach((c) => {
    sections.push(new Paragraph({ text: c.stage, heading: HeadingLevel.HEADING_2 }));
    c.actions.forEach((a) => sections.push(new Paragraph({ bullet: { level: 0 }, text: a })));
  });

  sections.push(
    new Paragraph({ text: "Accessibility compliance note", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(
      "This document was produced with heading styles, table header rows and logical reading order to support screen readers. WCAG 2.2 AAA is targeted; some legal text may require manual review."
    ),
    new Paragraph({ alignment: AlignmentType.LEFT, text: "" }),
    new Paragraph(
      "BiasLens by BeAccessible — hello@beaccessible.co.za. This report is decision-support, not legal advice."
    )
  );

  const doc = new Document({
    title: `Bias Risk Report — ${data.title}`,
    description: "Generated by BiasLens (BeAccessible)",
    sections: [{ children: sections }],
  });

  return Packer.toBuffer(doc);
}
