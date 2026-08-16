import { NextResponse } from "next/server";
import {
  buildRecruitmentCaseStudyPdf,
  PUBLIC_PROOF_DOWNLOADS,
} from "@/lib/export/publicProofPdfs";

export const runtime = "nodejs";

export async function GET() {
  const bytes = await buildRecruitmentCaseStudyPdf();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${PUBLIC_PROOF_DOWNLOADS.recruitment.filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
