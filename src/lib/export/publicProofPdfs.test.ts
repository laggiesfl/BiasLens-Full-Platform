import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  buildAlgorithmDefenceFilePdf,
  buildRecruitmentCaseStudyPdf,
  PUBLIC_PROOF_DOWNLOADS,
} from "./publicProofPdfs";

describe("public BiasLens proof PDFs", () => {
  it("builds a valid multi-page fictional recruitment case study PDF", async () => {
    const bytes = await buildRecruitmentCaseStudyPdf();
    expect(Buffer.from(bytes).subarray(0, 4).toString("ascii")).toBe("%PDF");

    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(4);
    expect(pdf.getTitle()).toContain("Fictional Recruitment Case Study");
  });

  it("builds a valid multi-page sample Algorithm Defence File PDF", async () => {
    const bytes = await buildAlgorithmDefenceFilePdf();
    expect(Buffer.from(bytes).subarray(0, 4).toString("ascii")).toBe("%PDF");

    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(4);
    expect(pdf.getTitle()).toContain("Sample Algorithm Defence File");
  });

  it("publishes stable, human-readable download filenames", () => {
    expect(PUBLIC_PROOF_DOWNLOADS.recruitment.filename).toBe(
      "BiasLens-Fictional-Recruitment-Case-Study.pdf"
    );
    expect(PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.filename).toBe(
      "BiasLens-Sample-Algorithm-Defence-File.pdf"
    );
  });
});
