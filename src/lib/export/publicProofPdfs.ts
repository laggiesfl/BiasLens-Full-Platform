import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { BEACCESSIBLE_LOGO_PNG_BASE64 } from "@/lib/export/logo";

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 54;
const DEEP = rgb(31 / 255, 63 / 255, 107 / 255);
const MID = rgb(47 / 255, 92 / 255, 154 / 255);
const SOFT = rgb(74 / 255, 120 / 255, 181 / 255);
const PALE = rgb(230 / 255, 238 / 255, 248 / 255);
const TEXT = rgb(13 / 255, 27 / 255, 46 / 255);
const MUTED = rgb(43 / 255, 66 / 255, 96 / 255);
const WHITE = rgb(1, 1, 1);
const BORDER = rgb(184 / 255, 206 / 255, 234 / 255);

export const PUBLIC_PROOF_DOWNLOADS = {
  recruitment: {
    href: "/downloads/recruitment-case-study",
    filename: "BiasLens-Fictional-Recruitment-Case-Study.pdf",
  },
  algorithmDefenceFile: {
    href: "/downloads/algorithm-defence-file",
    filename: "BiasLens-Sample-Algorithm-Defence-File.pdf",
  },
} as const;

type Writer = ReturnType<typeof createWriter>;

function ascii(text: string) {
  return text
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/·/g, "|")
    .replace(/™/g, "TM");
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = ascii(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(candidate, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function createWriter(pdf: PDFDocument, font: PDFFont, bold: PDFFont) {
  let page = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - MARGIN;
  const maxW = A4.w - MARGIN * 2;

  function footer(label: string) {
    page.drawLine({
      start: { x: MARGIN, y: 35 },
      end: { x: A4.w - MARGIN, y: 35 },
      thickness: 0.6,
      color: BORDER,
    });
    page.drawText(`BiasLens by BeAccessible | ${ascii(label)}`, {
      x: MARGIN,
      y: 22,
      size: 7.5,
      font,
      color: MUTED,
    });
    page.drawText(`Page ${pdf.getPageCount()}`, {
      x: A4.w - MARGIN - 42,
      y: 22,
      size: 7.5,
      font,
      color: MUTED,
    });
  }

  function newPage(label: string) {
    footer(label);
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - MARGIN;
  }

  function ensure(space: number, label: string) {
    if (y - space < 55) newPage(label);
  }

  function text(
    value: string,
    options: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      gap?: number;
      indent?: number;
      width?: number;
      label: string;
    }
  ) {
    const size = options.size ?? 10.5;
    const usedFont = options.font ?? font;
    const color = options.color ?? TEXT;
    const indent = options.indent ?? 0;
    const width = options.width ?? maxW - indent;
    const lineH = size * 1.42;
    const lines = wrap(value, usedFont, size, width);
    ensure(lines.length * lineH + 4, options.label);
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN + indent,
        y: y - size,
        size,
        font: usedFont,
        color,
      });
      y -= lineH;
    }
    y -= options.gap ?? 0;
  }

  function heading(value: string, label: string) {
    y -= 4;
    text(value, { size: 16, font: bold, color: DEEP, gap: 7, label });
  }

  function subheading(value: string, label: string) {
    text(value, { size: 12.2, font: bold, color: DEEP, gap: 4, label });
  }

  function bullet(value: string, label: string) {
    text(`- ${value}`, { size: 10.2, indent: 8, width: maxW - 8, gap: 2, label });
  }

  function band(value: string, label: string) {
    const lines = wrap(value, bold, 10, maxW - 22);
    const h = 16 + lines.length * 14;
    ensure(h + 8, label);
    page.drawRectangle({
      x: MARGIN,
      y: y - h,
      width: maxW,
      height: h,
      color: PALE,
      borderColor: MID,
      borderWidth: 0.8,
    });
    let ty = y - 14;
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN + 11,
        y: ty,
        size: 10,
        font: bold,
        color: DEEP,
      });
      ty -= 14;
    }
    y -= h + 10;
  }

  function finish(label: string) {
    footer(label);
  }

  return {
    get page() {
      return page;
    },
    get y() {
      return y;
    },
    set y(value: number) {
      y = value;
    },
    maxW,
    newPage,
    text,
    heading,
    subheading,
    bullet,
    band,
    finish,
  };
}

