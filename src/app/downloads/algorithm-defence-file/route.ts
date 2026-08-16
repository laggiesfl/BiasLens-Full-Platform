import { NextResponse } from "next/server";
import {
  buildAlgorithmDefenceFilePdf,
  PUBLIC_PROOF_DOWNLOADS,
} from "@/lib/export/publicProofPdfs";

export const runtime = "nodejs";

export async function GET() {
  const bytes = await buildAlgorithmDefenceFilePdf();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${PUBLIC_PROOF_DOWNLOADS.algorithmDefenceFile.filename}"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