async function drawCover(
  pdf: PDFDocument,
  writer: Writer,
  font: PDFFont,
  bold: PDFFont,
  title: string,
  subtitle: string,
  badge: string,
  label: string
) {
  const page = writer.page;
  page.drawRectangle({ x: 0, y: 0, width: A4.w, height: A4.h, color: DEEP });

  for (let x = 0; x < A4.w; x += 28) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: A4.h },
      thickness: 0.25,
      color: rgb(48 / 255, 82 / 255, 126 / 255),
    });
  }
  for (let y = 0; y < A4.h; y += 28) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: A4.w, y },
      thickness: 0.25,
      color: rgb(48 / 255, 82 / 255, 126 / 255),
    });
  }

  try {
    const logo = await pdf.embedPng(
      Uint8Array.from(Buffer.from(BEACCESSIBLE_LOGO_PNG_BASE64, "base64"))
    );
    page.drawImage(logo, { x: 64, y: 744, width: 52, height: 52 });
  } catch {
    // The live-text brand remains usable even if the PNG cannot be embedded.
  }

  page.drawText("BeAccessible", {
    x: 128,
    y: 772,
    size: 16,
    font: bold,
    color: WHITE,
  });
  page.drawText("CREATING ACCESS FOR ALL", {
    x: 128,
    y: 758,
    size: 7.5,
    font,
    color: PALE,
  });
  page.drawText("BiasLens", {
    x: 128,
    y: 738,
    size: 11,
    font: bold,
    color: rgb(0.66, 0.82, 1),
  });

  page.drawRectangle({
    x: 64,
    y: 650,
    width: 210,
    height: 34,
    color: MID,
    borderColor: SOFT,
    borderWidth: 0.8,
  });
  page.drawText(ascii(badge).toUpperCase(), {
    x: 78,
    y: 661,
    size: 9,
    font: bold,
    color: WHITE,
  });

  let ty = 590;
  for (const line of wrap(title, bold, 26, 455)) {
    page.drawText(line, { x: 64, y: ty, size: 26, font: bold, color: WHITE });
    ty -= 34;
  }

  ty -= 32;
  for (const line of wrap(subtitle, font, 12, 440)) {
    page.drawText(line, { x: 64, y: ty, size: 12, font, color: PALE });
    ty -= 17;
  }

  page.drawRectangle({
    x: 64,
    y: 84,
    width: 467,
    height: 92,
    color: rgb(38 / 255, 74 / 255, 120 / 255),
    borderColor: SOFT,
    borderWidth: 0.8,
  });
  page.drawText("BIASLENS PROOF ASSET", {
    x: 82,
    y: 147,
    size: 8,
    font: bold,
    color: SOFT,
  });
  page.drawText(ascii(label), {
    x: 82,
    y: 124,
    size: 13,
    font: bold,
    color: WHITE,
  });
  page.drawText("Fictional demonstration data. Not legal advice. Not a finding of discrimination.", {
    x: 82,
    y: 101,
    size: 8.2,
    font,
    color: PALE,
  });
}

async function createDocument(title: string, subject: string) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setAuthor("BiasLens by BeAccessible");
  pdf.setSubject(subject);
  pdf.setCreator("BiasLens by BeAccessible");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  return { pdf, font, bold, writer: createWriter(pdf, font, bold) };
}

export async function buildRecruitmentCaseStudyPdf(): Promise<Uint8Array> {
  const label = "Fictional Recruitment Case Study";
  const { pdf, font, bold, writer } = await createDocument(
    "BiasLens - Fictional Recruitment Case Study",
    "Fictional-data BiasLens recruitment evidence walkthrough"
  );

  await drawCover(
    pdf,
    writer,
    font,
    bold,
    "Fictional-Data Recruitment Case Study",
    "A practical BiasLens walkthrough showing how one AI-assisted recruitment process moves from concern to an evidence-led investigation question.",
    "Proof and trust",
    label
  );

  writer.newPage(label);
  writer.heading("Executive summary", label);
  writer.text(
    "This fictional case study shows how BiasLens examines one AI-assisted recruitment workflow without turning incomplete evidence into a binary pass/fail conclusion. The method defines the system, inventories evidence, identifies possible bias pathways, interprets outcome differences cautiously, records limitations and decides what requires investigation next.",
    { label }
  );
  writer.band("Case reference: BL-DEMO-RECRUIT-001 | Northstar Services (fictional)", label);
  writer.subheading("System and decision context", label);
  writer.text("System: AI-assisted candidate screening used to support shortlisting decisions.", { label });
  writer.text("Decision context: recruitment shortlisting for a fictional professional-services role.", { label });
  writer.text("Assessment trigger: concern that disabled applicants may be under-represented in shortlisted outcomes.", { label });
  writer.text("BiasLens question: What does the available evidence support, what remains unverified, and what requires investigation?", { label });

  writer.newPage(label);
  writer.heading("1. Evidence inventory", label);
  const evidence = [
    ["Available", "System purpose and shortlisting workflow documented internally."],
    ["Available", "Fictional aggregate applicant and shortlist counts for the demonstration period."],
    ["Unverified", "Vendor statement that the model was tested for fairness without supporting validation evidence."],
    ["Missing", "Clear evidence showing the validation population adequately represents affected disability groups."],
    ["Unverified", "Internal keyboard spot-check suggests a possible upload barrier, but no structured accessibility test report exists."],
    ["Missing", "Reliable evidence explaining disability disclosure patterns and non-disclosure within the applicant pool."],
  ] as const;
  for (const [status, detail] of evidence) {
    writer.subheading(status, label);
    writer.text(detail, { label, gap: 3 });
  }
  writer.band("BiasLens preserves the distinction between evidence present, evidence absent and evidence that remains unverified.", label);

  writer.newPage(label);
  writer.heading("2. Possible bias pathways", label);
  writer.subheading("Preexisting", label);
  writer.text("A representation gap may exist if disabled people or disability-related needs were insufficiently represented in historic or validation data. Possible pathway only; this does not establish that it caused the observed outcome difference.", { label });
  writer.subheading("Technical", label);
  writer.text("A possible keyboard or accessibility barrier in the upload step may affect who can complete the process successfully. A spot-check is not comprehensive accessibility testing and is not a WCAG conformance finding.", { label });
  writer.subheading("Emergent", label);
  writer.text("The applicant population, use context or vendor model may change after deployment. Material change can create new risk even when earlier evidence was stronger.", { label, gap: 8 });

  writer.heading("3. Fictional fairness signal", label);
  writer.text("Disability-disclosed analysis group: 40 applications, 12 shortlisted, 30% selection rate.", { label });
  writer.text("Comparison group: 80 applications, 36 shortlisted, 45% selection rate.", { label });
  writer.text("Selection-rate ratio: 0.67", { label, font: bold, color: DEEP });
  writer.band("Interpretation: this fictional outcome difference is a signal requiring investigation. It does not establish causation or unlawful discrimination.", label);
  writer.text("Critical limitation: the comparison group must not be described as non-disabled people. Disability non-disclosure can occur, and the fictional data does not establish the actual disability status of everyone outside the disclosed group.", { label });

  writer.newPage(label);
  writer.heading("4. Limitations that remain visible", label);
  writer.bullet("The data is entirely fictional and exists only to demonstrate BiasLens methodology.", label);
  writer.bullet("The group sizes are not statutory thresholds or legal safe harbours.", label);
  writer.bullet("The outcome difference alone does not explain cause.", label);
  writer.bullet("The vendor fairness statement remains an assertion until supported by evidence.", label);
  writer.bullet("An accessibility spot-check does not equal structured testing, validation or conformance.", label);
  writer.heading("5. Recommended next actions", label);
  [
    "Improve denominator and disclosure-quality evidence before drawing stronger conclusions.",
    "Request the vendor's validation methodology, affected-group evidence, fairness testing scope and material limitations.",
    "Conduct structured accessibility testing across the full candidate workflow.",
    "Investigate where the outcome difference enters the process rather than assuming the AI model is the sole cause.",
    "Record rationale, evidence status, limitations, owners and due dates in the organisation's governance evidence trail.",
    "Reassess after material model, vendor, workflow or applicant-population change.",
  ].forEach((item) => writer.bullet(item, label));

  writer.newPage(label);
  writer.heading("6. What BiasLens clarified", label);
  [
    "There is an observable fictional outcome difference, but the current evidence does not establish why it exists.",
    "The vendor's fairness statement is not yet verified evidence.",
    "Disability visibility is incomplete because disclosure status cannot be treated as a complete proxy for disability status.",
    "Accessibility evidence is incomplete and requires structured testing.",
    "The organisation now has specific evidence questions and next actions rather than a vague question such as Is the AI biased?",
  ].forEach((item) => writer.bullet(item, label));
  writer.band("BiasLens tells you what your evidence supports - and what it does not.", label);
  writer.subheading("Next step", label);
  writer.text("Assess one AI system: https://biaslens.beaccessible.co.za/enquire", { label });
  writer.text("Methodology: https://biaslens.beaccessible.co.za/methodology | hello@beaccessible.co.za", { label, color: MUTED });
  writer.finish(label);

  return pdf.save();
}

export async function buildAlgorithmDefenceFilePdf(): Promise<Uint8Array> {
  const label = "Sample Algorithm Defence File";
  const { pdf, font, bold, writer } = await createDocument(
    "BiasLens - Sample Algorithm Defence File",
    "Fictional organisation-owned governance evidence record"
  );

  await drawCover(
    pdf,
    writer,
    font,
    bold,
    "Sample Algorithm Defence File",
    "A fictional organisation-owned evidence record showing what was assessed, what is known, what remains unresolved and what action follows.",
    "Governance evidence",
    label
  );

  writer.newPage(label);
  writer.heading("Purpose of this sample file", label);
  writer.text("This fictional sample Algorithm Defence File demonstrates how an organisation can retain an evidence record showing what was assessed, what evidence was available, what remained uncertain, what controls existed and what actions followed. It is an example governance record - not legal immunity, certification, legal advice or a formal conformity assessment.", { label });
  writer.band("Case reference: BL-DEMO-RECRUIT-001 | Northstar Services (fictional)", label);
  writer.heading("1. System overview and scope", label);
  writer.text("System: AI-assisted candidate screening used to support recruitment shortlisting.", { label });
  writer.text("Business owner: People / Recruitment function (fictional).", { label });
  writer.text("Assessment scope: evidence and bias-risk review of one defined candidate-screening workflow.", { label });
  writer.text("Decision influenced: candidate shortlisting; human review remains in the workflow.", { label });
  writer.text("Affected population: applicants to the fictional role, including applicants who disclose disability.", { label });

  writer.newPage(label);
  writer.heading("2. Evidence inventory", label);
  [
    ["Available", "Documented system purpose and role of human review."],
    ["Available", "Fictional aggregate shortlisting counts for the demonstration period."],
    ["Unverified", "Vendor assertion that the model was tested for fairness."],
    ["Missing", "Supporting vendor validation report and affected-group evidence."],
    ["Unverified", "Keyboard spot-check indicating a possible upload barrier."],
    ["Missing", "Structured accessibility test evidence covering the candidate workflow."],
    ["Missing", "Evidence that disability disclosure data is sufficiently complete for stronger inference."],
  ].forEach(([status, detail]) => {
    writer.subheading(status, label);
    writer.text(detail, { label, gap: 3 });
  });

  writer.newPage(label);
  writer.heading("3. Findings summary", label);
  const findings = [
    ["Outcome difference requires investigation", "Credible signal", "Fictional selection rates differ between the disability-disclosed analysis group and the comparison group.", "The difference does not establish cause or unlawful discrimination."],
    ["Vendor fairness assertion remains unverified", "Unverified evidence", "The vendor claims fairness testing, but supporting methodology and validation evidence are absent from the file.", "An assertion is not converted into verified evidence."],
    ["Accessibility evidence is incomplete", "Emerging / incomplete evidence", "A keyboard spot-check suggests a possible barrier in the upload workflow.", "A spot-check is not comprehensive accessibility testing and does not establish WCAG conformance status."],
  ] as const;
  for (const [title, status, rationale, limitation] of findings) {
    writer.subheading(title, label);
    writer.text(`Evidence status: ${status}`, { label, font: bold, color: DEEP });
    writer.text(`Rationale: ${rationale}`, { label });
    writer.text(`Limitation: ${limitation}`, { label, gap: 7 });
  }

  writer.newPage(label);
  writer.heading("4. Controls currently in place", label);
  [
    "Human review remains part of the fictional shortlisting workflow.",
    "A named governance owner is assigned to evidence escalation.",
    "A formal request for stronger vendor validation evidence is recorded.",
    "Outcome monitoring is separated from individual employee or applicant surveillance.",
  ].forEach((item) => writer.bullet(item, label));
  writer.heading("5. Unresolved questions", label);
  [
    "Was the validation population sufficiently representative of disability-related needs and relevant affected groups?",
    "How complete and reliable is disability disclosure information in the applicant population?",
    "At which stage of the workflow does the observed outcome difference arise?",
    "What is the full accessibility test position across keyboard, screen reader, reflow and other relevant user needs?",
    "What material model, vendor or workflow changes occurred after the last available evidence was produced?",
  ].forEach((item) => writer.bullet(item, label));

  writer.newPage(label);
  writer.heading("6. Required actions", label);
  [
    "A1 | High | Obtain stronger denominator/disclosure-quality evidence. Owner: People Analytics.",
    "A2 | High | Request vendor validation methodology, fairness evidence and known limitations. Owner: Procurement / AI Governance.",
    "A3 | High | Conduct structured accessibility testing of the end-to-end candidate journey. Owner: Accessibility Owner.",
    "A4 | High | Investigate where the selection-rate difference enters the process. Owner: AI Governance / HR.",
    "A5 | Medium | Re-run the evidence review after material new evidence or system change. Owner: AI Governance.",
  ].forEach((item) => writer.bullet(item, label));

  writer.heading("7. Governance and review record", label);
  writer.text("Assessment basis: fictional demonstration case using aggregated outcome counts and fictional documentation status.", { label });
  writer.text("Current determination: evidence supports further investigation; it does not support a legal finding of discrimination.", { label });
  writer.text("Decision: do not issue a binary safe or biased label. Improve evidence, investigate causes and reassess.", { label });
  writer.text("Evidence owner: fictional AI Governance / Risk owner.", { label });
  writer.text("Review checkpoint: after material model, vendor or workflow change, or within 90 days of completing the recommended evidence actions, whichever occurs first.", { label });
  writer.band("Governance evidence, not legal immunity. Traceability improves reviewability; it does not guarantee regulatory or legal acceptance.", label);
  writer.text("Methodology: https://biaslens.beaccessible.co.za/methodology | Qualification: https://biaslens.beaccessible.co.za/enquire | hello@beaccessible.co.za", { label, color: MUTED });
  writer.finish(label);

  return pdf.save();
}
